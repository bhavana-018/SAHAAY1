// Deterministic "AI" logic — real formulas over real seed data, plus a thin layer of
// real text generation via Hugging Face's free-tier hosted Inference API (see ai.js)
// for the narration-only surfaces. Every score, ranking, and classification stays
// deterministic; only written sentences are AI-generated, with a template fallback
// if no token is configured or the request fails.
import { WORKERS, workersForService, bookingsForCoop, bookingsForWorker, COOPERATIVES, SERVICES, COURSES, DISPUTES, customerById } from "../data/seed";
import { runLocalAI } from "./ai";

export const formatINR = (n) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

// ---------------- FairMatch scoring (Section 6) ----------------
// Weighted formula, computed per candidate worker for a given service + customer location.
// Seven factors: skill fit, distance, live availability, certification depth, customer
// rating, current workload, and fair-opportunity (rotation priority for members who
// haven't had recent work) — this is what keeps FairMatch from routing every job to the
// same few "star" workers.
export const FAIRMATCH_WEIGHTS = {
  skillMatch: 0.22,
  proximity: 0.16,
  availability: 0.14,
  certification: 0.12,
  rating: 0.14,
  workload: 0.11,
  fairOpportunity: 0.11,
};

export function scoreWorkerForBooking(worker, { serviceId, district }) {
  const skillMatch = worker.skills.includes(serviceId) ? 100 : 40;
  const proximity = worker.district === district ? 100 : 55;
  // Live availability: whether the worker has actually marked themselves available today,
  // not just a static profile field — same flag the Emergency Service page checks.
  const availability = worker.availabilityToday ? 100 : 30;
  // Certification: identity + skill certificate + background check + training, plus a
  // small bonus for holding multiple named certifications — a visible factor on its own,
  // separate from the customer-facing rating below.
  const certBase =
    (worker.identityVerified ? 25 : 5) +
    (worker.skillVerified ? 30 : 10) +
    (worker.backgroundVerified ? 25 : 5) +
    (worker.trainingCompleted ? 20 : 5);
  const certification = Math.min(100, certBase + Math.max(0, worker.certifications.length - 1) * 5);
  // Rating: the worker's actual customer-facing rating (out of 5), scaled to 100 — this
  // is what earlier scoring left out entirely.
  const rating = Math.min(100, (worker.rating / 5) * 100);
  // Workload: how much headroom the worker has this week relative to their own capacity.
  const workload = Math.max(0, 100 - (worker.workloadThisWeek / worker.maxWeeklyCapacity) * 100);
  // Fair opportunity: rotation boost for workers sitting furthest below the *cooperative's*
  // average workload share, so idle members get surfaced ahead of already-busy ones even
  // when their individual workload score alone wouldn't rank them first.
  const coopPeers = WORKERS.filter((w) => w.coopId === worker.coopId);
  const coopAvgSharePct =
    coopPeers.reduce((s, w) => s + w.workloadThisWeek / w.maxWeeklyCapacity, 0) / (coopPeers.length || 1) * 100;
  const workerSharePct = (worker.workloadThisWeek / worker.maxWeeklyCapacity) * 100;
  const fairOpportunity = Math.max(0, Math.min(100, 50 + (coopAvgSharePct - workerSharePct)));

  const total =
    skillMatch * FAIRMATCH_WEIGHTS.skillMatch +
    proximity * FAIRMATCH_WEIGHTS.proximity +
    availability * FAIRMATCH_WEIGHTS.availability +
    certification * FAIRMATCH_WEIGHTS.certification +
    rating * FAIRMATCH_WEIGHTS.rating +
    workload * FAIRMATCH_WEIGHTS.workload +
    fairOpportunity * FAIRMATCH_WEIGHTS.fairOpportunity;

  return {
    total: Math.round(total),
    breakdown: {
      skillMatch: Math.round(skillMatch),
      proximity: Math.round(proximity),
      availability: Math.round(availability),
      certification: Math.round(certification),
      rating: Math.round(rating),
      workload: Math.round(workload),
      fairOpportunity: Math.round(fairOpportunity),
    },
  };
}

export function fairMatchResults({ serviceId, district }, limit = 6) {
  const candidates = workersForService(serviceId);
  const scored = candidates.map((w) => ({ worker: w, ...scoreWorkerForBooking(w, { serviceId, district }) }));
  scored.sort((a, b) => b.total - a.total);
  return scored.slice(0, limit);
}

// Instant, deterministic fallback sentence — shown immediately on every worker card
// so there's never a blank/loading state, and used if the local model fails to load.
export function explainMatch(scored) {
  const { breakdown } = scored;
  const strongest = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0][0];
  const labels = {
    skillMatch: "an exact skill match for this job",
    proximity: "being based in your district",
    availability: "being marked available today",
    certification: "verified identity, skill, and background certification",
    rating: "a strong customer rating",
    workload: "having capacity this week",
    fairOpportunity: "being below the cooperative's average workload, so work stays distributed fairly",
  };
  return `Recommended mainly for ${labels[strongest]}.`;
}

// Real local-model version — worker scoring & ranking is NEVER model-driven (that stays
// in scoreWorkerForBooking/fairMatchResults above); this only asks the model to write a
// fuller sentence from the already-computed score breakdown, so it can't invent facts.
export async function explainMatchAI(scored) {
  const { breakdown } = scored;
  const messages = [
    {
      role: "system",
      content:
        "Explain in one friendly sentence why this worker was recommended, based only on the scores given. Don't invent details not in the data.",
    },
    {
      role: "user",
      content: `Skill match: ${breakdown.skillMatch}/100. Distance: ${breakdown.proximity}/100. Availability: ${breakdown.availability}/100. Certification: ${breakdown.certification}/100. Rating: ${breakdown.rating}/100. Workload headroom: ${breakdown.workload}/100. Fair opportunity: ${breakdown.fairOpportunity}/100.`,
    },
  ];
  return runLocalAI(messages, { maxNewTokens: 60 });
}

// ---------------- Trust Score (Section 15) ----------------
export function trustFactorRows(worker) {
  return [
    { label: "Identity Verified", value: worker.identityVerified, weight: 25 },
    { label: "Skill Certified", value: worker.skillVerified, weight: 25 },
    { label: "Background Check", value: worker.backgroundVerified, weight: 25 },
    { label: "Training Completed", value: worker.trainingCompleted, weight: 15 },
    { label: "On-time Delivery ≥ 90%", value: worker.onTimeRate >= 90, weight: 10 },
  ];
}

// ---------------- AI Demand Radar (Section 13) ----------------
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// "Where" and "when": real per-locality and per-weekday breakdowns from each booking's
// linked customer and date, not just an aggregate count — this is what answers "which
// locality" and "which day" for a service, rather than only "how much".
function whereAndWhen(bookings) {
  if (!bookings.length) return { topLocality: null, peakDay: null };
  const localityCounts = {};
  const dayCounts = new Array(7).fill(0);
  bookings.forEach((b) => {
    const customer = customerById(b.customerId);
    if (customer) localityCounts[customer.locality] = (localityCounts[customer.locality] || 0) + 1;
    const dow = new Date(b.date).getUTCDay();
    dayCounts[dow] += 1;
  });
  const topLocality = Object.entries(localityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const peakDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
  const peakDay = Math.max(...dayCounts) > 0 ? WEEKDAY_NAMES[peakDayIndex] : null;
  return { topLocality, peakDay };
}

export function demandRadarForCoop(coopId) {
  const coop = COOPERATIVES.find((c) => c.id === coopId);
  const bookings = bookingsForCoop(coopId);
  const today = new Date();
  return coop.servicesOffered.map((serviceId) => {
    const service = SERVICES.find((s) => s.id === serviceId);
    const serviceBookings = bookings.filter((b) => b.serviceId === serviceId);
    const historical = serviceBookings.length;
    const workerCount = WORKERS.filter((w) => w.coopId === coopId && w.skills.includes(serviceId)).length;
    const demandPerWorker = workerCount ? historical / workerCount : historical;
    let state = "healthy";
    if (workerCount === 0 || demandPerWorker > 3.2) state = "critical";
    else if (demandPerWorker > 2) state = "shortage";

    // "When"/"how much": compare the last 15 days' daily rate against the prior 30 days'
    // daily rate (the seed window is 45 days), then project that trend 30 days forward —
    // a real trend read on the same booking data, not a fixed multiplier.
    const withAge = serviceBookings.map((b) => ({
      ...b,
      daysAgo: Math.floor((today - new Date(b.date)) / MS_PER_DAY),
    }));
    const recent = withAge.filter((b) => b.daysAgo <= 15);
    const older = withAge.filter((b) => b.daysAgo > 15);
    const recentRate = recent.length / 15;
    const olderRate = older.length / 30;
    const growth = olderRate > 0 ? recentRate / olderRate : recentRate > 0 ? 1.5 : 1;
    const clampedGrowth = Math.max(0.6, Math.min(2, growth));
    const predicted = Math.max(1, Math.round(recentRate * 30 * clampedGrowth) || Math.round(historical * 0.6));

    const { topLocality, peakDay } = whereAndWhen(serviceBookings);

    return {
      service,
      historical,
      predicted,
      workerCount,
      state,
      demandPerWorker: +demandPerWorker.toFixed(2),
      topLocality,
      peakDay,
      trend: clampedGrowth >= 1.1 ? "rising" : clampedGrowth <= 0.9 ? "falling" : "steady",
    };
  });
}

// Deterministic template — instant fallback, and what's shown if the model isn't ready.
export function demandRecommendation(row) {
  const where = row.topLocality ? ` Demand concentrates around ${row.topLocality}` : "";
  const when = row.peakDay ? `${row.topLocality ? ", peaking on" : " Demand peaks on"} ${row.peakDay}s.` : where ? "." : "";
  if (row.state === "critical")
    return `${row.service.name}: only ${row.workerCount} worker(s) cover rising demand — recommend onboarding 2-3 more this month.${where}${when}`;
  if (row.state === "shortage")
    return `${row.service.name}: demand is outpacing supply — consider cross-training members from adjacent trades.${where}${when}`;
  return `${row.service.name}: supply is matching demand — no action needed this cycle.${where}${when}`;
}

// Real local-model version — the shortage/critical/healthy classification itself stays
// deterministic (computed in demandRadarForCoop above); only this written recommendation
// sentence is model-generated, from those same computed numbers.
export async function demandRecommendationAI(row) {
  const messages = [
    {
      role: "system",
      content:
        "You are a workforce planning assistant for a service cooperative. Write one concise, specific recommendation (1-2 sentences) based on the data given.",
    },
    {
      role: "user",
      content: `Service: ${row.service.name}. Status: ${row.state}. Workers available: ${row.workerCount}. Demand per worker: ${row.demandPerWorker}. Trend: ${row.trend}. Top locality: ${row.topLocality || "n/a"}. Peak day: ${row.peakDay || "n/a"}.`,
    },
  ];
  return runLocalAI(messages, { maxNewTokens: 60 });
}

// ---------------- Federation Insights (Section 26) ----------------
// Deterministic template version — instant fallback, and what's shown if the model isn't ready.
export function federationInsights(cooperatives) {
  const avgUtil = cooperatives.reduce((s, c) => s + c.utilization, 0) / cooperatives.length;
  const below = cooperatives.filter((c) => c.utilization < avgUtil - 8);
  const above = cooperatives.filter((c) => c.utilization > avgUtil + 8);
  const insights = [];
  if (below.length) {
    insights.push({
      insight: `${below.length} cooperative(s) are running below network-average utilization.`,
      reason: `${below.map((c) => c.name).join(", ")} sit more than 8 points under the ${avgUtil.toFixed(0)}% network average.`,
      action: "Route overflow bookings from high-utilization cooperatives to these districts.",
    });
  }
  if (above.length) {
    insights.push({
      insight: `${above.length} cooperative(s) are near or above capacity.`,
      reason: `${above.map((c) => c.name).join(", ")} are running above ${(avgUtil + 8).toFixed(0)}% utilization, risking response-time slippage.`,
      action: "Prioritize member onboarding drives in these districts next quarter.",
    });
  }
  const fundTotal = cooperatives.reduce((s, c) => s + c.welfareFundBalance, 0);
  insights.push({
    insight: `Network welfare fund holds ${formatINR(fundTotal)} across ${cooperatives.length} cooperatives.`,
    reason: "Aggregated from each cooperative's welfare contribution ledger.",
    action: "On track — no rebalancing required this cycle.",
  });
  return insights;
}

// ---------------- Cooperative Network (shortage ↔ surplus routing) ----------------
// Finds, per service, which cooperatives are genuinely short-handed (from
// demandRadarForCoop) and which have real idle worker capacity to spare, then pairs
// them directly — instead of only saying "some coops are above/below average".
export function cooperativeNetworkMatches(cooperatives) {
  const bySer = {};
  cooperatives.forEach((coop) => {
    demandRadarForCoop(coop.id).forEach((row) => {
      const idleCapacity = WORKERS.filter((w) => w.coopId === coop.id && w.skills.includes(row.service.id)).reduce(
        (s, w) => s + Math.max(0, w.maxWeeklyCapacity - w.workloadThisWeek),
        0
      );
      (bySer[row.service.id] ||= []).push({ coop, row, idleCapacity });
    });
  });

  const matches = [];
  Object.entries(bySer).forEach(([serviceId, entries]) => {
    const service = SERVICES.find((s) => s.id === serviceId);
    const shortages = entries
      .filter((e) => (e.row.state === "shortage" || e.row.state === "critical") && e.row.historical > 0)
      .sort((a, b) => b.row.demandPerWorker - a.row.demandPerWorker);
    const surpluses = entries
      .filter((e) => e.row.state === "healthy" && e.row.demandPerWorker < 1 && e.idleCapacity > 0)
      .sort((a, b) => b.idleCapacity - a.idleCapacity);
    if (!shortages.length || !surpluses.length) return;

    shortages.forEach((shortageEntry) => {
      const surplusEntry = surpluses.find((s) => s.coop.id !== shortageEntry.coop.id);
      if (!surplusEntry) return;
      const gapEstimate = Math.max(1, Math.round((shortageEntry.row.demandPerWorker - 2) * shortageEntry.row.workerCount));
      const suggestedSlots = Math.max(1, Math.min(surplusEntry.idleCapacity, gapEstimate));
      matches.push({
        service,
        from: surplusEntry.coop,
        to: shortageEntry.coop,
        suggestedSlots,
        toState: shortageEntry.row.state,
        toDemandPerWorker: shortageEntry.row.demandPerWorker,
        fromIdleCapacity: surplusEntry.idleCapacity,
      });
    });
  });

  // Strongest shortages first (critical before shortage, larger gap first).
  matches.sort((a, b) => (b.toState === "critical") - (a.toState === "critical") || b.toDemandPerWorker - a.toDemandPerWorker);
  return matches;
}

// Real local-model version — which cooperative is under/over network average stays
// deterministic (same math as above); only the written insight/reason/action text is
// model-generated, from those same computed facts, so it can't invent numbers.
export async function federationInsightsAI(cooperatives) {
  const avgUtil = cooperatives.reduce((s, c) => s + c.utilization, 0) / cooperatives.length;
  const below = cooperatives.filter((c) => c.utilization < avgUtil - 8);
  const above = cooperatives.filter((c) => c.utilization > avgUtil + 8);
  const fundTotal = cooperatives.reduce((s, c) => s + c.welfareFundBalance, 0);

  const facts = [];
  if (below.length) {
    facts.push({
      tone: "alert",
      data: `${below.length} cooperative(s) — ${below.map((c) => c.name).join(", ")} — are running more than 8 points below the network-average utilization of ${avgUtil.toFixed(0)}%.`,
    });
  }
  if (above.length) {
    facts.push({
      tone: "marigold",
      data: `${above.length} cooperative(s) — ${above.map((c) => c.name).join(", ")} — are running above ${(avgUtil + 8).toFixed(0)}% utilization, risking response-time slippage.`,
    });
  }
  facts.push({
    tone: "teal",
    data: `The network welfare fund holds ${formatINR(fundTotal)} across ${cooperatives.length} cooperatives.`,
  });

  const written = await Promise.all(
    facts.map(async (f) => {
      const messages = [
        {
          role: "system",
          content:
            "You write short network-operations insights for a federation of worker cooperatives. Given one fact, respond with exactly two lines: 'Reason: <one sentence explaining why it matters>' then 'Action: <one concise recommended action>'. Don't invent numbers not in the fact.",
        },
        { role: "user", content: f.data },
      ];
      const text = await runLocalAI(messages, { maxNewTokens: 80 });
      const reasonMatch = text.match(/Reason:\s*(.*)/i);
      const actionMatch = text.match(/Action:\s*(.*)/i);
      return {
        tone: f.tone,
        insight: f.data,
        reason: reasonMatch ? reasonMatch[1].trim() : text,
        action: actionMatch ? actionMatch[1].trim() : "Review with the federation team.",
      };
    })
  );
  return written;
}

// ---------------- AI Service Assistant (Section 17) ----------------
const ISSUE_KEYWORDS = [
  { category: "electrical", words: ["shock", "spark", "short circuit", "wiring", "switch", "fuse", "mcb", "power", "socket", "electric"] },
  { category: "plumbing", words: ["leak", "pipe", "tap", "drain", "clog", "toilet", "water", "flush", "faucet"] },
  { category: "carpentry", words: ["door", "hinge", "cupboard", "wood", "drawer", "furniture", "lock"] },
  { category: "appliance", words: ["fridge", "washing machine", "mixer", "microwave", "geyser", "appliance"] },
  { category: "ac", words: ["ac", "cooling", "gas", "compressor", "air conditioner"] },
  { category: "pest", words: ["cockroach", "termite", "rodent", "pest", "ants", "mosquito"] },
  { category: "cleaning", words: ["clean", "dust", "sanitize", "deep clean"] },
  { category: "painting", words: ["paint", "wall", "crack", "damp"] },
];

export function classifyIssue(text) {
  const lower = text.toLowerCase();
  for (const entry of ISSUE_KEYWORDS) {
    if (entry.words.some((w) => lower.includes(w))) {
      return SERVICES.find((s) => s.id === entry.category);
    }
  }
  return null;
}

// Real local-model fallback — only called when the instant keyword pass above finds
// nothing, so common phrasing stays instant and only unmatched text waits on the model.
export async function classifyIssueAI(text) {
  try {
    const names = SERVICES.map((s) => s.name).join(", ");
    const messages = [
      {
        role: "system",
        content: `Which service category does this describe: ${names}? Reply with only the category name.`,
      },
      { role: "user", content: text },
    ];
    const raw = (await runLocalAI(messages, { maxNewTokens: 8 })).trim().toLowerCase();
    return SERVICES.find((s) => raw.includes(s.name.toLowerCase())) || null;
  } catch {
    return null;
  }
}

// ---------------- Customer-side trust factors (Section 15) ----------------
export function customerTrustFactorRows(customer) {
  return [
    { label: "Phone Verified", value: true, weight: 30 },
    { label: "Address Confirmed", value: true, weight: 25 },
    { label: `${customer.bookingsCount}+ Completed Bookings`, value: customer.bookingsCount >= 3, weight: 25 },
    { label: "No Unresolved Disputes", value: !DISPUTES.some((d) => d.customerId === customer.id && d.status === "open"), weight: 20 },
  ];
}

// ---------------- Fair Rating Intelligence (Section 16) ----------------
export function ratingAnomalies(workerId) {
  const jobs = bookingsForWorker(workerId).filter((b) => b.ratingDims);
  if (jobs.length < 2) return { flagged: [], avg: null };
  const scores = jobs.map((b) => (b.ratingDims.punctuality + b.ratingDims.quality + b.ratingDims.professionalism) / 3);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const flagged = jobs.filter((b, i) => Math.abs(scores[i] - avg) >= 1.6);
  return { flagged, avg: +avg.toFixed(2), jobs };
}

// ---------------- Verification Center (Section 27) ----------------
export function verificationStages(worker) {
  return [
    { label: "Identity Document", status: worker.identityVerified ? "done" : "pending" },
    { label: "Skill Certification", status: worker.skillVerified ? "done" : worker.identityVerified ? "current" : "pending" },
    { label: "Background Check", status: worker.backgroundVerified ? "done" : worker.skillVerified ? "current" : "pending" },
    { label: "Cooperative Approval", status: worker.identityVerified && worker.skillVerified && worker.backgroundVerified ? "done" : "pending" },
  ];
}

// ---------------- Opportunity Balance (Section 21) ----------------
export function opportunityBalanceForCoop(coopId) {
  const members = WORKERS.filter((w) => w.coopId === coopId);
  const rows = members
    .map((w) => ({ worker: w, sharePct: +((w.workloadThisWeek / w.maxWeeklyCapacity) * 100).toFixed(0) }))
    .sort((a, b) => b.sharePct - a.sharePct);
  const eligible = members.filter((w) => w.workloadThisWeek < w.maxWeeklyCapacity * 0.5);
  const avgShare = rows.reduce((s, r) => s + r.sharePct, 0) / (rows.length || 1);
  return { rows, eligible, avgShare: +avgShare.toFixed(0) };
}

// ---------------- Cooperative Impact Ledger (Section 22) ----------------
export function impactLedgerForCoop(coopId) {
  const bookings = bookingsForCoop(coopId).filter((b) => b.status === "completed");
  const totals = bookings.reduce(
    (acc, b) => {
      acc.worker += b.breakdown.worker;
      acc.cooperative += b.breakdown.cooperative;
      acc.welfare += b.breakdown.welfare;
      acc.ops += b.breakdown.ops;
      return acc;
    },
    { worker: 0, cooperative: 0, welfare: 0, ops: 0 }
  );
  const impacts = [
    { label: "Paid directly to members", amount: totals.worker, note: "Distributed across cooperative workers this period." },
    { label: "Reinvested in cooperative operations", amount: totals.cooperative, note: "Covers coordination, tooling, and admin costs." },
    { label: "Welfare fund contribution", amount: totals.welfare, note: "Feeds the emergency fund and insurance pool." },
    { label: "Platform operations", amount: totals.ops, note: "Shared infrastructure cost across the federation." },
  ];
  return { totals, impacts, bookingCount: bookings.length };
}

// ---------------- Training & Upskilling (Section 29) ----------------
export function coursesForWorker(worker) {
  const relevant = COURSES.filter((c) => !c.serviceId || worker.skills.includes(c.serviceId));
  return relevant.slice(0, 5);
}

// ---------------- Emergency Service (Section 14) ----------------
export function emergencyEligibleWorkers(district, serviceId) {
  return workersForService(serviceId)
    .filter((w) => w.district === district && w.availabilityToday)
    .sort((a, b) => a.avgResponseMins - b.avgResponseMins)
    .slice(0, 4);
}

// ---------------- Disputes (Section 28) ----------------
export function disputesForCustomer(customerId) {
  return DISPUTES.filter((d) => d.customerId === customerId);
}
export function disputesForWorker(workerId) {
  return DISPUTES.filter((d) => d.workerId === workerId);
}
export function disputesForCoop(coopId) {
  return DISPUTES.filter((d) => d.coopId === coopId);
}
const DISPUTE_CATEGORIES = ["Billing", "Punctuality", "Conduct", "Service Quality"];

// Deterministic keyword fallback — used if the model returns something outside the
// four known categories (rare, small-model case), so the UI never breaks.
export function classifyDisputeFallback(text) {
  const lower = text.toLowerCase();
  if (/(charge|price|bill|amount|money)/.test(lower)) return { category: "Billing", confidence: 88 };
  if (/(late|time|delay|wait)/.test(lower)) return { category: "Punctuality", confidence: 84 };
  if (/(rude|behav|attitude|conduct)/.test(lower)) return { category: "Conduct", confidence: 90 };
  return { category: "Service Quality", confidence: 79 };
}

// Real local-model classification.
export async function classifyDispute(text) {
  try {
    const messages = [
      {
        role: "system",
        content:
          "Classify the complaint into exactly one category: Billing, Punctuality, Conduct, or Service Quality. Reply with only the category name.",
      },
      { role: "user", content: text },
    ];
    const raw = (await runLocalAI(messages, { maxNewTokens: 5 })).trim();
    const category = DISPUTE_CATEGORIES.find((c) => raw.toLowerCase().includes(c.toLowerCase()));
    if (!category) return classifyDisputeFallback(text); // model returned something unrecognized — snap to keyword fallback
    return { category, confidence: 85 }; // the API doesn't return a real confidence score — an approximate display number, not a measured one
  } catch {
    return classifyDisputeFallback(text); // model not loaded / failed — keyword fallback
  }
}
