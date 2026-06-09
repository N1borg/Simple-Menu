# 🧾 Simple Menu – QR Code Digital Menu for Bars & Restaurants

Simple Menu is a minimalist SaaS project for bars, cafés, and restaurants, allowing them to create **personalized online menus** accessible via **QR Code**.

Each establishment gets:
- A dynamic public page (`/e/bar-name`)
- A secured admin dashboard (`/e/bar-name/admin`)
- A dedicated database to manage products, offers, happy hours…

---

## 🚀 Features

- 🔐 Admin authentication with hashed passwords (bcrypt + JWT)
- 🧾 Menu display with dynamic sections and products
- ✍️ Real-time editing (name, description, price, availability…)
- 🎨 Customizable colors & logo per establishment
- 📸 Image uploads via Cloudinary
- 📦 Scalable multi-tenant architecture (`/e/[slug]`)
- 🧠 SSR rendering with smart caching (Next.js App Router)
- 📱 Mobile-friendly (optimized for QR code scanning)
- 💸 Stripe for subscription and payment management
- 🔔 Drag-and-drop category and item reordering
- 🧭 Guided onboarding tour (Driver.js)
- 📊 Subscription limits enforcement with upgrade prompts

---

## 🧠 Tech Stack

| Technology      | Role                                              |
|-----------------|---------------------------------------------------|
| **Next.js 15**  | SSR framework (App Router)                        |
| **TypeScript 5**| Language                                          |
| **Supabase**    | Postgres database & server-side client            |
| **TailwindCSS** | Responsive and fast UI                            |
| **Shadcn/UI**   | Accessible UI component library                   |
| **Cloudinary**  | Image hosting (logos, products)                   |
| **Stripe**      | Subscription billing & payment webhooks           |
| **Vercel**      | Hosting & Cron jobs                               |
| **Nodemailer**  | Transactional emails (Gmail SMTP)                 |
| **Framer Motion**| Animations                                       |
| **@dnd-kit**    | Drag-and-drop reordering                          |

---

## 🗂️ Project Structure

```
src/
├─ app/
│  ├─ e/[slug]/              → Dynamic pages per establishment
│  │  ├─ page.tsx            → Public page (menu)
│  │  ├─ admin/page.tsx      → Admin dashboard
│  │  └─ admin/setup/        → First-time setup wizard
│  ├─ api/                   → API route handlers (35+ endpoints)
│  └─ layout.tsx             → Main layout
├─ components/               → Reusable components (MenuDisplay, forms…)
├─ lib/                      → Service clients (Supabase, Stripe, Auth, Email)
├─ hooks/                    → Custom hooks (useSubscription, useDashboardTutorial)
├─ contexts/                 → React contexts (EstablishmentThemeContext)
├─ types/                    → TypeScript definitions
database/
└─ db.sql                    → Database schema
legal/                       → Legal documents
.env                         → Environment variables
```

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/N1borg/Simple-Menu.git
cd Simple-Menu
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ESSENTIEL_LAUNCH=
STRIPE_PRICE_ESSENTIEL_NORMAL=
STRIPE_PRICE_PRO_LAUNCH=
STRIPE_PRICE_PRO_NORMAL=
STRIPE_PRICE_PREMIUM_LAUNCH=
STRIPE_PRICE_PREMIUM_NORMAL=

# Cloudinary
CLOUDINARY_URL=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Auth
JWT_SECRET=

# Email (Gmail SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CRON_SECRET=
```

### 4. Set up the database

Run the SQL schema in your Supabase project:

```bash
# In Supabase SQL editor, run the contents of:
database/db.sql
```

### 5. Start the development server

```bash
npm run dev
```

### 6. Access the app

- Public menu demo: http://localhost:3000/e/demo
- Admin dashboard: http://localhost:3000/e/demo/admin

---

## 💳 Subscription Plans

| Plan         | Launch Price | Normal Price | Categories | Items    |
|--------------|-------------|--------------|------------|----------|
| **Essentiel**| €6.99/mo    | €13.99/mo    | 5          | 50       |
| **Pro**      | €12.99/mo   | €25.99/mo    | 15         | 200      |
| **Premium**  | €19.99/mo   | €39.99/mo    | Unlimited  | Unlimited|

Launch offer: 14-day free trial + 50% off for the first 3 months.

---

## 🔒 Security

- JWT sessions (httpOnly cookies, 10-round bcrypt hashing)
- Rate limiting (20 req/min per IP)
- Stripe webhook signature verification
- Audit logging with severity levels and IP tracking
- Production security headers: HSTS (2 years), CSP, X-Frame-Options, XSS protection
- Input validation with Zod schemas

---

## 📋 Status

**Discontinued** (Sept. 2025). Built and launched solo between June–September 2025. Archived when I moved to Los Angeles. Repository is public.
