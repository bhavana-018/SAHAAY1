# SAHAAY — Cooperative Service Platform

## All 4 roles now integrated: Customer, Worker, Cooperative Admin, Federation Admin

## What's built (Sessions 1–3 of the build plan)

**Session 1 — Foundation**
- Design system: custom palette (deep teal / marigold / cooperative green), Fraunces + IBM Plex type pairing, shared component library (KPI grid, entity cards, badge row, breakdown ledger, chart pair, insight card, timeline, wizard shell, chat shell, voice mic, language switcher)
- Seed data engine (`src/data/seed.js`): 11 services, 16 cooperatives, 30 workers, 15 customers, 100 bookings — deterministic, realistic Indian names/districts/INR pricing
- Landing page: animated Customer→AI→Cooperative→Worker flow visual, count-up "Sample Data" stats, value-prop cards

**Session 2 — Customer Experience + Booking + FairMatch AI**
- Customer dashboard: all 11 service categories with icon/price/response time/worker count
- Full 6-step booking wizard: service → describe (text + voice + photo/video attach) → location/radius → time slot → AI Service Assistant category suggestion → FairMatch worker results
- FairMatch AI: real weighted scoring (`src/lib/logic.js`) — skill match, distance, availability, certification, rating, workload, and fair opportunity — with a "why recommended" explanation per worker
- Fair Wage Guard: price breakdown modal shown before booking confirmation

**Session 3 — Worker Experience**
- Worker profile + Digital Skill Passport (visual verification timeline)
- Worker dashboard: today's stats, job-status timeline, upcoming jobs
- Availability: weekly calendar toggle **and** a working voice-driven unavailability input (try the mic on the Availability page — say the phrase shown, in EN/HI/TE)
- Earnings dashboard: today/week/month toggle, trend chart, payment breakdown ledger, transaction history with invoice download affordance
- Welfare Wallet: contribution total, emergency fund eligibility, training credits, insurance status

All "AI" features are real deterministic logic over the seed data (see `src/lib/logic.js`) — no model calls, exactly as the spec requires, with disclaimer copy on every AI surface.

## Sessions 4–7 (now merged in)
- **Cooperative Admin** (role switcher: "Cooperative Admin view") — Dashboard, AI Demand Radar, Opportunity Balance, Impact Ledger
- **Federation Admin** (role switcher: "Federation Admin view") — Federation Dashboard (state/national filtering), Federation Insights
- **Cross-role additions to Customer & Worker**: Trust Score (two-sided), Emergency Service, AI Service Assistant (chat), Complaints & Disputes, Notification Center
- **Worker-only additions**: Verification Center, Fair Rating Intelligence, Training & Upskilling
- **Customer-only additions**: Institutional Booking (bulk/recurring)
- **Payments**: mock UPI/card/netbanking/wallet flow (`PaymentFlow`), now wired into both the standard booking confirm step and Institutional Booking checkout

All of this reads from the same `src/data/seed.js` / `src/lib/logic.js` used by sessions 1–3 — no separate mock data per section. New shared logic helpers (trust factors, demand radar, opportunity balance, impact ledger, verification stages, dispute classification, federation insights) live in `src/lib/logic.js`.

**Note:** this merge was done in a sandboxed environment without network access, so `npm install` / `npm run build` could not be run here to verify the build end-to-end. Every relative import, named/default export, and bracket/brace balance was checked statically across all touched files with no mismatches found — but please run a local build before treating this as final. If `npm run build` throws anything, paste the error back and it can be fixed immediately.

## Run locally
```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/ — deploy dist/ to Vercel/Netlify
```

## Enabling real AI (optional but recommended)
The AI Service Assistant, dispute categorization, Booking Wizard suggestions, AI Demand
Radar, and Federation Insights use Hugging Face Inference Providers for generated text.
The browser never receives the production Hugging Face token. Requests go through the
Vercel serverless function at `/api/chat`.

### Vercel / production setup
1. Create a Hugging Face access token with permission to make Inference Providers calls.
2. In Vercel, open **Project → Settings → Environment Variables**.
3. Add `HF_TOKEN` with your Hugging Face token.
4. Add `HF_MODEL` with `openai/gpt-oss-120b:fastest` (or another chat model available through Hugging Face Inference Providers).
5. Redeploy the project after saving the variables.

### Local development
For `npm run dev`, copy `.env.example` to `.env` and set `VITE_DEV_HF_TOKEN`.
This local-only variable is used only while Vite is running in development mode.
Production builds use `/api/chat` and the server-side `HF_TOKEN` instead.

If Hugging Face returns a rate limit or temporary provider error, SAHAAY automatically
falls back to its deterministic keyword/template responses.

### Security
Never put the production Hugging Face token in a `VITE_*` variable. Vite exposes `VITE_*`
values to browser code. The production token is intentionally named `HF_TOKEN` and is
read only by `api/chat.js`.

## Map (Booking Wizard → Location & radius)
Uses `leaflet` + `react-leaflet` with OpenStreetMap tiles — free, no API key needed.
Shows the selected locality with a radius circle that updates live as you drag the
search-radius slider.

## Stack
React + Vite + Tailwind CSS + Recharts + lucide-react + Leaflet/react-leaflet, as
confirmed in the build plan.
