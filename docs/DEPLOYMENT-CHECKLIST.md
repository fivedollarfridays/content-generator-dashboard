# Deployment Checklist

## Pre-Deployment

### Environment Configuration
- [ ] Set `NEXT_PUBLIC_API_URL` environment variable in Vercel dashboard
- [ ] Verify all environment variables are correctly configured
- [ ] Confirm API endpoint is accessible from production
- [ ] Test API key authentication flow

### Code Quality
- [ ] Run `npm run lint` and fix all issues
- [ ] Run `npm run type-check` and fix all TypeScript errors
- [ ] Run `npm run test` and ensure all tests pass
- [ ] Review console for any warnings during build

### Build Verification
- [ ] Run `npm run build` locally and verify successful build
- [ ] Check build output for any errors or warnings
- [ ] Verify bundle size is optimized (check `.next/analyze` if needed)
- [ ] Test production build locally with `npm run start`

### Performance
- [ ] Run Lighthouse audit on key pages (Dashboard, Analytics, History)
- [ ] Verify lazy loading is working for heavy components
- [ ] Check that images are optimized
- [ ] Confirm code splitting is effective

### Security
- [ ] Review security headers in `vercel.json`
- [ ] Ensure API keys are not exposed in client code
- [ ] Verify CORS configuration
- [ ] Check for any sensitive data in error messages

### Accessibility
- [ ] Run accessibility audit with aXe or Lighthouse
- [ ] Test keyboard navigation on all pages
- [ ] Verify ARIA labels are present
- [ ] Confirm color contrast meets WCAG 2.1 AA

## Deployment

### Vercel Setup
- [ ] Create Vercel project linked to GitHub repository
- [ ] Configure automatic deployments from main branch
- [ ] Set up preview deployments for pull requests
- [ ] Configure custom domain (if applicable)

### Initial Deploy
- [ ] Deploy to Vercel
- [ ] Monitor build logs for errors
- [ ] Verify deployment completes successfully
- [ ] Check deployment URL is accessible

## Post-Deployment

### Smoke Testing
- [ ] Test Dashboard page loads correctly
- [ ] Test Analytics page displays data
- [ ] Test History page timeline functions
- [ ] Test all navigation links work
- [ ] Verify mobile responsive design
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)

### Monitoring Setup
- [ ] Configure Vercel Analytics
- [ ] Set up error tracking (Sentry or similar)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring

### Production Data
- [ ] Switch from mock data to real API (when ready)
- [ ] Test with production API endpoints
- [ ] Verify data is loading correctly
- [ ] Monitor API response times

### Documentation
- [ ] Update README with production URL
- [ ] Document deployment process
- [ ] Document environment variables
- [ ] Create runbook for common issues

## Rollback Plan

### If Issues Occur
- [ ] Vercel allows instant rollback to previous deployment
- [ ] Navigate to Vercel dashboard → Deployments
- [ ] Select working deployment → Click "Promote to Production"
- [ ] Monitor logs to confirm rollback success

## Success Criteria

✅ All pages load without errors
✅ Performance scores > 90 on Lighthouse
✅ No console errors in production
✅ Mobile responsive design works
✅ All interactive features function correctly
✅ Mock data displays properly (until API integration)
✅ Security headers are present
✅ Accessibility audit passes

---

**Last Updated**: 2025-10-07
**Sprint**: Sprint 8 - Task 8
