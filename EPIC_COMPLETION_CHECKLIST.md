# Epic Completion Checklist

## Purpose
This checklist ensures that every epic is **fully implemented and tested** before being marked as complete. Use this to prevent incomplete implementations.

---

## ✅ Pre-Completion Checklist

### **1. Backend Verification**
- [ ] All API endpoints created and documented
- [ ] All services implemented with business logic
- [ ] Database schema updated (if needed)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Backend server starts successfully
- [ ] Test API endpoints with curl/Postman
- [ ] Error handling implemented
- [ ] Logging added for debugging

**Test Command:**
```bash
cd backend
npm run build
npm run start:dev
# Verify server starts and endpoints are mapped
```

---

### **2. Frontend Verification**
- [ ] All components created
- [ ] All services/API calls implemented
- [ ] Components **actually imported AND rendered** in pages
- [ ] TypeScript compiles without errors
- [ ] Frontend builds successfully (`npm run build`)
- [ ] UI matches design requirements
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Responsive design verified

**Test Command:**
```bash
cd frontend
npm run build
npm run dev
# Open browser and verify UI is visible
```

---

### **3. Integration Verification** ⚠️ **CRITICAL**
- [ ] **Manually test the complete user flow in browser**
- [ ] Verify components are **visible** on the page (not just imported)
- [ ] Test happy path (success scenario)
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Verify data flows from frontend → backend → database
- [ ] Check browser console for errors
- [ ] Check network tab for API calls

**Manual Test Steps:**
1. Open http://localhost:3000 in browser
2. Navigate through the user flow
3. **Visually confirm** all new features are visible
4. Complete the flow end-to-end
5. Check database for data persistence
6. Verify success/error messages

---

### **4. Code Quality**
- [ ] No console.log statements in production code
- [ ] No commented-out code blocks
- [ ] Proper error messages (user-friendly)
- [ ] Code follows project conventions
- [ ] No duplicate code
- [ ] No unused imports

---

### **5. Documentation**
- [ ] README updated (if needed)
- [ ] API endpoints documented
- [ ] Environment variables documented in `.env.example`
- [ ] TASKS.md updated with completion status
- [ ] Commit messages are descriptive

---

### **6. Git Verification**
- [ ] All files committed
- [ ] Commit message follows convention
- [ ] No sensitive data in commits
- [ ] Branch is up to date

---

## 🚨 Common Pitfalls to Avoid

### **Pitfall #1: Component Imported But Not Rendered**
**Problem:** Component exists and is imported, but never used in JSX
**Solution:** Search for `<ComponentName` in the file to verify it's rendered

### **Pitfall #2: API Endpoint Created But Not Called**
**Problem:** Backend endpoint exists but frontend doesn't call it
**Solution:** Check Network tab in browser DevTools

### **Pitfall #3: Feature Works in Dev But Not in Build**
**Problem:** Code works with `npm run dev` but fails in production build
**Solution:** Always run `npm run build` before marking complete

### **Pitfall #4: TypeScript Errors Ignored**
**Problem:** Code runs but has TypeScript errors
**Solution:** Run `npm run build` and fix all errors

### **Pitfall #5: No Manual Testing**
**Problem:** Assuming code works without actually testing it
**Solution:** **ALWAYS** manually test in browser

---

## 📋 Epic-Specific Checklists

### **For Payment Integration Epics:**
- [ ] Test with real payment provider (sandbox)
- [ ] Verify webhook handlers work
- [ ] Test refund flow
- [ ] Verify payment status updates in database
- [ ] Test all payment methods (card, BNPL, etc.)
- [ ] **Visually confirm payment options appear on checkout page**

### **For Notification Epics:**
- [ ] Send test email/SMS
- [ ] Verify email templates render correctly
- [ ] Test retry logic
- [ ] Verify notifications appear in database
- [ ] Check queue processing works

### **For UI/Component Epics:**
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport
- [ ] Verify accessibility (keyboard navigation)
- [ ] Test with Arabic and English content
- [ ] **Screenshot the working feature**

---

## 🎯 Final Verification Before "Complete"

**Ask yourself:**
1. ✅ Can I see the feature working in the browser?
2. ✅ Did I test the complete user flow?
3. ✅ Does the backend respond correctly?
4. ✅ Is the data persisted in the database?
5. ✅ Are there no console errors?
6. ✅ Did I test error scenarios?

**If ANY answer is "No" → Epic is NOT complete**

---

## 📝 How to Use This Checklist

1. **Before starting an epic:** Review relevant sections
2. **During development:** Check off items as you complete them
3. **Before marking epic complete:** Go through entire checklist
4. **Before committing:** Verify all items are checked
5. **After deployment:** Test in production environment

---

## 🔄 Continuous Improvement

After each epic, ask:
- What went wrong?
- What could be improved?
- What should be added to this checklist?

**Update this checklist based on lessons learned!**

---

## Example: Epic 1.6 BNPL Lessons Learned

### **Lesson 1: Component Integration**

**What Happened:**
- Backend: ✅ Fully implemented
- Frontend Components: ✅ Created
- Frontend Integration: ❌ Component imported but NOT rendered
- Result: Marked as "complete" but feature not visible to users

**What Should Have Been Done:**
1. After creating BNPLOptions component
2. Open http://localhost:3000/checkout in browser
3. **Visually verify** Tabby and Tamara options appear
4. Test clicking the buttons
5. Only then mark as complete

**Lesson:** Always do manual browser testing, not just code review!

---

### **Lesson 2: Never Hardcode Third-Party Provider Business Rules**

**What Happened:**
- Installment counts hardcoded: Tabby = 4, Tamara = 3 or 4
- Eligibility rules hardcoded based on assumptions
- Business logic contained provider-specific rules
- Result: Code breaks when providers change their offerings

**Why This Is Wrong:**
- Provider rules change (new installment options, amount thresholds, promotions)
- Rules vary by merchant agreement, customer location, risk assessment
- Hardcoded rules become outdated immediately
- Not scalable - every rule change requires code deployment
- You're guessing instead of using the source of truth

**What Should Have Been Done:**
1. Call Tabby API to get `available_products.installments[]`
2. Call Tamara API to get available payment plans
3. Use provider responses as source of truth
4. Only hardcode as **fallback** when API fails
5. Centralize provider logic in dedicated service classes

**Rule:** If integrating with third-party payment providers, marketplaces, or external services with business rules - **always fetch those rules from their API, never hardcode them**.

**Code Example:**
```typescript
// ❌ WRONG - Hardcoded
const installments = provider === 'TABBY' ? 4 : 3;

// ✅ CORRECT - Fetch from provider API
const options = await tabbyService.getInstallmentOptions(amount);
const installments = options[0].installments;
```
