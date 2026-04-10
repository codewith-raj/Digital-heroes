# 🏌️ Digital Heroes Golf Platform

A full-stack subscription-based golf draw platform where players enter their golf scores, participate in monthly prize draws, and simultaneously contribute a portion of their subscription to a charity of their choice.

# Deployed link : https://digital-heroes-rydq.vercel.app/

---

## ✨ Features

### For Players
- **Subscription Plans** — Monthly and yearly tiers powered by Stripe
- **Score Entry** — Log up to 5 golf scores (rolling window) per draw period
- **Monthly Prize Draws** — Random or algorithmic draws with 3, 4, and 5-match prize tiers
- **Charity Support** — Allocate 10–100% of your subscription to a partner charity
- **Winner Verification** — Upload proof of winnings for admin review and payout

### For Admins
- **Admin Dashboard** — Platform-wide stats: users, revenue, active subscriptions
- **User Management** — View, search, and manage all subscribers
- **Draw Management** — Create, simulate, and publish monthly draws
- **Charity Management** — Add, edit, and feature partner charities
- **Winner Management** — Review winner proofs and manage payout statuses

### Platform
- 🔐 JWT-based authentication with Supabase Auth
- 📧 Email notifications via Resend
- 💳 Stripe Webhooks for subscription lifecycle events
- 🔒 Row-Level Security (RLS) on all database tables
- 📱 Fully responsive UI

---

## 🗂 Project Structure

```
digital-heroes/
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── index.js       # Entry point, middleware, route registration
│   │   ├── routes/
│   │   │   ├── auth.js          # Register, login, forgot/reset password
│   │   │   ├── scores.js        # Score CRUD
│   │   │   ├── draws.js         # Draw listings & entries
│   │   │   ├── charities.js     # Charity listings & profiles
│   │   │   ├── subscriptions.js # Stripe checkout & portal
│   │   │   ├── winners.js       # Winner verification & proofs
│   │   │   └── admin.js         # Protected admin endpoints
│   │   ├── middleware/    # Auth middleware (JWT verification)
│   │   ├── lib/           # Supabase client, Stripe client
│   │   ├── services/      # Business logic
│   │   └── webhooks/
│   │       └── stripe.js  # Stripe webhook handler
│   ├── .env.example
│   └── vercel.json
│
├── frontend/              # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx        # Route definitions
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx / Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Charities.jsx / CharityProfile.jsx
│   │   │   ├── ForgotPassword.jsx / ResetPassword.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       ├── AdminDraws.jsx
│   │   │       ├── AdminCharities.jsx
│   │   │       └── AdminWinners.jsx
│   │   ├── components/    # Shared UI components
│   │   ├── hooks/         # useAuth, custom hooks
│   │   └── lib/           # Axios client, Supabase client
│   └── vercel.json
│
└── supabase/
    └── schema.sql         # Full database schema with RLS policies & seed data
```

---

## 🛠 Tech Stack

| Layer       | Technology                                 |
|-------------|---------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend     | Node.js, Express 4                          |
| Database    | Supabase (PostgreSQL + RLS)                 |
| Auth        | Supabase Auth + JWT                         |
| Payments    | Stripe (Subscriptions + Webhooks)           |
| Email       | Resend                                      |
| Deployment  | Vercel (separate frontend & backend projects)|

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode for development)
- A [Resend](https://resend.com) account (optional — emails are stubbed if not set)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/digital-heroes.git
cd digital-heroes
```

---

### 2. Set Up the Database

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**
2. Paste and run the entire contents of `supabase/schema.sql`

This will create all tables, enable Row Level Security, set up triggers, and seed 5 default charities.

> **Note:** After running the schema, go to **Storage → New Bucket** and create a private bucket named `winner-proofs`.

---

### 3. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email (optional)
RESEND_API_KEY=re_...

# Frontend URL (for CORS + Stripe redirects)
FRONTEND_URL=http://localhost:5173
```

#### Where to find these values

| Variable | Source |
|---|---|
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks |
| `STRIPE_MONTHLY_PRICE_ID` / `STRIPE_YEARLY_PRICE_ID` | Stripe Dashboard → Products (create two subscription products) |
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RESEND_API_KEY` | [Resend Dashboard](https://resend.com/api-keys) |

---

### 4. Configure Frontend Environment

```bash
cd ../frontend
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

### 5. Install Dependencies & Run

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

### 6. (Optional) Test Stripe Webhooks Locally

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

Copy the webhook signing secret it prints and set it as `STRIPE_WEBHOOK_SECRET` in your `.env`.

---

## 📡 API Reference

All routes are prefixed with `/api`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Health check | — |
| `POST` | `/auth/register` | Register new user | — |
| `POST` | `/auth/login` | Login | — |
| `POST` | `/auth/forgot-password` | Send reset email | — |
| `POST` | `/auth/reset-password` | Reset password | — |
| `GET` | `/scores` | Get user's scores | ✅ |
| `POST` | `/scores` | Add a score | ✅ |
| `DELETE` | `/scores/:id` | Delete a score | ✅ |
| `GET` | `/draws` | List published draws | ✅ |
| `GET` | `/charities` | List active charities | — |
| `GET` | `/charities/:id` | Charity profile | — |
| `POST` | `/subscriptions/checkout` | Start Stripe checkout | ✅ |
| `POST` | `/subscriptions/portal` | Open billing portal | ✅ |
| `GET` | `/winners` | Get user's win history | ✅ |
| `POST` | `/winners/:id/proof` | Upload winner proof | ✅ |
| `GET` | `/admin/stats` | Platform stats | 🔐 Admin |
| `GET` | `/admin/users` | All users | 🔐 Admin |
| `GET` | `/admin/draws` | All draws | 🔐 Admin |
| `POST` | `/admin/draws` | Create draw | 🔐 Admin |
| `PATCH` | `/admin/draws/:id` | Update draw | 🔐 Admin |
| `GET` | `/admin/charities` | All charities | 🔐 Admin |
| `POST` | `/admin/charities` | Create charity | 🔐 Admin |
| `PATCH` | `/admin/charities/:id` | Update charity | 🔐 Admin |
| `GET` | `/admin/winners` | All winner verifications | 🔐 Admin |
| `PATCH` | `/admin/winners/:id` | Update winner status | 🔐 Admin |

> **Auth header**: `Authorization: Bearer <jwt_token>`

---

## 🗃 Database Schema

| Table | Description |
|-------|-------------|
| `users` | Extends Supabase auth — stores role, subscription status, linked charity |
| `charities` | Partner charities with description, images, and events |
| `scores` | User golf scores (max 5 per user, rolling) |
| `draws` | Monthly prize draws (draft → simulated → published) |
| `draw_entries` | Users matched in a specific draw & their prize amount |
| `prize_pools` | Total and tier-split prize pools per draw |
| `charity_contributions` | Monthly charity allocation records per user |
| `winner_verifications` | Winner proof submissions and payout tracking |

All tables have **Row Level Security (RLS)** enabled. Users can only access their own data; admins have full access.

---

## 🌐 Deploying to Vercel

The platform deploys as **two separate Vercel projects** — one for the backend API and one for the frontend.

### Backend

```bash
cd backend
vercel --prod
```

Set all environment variables from `.env` in the Vercel project settings. The `vercel.json` in `backend/` configures Express as a serverless function.

### Frontend

```bash
cd frontend
vercel --prod
```

Set `VITE_API_URL` to your deployed backend URL (e.g., `https://your-backend.vercel.app/api`). The `vercel.json` in `frontend/` rewrites all routes to `index.html` for SPA routing.

### Stripe Webhook (Production)

In the Stripe Dashboard → Developers → Webhooks, add an endpoint pointing to:
```
https://your-backend.vercel.app/api/webhooks/stripe
```

---

## 🧑‍💻 Development Notes

- The backend uses **`nodemon`** for hot-reloading during development (`npm run dev`)
- Scores are automatically capped at **5 per user** by a Supabase database trigger
- A new user profile is automatically created in `public.users` on Supabase Auth signup via a database trigger
- Emails are **silently skipped** if `RESEND_API_KEY` is not set — safe for local development

---

## 📄 License

MIT © Digital Heroes
