# 🚨 LOCURA — Community-Driven Emergency Response & Safety Platform

LOCURA connects people in distress with nearby verified civilian first-responders, trusted contacts, and official emergency helplines within seconds — closing the critical "Golden Hour" gap in emergency dispatch.

Built for **Smart India Hackathon 2026**.

---

## LIVE DEMO 
  👉   https://locura-2-0.vercel.app

----



## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Current Limitations & Roadmap](#-current-limitations--roadmap)
- [License](#-license)

---

## 🧩 Problem Statement

Emergency medical services and police often take **15–30+ minutes** to reach a victim, missing the critical **10-minute "Golden Hour"** where immediate bystander intervention can save a life. Existing safety apps either send passive SMS alerts with no coordination, or expose sensitive personal data to untrusted strangers.

LOCURA solves this by mobilizing **verified nearby civilian helpers** for rapid first response, while keeping personal and medical data protected through a tiered privacy model.

---

## ✨ Key Features

- **One-Touch SOS Trigger** — 2-second press-and-hold activation with 5 incident categories (Medical, Accident, Unsafe Situation, Fire, Flood)
- **Hyper-Local Helper Dispatch** — Alerts verified community helpers within 1–3 km of the victim
- **3-Tier Medical Privacy Model** — Family sees full details, nearby helpers see only life-critical data (blood group, allergies), hospitals get time-limited (2-hour) secure access tokens
- **Trust Score System** — Helpers earn a dynamic 0.0–5.0 reputation score based on verified responses and post-emergency feedback
- **Incident-Aware Safe Routing** — Interactive map comparing the fastest route vs. a safer, better-lit route
- **Rule-Based Area Risk Engine** — Scores area safety (0–100) using incident history, time-of-day lighting rules, and weather/flood alerts
- **Offline-First Failsafes:**
  - Low-battery (≤5%) automatic GPS beacon to trusted contacts
  - `sms:` URI fallback to send location via the phone's native SMS app with no internet
  - Offline incident report queue that auto-syncs when connectivity returns
- **Multilingual UI** — English, Hindi, Telugu, and Spanish

---

## 🛠 Tech Stack

**Frontend**
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool & dev server
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [React Router](https://reactrouter.com/) — client-side routing
- [Leaflet.js](https://leafletjs.com/) — interactive maps (OpenStreetMap tiles)
- [Lucide React](https://lucide.dev/) — icon set

**Data Layer (current)**
- Browser `localStorage` for all persistence (SOS history, medical profiles, helper records, incidents)
- Seed/demo data in `src/data/mockData.ts`

**Data Layer (staged, not yet connected)**
- Firebase config scaffold (`src/services/firebaseConfig.ts`) prepared for future Firestore + Cloud Messaging integration — **not wired in yet**, no live backend or database is connected in this version

> **Note:** This prototype is fully client-side. There is currently no backend server, REST API, or SQL/NoSQL database in production use — everything runs and persists locally in the browser for demo purposes.

---

## 🏗 Project Architecture

LOCURA follows a **client-side, event-driven service architecture**. Each service is a standalone class exposing a `subscribe()` method; whenever its internal state changes, it calls `notify()` to instantly push updates to every subscribed component — no polling, no server round-trip.

```
UI Components (Pages)
        │  subscribe() / calls
        ▼
┌─────────────────────────────────────────────┐
│              Service Layer                   │
│  SosService · HelperService · LocationService│
│  IncidentService · MedicalService            │
│  RiskService · AuthService                   │
└─────────────────────────────────────────────┘
        │  read/write
        ▼
   localStorage (browser persistence)
        │
        ▼
  [Planned] Firebase Firestore + Cloud Messaging
```

**Core services:**

| Service | Responsibility |
|---|---|
| `sosService.ts` | SOS lifecycle — trigger, dispatch, resolve, feedback |
| `helperService.ts` | Helper registry, verification status, trust scoring |
| `locationService.ts` | GPS tracking, battery-status beacon, SMS fallback |
| `incidentService.ts` | Hazard/incident reporting, offline queue & sync |
| `medicalService.ts` | 3-tier medical data access & secure token generation |
| `riskService.ts` | Rule-based area safety scoring (0–100) |
| `authService.ts` | Local session/login state management |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd locura-2.0

# Install dependencies
npm install

# Copy environment template (optional — app runs fully without it)
cp .env.example .env

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Type-check with `tsc` and build for production |
| `npm run preview` | Preview the production build locally |

---

## 🔐 Environment Variables

Copy `.env.example` to `.env`. These are **optional** for running the demo — the app works fully offline using `localStorage` without any of these keys set.

```env
# Firebase Cloud Suite (staged for future Firestore/Cloud Messaging integration)
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""

# Google Maps Platform (optional — Leaflet/OpenStreetMap is the default, no key required)
VITE_GOOGLE_MAPS_API_KEY=""

# Weather / disaster alert API (optional, for future risk-engine enrichment)
VITE_WEATHER_API_KEY=""
```

---

## 📁 Project Structure

```
locura-2.0/
├── public/                  # Static assets
├── src/
│   ├── assets/               # Images, icons
│   ├── components/           # Reusable UI components (maps, modals, cards)
│   ├── data/                 # Seed/demo data (mockData.ts)
│   ├── pages/                 # Route-level pages (Dashboard, SOS, Helpers, etc.)
│   ├── services/              # Event-driven business logic layer
│   ├── types/                  # Shared TypeScript types/interfaces
│   ├── utils/                   # Helpers (i18n, storage wrapper, etc.)
│   └── main.tsx                  # App entry point
├── .env.example
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 🗺 Current Limitations & Roadmap

**Known limitations (current prototype):**
- No live backend — data is local to each browser/device and does not sync across users
- Firebase integration is scaffolded but not connected (no live Firestore/Cloud Messaging calls)
- SMS fallback requires user tap confirmation (browsers can't send SMS silently)
- Safe-route pathing uses waypoint geometry between known safe landmarks, not a full routing graph

**Planned enhancements:**
- [ ] Firestore integration for real-time, multi-user data sync
- [ ] Node.js/Express backend with REST APIs and push notifications
- [ ] Twilio (or similar) integration for automated SMS/telephony alerts
- [ ] Native mobile app (React Native) with hardware panic-button triggers
- [ ] ML-based predictive risk scoring (replacing the current rule-based engine)
- [ ] Integration with India's ERSS-112 emergency dispatch system
- [ ] OSRM/graph-based routing for safe-route navigation
- [ ] Additional regional language support

---

## 📄 License

This project was built for Smart India Hackathon 2026. License to be determined by the team.

---

**Built with ❤️ for safer communities.**





# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:



See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.



support


👥 Team — SparkVerse

Built by Team SparkVerse (@LOCURA-SIH) for Smart India Hackathon 2026.


Sreeja Goundla                   @sreejagoundla-coder  
    |
Sindhu Reddy	                   @sindhureddy6
     |      
Kairakonda Jashwanth	           @jashwanthkairamkonda  
    |
Shaiinit Varsha	                 @shaiinitvarsha  
   |
Akshaya Kotha                    @AkshayaKotha15
   |
Varshini Reddy	                 @varshinireddy1711



## 📄 License

This project was built for Smart India Hackathon 2026. License to be determined by the team.

---

**Built with ❤️ for safer communities.**


