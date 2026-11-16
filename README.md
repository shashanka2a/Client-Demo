# Wick'd Environmental — Interactive Client Portal Demo

Interactive product demonstration of the Wick'd Environmental client portal for solar site asset management. Prospective clients can experience all client-facing capabilities with realistic mock data, animated walkthroughs, and geospatial KMZ asset mapping without needing production credentials or connecting to live systems.

## Key Workflows Demonstrated

1. **Client Dashboard & Site Overview (`/portal/overview`)**
   - High-level project specifications (210 Acres, Birmingham, AL).
   - Collapsible contractor and superintendent directory with direct contact links.
   - Chronological maintenance schedule (Wicking, Spraying, Mowing) with past and upcoming cycles.
   - Interactive client inquiry submission form with simulated real-time response.

2. **KMZ Satellite Asset Mapping (`/portal/map`)**
   - Leaflet satellite imagery loaded with full solar site boundary and panel blocks (Blocks A–S).
   - Dynamic asset layer controls (Boundary, Acreage Labels, Hazard & Vegetation pins).
   - Interactive geotagged observation inspection card.
   - Direct integration link with Google Earth for 3D flyovers.

3. **Site Health Watchlist & Issue Remediation (`/portal/health`)**
   - Proactive risk tracking across Hazards, Environmental, Electrical Safety, and Stormwater.
   - Open vs. Resolved issue lifecycle tracking.
   - Expandable audit trail with chronological employee updates and field notes.
   - Full-screen high-resolution photo inspection lightbox.

4. **Drone & Field Photo Gallery (`/portal/gallery`)**
   - Date-stamped high-resolution photography repository.
   - Real-time keyword & tag search (e.g. "kudzu", "inverter").
   - Category filter chips (Progress, Chemical, Equipment, Safety, Wildlife, Weather).
   - Interactive photo lightbox with superintendent captions.

5. **Certified Daily Field Reports (`/portal/reports`)**
   - Daily signed field logs from superintendents with digital certification stamps.
   - Detailed weather metrics (temperature, humidity, wind direction/speed for zero-drift compliance).
   - Personnel headcounts, specialized equipment deployed, and acreage treated.
   - Simulated official PDF download and printable inspection records.

6. **Multi-Project Portfolio Switcher & Client Profile (`/portal/profile`)**
   - Portfolio switcher demonstrating multi-site scalability across utility-scale facilities.
   - Role-based security guardrails and authorized project permissions.
   - Seamless transition into Free Exploration Mode.

## Guided Demo Controls

- **Start Guided Tour**: Initiates the 22-step guided animation tour with simulated cursor, clicks, and spotlight highlights.
- **Pause / Resume**: Pause at any time to read or inspect elements; resume with a single click.
- **Step Navigation (Prev / Next)**: Skip backwards or forwards through individual steps.
- **Workflow Feature Dropdown**: Jump directly to any of the 6 core workflows.
- **Playback Speed**: Toggle between 1x and 1.5x pacing.
- **Exit Walkthrough**: Switch instantly into **Free Exploration Mode** to manually interact with all portal pages, switch projects, search photos, and test forms.
- **Replay Step**: Replay the current step animation anytime.

## Quick Start

```bash
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001`).

- **Instant Demo Access**: Click **"Launch Interactive Product Demo"** on the login screen, or sign in with `demo@meridianenergy.com` / `demoportal`.


### Vercel environment variables

Add these in the Vercel project **Settings → Environment Variables** (Production, Preview, and Development):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — portal API data loading |
| `NEXT_PUBLIC_APP_URL` | e.g. `https://app.utilityvision.app` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Routes

| Path | Description |
|------|-------------|
| `/` | Login |
| `/portal/overview` | Project overview |
| `/portal/map` | KMZ boundary map (Leaflet) |
| `/portal/health` | Site health watchlist |
| `/portal/gallery` | Photo gallery |
| `/portal/reports` | Daily field reports |

## Project structure

```
app/                  # App Router pages & layouts
components/portal/    # Portal screens & navigation
contexts/             # Auth context
lib/                  # Shared data & types
```
