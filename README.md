# VerbiQ - Real-Time Language Exchange Platform

VerbiQ is a full-stack language exchange app that connects learners with partners for real-time chat and profile-driven matching. It focuses on clean onboarding, partner discovery, and daily consistency through streaks.

## Features

- Match partners by native/learning language, timezone, and availability
- Friend requests, profiles, and discovery cards
- Stream-powered chat and video call entry point
- Daily goal streak check-in on Home
- Rich onboarding with interests and proficiency

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, React Router, Tailwind CSS, DaisyUI |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Realtime | Stream Chat |
| State/Data | TanStack Query |

## Getting Started

1) Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

2) Create env files

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

3) Add your keys

- `backend/.env`: MongoDB URI, Stream API key/secret, JWT secret
- `frontend/.env`: Stream API key

4) Run locally

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:5173`.

## License

See [LICENSE](LICENSE).

Contact : s26riti@gmail.com