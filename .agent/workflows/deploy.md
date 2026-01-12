---
description: Deploy SEU Short Courses to Alibaba Cloud server
---

# SEU Short Courses Deployment Workflow

## Prerequisites
- Changes committed and pushed to GitHub (main branch)
- SSH key file: `ai-TLM.pem` (located in project root)

## Server Details
- **IP Address**: 8.213.24.219
- **User**: root
- **Project Path**: /var/www/SEU_Short-Courses
- **PM2 Process**: seu-frontend

## Deployment Command
// turbo
```bash
ssh -i /Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/ai-TLM.pem -o StrictHostKeyChecking=no root@8.213.24.219 '
cd /var/www/SEU_Short-Courses &&
git pull origin main &&
cd frontend &&
npm run build &&
pm2 restart seu-frontend
'
```

## Step-by-Step Manual Deployment

1. **Commit and push changes locally:**
```bash
cd /Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses
git add -A
git commit -m "your commit message"
git push origin main
```

2. **Connect to server:**
```bash
ssh -i ai-TLM.pem -o StrictHostKeyChecking=no root@8.213.24.219
```

3. **On the server, run:**
```bash
cd /var/www/SEU_Short-Courses
git pull origin main
cd frontend
npm run build
pm2 restart seu-frontend
```

4. **Verify deployment:**
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs seu-frontend`

## Troubleshooting

- **SSH Permission Denied**: Ensure ai-TLM.pem has correct permissions (chmod 400 ai-TLM.pem)
- **Build fails**: Check npm install was run if new dependencies added
- **PM2 not found**: Use full path /usr/bin/pm2 or ensure PATH is set
