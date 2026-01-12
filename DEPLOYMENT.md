# SEU Short Courses - Deployment Guide

## Vercel Deployment

### Prerequisites
- GitHub repository: https://github.com/mawaji1/SEU_Short-Courses.git
- Vercel account connected to GitHub
- Prisma.io database (already configured)

---

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgres://bc930ab096d35d418e9c346a748ddb326cf8ff7f58fe16d54fdd48e604c0a434:sk_Mvt7ubav85J4KDmiZ_-1Y@db.prisma.io:5432/postgres?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Redis (Optional - for caching)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# AWS SES (Email)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_SES_FROM_EMAIL="noreply@seu.edu.sa"

# Blackboard Integration
BLACKBOARD_API_URL="https://blackboard.seu.edu.sa/api"
BLACKBOARD_API_KEY="your-blackboard-api-key"
BLACKBOARD_CLIENT_ID="your-client-id"
BLACKBOARD_CLIENT_SECRET="your-client-secret"

# Payment Gateway (Tabby/Tamara)
TABBY_API_KEY="your-tabby-api-key"
TABBY_MERCHANT_CODE="your-merchant-code"
TAMARA_API_KEY="your-tamara-api-key"
TAMARA_MERCHANT_CODE="your-merchant-code"

# Admin
ADMIN_EMAIL="admin@seu.edu.sa"
ADMIN_PASSWORD="Admin@123456"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="https://your-backend-url.vercel.app"
```

---

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: Ready for production deployment"
git push origin main
```

### 2. Deploy Backend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import from GitHub: `SEU_Short-Courses`
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Add Environment Variables (from Backend .env above)

6. Deploy

### 3. Deploy Frontend to Vercel

1. Click "Add New Project" again
2. Import same repository
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = Your backend Vercel URL

5. Deploy

### 4. Update Frontend Environment Variable

After backend is deployed:
1. Copy backend URL (e.g., `https://seu-backend.vercel.app`)
2. Go to Frontend project settings
3. Update `NEXT_PUBLIC_API_URL` to backend URL
4. Redeploy frontend

---

## Post-Deployment

### 1. Run Database Migrations
```bash
# From your local machine
cd backend
npx prisma migrate deploy
```

### 2. Seed Admin User
```bash
npx ts-node prisma/seed-admin.ts
```

### 3. Seed Sample Data (Optional)
```bash
npm run db:seed
```

### 4. Test Login
- Go to your frontend URL
- Login with: `admin@seu.edu.sa` / `Admin@123456`
- Verify all admin features work

---

## Custom Domain (Optional)

### Frontend
1. Go to Frontend project → Settings → Domains
2. Add your domain: `courses.seu.edu.sa`
3. Add DNS records as instructed

### Backend
1. Go to Backend project → Settings → Domains
2. Add subdomain: `api.courses.seu.edu.sa`
3. Update frontend `NEXT_PUBLIC_API_URL` to new domain

---

## Monitoring & Logs

### Vercel Dashboard
- View deployment logs
- Monitor function invocations
- Check error rates

### Prisma.io Dashboard
- Monitor database performance
- View query logs
- Check connection pool

---

## Security Checklist

- [ ] Change JWT secrets in production
- [ ] Change admin password after first login
- [ ] Enable CORS only for your domain
- [ ] Set up rate limiting
- [ ] Enable Vercel password protection (optional)
- [ ] Configure proper HTTPS redirects
- [ ] Set up monitoring and alerts

---

## Troubleshooting

### Backend not connecting to database
- Verify DATABASE_URL in Vercel environment variables
- Check Prisma.io connection limits
- Ensure SSL mode is enabled

### Frontend can't reach backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

### Authentication issues
- Clear browser cookies
- Verify JWT secrets match
- Check token expiration settings

---

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
