# 🦯 Smart Cane Frontend (iCane)

Frontend application for the **Smart Cane Guardian System**, built with **React + Vite**.
This application serves as the main interface for guardians to monitor devices, track locations, receive alerts, and manage accounts in real time.
---

## 📌 Overview

This repository contains the **frontend-only implementation** of the Smart Cane platform.

It provides a responsive web dashboard for:

- Guardian monitoring
- Real-time device tracking
- Emergency alerts
- Location mapping
- Notifications and logs
- Account and settings management

> ⚠️ This project does NOT include backend services or database implementation.

---

## ✨ Core Features

### 🔐 Authentication System

- Login and registration flows
- Forgot password recovery
- OTP verification support
- Optional CAPTCHA protection

---

### 📊 Guardian Dashboard

- Protected dashboard routes
- Live device monitoring UI
- Emergency and fall alert overlays
- Auto-refresh and polling system

---

### 📱 Device Management

- Pair / unpair devices
- Device status overview
- Advanced device controls

---

### 🌐 Real-Time System

- WebSocket-based live updates
- Device and guardian event streaming
- Connection status indicators

---

### 🗺️ Location & Mapping

- Live GPS tracking via interactive maps
- Route history visualization
- Location logs with drill-down support

---

### 🔔 Notifications System

- In-app notification center
- Push notification support (Service Worker)
- Mark-as-read and grouped alerts

---

### 📜 Logs & Activity History

- Filterable activity logs
- Device event history
- Search and date-based filtering

---

### 🌦️ Weather Dashboard

- Weather forecast lookup
- Location-based search
- Safety recommendation (“Can go outside” indicator)

---

### 👤 Profile & Settings

- Guardian profile management
- Image upload support
- Privacy and permission controls
- Secure logout session handling

---

### 🎓 Onboarding Experience

- Guided UI walkthrough
- Feature highlight tour for first-time users

---

## 🧱 Tech Stack

- ⚛️ React 19
- ⚡ Vite 7
- 🧭 React Router 7
- 🧠 Zustand (state management)
- 🌐 Axios (API requests)
- 🗺️ Leaflet + React Leaflet (maps)
- 🎞️ Framer Motion (animations)
- 🎨 Tailwind CSS 4
- 🧪 Vitest + Testing Library

---

## 🚀 Getting Started

### 1. Install dependencies

```bash id="install_deps"
npm install
```

---

### 2. Setup environment variables

Create a `.env` file in the project root:

```bash id="env_copy"
cp .env.example .env
```

On Windows (PowerShell):

```powershell id="env_windows"
Copy-Item .env.example .env
```

If `.env.example` is not available, manually create `.env` using the template below.

---

### 3. Run development server

```bash id="run_dev"
npm run dev
```

App runs at:

```
http://localhost:5173
```

---

## ⚙️ Available Scripts

| Command              | Description               |
| -------------------- | ------------------------- |
| `npm run dev`        | Start development server  |
| `npm run build`      | Create production build   |
| `npm run preview`    | Preview production build  |
| `npm run lint`       | Run ESLint                |
| `npm run lint:fix`   | Auto-fix lint issues      |
| `npm run format`     | Format code with Prettier |
| `npm run test`       | Run tests                 |
| `npm run test:watch` | Watch mode testing        |

---

## 🔐 Environment Variables

```env
VITE_BACKEND_ENABLED=true
VITE_BACKEND_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
VITE_MIDDLEWARE_WS_URL=ws://localhost:3000

VITE_WEB_PUSH_PUBLIC_KEY=
VITE_PUSH_SUBSCRIPTION_ENDPOINT=/guardian/push-subscription

VITE_CAPTCHA_KEY=
VITE_ENV=development
VITE_OVERRIDE=false

```

### ⚠️ Notes:

- Only `VITE_` prefixed variables are exposed to the frontend.
- Never commit real production secrets.
- Use `.env.local` for private local overrides.

---

## 📡 PWA & Push Notifications

- Service Worker: `public/sw.js`
- Supports push notifications when the app is inactive
- Notification clicks redirect to `/notifications`

---

## 🧪 Testing

Run all tests:

```bash id="test_run"
npm run test
```

Watch mode:

```bash id="test_watch"
npm run test:watch
```

---

## 📦 Build & Deployment

```bash id="build"
npm run build
npm run preview
```

Output is a **static frontend build** ready for deployment.

---

## 📌 Project Scope

- Frontend-only system
- Requires backend API + WebSocket services for full functionality
- Designed for real-time IoT guardian monitoring

---

## 🧠 Summary

The Smart Cane Frontend is a real-time guardian dashboard built with React and Vite, providing monitoring, mapping, notifications, and device management for Smart Cane IoT-assisted safety device.

---
