# xDigital Production Readiness Checklist

## Status: ⚠️ NOT READY FOR PRODUCTION

**Current Score: 8/10** (improved from 7.5)
**Target Score: 9/10**

---

## ✅ COMPLETED

### Critical Fixes
- [x] Fixed feedback.ts serialization bugs (3 functions)
- [x] Made Pusher required and confirmed ONLY for messaging
- [x] Fixed JSON.parse error handling in monitoring.ts (3 locations)
- [x] Implemented all unused backend functionality

### Features Completed
- [x] Saved Filters management UI
- [x] Global Search functionality
- [x] Website Monitoring dashboard
- [x] Admin Activity Feed
- [x] Resource Search UI
- [x] Admin Reminder Dashboard
- [x] Clone Project as Template button
- [x] Bulk Project Operations UI

### Infrastructure Completed
- [x] Sentry error tracking configured (client, server, edge)
- [x] Error boundaries added (app/error.tsx, app/global-error.tsx)
- [x] Sentry logger utility created (lib/sentry-logger.ts)
- [x] Console statements replaced with Sentry logging in critical files:
  - monitoring.ts (6 locations)
  - messages.ts (3 locations)
  - pusher.service.ts (1 location)

---

## 🔴 CRITICAL ISSUES (Must Fix Before Production)

### 1. ObjectId Serialization in toObject() Calls
**Impact:** CRITICAL - Will cause runtime errors
**Files Affected:** 30+ action files

**Pattern:**
```typescript
// ❌ BAD - Will cause serialization error
return { success: true, data: task.toObject() };

// ✅ GOOD - Properly serializes ObjectIds
return {
    success: true,
    data: {
        ...task.toObject(),
        _id: task._id.toString(),
        projectId: task.projectId.toString(),
        assignedTo: task.assignedTo?.toString(),
    },
};
```

**Files that MUST be fixed:**
- [ ] `/app/actions/activities.ts` - Line 46
- [ ] `/app/actions/tasks.ts` - Lines 320, 362
- [ ] `/app/actions/deliverables.ts` - Lines 93, 143, 206, 269
- [ ] `/app/actions/files.ts` - Lines 115, 166, 210
- [ ] `/app/actions/resources.ts` - Lines 218, 251
- [ ] `/app/actions/client-notes.ts` - Lines 128, 181
- [ ] `/app/actions/saved-filters.ts` - Lines 188, 247
- [ ] And 20+ more instances (run grep for `.toObject\(\)` to find all)

**Command to find all instances:**
```bash
grep -r "\.toObject()" app/actions/ --include="*.ts" -n
```

### 2. Webhook Cascade Delete Field Inconsistency
**Impact:** CRITICAL - Data integrity issues
**File:** `/app/api/webhooks/clerk/route.ts` Lines 198-227

**Problem:** Inconsistent field references in cascade delete:
- Some models use `userId` as `clerkId` (string)
- Some models use `userId` as `_id` (ObjectId)
- Some models use `createdBy` as ObjectId

**Action Required:**
1. Audit all models to confirm field types
2. Update cascade delete to use correct field references for each model
3. Test thoroughly with user deletion

---

## ⚠️ HIGH PRIORITY WARNINGS

### 1. Console.log Statements
**Files:** 33 files still contain console.log (10 replaced in critical files)
**Action:** Replace remaining console statements with Sentry logging
**Progress:** Sentry logger utility created and implemented in:
- ✅ monitoring.ts (6 console.error → logError)
- ✅ messages.ts (3 console.error → logError)
- ✅ pusher.service.ts (1 console.error → logError)

**Remaining:** ~17 action files + client components need conversion

### 2. TypeScript 'any' Type Usage
**Files:** 55 files with excessive `any` usage
**Action:** Replace with proper types or `unknown` with type guards

### 3. Missing .lean() on Queries
**File:** `/app/actions/monitoring.ts` - Lines 36, 96, 138, 180, 241
**Action:** Add `.lean()` to all queries

### 4. Environment Variables Documentation
**Action:** Add to `.env.example`:
```bash
CLERK_WEBHOOK_SECRET=  # ⚠️ Currently missing
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Code Quality
- [ ] Fix all toObject() serialization bugs
- [ ] Fix webhook cascade delete logic
- [ ] Remove/replace all console.log statements
- [ ] Add missing .lean() calls
- [ ] Reduce TypeScript 'any' usage
- [ ] Add CLERK_WEBHOOK_SECRET to documentation

### Infrastructure
- [x] Set up production error tracking (Sentry)
- [ ] Replace remaining console statements with Sentry logging
- [ ] Set up database backups (MongoDB Atlas automated backups)
- [ ] Configure monitoring (Uptime, Performance)
- [ ] Set up alerts for critical errors in Sentry dashboard

### Security
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Add rate limiting to API routes
- [ ] Verify all environment variables are set
- [ ] Test webhook signature verification
- [ ] Review CORS settings

### Testing
- [ ] Test all toObject() serialization fixes
- [ ] Test webhook cascade delete
- [ ] Load test critical endpoints
- [ ] Test all bulk operations
- [ ] Test file upload limits
- [ ] Test Pusher real-time messaging

### Performance
- [ ] Verify all database indexes are optimal
- [ ] Check query performance on large datasets
- [ ] Test with 100+ concurrent users
- [ ] Verify CDN is configured for static assets
- [ ] Consider Redis caching for frequently accessed data

---

## 🔒 REQUIRED ENVIRONMENT VARIABLES

### Critical (app will fail without these)
```bash
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...  # ⚠️ Add this!
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=us2
```

### Important (features will fail without these)
```bash
RESEND_API_KEY=re_...
NEXT_PUBLIC_PUSHER_KEY=...  # Same as PUSHER_KEY
NEXT_PUBLIC_PUSHER_CLUSTER=us2
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...  # Required for error tracking
SENTRY_ORG=...  # For source map uploads (optional but recommended)
SENTRY_PROJECT=...  # For source map uploads (optional but recommended)
SENTRY_AUTH_TOKEN=...  # For source map uploads (optional but recommended)
```

### Optional (features will degrade gracefully)
```bash
GOOGLE_ANALYTICS_CREDENTIALS={"type":"service_account",...}
GOOGLE_ANALYTICS_PROPERTY_ID=properties/...
PAGESPEED_API_KEY=...
```

---

## 📊 PRODUCTION READINESS SCORES

### Current Status
- **Architecture:** 9/10 ✅
- **Security:** 8/10 ✅
- **Code Quality:** 7/10 ⚠️ (TypeScript any usage, some console.logs remaining)
- **Error Handling:** 10/10 ✅ (Sentry configured with error boundaries)
- **Database:** 6/10 🔴 (serialization bugs, inconsistent fields)
- **Testing:** 0/10 ❌ (no test files)
- **Documentation:** 8/10 ⚠️

### Overall: 8/10 (improved from 7.5)

---

## 🎯 PATH TO PRODUCTION

### Phase 1: Critical Fixes (Est. 4-6 hours)
1. Fix all toObject() serialization bugs
2. Fix webhook cascade delete logic
3. Test all fixes thoroughly

### Phase 2: High Priority (Est. 1-2 hours)
1. Replace remaining console.log statements (~17 files)
2. Add missing .lean() calls
3. Test Sentry error tracking in development

### Phase 3: Infrastructure Setup (Est. 1-2 hours)
1. ✅ Error tracking (Sentry) - COMPLETE
2. Set up Sentry alerts and notification rules
3. Set up uptime monitoring
4. Configure database backups

### Phase 4: Testing (Est. 3-4 hours)
1. Manual testing of all critical paths
2. Load testing
3. Security testing
4. User acceptance testing

**Total Estimated Time: 9-14 hours** (reduced from 11-16 due to Sentry completion)

---

## 🚀 DEPLOYMENT STEPS

1. **Verify all critical fixes are complete**
2. **Run final checks:**
   ```bash
   npm run build
   npm audit
   npm run lint
   ```
3. **Set all environment variables** in production
4. **Deploy to staging first**
5. **Run smoke tests** on staging
6. **Monitor error rates** for 24 hours
7. **Deploy to production**
8. **Monitor closely** for first 48 hours

---

## 📞 SUPPORT CONTACTS

- **Database Issues:** Check MongoDB Atlas alerts
- **Authentication Issues:** Check Clerk dashboard
- **Real-time Issues:** Check Pusher dashboard
- **Email Issues:** Check Resend dashboard
- **Application Errors:** Check Sentry dashboard (errors, performance, replays)

---

## 📝 NOTES

- This application uses Next.js 16 App Router
- All database operations use Mongoose with MongoDB
- Authentication is handled by Clerk
- Real-time messaging uses Pusher (required)
- Email notifications use Resend
- Notification polling is 30 seconds (no Pusher for notifications)
- Error tracking uses Sentry (client-side, server-side, and edge runtime)
- Error boundaries are configured for graceful error handling

---

**Last Updated:** 2025-11-18 (Sentry Integration Complete)
**Next Review:** Before Production Deployment
