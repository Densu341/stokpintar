# StokPintar - Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] Run `npm run lint` - no errors
- [ ] Review git changes - `git diff`
- [ ] Test all pages locally - `npm run dev`
- [ ] Test CSV upload with sample data
- [ ] Verify error handling works
- [ ] Check console for warnings

### Environment Variables
- [ ] All required env vars are set in `.env.local`
- [ ] Test database connection works
- [ ] Test OpenAI API key is valid
- [ ] NEXT_PUBLIC_SITE_URL is correct for deployment

### Database
- [ ] Run `npm run init-db` successfully
- [ ] Tables created in Supabase
- [ ] RLS policies are enabled
- [ ] Test user signup/login
- [ ] Test data upload

### Functionality Test
- [ ] [ Sign up works
- [ ] Login works
- [ ] CSV upload succeeds
- [ ] Dashboard loads data
- [ ] Charts display correctly
- [ ] Insights page shows AI analysis
- [ ] Logout works

## Deploy to Vercel (Recommended)

### Step 1: Connect Repository
```bash
# Push to GitHub (if not already done)
git add .
git commit -m "Initial StokPintar MVP"
git push origin main
```

### Step 2: Import to Vercel
1. Go to vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select root directory (if needed)
5. Click "Import"

### Step 3: Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_value
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
SUPABASE_SERVICE_ROLE_KEY=your_value
OPENAI_API_KEY=your_value
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### Step 4: Deploy
1. Click "Deploy" button
2. Wait for build to complete
3. Visit your live URL

### Post-Deployment
1. Test signup at `https://your-domain.vercel.app/auth/signup`
2. Upload test CSV file
3. Verify dashboard shows data
4. Check insights page for AI analysis
5. Monitor Vercel logs for errors

## Deploy to Other Platforms

### Docker (Self-Hosted)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t stokpintar .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=... stokpintar
```

### AWS Amplify
1. Connect GitHub repository
2. Amplify auto-detects Next.js
3. Set environment variables
4. Deploy

### AWS Lambda + RDS
1. Use serverless-next.js plugin
2. Deploy database to RDS
3. Configure environment variables
4. Deploy function

### Railway.app
1. Connect GitHub repo
2. Add Postgres database
3. Set environment variables
4. Deploy

## Environment Variables by Platform

### Vercel
- Set in Project Settings → Environment Variables
- Support for preview/production environments

### Docker/Self-Hosted
- Create `.env.production.local`
- Or pass as environment variables at runtime
```bash
docker run -e NEXT_PUBLIC_SUPABASE_URL=... app
```

### AWS Lambda
- Use Parameter Store or Secrets Manager
- Reference in serverless.yml

## Database Migration on Deploy

### Supabase
Database migrations automatically run on the first deployment. If you need to run migrations manually:

```bash
# Local migration (already done)
npm run init-db

# Or use Supabase CLI
npx supabase db push
```

### Production Database Backup
Before deploying to production:
1. Go to Supabase Dashboard
2. Click "Backups" in left menu
3. Create manual backup
4. Test deployment
5. Monitor for errors

## Monitoring & Logging

### Vercel
- Dashboard shows deployment status
- Logs available in Function logs
- Error reporting with Sentry (optional)

### Supabase
- Monitor database logs in Dashboard
- Check Auth logs for signup/login issues
- View real-time database activity

### Application Errors
- Check browser console (DevTools F12)
- Check Vercel function logs
- Enable debug mode in `.env.local`:
```
DEBUG=*
```

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze
```

### Database Optimization
- Indexes are already created
- RLS policies are optimized
- Connection pooling via Supabase

### Caching Strategy
- Static pages: Revalidate every 1 hour
- API routes: Cache where possible
- Client-side: React Query for data caching

## Troubleshooting Deployment

### Build Fails
1. Check build logs in Vercel
2. Verify all dependencies in `package.json`
3. Check for TypeScript errors: `npm run build`
4. Clear cache and redeploy

### Database Connection Fails
1. Verify Supabase URL and keys
2. Check network/firewall settings
3. Test connection locally first
4. Verify RLS policies aren't blocking access

### Auth Not Working
1. Check Supabase Auth is enabled
2. Verify email/password signup is configured
3. Test with different browser
4. Clear cookies and try again

### OpenAI Features Not Working
1. Verify API key is correct
2. Check OpenAI account has credits
3. Monitor token usage in OpenAI dashboard
4. Test with simple request first

## Scaling Considerations

### For 100-1000 Users
- Current setup handles fine
- Monitor database connections
- Consider read replicas if needed

### For 1000+ Users
- Implement database connection pooling
- Cache frequently accessed data
- Consider CDN for static assets
- Implement rate limiting on APIs

### Performance Targets
- Page load: < 2 seconds
- CSV upload: < 5 seconds
- AI analysis: < 15 seconds (depends on data size)

## Security Checklist

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] RLS enabled on all tables
- [ ] API routes validate user ID
- [ ] No sensitive data in client code
- [ ] Environment variables not committed
- [ ] Regular backups configured
- [ ] Error messages don't leak data

## Rollback Procedure

### If Deployment Fails
1. Vercel automatically keeps previous version
2. Click "Deployments" tab
3. Select previous working version
4. Click "Redeploy"

### If Database Migration Fails
1. Check Supabase backups
2. Restore from backup if needed
3. Review and fix migration
4. Retry deployment

## Cost Estimation

### Supabase (Free tier included)
- DB: 500 MB (free)
- Auth: 50,000 monthly active users (free)
- Overages: ~$50/month per 100GB

### OpenAI
- Estimate: ~$0.01-0.10 per analysis (depends on data size)
- Monitor usage in OpenAI dashboard

### Vercel (Free tier included)
- Bandwidth: 100 GB/month (free)
- Serverless functions included (free)
- Overages: $0.50 per 100,000 function invocations

### Total Estimated Cost (1000 users)
- Supabase: ~$50-100/month
- OpenAI: ~$20-50/month  
- Vercel: Free to $10-50/month
- **Total: ~$70-200/month**

## Support & Maintenance

### Regular Tasks
- Monitor error logs weekly
- Check database performance monthly
- Review API usage
- Update dependencies quarterly
- Test backup restoration bi-annually

### Upgrade Path
1. Test in preview deployment
2. Get user feedback
3. Deploy to production
4. Monitor for issues
5. Document changes

## Contact & Escalation

For deployment issues:
1. Check error logs first
2. Review this guide
3. Check Supabase/Vercel docs
4. Open GitHub issue
5. Contact support

---

**Last Updated**: March 2024
**Deployed Version**: 0.1.0 (MVP)
