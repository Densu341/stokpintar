# StokPintar MVP - Quick Start

## 1. Environment Setup (5 minutes)

Create `.env.local` with these values:

```
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Get from OpenAI
OPENAI_API_KEY=sk-...

# Your app URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 2. Install & Setup Database (3 minutes)

```bash
# Install dependencies
npm install

# Initialize database (creates tables and enables RLS)
npm run init-db

# Start dev server
npm run dev
```

Visit http://localhost:3000

## 3. Test the App (10 minutes)

1. **Sign Up**: Create an account at `/auth/signup`
2. **Upload CSV**: Click "Upload" and try this sample data:

```csv
product_name,quantity_sold,date,initial_stock
Laptop,5,2024-03-01,100
Laptop,8,2024-03-02,95
Mouse,50,2024-03-01,500
Mouse,40,2024-03-02,460
Monitor,2,2024-03-01,50
Monitor,3,2024-03-02,48
```

3. **View Dashboard**: See your sales trends
4. **Check Insights**: View AI-powered burn rate predictions
5. **Install PWA**: On mobile, add the app to home screen

## Features Overview

### Dashboard
- Sales trend charts by product
- Quick inventory status
- Key metrics (total sold, burn rate)

### Upload
- CSV/Excel file support
- Required columns: product_name, quantity_sold, date, initial_stock
- Automatic validation and error handling

### Insights
- AI-powered burn rate analysis
- Stockout date predictions
- Recommended order quantities
- Alert levels: Critical (≤7 days), Warning (≤14 days), Safe (>14 days)

### PWA Features
- Install on Android/iOS
- Works offline with cached data
- Push notifications ready

## Troubleshooting

**Can't login after signup?**
- Check Supabase Auth is enabled
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct

**Upload failing?**
- File must be CSV or Excel format
- Required columns: product_name, quantity_sold, date, initial_stock
- Sample: 3 products, 2 records each works fine

**No AI insights?**
- Verify OPENAI_API_KEY is set correctly
- Check OpenAI account has credits
- Ensure you have at least 5 data records

**PWA not installing?**
- Use Chrome/Edge on Android
- Use Safari on iOS
- Check if HTTPS (required for PWA, use ngrok for local testing)

## File Structure

```
app/
├── (protected)/       # Protected routes (login required)
│   ├── dashboard/     # Sales analytics
│   ├── upload/        # CSV upload
│   └── insights/      # AI alerts
├── auth/              # Login/signup pages
└── api/               # API endpoints

lib/
├── supabase.ts        # Database client
├── openai.ts          # AI integration
├── data.ts            # Database queries
├── auth.ts            # Auth utilities
└── csv-parser.ts      # File parsing

components/           # Reusable components
```

## Next Steps

1. **Test all features** with sample data
2. **Check logs** using browser DevTools console
3. **Deploy to Vercel**: `vercel deploy`
4. **Add your own data** from TikTok/Shopee exports
5. **Customize colors** in `app/globals.css` and Tailwind config

## Support

- Check `PROJECT_SETUP.md` for detailed setup
- Review API endpoints in `PROJECT_SETUP.md`
- Enable Supabase logs to debug database issues
