// SAHAAY seed data engine — deterministic pseudo-random generator.
// Every screen in the app reads from the objects exported here.
// No backend: this module IS the backend, as a set of pure functions over static state.

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(19830512);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickN = (arr, n) => {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
};
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const flt = (min, max, dp = 1) => +(rand() * (max - min) + min).toFixed(dp);
const bool = (p = 0.5) => rand() < p;

// ---------- reference pools ----------
export const MALE_NAMES = ["Ravi Kumar", "Suresh Yadav", "Manoj Prasad", "Anil Gowda", "Ramesh Naidu", "Prakash Reddy", "Vijay Singh", "Ajay Verma", "Deepak Rao", "Santosh Pillai", "Mahesh Chand", "Kiran Babu", "Ganesh Iyer", "Naveen Kumar", "Sunil Mehta", "Raju Shetty", "Arun Das", "Rajesh Sharma", "Vinod Nair", "Baburao Patil"];
export const FEMALE_NAMES = ["Lakshmi Devi", "Sunita Kumari", "Meena Bai", "Kavita Rani", "Radha Krishnan", "Anita Sharma", "Geeta Devi", "Priya Reddy", "Shanti Bai", "Rekha Nair", "Sarita Yadav", "Vandana Joshi", "Padma Lakshmi", "Usha Rani", "Kamala Devi"];
export const CUSTOMER_NAMES = ["Arjun Mehta", "Sneha Kapoor", "Rohit Bansal", "Aisha Khan", "Karthik Subramaniam", "Divya Menon", "Farhan Ahmed", "Neha Gupta", "Sameer Joshi", "Pooja Iyer", "Vikram Chauhan", "Anjali Desai", "Imran Sheikh", "Ritu Malhotra", "Aditya Rao"];
export const DISTRICTS = [
  { district: "Vijayawada", state: "Andhra Pradesh" },
  { district: "Guntur", state: "Andhra Pradesh" },
  { district: "Amaravati", state: "Andhra Pradesh" },
  { district: "Visakhapatnam", state: "Andhra Pradesh" },
  { district: "Hyderabad", state: "Telangana" },
  { district: "Warangal", state: "Telangana" },
  { district: "Chennai", state: "Tamil Nadu" },
  { district: "Bengaluru Urban", state: "Karnataka" },
];
export const LOCALITIES = ["Governorpet", "Benz Circle", "Auto Nagar", "MG Road", "Patamata", "Gunadala", "Ashok Nagar", "Poranki", "Kanuru", "Machavaram", "Ramavarappadu", "Suryaraopet"];

export const SERVICES = [
  { id: "electrical", name: "Electrical Repair", icon: "Zap", basePrice: 350 },
  { id: "plumbing", name: "Plumbing", icon: "Wrench", basePrice: 400 },
  { id: "carpentry", name: "Carpentry", icon: "Hammer", basePrice: 450 },
  { id: "cleaning", name: "Deep Cleaning", icon: "Sparkles", basePrice: 600 },
  { id: "appliance", name: "Appliance Repair", icon: "WashingMachine", basePrice: 500 },
  { id: "painting", name: "Painting", icon: "PaintRoller", basePrice: 3500 },
  { id: "pest", name: "Pest Control", icon: "Bug", basePrice: 800 },
  { id: "masonry", name: "Masonry", icon: "BrickWall", basePrice: 700 },
  { id: "ac", name: "AC Service & Repair", icon: "Wind", basePrice: 550 },
  { id: "gardening", name: "Gardening & Landscaping", icon: "Trees", basePrice: 450 },
  { id: "moving", name: "House Shifting", icon: "Truck", basePrice: 2200 },
];

const SKILL_CERTS = ["Certified Electrician (ITI)", "Govt. Plumbing License", "Carpentry Guild Certificate", "Safety Handling Cert.", "Appliance Repair Cert. (Bosch Authorised)", "Pest Control Handling License", "AC Gas Handling Cert.", "First Aid Certified"];

// ---------- cooperatives ----------
export const COOPERATIVES = DISTRICTS.flatMap((d, di) =>
  [0, 1].map((i) => {
    const id = `coop-${di}-${i}`;
    return {
      id,
      name: `${d.district} ${i === 0 ? "Seva" : "Shram"} Cooperative`,
      district: d.district,
      state: d.state,
      founded: int(2016, 2023),
      memberCount: int(18, 45),
      utilization: int(52, 96),
      welfareFundBalance: int(180000, 950000),
      servicesOffered: pickN(SERVICES, int(5, 9)).map((s) => s.id),
      trustRating: flt(3.9, 4.9),
    };
  })
);

// ---------- workers ----------
export const WORKERS = Array.from({ length: 30 }).map((_, i) => {
  const isMale = bool(0.72);
  const name = isMale ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
  const coop = pick(COOPERATIVES);
  const skills = pickN(SERVICES, int(1, 3));
  const experienceYears = int(1, 22);
  const completedJobs = int(20, 640);
  const identity = bool(0.94);
  const skillVerified = bool(0.88);
  const background = bool(0.9);
  const training = bool(0.65);
  const trustScore = Math.round(
    (identity ? 25 : 8) + (skillVerified ? 25 : 10) + (background ? 25 : 10) + (training ? 15 : 5) + int(0, 10)
  );
  return {
    id: `worker-${i + 1}`,
    name,
    gender: isMale ? "male" : "female",
    coopId: coop.id,
    district: coop.district,
    locality: pick(LOCALITIES),
    skills: skills.map((s) => s.id),
    certifications: pickN(SKILL_CERTS, int(1, 3)),
    experienceYears,
    completedJobs,
    rating: flt(3.6, 5.0),
    ratingCount: int(12, 480),
    workloadThisWeek: int(2, 9),
    maxWeeklyCapacity: 10,
    hourlyRate: skills[0].basePrice + int(-50, 120),
    avgResponseMins: int(12, 55),
    languages: pickN(["Telugu", "Hindi", "English", "Tamil", "Kannada"], int(1, 3)),
    identityVerified: identity,
    skillVerified,
    backgroundVerified: background,
    trainingCompleted: training,
    trustScore: Math.min(trustScore, 100),
    onTimeRate: int(78, 99),
    repeatCustomerRate: int(15, 68),
    welfareContribution: int(500, 3200),
    emergencyFundEligible: bool(0.8),
    insuranceStatus: bool(0.7) ? "Active" : "Pending Enrolment",
    trainingCredits: int(0, 6),
    availabilityToday: bool(0.75),
  };
});

// ---------- customers ----------
export const CUSTOMERS = Array.from({ length: 15 }).map((_, i) => {
  const d = pick(DISTRICTS);
  return {
    id: `cust-${i + 1}`,
    name: pick(CUSTOMER_NAMES),
    district: d.district,
    locality: pick(LOCALITIES),
    bookingsCount: int(1, 24),
    isInstitutional: bool(0.15),
  };
});

// ---------- bookings ----------
const STATUSES = ["completed", "completed", "completed", "completed", "in_progress", "scheduled", "cancelled"];
export const BOOKINGS = Array.from({ length: 100 }).map((_, i) => {
  const service = pick(SERVICES);
  const worker = pick(WORKERS.filter((w) => w.skills.includes(service.id)) .length ? WORKERS.filter((w) => w.skills.includes(service.id)) : WORKERS);
  const customer = pick(CUSTOMERS);
  const amount = service.basePrice + int(-40, 250);
  const workerCut = Math.round(amount * 0.72);
  const welfareCut = Math.round(amount * 0.08);
  const opsCut = Math.round(amount * 0.05);
  const coopCut = amount - workerCut - welfareCut - opsCut;
  const daysAgo = int(0, 45);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id: `bk-${1000 + i}`,
    serviceId: service.id,
    workerId: worker.id,
    coopId: worker.coopId,
    customerId: customer.id,
    status: pick(STATUSES),
    date: date.toISOString().slice(0, 10),
    amount,
    breakdown: { worker: workerCut, cooperative: coopCut, welfare: welfareCut, ops: opsCut },
    rating: bool(0.85) ? int(3, 5) : null,
    ratingDims: bool(0.85) ? { punctuality: int(3, 5), quality: int(3, 5), professionalism: int(3, 5) } : null,
  };
});

// ---------- helpers exported for pages ----------
export const serviceById = (id) => SERVICES.find((s) => s.id === id);
export const workerById = (id) => WORKERS.find((w) => w.id === id);
export const coopById = (id) => COOPERATIVES.find((c) => c.id === id);
export const customerById = (id) => CUSTOMERS.find((c) => c.id === id);

export const workersForService = (serviceId) => WORKERS.filter((w) => w.skills.includes(serviceId));
export const bookingsForWorker = (workerId) => BOOKINGS.filter((b) => b.workerId === workerId);
export const bookingsForCoop = (coopId) => BOOKINGS.filter((b) => b.coopId === coopId);
export const bookingsForCustomer = (customerId) => BOOKINGS.filter((b) => b.customerId === customerId);

export const CURRENT_CUSTOMER = CUSTOMERS[0];
export const CURRENT_WORKER = WORKERS[0];
export const CURRENT_COOP = COOPERATIVES[0];

// ---------- institutions (Section 19) ----------
export const INSTITUTIONS = [
  { id: "inst-1", name: "Sri Chaitanya Public School", type: "School", district: "Vijayawada", units: 3, contact: "Admin Office" },
  { id: "inst-2", name: "Guntur Government Hospital", type: "Hospital", district: "Guntur", units: 5, contact: "Facilities Dept." },
  { id: "inst-3", name: "Amaravati Heights Apartments", type: "Apartment Complex", district: "Amaravati", units: 4, contact: "RWA Office" },
  { id: "inst-4", name: "Vizag Tech Park", type: "Office Campus", district: "Visakhapatnam", units: 6, contact: "Facilities Manager" },
  { id: "inst-5", name: "Hyderabad Central Mall", type: "Commercial", district: "Hyderabad", units: 2, contact: "Ops Team" },
];

// ---------- training courses (Section 29) ----------
export const COURSES = [
  { id: "crs-1", title: "Advanced Wiring & Panel Safety", serviceId: "electrical", durationHrs: 12, credits: 2 },
  { id: "crs-2", title: "Modern Bathroom Fitting Systems", serviceId: "plumbing", durationHrs: 10, credits: 2 },
  { id: "crs-3", title: "Modular Furniture Assembly", serviceId: "carpentry", durationHrs: 8, credits: 1 },
  { id: "crs-4", title: "Split AC Gas Handling Certification", serviceId: "ac", durationHrs: 14, credits: 3 },
  { id: "crs-5", title: "Commercial Deep-Cleaning Protocols", serviceId: "cleaning", durationHrs: 6, credits: 1 },
  { id: "crs-6", title: "Safe Pesticide Handling Refresher", serviceId: "pest", durationHrs: 6, credits: 1 },
  { id: "crs-7", title: "Customer Communication & De-escalation", serviceId: null, durationHrs: 4, credits: 1 },
  { id: "crs-8", title: "First Aid & On-site Safety", serviceId: null, durationHrs: 5, credits: 1 },
];

// ---------- disputes (Section 28) ----------
const DISPUTE_REASONS = [
  "Job marked complete but work was incomplete",
  "Price charged did not match the estimate",
  "Worker arrived significantly late without notice",
  "Disagreement over additional parts cost",
  "Customer unreachable at scheduled time",
  "Quality of work below expectation",
];
const DISPUTE_STATUSES = ["open", "under_review", "resolved", "resolved", "escalated"];
export const DISPUTES = Array.from({ length: 9 }).map((_, i) => {
  const booking = pick(BOOKINGS);
  return {
    id: `disp-${100 + i}`,
    bookingId: booking.id,
    workerId: booking.workerId,
    customerId: booking.customerId,
    coopId: booking.coopId,
    filedBy: bool(0.6) ? "customer" : "worker",
    category: pick(["Service Quality", "Billing", "Punctuality", "Conduct"]),
    reason: pick(DISPUTE_REASONS),
    status: pick(DISPUTE_STATUSES),
    filedDaysAgo: int(0, 20),
    aiCategoryConfidence: int(72, 97),
  };
});

// ---------- notifications (Section 24) ----------
function buildNotifications(role) {
  const templates = {
    customer: [
      { title: "Worker on the way", body: "Ravi Kumar is heading to your location.", tone: "teal" },
      { title: "Booking confirmed", body: "Your electrical repair is scheduled for tomorrow, 9–11 AM.", tone: "coop" },
      { title: "Rate your last service", body: "Tell us how the plumbing job went.", tone: "marigold" },
      { title: "Fair Wage Guard applied", body: "Your last payment included the cooperative's fair-price floor.", tone: "teal" },
    ],
    worker: [
      { title: "New job matched", body: "A FairMatch job is waiting for your response.", tone: "coop" },
      { title: "Payout processed", body: "₹1,240 was credited to your account.", tone: "coop" },
      { title: "Training credit earned", body: "You earned 1 training credit for a completed certification.", tone: "marigold" },
      { title: "Verification reminder", body: "Upload your background check document to complete verification.", tone: "alert" },
    ],
    coop: [
      { title: "Demand shortage flagged", body: "AC Service is running critical this week.", tone: "alert" },
      { title: "New member application", body: "A new worker has applied to join your cooperative.", tone: "teal" },
      { title: "Welfare fund milestone", body: "Your welfare fund has crossed ₹5,00,000.", tone: "coop" },
    ],
    federation: [
      { title: "Utilization gap widening", body: "3 cooperatives are trending below network average.", tone: "alert" },
      { title: "Network welfare report ready", body: "Quarterly welfare fund report is available.", tone: "teal" },
    ],
  };
  return (templates[role] || []).map((n, i) => ({ id: `notif-${role}-${i}`, read: bool(0.4), daysAgo: int(0, 6), ...n }));
}
export const NOTIFICATIONS = {
  customer: buildNotifications("customer"),
  worker: buildNotifications("worker"),
  coop: buildNotifications("coop"),
  federation: buildNotifications("federation"),
};
