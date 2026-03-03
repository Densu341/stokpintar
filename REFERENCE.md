# StokPintar MVP - Quick Reference Card

## 30-Second Summary

Complete inventory SaaS with:
- User auth (email/password)
- CSV upload & parsing
- Sales dashboard with charts
- AI-powered predictions
- PWA installation support

## First 5 Minutes

```bash
# 1. Create .env.local with your keys
# (Copy from .env.example)

# 2. Install & setup
npm install
npm run init-db

# 3. Start
npm run dev

# 4. Visit http://localhost:3000
```

## User Flow

```
Sign Up → Upload CSV → View Dashboard → Check Insights → Install PWA
```

## Pages Map

| URL | Purpose | Auth Required |
|-----|---------|---------------|
| `/` | Home | ✓ (redirects) |
| `/auth/login` | Login | ✗ |
| `/auth/signup` | Sign up | ✗ |
| `/dashboard` | Sales analytics | ✓ |
| `/upload` | File upload | ✓ |
| `/insights` | AI alerts | ✓ |
| `/offline` | PWA fallback | ✗ |

## CSV Format

```csv
product_name,quantity_sold,date,initial_stock
Laptop,5,2024-03-01,100
Mouse,50,2024-03-01,500
```

**Required columns**: product_name, quantity_sold, date, initial_stock

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/upload` | Upload CSV file |
| POST | `/api/analyze` | Generate AI analysis |

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
NEXT_PUBLIC_SITE_URL=...
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Check code quality
npm run init-db  # Initialize database
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `sales_data` | Uploaded sales records |
| `inventory_status` | Current stock levels |
| `alerts` | AI-generated alerts |

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Header | `components/Header.tsx` | Navigation |
| Chart | `components/SalesTrendChart.tsx` | Sales graph |
| Cards | `components/InventoryStatusCard.tsx` | Stock cards |
| Stats | `components/QuickStats.tsx` | Key metrics |
| Alerts | `components/AlertCard.tsx` | Alert display |

## Key Libraries

| Library | Use |
|---------|-----|
| supabase-js | Database & auth |
| openai | AI analysis |
| recharts | Charts |
| papaparse | CSV parsing |
| next-pwa | PWA support |

## Burn Rate Formula

```
Burn Rate = Units Sold ÷ Days Elapsed
Days Until Stockout = Current Stock ÷ Burn Rate
```

## Alert Levels

| Level | Days Until Stockout | Color |
|-------|-------------------|-------|
| Critical | ≤ 7 days | Red |
| Warning | 8-14 days | Yellow |
| Safe | > 14 days | Green |

## File Structure (Important)

```
app/(protected)/     ← Login required routes
app/auth/           ← Public auth pages
app/api/            ← Backend endpoints
lib/                ← Business logic
components/         ← React components
public/manifest.json ← PWA config
.env.local          ← Your secrets
```

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| Can't login | Check `.env.local` vars |
| CSV upload fails | Verify columns match |
| No AI insights | Check OpenAI API key |
| Database error | Run `npm run init-db` |
| PWA won't install | Use Chrome/Safari, HTTPS needed |

## Performance Targets

- Page load: < 2s
- CSV upload: < 3s
- AI analysis: < 10s
- DB queries: < 100ms

## Deployment

```bash
# To Vercel (recommended)
vercel deploy

# Add env vars in Vercel dashboard
# Then done! 🚀
```

## Key Directories

| Directory | Contains |
|-----------|----------|
| `app/` | Pages and routes |
| `lib/` | Utilities and API calls |
| `components/` | Reusable UI components |
| `public/` | Static assets |
| `scripts/` | Setup scripts |

## CSS Classes Used

All styling via **Tailwind CSS**:
```
flex, gap, grid, p-*, m-*, text-*, bg-*, border-*, rounded
```

## Git Commands

```bash
# First time setup
git clone <repo>
cd stokpintar

# Daily workflow
git add .
git commit -m "Your message"
git push

# Revert changes
git checkout -- .
```

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)

## Feature Flags

None currently, but to add:
1. Create env var: `FEATURE_X_ENABLED`
2. Check in code: `if (process.env.FEATURE_X_ENABLED)`

## Monitoring (Vercel)

- Dashboard → Deployments
- Functions tab → Logs
- Analytics tab → Metrics

## Test Data

```csv
product_name,quantity_sold,date,initial_stock
Laptop,5,2024-03-01,100
Laptop,8,2024-03-02,95
Laptop,3,2024-03-03,87
Mouse,50,2024-03-01,500
Mouse,40,2024-03-02,460
Mouse,35,2024-03-03,425
Monitor,2,2024-03-01,50
Monitor,3,2024-03-02,48
Monitor,2,2024-03-03,46
```

## Response Formats

### Upload Endpoint
```json
{
  "success": true,
  "data": [
    {
      "product_name": "Laptop",
      "quantity_sold": 5,
      "date": "2024-03-01",
      "initial_stock": 100
    }
  ],
  "message": "Data uploaded successfully"
}
```

### Analyze Endpoint
```json
{
  "product_name": "Laptop",
  "burn_rate": 5.33,
  "current_stock": 87,
  "estimated_stockout_date": "2024-03-19",
  "days_remaining": 16,
  "alert_level": "safe",
  "recommended_order_qty": 50,
  "analysis": "Your Laptop sales are steady..."
}
```

## Important Notes

1. **Security**: Never commit `.env.local`
2. **Database**: Always backup before major changes
3. **Costs**: Monitor OpenAI usage regularly
4. **Scale**: Add indexes for > 100k records
5. **PWA**: Requires HTTPS (not localhost)

## Contact Points

- Database: Supabase dashboard
- Auth: Supabase Auth section
- AI: OpenAI dashboard
- Hosting: Vercel dashboard
- Code: Your GitHub repo

## Version History

- **0.1.0** (Current): MVP with core features

## Support Docs

1. **[MVPREADY.md](./MVPREADY.md)** - Overview
2. **[QUICK_START.md](./QUICK_START.md)** - Fast setup
3. **[PROJECT_SETUP.md](./PROJECT_SETUP.md)** - Detailed guide
4. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production
5. **[VERIFY.md](./VERIFY.md)** - Testing
6. **[INDEX.md](./INDEX.md)** - Everything
7. **[REFERENCE.md](./REFERENCE.md)** - This file

---

**Print this page or bookmark for quick reference!** 📌

Last Updated: March 2024 | Version: 0.1.0
