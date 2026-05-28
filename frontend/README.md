# VerbiQ Frontend

VerbiQ is a language exchange platform that helps learners find partners, chat, and build consistency with daily goals.

## Features

- Matching by native/learning language, timezone, and availability
- Friend requests, profiles, and partner discovery
- Stream-powered chat and video call entry points
- Daily goal streak prompt on the Home page

## Tech Stack

- React + Vite
- Tailwind CSS + DaisyUI
- TanStack Query
- Stream Chat UI

## Local Setup

1) Install dependencies

```
npm install
```

2) Create env file

```
cp .env.example .env
```

3) Add your Stream API key in `.env`

```
VITE_STREAM_API_KEY=your_stream_api_key
```

4) Run the dev server

```
npm run dev
```

The app runs at `http://localhost:5173`.
