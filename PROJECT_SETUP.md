# StokPintar - MVP Setup Guide

## Features
- 📊 **Dashboard**: Visualize sales trends with interactive charts
- 📤 **CSV Upload**: Import sales data from TikTok/Shopee exports
- 🚨 **Smart Alerts**: AI-powered burn rate analysis and stockout predictions
- 📱 **PWA Ready**: Install as an app on Android/iOS without app stores
- 🔐 **Secure Auth**: Email/password authentication with Supabase

## Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account with PostgreSQL database
- OpenAI API key for AI features

## Quick Setup

### 1. Environment Variables
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `OPENAI_API_KEY` - Your OpenAI API key
- `NEXT_PUBLIC_SITE_URL` - Your application URL

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Initialize Database
```bash
npm run init-db
# or
node scripts/init-db.js
```

This creates 4 tables:
- `users` - User accounts and profiles
- `sales_data` - Uploaded sales records
- `inventory_status` - Current stock levels by product
- `alerts` - Smart alerts and predictions

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000 to see your app.

## Project Structure

```
app/
├── (protected)/          # Auth-protected routes
│   ├── dashboard/        # Sales analytics dashboard
│   ├── upload/           # CSV file upload page
│   └── insights/         # AI-powered smart alerts
├── auth/                 # Authentication pages
│   ├── login/
│   └── signup/
└── api/                  # API endpoints
    ├── upload/           # File upload handler
    └── analyze/          # OpenAI analysis endpoint

lib/
├── supabase.ts          # Supabase client setup
├── auth.ts              # Authentication utilities
├── data.ts              # Database queries
├── openai.ts            # OpenAI integration
└── csv-parser.ts        # CSV parsing utilities

components/             # Reusable React components
├── Header.tsx
├── SalesTrendChart.tsx
├── InventoryStatusCard.tsx
├── QuickStats.tsx
└── AlertCard.tsx
```

## How to Use

### 1. Create Account
- Go to `/auth/signup`
- Sign up with email and password

### 2. Upload Sales Data
- Click "Upload" in the header
- Upload a CSV file with columns: `product_name`, `quantity_sold`, `date`, `initial_stock`
- The system automatically calculates burn rates

### 3. View Dashboard
- See sales trends and inventory status
- Charts update after each upload

### 4. Check Smart Alerts
- AI analyzes your data and predicts stockout dates
- Get recommendations on order quantities
- Alerts show urgency: Critical (≤7 days), Warning (≤14 days), Safe

### 5. Install as PWA
- On Android: Browser menu → "Install app"
- On iOS: Share → "Add to Home Screen"
- Access offline with cached data

## CSV Format Example

```csv
product_name,quantity_sold,date,initial_stock
Laptop,5,2024-03-01,100
Laptop,3,2024-03-02,95
Mouse,50,2024-03-01,500
Mouse,40,2024-03-02,460
```

## API Endpoints

### POST /api/upload
Upload and parse CSV file
- Body: `FormData` with `file` field
- Returns: Parsed data and confirmation

### POST /api/analyze
Trigger AI analysis for smart alerts
- Body: `{ userId: string }`
- Returns: Burn rate calculations and stockout predictions

## Troubleshooting

**Database connection error?**
- Check your Supabase credentials in `.env.local`
- Ensure tables are created by running `npm run init-db`

**Upload not working?**
- File must be CSV or Excel format
- Required columns: `product_name`, `quantity_sold`, `date`, `initial_stock`

**AI features not generating?**
- Verify your OpenAI API key is valid
- Check token usage in your OpenAI account

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Charts**: Recharts
- **AI**: OpenAI GPT-4
- **PWA**: next-pwa
- **File Handling**: PapaParse (CSV), XLSX (Excel)

## Deployment

### Deploy to Vercel (Recommended)
```bash
vercel deploy
```

### Environment Variables on Vercel
Add these in Vercel Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Support
For issues or questions, check the documentation or create a GitHub issue.
