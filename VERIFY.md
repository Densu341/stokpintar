# StokPintar MVP - Verification Checklist

After setup, use this checklist to verify everything works correctly.

## Prerequisites ✓
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account created
- [ ] OpenAI account with API key
- [ ] `.env.local` file filled with all required variables

## Installation Verification

### 1. Dependencies Installed
```bash
npm install
```
- [ ] No dependency errors
- [ ] `node_modules/` folder exists
- [ ] `package-lock.json` updated

### 2. Database Initialized
```bash
npm run init-db
```
- [ ] No database errors
- [ ] 4 tables created in Supabase:
  - [ ] `users`
  - [ ] `sales_data`
  - [ ] `inventory_status`
  - [ ] `alerts`
- [ ] RLS policies enabled
- [ ] Indexes created

Check in Supabase Dashboard:
1. Go to SQL Editor
2. Run: `SELECT tablename FROM pg_tables WHERE schemaname='public';`
3. Should see 4 tables listed

### 3. Development Server Starts
```bash
npm run dev
```
- [ ] No build errors
- [ ] Server running on `http://localhost:3000`
- [ ] No TypeScript errors
- [ ] No console errors

## Feature Testing

### Authentication (5 minutes)

#### Signup Test
1. Open `http://localhost:3000`
2. Redirected to `/auth/login`
3. Click "Sign up" link
4. Fill signup form:
   - [ ] Email: `test@example.com`
   - [ ] Password: `TestPassword123!`
   - [ ] Confirm Password: Same
5. Click "Sign Up"
   - [ ] Success message appears
   - [ ] Redirected to dashboard
   - [ ] User can see Header with email

#### Logout Test
1. In Header, click "Logout"
   - [ ] Redirected to login page
   - [ ] Session cleared

#### Login Test
1. On login page, enter:
   - [ ] Email: `test@example.com`
   - [ ] Password: `TestPassword123!`
2. Click "Login"
   - [ ] Redirected to dashboard
   - [ ] Email shows in header

### CSV Upload (10 minutes)

#### Prepare Test Data
Create file `test.csv`:
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

#### Upload Test
1. Navigate to `/upload`
2. Click "Select File" or drag & drop `test.csv`
3. Verify:
   - [ ] File accepted
   - [ ] Preview shows data
   - [ ] No validation errors
4. Click "Upload"
5. Verify:
   - [ ] Success message shows
   - [ ] Data saved (check browser console for confirmation)
   - [ ] No errors in console

#### Database Verification
In Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM sales_data 
WHERE user_id = auth.uid();
```
- [ ] Should show 9 rows (3 products × 3 days)

### Dashboard (5 minutes)

Navigate to `/dashboard`

#### Check Elements
- [ ] Header displays with user email
- [ ] "Dashboard" nav item active
- [ ] Page loads without errors

#### Verify Components
1. **Quick Stats** (top section)
   - [ ] Shows "Total Sold: 139 units"
   - [ ] Shows burn rate
   - [ ] Shows "Days Until Stockout"
   - [ ] Shows last upload date

2. **Sales Trend Chart** (top chart)
   - [ ] Chart displays
   - [ ] Shows multiple products
   - [ ] X-axis: dates
   - [ ] Y-axis: quantities
   - [ ] Legend shows product names
   - [ ] Tooltip works on hover

3. **Inventory Cards** (bottom)
   - [ ] 3 cards display (one per product)
   - [ ] Each shows:
     - [ ] Product name
     - [ ] Current stock
     - [ ] Burn rate
     - [ ] Days remaining
     - [ ] Status indicator (color)

### Insights Page (10 minutes)

Navigate to `/insights`

#### Verify Page Structure
- [ ] Page loads successfully
- [ ] "Insights" nav item active
- [ ] Loading spinner initially shows
- [ ] Data loads within 10 seconds

#### Verify AI Analysis
For each product, should display:
- [ ] Product name
- [ ] Current stock
- [ ] Daily burn rate
- [ ] Days until stockout (estimated)
- [ ] Recommended order quantity
- [ ] Alert level badge:
  - [ ] Critical (red, ≤7 days)
  - [ ] Warning (yellow, 8-14 days)
  - [ ] Safe (green, >14 days)

Example for Laptop (87 stock, ~5.33/day burn rate):
- [ ] Estimated stockout: ~16 days
- [ ] Alert: "Safe" (not critical/warning)
- [ ] Recommended order: 50+ units

Example for Mouse (425 stock, ~41.67/day burn rate):
- [ ] Estimated stockout: ~10 days  
- [ ] Alert: "Warning" (yellow)
- [ ] Recommended order: 200+ units

Example for Monitor (46 stock, ~2.33/day burn rate):
- [ ] Estimated stockout: ~20 days
- [ ] Alert: "Safe"
- [ ] Recommended order: 20+ units

#### Verify AI Insights Text
- [ ] Each product has written analysis
- [ ] Analysis mentions burn rate
- [ ] Analysis mentions stockout timeline
- [ ] Recommendations are realistic
- [ ] Language is professional

### PWA Features (5 minutes)

#### Check PWA Files
Files that should exist:
- [ ] `/public/manifest.json`
- [ ] `next.config.js` with PWA config

#### Test Install (Android)
1. Open app in Chrome on Android
2. Tap menu (⋯) → "Install app"
   - [ ] Installation prompt appears
   - [ ] Click "Install"
   - [ ] App installs to home screen
   - [ ] Icon appears on home screen
   - [ ] Can launch from home screen

#### Test Install (iOS)
1. Open app in Safari on iPhone
2. Tap Share → "Add to Home Screen"
   - [ ] Option available
   - [ ] App adds to home screen
   - [ ] Icon appears on home screen
   - [ ] Can launch from home screen

#### Test Offline (if PWA installed)
1. On mobile, enable Airplane Mode
2. Launch app from home screen
3. Navigate pages
   - [ ] Pages that were visited load
   - [ ] Offline page shows for unvisited pages
   - [ ] Disable Airplane Mode
   - [ ] App syncs and shows latest data

## API Testing (Optional)

### Test Upload Endpoint
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.csv" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 OK
- [ ] Response includes parsed data
- [ ] Data matches CSV

### Test Analyze Endpoint
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId":"YOUR_USER_ID"}'
```
- [ ] Returns 200 OK
- [ ] Response includes burn_rate
- [ ] Response includes stockout_date
- [ ] Response includes recommendations

## Error Handling Tests

### Invalid CSV Upload
1. Create invalid CSV (missing columns)
2. Try to upload
   - [ ] Error message appears
   - [ ] Specific column mentioned
   - [ ] Upload doesn't proceed

### Invalid Login Credentials
1. Enter wrong password
   - [ ] Error message: "Invalid credentials"
   - [ ] Page doesn't navigate away

### Network Errors (Simulate)
1. Disconnect internet
2. Try to access dashboard
   - [ ] Error page shows
   - [ ] Offline page available (if PWA)
   - [ ] No crashes

## Performance Tests

### Page Load Time
Using DevTools Network tab:
- [ ] Dashboard: < 2 seconds
- [ ] Upload page: < 2 seconds
- [ ] Insights page: < 3 seconds (includes AI call)

### Bundle Size
```bash
npm run build
```
- [ ] Build succeeds
- [ ] No warnings
- [ ] `.next/` folder created

### Database Query Speed
Check Supabase logs:
- [ ] Queries: < 100ms
- [ ] Network latency: acceptable

## Cleanup & Final Steps

### Remove Test Data (Optional)
In Supabase SQL Editor:
```sql
DELETE FROM sales_data 
WHERE user_id = auth.uid();
```

### Clear Cookies (If needed)
DevTools → Application → Cookies:
- [ ] Delete `localhost` cookies
- [ ] Refresh page
- [ ] Redirected to login

### Review Logs
Browser Console (F12):
- [ ] No red errors
- [ ] No critical warnings
- [ ] Info messages are helpful

## Verification Results

### All Tests Passed! ✓
If all above checkmarks are complete:
- [ ] Authentication works
- [ ] CSV upload works
- [ ] Dashboard displays correctly
- [ ] AI analysis works
- [ ] PWA installable
- [ ] No console errors
- [ ] Performance acceptable

### Ready for Deployment ✓
You can now:
1. Deploy to Vercel (`vercel deploy`)
2. Invite beta users
3. Collect feedback
4. Plan next features

### Issues Found
If any tests failed:
1. Check the specific error in browser console
2. Review [PROJECT_SETUP.md](./PROJECT_SETUP.md)
3. Check environment variables in `.env.local`
4. Verify Supabase is configured correctly
5. Test with different browser
6. Clear cache and reload

## Test Data Summary

After verification:
- 1 user account created
- 3 products with 9 sales records
- 3 inventory items tracked
- 3 AI alerts generated

## Next Steps

### Local Development
- Continue adding features
- Test with more products
- Add more sales records
- Invite test users

### Production Deployment
1. Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Deploy to Vercel
3. Test live version
4. Monitor logs
5. Collect user feedback

### Optimization
- Review [QUICK_START.md](./QUICK_START.md) best practices
- Monitor database performance
- Track OpenAI API usage
- Optimize slow pages

## Support

If verification fails:
1. Check error message carefully
2. Review relevant documentation section
3. Check Supabase & Vercel logs
4. Try troubleshooting steps in docs
5. Delete `.env.local` and reconfigure

**Status**: Ready to verify ✓

---
**Last Updated**: March 2024
**Version**: MVP 0.1.0
