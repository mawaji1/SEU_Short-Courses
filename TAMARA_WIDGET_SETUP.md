# Tamara Widget Setup Guide

## Issue: Tamara Widget Not Displaying

**Console Output Shows:**
```
Tamara Widget Init: {price: 2500, currency: 'SAR', language: 'ar', widgetType: 'product-widget', publicKey: 'Missing', scriptLoaded: true}
Tamara widget refreshed successfully
```

## Root Cause

**Yes, the Tamara widget requires a valid public key to display.**

The widget script loads successfully and the refresh function executes, but **Tamara will not render the widget without a valid public key**.

---

## Solution

### 1. Get Tamara Public Key

You need to obtain your Tamara public key from:
- **Tamara Dashboard:** https://dashboard.tamara.co/
- Contact Tamara support if you don't have access

### 2. Add Environment Variable

Create or update `/frontend/.env.local`:

```bash
# Tamara Configuration
NEXT_PUBLIC_TAMARA_PUBLIC_KEY=pk_live_your_actual_key_here
```

**For Testing:**
```bash
NEXT_PUBLIC_TAMARA_PUBLIC_KEY=pk_test_your_test_key_here
```

### 3. Restart Frontend Server

After adding the environment variable:

```bash
cd frontend
# Stop the server (Ctrl+C)
npm run dev
# or
yarn dev
```

---

## Verification

After restart, check the browser console. You should see:

```
Tamara Widget Init: {price: 2500, currency: 'SAR', language: 'ar', widgetType: 'product-widget', publicKey: 'Set', scriptLoaded: true}
Tamara widget refreshed successfully
```

**The widget should now be visible on:**
- Product details page (below price)
- Checkout page (above payment selector)

---

## Current Status

✅ **Tabby Widget:** Working (displays without public key in test mode)  
❌ **Tamara Widget:** Requires valid public key to display  

**Backend:** Tamara integration is complete and production-ready  
**Frontend:** Widget code is correct, just needs valid credentials  

---

## Environment Variables Summary

All required environment variables for payment integrations:

```bash
# Backend (.env)
MOYASAR_SECRET_KEY=sk_live_...
MOYASAR_PUBLISHABLE_KEY=pk_live_...
TABBY_SECRET_KEY=sk_...
TABBY_PUBLIC_KEY=pk_...
TABBY_MERCHANT_CODE=...
TAMARA_API_TOKEN=...
TAMARA_NOTIFICATION_TOKEN=...

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_TABBY_PUBLIC_KEY=pk_...
NEXT_PUBLIC_TAMARA_PUBLIC_KEY=pk_...  # ← THIS IS MISSING
```

---

## Next Steps

1. **Obtain Tamara public key** from dashboard
2. **Add to `.env.local`** in frontend
3. **Restart frontend server**
4. **Verify widget displays** on product and checkout pages
