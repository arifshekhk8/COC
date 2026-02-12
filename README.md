# ⚔️ COC Clan App

A Progressive Web App for Clash of Clans clan management — real-time chat, clan tracking, war coordination.

## Architecture

```
/
├── Frontend/     Next.js 15 (App Router) + TypeScript + TailwindCSS + shadcn/ui
├── Backend/      Django 5 + DRF + Django Channels (ASGI) + JWT
├── run_dev.py    Starts both services concurrently
└── README.md     You are here
```

## Prerequisites

| Tool        | Version                    | Check               |
| ----------- | -------------------------- | ------------------- |
| **Python**  | 3.11+                      | `python3 --version` |
| **Node.js** | 20 LTS+                    | `node --version`    |
| **npm**     | 10+                        | `npm --version`     |
| **Redis**   | _optional but recommended_ | `redis-cli ping`    |

### Installing Redis (optional)

Redis is **recommended** for WebSocket support across multiple workers. Without it, the app falls back to `InMemoryChannelLayer` (works for single-process dev).

| OS                | Command                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| **macOS**         | `brew install redis && brew services start redis`                                              |
| **Ubuntu/Debian** | `sudo apt update && sudo apt install redis-server && sudo systemctl enable --now redis-server` |
| **Windows**       | Use [Redis for Windows](https://github.com/tporadowski/redis/releases) or install via WSL      |

Once running, set `REDIS_URL=redis://localhost:6379/0` in `Backend/.env`.

---

## Quick Start

### 1. Backend Setup

```bash
cd Backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file and edit as needed
cp .env.example .env

# Run migrations
python manage.py migrate

# (Optional) Create superuser for admin panel
python manage.py createsuperuser
```

### 2. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
```

### 3. Run Both Services

From the **project root**:

```bash
# Activate the backend venv first
source Backend/venv/bin/activate   # Windows: Backend\venv\Scripts\activate

# Start both services
python run_dev.py
```

You'll see:

```
  Frontend:   http://localhost:3000
  Backend:    http://localhost:8000
  Health:     http://localhost:8000/api/health/
  WebSocket:  ws://localhost:8000/ws/chat/<channelId>/?token=<jwt>
  Admin:      http://localhost:8000/admin/
```

Press **Ctrl+C** to stop both services cleanly.

---

## How to Test

### 1. Health Check

```bash
curl http://localhost:8000/api/health/
# → {"ok": true}
```

### 2. Sign In with Google

- Open http://localhost:3000/login
- Click the **"Sign in with Google"** button
- Authenticate with your Google account
- You'll be auto-redirected to the chat view

> **Note:** There is no username/password registration. All auth goes through Google.

### 3. Create a Channel & Send Messages

- Click the **+** button in the Chat tab
- Create a channel name (e.g., "general")
- Click into the channel and send messages

### 4. Verify Real-time WebSocket

- Open **two browser windows** both logged in (can be same or different users)
- Both open the same channel
- Messages sent in one window should appear instantly in the other

### 5. Enable Push Notifications

- Go to the **Profile** tab
- Click **"Enable Notifications"**
- Allow the browser permission prompt
- The subscription is stored in the backend DB

---

## API Endpoints

| Method | Endpoint                           | Auth | Description                      |
| ------ | ---------------------------------- | ---- | -------------------------------- |
| GET    | `/api/health/`                     | —    | Health check                     |
| POST   | `/api/auth/google/`                | —    | Google OAuth login (ID token)    |
| POST   | `/api/auth/refresh/`               | —    | Refresh access token             |
| GET    | `/api/auth/me/`                    | ✅   | Current user info                |
| GET    | `/api/chat/channels/`              | ✅   | List channels                    |
| POST   | `/api/chat/channels/`              | ✅   | Create channel                   |
| GET    | `/api/chat/channels/:id/messages/` | ✅   | List messages (cursor-paginated) |
| POST   | `/api/chat/channels/:id/messages/` | ✅   | Send message (REST)              |
| POST   | `/api/push/subscribe/`             | ✅   | Store push subscription          |
| POST   | `/api/push/test/`                  | ✅   | Test push (stub)                 |

### WebSocket

```
ws://localhost:8000/ws/chat/<channelId>/?token=<access_token>
```

**Auth method**: JWT access token via query string parameter `token`.

**Send**: `{"type": "chat.message", "text": "Hello!"}`
**Receive**: `{"id": 1, "text": "Hello!", "sender": {"id": 1, "username": "alice"}, "created_at": "..."}`

---

## Project Structure

### Backend

```
Backend/
├── config/
│   ├── settings/
│   │   ├── base.py         # Core settings (JWT, CORS, Channels)
│   │   └── dev.py          # Dev overrides
│   ├── urls.py             # Root URL config
│   ├── asgi.py             # ASGI + Channels routing
│   └── wsgi.py
├── apps/
│   ├── users/              # Google OAuth login, JWT issuing, me endpoint
│   ├── chat/               # Channels, messages, WS consumer
│   ├── clan/               # Placeholder: heroes, troops, defenses
│   └── push/               # Push subscription model + endpoints
├── requirements.txt
└── manage.py
```

### Frontend

```
Frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx        # Root layout + providers
│   │   ├── manifest.ts       # PWA manifest
│   │   ├── page.tsx          # Root redirect
│   │   ├── login/page.tsx    # Google Sign-In
│   │   └── (tabs)/
│   │       ├── layout.tsx    # Bottom tab navigation
│   │       ├── chat/
│   │       │   ├── page.tsx         # Channel list
│   │       │   └── [id]/page.tsx    # Channel detail + messages
│   │       ├── feed/page.tsx
│   │       ├── status/page.tsx
│   │       ├── war/page.tsx
│   │       └── profile/page.tsx
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── auth-guard.tsx
│   ├── hooks/
│   │   ├── use-chat-socket.ts
│   │   ├── use-push-subscription.ts
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── api.ts            # Axios + refresh interceptor
│   │   ├── providers.tsx     # TanStack Query provider
│   │   ├── types.ts
│   │   └── utils.ts
│   └── stores/
│       ├── auth-store.ts     # Zustand + persist
│       └── ui-store.ts
├── public/
│   ├── sw.js                 # Service worker
│   └── icons/
└── package.json
```

---

## Security Notes

- **Authentication**: Google-only OAuth via Google Identity Services (GIS). The backend verifies Google ID tokens server-side using `google-auth`.
- JWT tokens are stored in `localStorage` (via Zustand persist). For production, consider moving to `httpOnly` cookies with a BFF pattern.
- The Axios interceptor handles automatic token refresh on 401 responses.
- WebSocket auth uses query string token — acceptable for dev; consider ticket-based auth for production.
- Password login is fully disabled; all users have `set_unusable_password()`.

---

## Google OAuth Setup

The app uses **Google Identity Services** for authentication.

### Where the Client ID lives

| Location                          | Variable                        |
| --------------------------------- | ------------------------------- |
| `Backend/.env`                    | `GOOGLE_CLIENT_ID`              |
| `Backend/config/settings/base.py` | Falls back to hardcoded default |
| `Frontend/.env.local`             | `NEXT_PUBLIC_GOOGLE_CLIENT_ID`  |

### Google Cloud Console setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add **Authorized JavaScript origins**: `http://localhost:3000`
4. Copy the Client ID into the env vars above
5. No client secret is needed (GIS uses ID tokens, not authorization code flow)

---

## Tech Stack

**Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, TanStack Query, Zustand, Axios, react-virtuoso, emoji-mart, react-dropzone, lucide-react

**Backend**: Django 5, DRF, SimpleJWT, Django Channels, Daphne (ASGI), channels_redis, django-cors-headers, google-auth, SQLite (dev default)
