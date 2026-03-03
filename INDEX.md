# StokPintar MVP - Documentation Index

Complete inventory management SaaS built with Next.js 16, Supabase, and OpenAI.

## Quick Navigation

### Getting Started
1. **[QUICK_START.md](./QUICK_START.md)** ← Start here! (10-minute setup)
2. **[PROJECT_SETUP.md](./PROJECT_SETUP.md)** - Detailed setup instructions
3. **[BUILD_SUMMARY.md](./BUILD_SUMMARY.md)** - What was built
4. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to production

### Core Features

#### Authentication
- Email/password signup and login
- Secure session management with Supabase Auth
- Protected routes that auto-redirect
- Location: `app/auth/` and `lib/auth.ts`

#### CSV Upload & Parsing
- Upload sales data from TikTok/Shopee
- Automatic CSV/Excel format detection
- Validation and error handling
- Parses: product_name, quantity_sold, date, initial_stock
- Location: `app/(protected)/upload/` and `lib/csv-parser.ts`

#### Sales Dashboard
- Interactive charts showing sales trends
- Inventory status by product
- Quick metrics (total sold, burn rate, days until stockout)
- Location: `app/(protected)/dashboard/` and `components/`

#### Smart Alerts & AI Analysis
- OpenAI GPT-4 integration
- Burn rate calculation and stockout prediction
- Product-level recommendations
- Alert severity levels (critical/warning/safe)
- Location: `app/(protected)/insights/` and `lib/openai.ts`

#### PWA (Progressive Web App)
- Installable on Android/iOS
- Works offline
- Home screen icon
- Location: `public/manifest.json` and `next.config.js`

## File Structure

```
StokPintar/
├── app/                          # Next.js app directory
│   ├── (protected)/              # Login-required routes
│   │   ├── dashboard/page.tsx    # Sales analytics
│   │   ├── upload/page.tsx       # CSV upload
│   │   ├── insights/page.tsx     # AI alerts
│   │   └── layout.tsx            # Auth check layout
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   └── signup/page.tsx       # Signup page
│   ├── api/
│   │   ├── upload/route.ts       # File upload API
│   │   └── analyze/route.ts      # AI analysis API
│   ├── layout.tsx                # Root layout with Header
│   ├── page.tsx                  # Home (redirects based on auth)
│   ├── globals.css               # Global styles
│   └── offline.tsx               # PWA offline page
│
├── components/                   # Reusable React components
│   ├── Header.tsx                # Navigation header
│   ├── SalesTrendChart.tsx       # Recharts visualization
│   ├── InventoryStatusCard.tsx   # Product cards
│   ├── QuickStats.tsx            # Key metrics
│   └── AlertCard.tsx             # Alert display
│
├── lib/                          # Business logic & utilities
│   ├── supabase.ts               # Database client
│   ├── auth.ts                   # Auth helpers
│   ├── data.ts                   # Database queries
│   ├── openai.ts                 # AI integration
│   ├── csv-parser.ts             # File parsing
│   └── utils.ts                  # Helper functions
│
├── public/
│   ├── manifest.json             # PWA configuration
│   └── [icons & assets]
│
├── scripts/
│   ├── init-db.js                # Database setup
│   └── 01-init-schema.sql        # SQL migrations
│
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js config with PWA
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies & scripts
└── [documentation files]
    ├── QUICK_START.md            # 10-min setup
    ├── PROJECT_SETUP.md          # Detailed setup
    ├── BUILD_SUMMARY.md          # What was built
    ├── DEPLOYMENT.md             # Production deployment
    └── INDEX.md                  # This file
```

## Database Schema

### users
```sql
id (UUID) - Auth user ID
email (TEXT) - User email
created_at (TIMESTAMP)
```

### sales_data
```sql
id, user_id, product_name, quantity_sold
sale_date, price_per_unit, source_platform, created_at
-- Indexes: user_id, user_id+product_name+date
```

### inventory_status
```sql
id, user_id, product_name, current_stock
last_updated
-- Index: user_id+product_name
```

### alerts
```sql
id, user_id, product_name, alert_type
estimated_stockout_date, burn_rate, recommended_order_qty
created_at
-- Index: user_id+created_at
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY          # Service role key
OPENAI_API_KEY                     # OpenAI API key
NEXT_PUBLIC_SITE_URL               # App URL (for redirects)
```

## API Endpoints

### POST `/api/upload`
Upload and parse CSV/Excel file
- Request: `FormData` with `file` field
- Response: `{ success: boolean, data: any[], message: string }`

### POST `/api/analyze`
Generate AI analysis for product
- Request: `{ userId: string, productName?: string }`
- Response: `{ burn_rate, stockout_date, recommendations, alert_level }`

## Key Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 16 |
| UI Framework | React | 19.2 |
| Language | TypeScript | 5.7 |
| Styling | Tailwind CSS | 3.4 |
| Database | Supabase/PostgreSQL | 2.45 |
| Authentication | Supabase Auth | - |
| AI | OpenAI GPT-4 | 4.67 |
| Charts | Recharts | 2.12 |
| CSV Parsing | PapaParse | 5.4 |
| PWA | next-pwa | 5.6 |

## Common Tasks

### Add a New Product Category
1. Update CSV parser to accept new field
2. Add column to `sales_data` table
3. Update dashboard chart filters
4. Update AI analysis to consider new field

### Customize Colors
1. Edit `app/globals.css` for CSS variables
2. Update `tailwind.config.ts` if using color tokens
3. Colors used: blue (#2563eb), gray, red, yellow, green

### Add User Settings
1. Create `app/(protected)/settings/page.tsx`
2. Create settings table in database
3. Update `lib/data.ts` with queries
4. Link from Header component

### Export Data
1. Create `app/api/export/route.ts`
2. Query user's sales_data
3. Convert to CSV
4. Return as downloadable file

### Add Email Notifications
1. Install `nodemailer` package
2. Create `lib/email.ts` with email service
3. Call from alert creation
4. Add email preferences to user settings

## Testing Checklist

- [ ] Sign up new account
- [ ] Login with email/password
- [ ] Upload sample CSV
- [ ] View dashboard with multiple products
- [ ] Check all chart types display
- [ ] Navigate to insights page
- [ ] See AI analysis and alerts
- [ ] Verify alert severity colors
- [ ] Logout successfully
- [ ] Login again
- [ ] Data persists
- [ ] Install PWA on mobile
- [ ] Test offline mode
- [ ] Upload new CSV
- [ ] Verify data updated in dashboard

## Performance Metrics

Target times (on average connection):
- Page load: < 2 seconds
- CSV upload (100 rows): < 3 seconds
- AI analysis: < 10 seconds
- Database query: < 100ms

## Security Features

- Row Level Security (RLS) on all tables
- Supabase Auth with secure sessions
- Protected routes with middleware
- CORS properly configured
- Environment variables not exposed
- API validation and sanitization

## Deployment Options

1. **Vercel** (Recommended) - 1-click deploy from GitHub
2. **Docker** - Self-hosted with docker-compose
3. **AWS** - Lambda + RDS or Amplify
4. **Railway** - Simple git-to-deployment
5. **Heroku** - Legacy but still works

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Monitoring & Analytics

### What to Monitor
- API response times
- Database query performance
- OpenAI token usage
- User signup/login rates
- CSV upload failures
- AI analysis success rate
- PWA installation count

### Tools
- Vercel: Built-in logs and analytics
- Supabase: Database metrics dashboard
- OpenAI: Token usage and costs
- Sentry: Error tracking (optional)

## Scaling Path

### 100 Users
- Current setup handles fine
- Monitor database connections

### 1,000 Users
- Add read replicas for queries
- Implement caching layer
- Rate limit API endpoints

### 10,000+ Users
- Separate database for analytics
- Message queue for async operations
- CDN for static assets
- Implement background jobs

## Known Limitations

- Max CSV file size: ~10MB (configurable)
- Max products per upload: 1000
- AI analysis limited by OpenAI API rates
- PWA offline functionality limited to cached pages
- Real-time alerts require polling (no WebSockets yet)

## Future Features

- Real-time notifications
- Multi-warehouse support
- Team/workspace management
- Supplier integration
- Automated reordering
- Mobile app (React Native)
- Advanced forecasting models
- API for third-party apps
- White-label solution

## Support Resources

### Documentation
- [Quick Start](./QUICK_START.md) - Fast setup guide
- [Project Setup](./PROJECT_SETUP.md) - Comprehensive setup
- [Build Summary](./BUILD_SUMMARY.md) - Features overview
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI Docs](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Troubleshooting
- Check browser console (F12) for errors
- Enable debug logging: `DEBUG=*`
- Check Vercel/Supabase logs
- Review error messages in UI

## Version History

### 0.1.0 (Current - MVP)
- Authentication system
- CSV upload & parsing
- Sales dashboard
- AI-powered alerts
- PWA support
- Database schema
- API endpoints

### Future (0.2.0)
- Email notifications
- Team workspaces
- Advanced analytics
- Scheduled reports
- API keys for developers

## License

This project is proprietary. All rights reserved.

## Contact

For questions or issues:
1. Check documentation first
2. Review error logs
3. Open GitHub issue
4. Contact support team

---

**Last Updated**: March 2024  
**Status**: MVP Ready  
**Version**: 0.1.0  

**Happy inventory management!** 📊
