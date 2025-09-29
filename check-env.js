
// check-env.js
// Simple check: logs and blocks if required env vars are missing before build or dev

require('dotenv').config({ path: '.env' })

const REQUIRED_VARS = [
  'ADMIN_CREATE_KEY',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLOUDINARY_URL',
  'CRON_SECRET',
  'DATABASE_URL',
  'FROM_EMAIL',
  'JWT_SECRET',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_URL',
  'NODE_ENV',
  'SMTP_HOST',
  'SMTP_PASSWORD',
  'SMTP_PORT',
  'SMTP_USER',
  'STRIPE_PRICE_ESSENTIEL',
  'STRIPE_PRICE_ESSENTIEL_PROMO',
  'STRIPE_PRICE_PREMIUM',
  'STRIPE_PRICE_PREMIUM_PROMO',
  'STRIPE_PRICE_PRO',
  'STRIPE_PRICE_PRO_PROMO',
  'STRIPE_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VERCEL_URL',
]

const missing = REQUIRED_VARS.filter((key) => !process.env[key])
if (missing.length > 0) {
  const msg = `\n[ENV CHECK] Missing required environment variables:\n  - ${missing.join('\n  - ')}\n`
  console.error(msg)
  process.exit(1)
}
