# Deployment Guide

This guide will help you deploy the Market Analysis app to production so your team can access it on your website.

## Recommended: Deploy to Vercel (Easiest)

Vercel is the easiest way to deploy Next.js apps and integrates seamlessly with your WordPress site.

### Step 1: Push Code to GitHub

1. Create a new repository on GitHub (if you haven't already)
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login (free)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Go to Project Settings → Environment Variables
   - Add the following variables (use values from your `.env.local`):
     - `DB_SERVER`
     - `DB_DATABASE`
     - `DB_USER`
     - `DB_PASSWORD`
     - `ADMIN_MODE` (optional, set to `false` for production)
5. Click "Deploy"

Vercel will automatically build and deploy your app. You'll get a URL like: `https://your-app.vercel.app`

### Step 3: Set Up Custom Domain (Subdomain)

1. In Vercel, go to your project → Settings → Domains
2. Add a subdomain: `market-analysis.yourwebsite.com`
3. Add the CNAME record in your domain's DNS:
   - Type: `CNAME`
   - Name: `market-analysis`
   - Value: `cname.vercel-dns.com` (Vercel will show you the exact value)

### Step 4: Link from WordPress

Add a link in your WordPress site to the new subdomain, or create a page that redirects to it.

## Alternative: Deploy to Azure App Service

If you prefer to host on Azure (since you're already using Azure SQL):

### Step 1: Build the App

```bash
npm run build
```

### Step 2: Create Azure App Service

1. Go to Azure Portal
2. Create a new "Web App" (Node.js runtime)
3. Configure environment variables in App Settings:
   - `DB_SERVER`
   - `DB_DATABASE`
   - `DB_USER`
   - `DB_PASSWORD`
   - `ADMIN_MODE`

### Step 3: Deploy

You can deploy using:
- Azure CLI
- GitHub Actions (CI/CD)
- VS Code Azure extension
- FTP/SFTP

### Step 4: Configure Custom Domain

1. In App Service → Custom domains
2. Add your subdomain
3. Configure DNS as instructed

## Updating the App

After initial deployment, any time you make changes:

1. **Vercel (Recommended)**: Just push to GitHub - Vercel auto-deploys!
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Azure App Service**: 
   ```bash
   npm run build
   # Then deploy using your chosen method
   ```

## Environment Variables for Production

⚠️ **Important**: Never commit `.env.local` to git. Instead, set environment variables in your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Azure**: App Service → Configuration → Application Settings

## Production Checklist

- [ ] Environment variables configured in hosting platform
- [ ] Database firewall rules allow hosting platform IP
- [ ] Custom domain configured (if using subdomain)
- [ ] SSL certificate active (automatic on Vercel/Azure)
- [ ] Test all functionality after deployment
- [ ] Verify database connections work from production

## Troubleshooting

### Database Connection Errors

1. Check that environment variables are set correctly (no extra spaces)
2. Verify Azure SQL firewall allows your hosting platform's IP addresses
3. For Vercel, check that all required env vars are set for "Production" environment

### Build Errors

1. Run `npm run build` locally first to catch errors
2. Check that all dependencies are in `package.json`
3. Verify Node.js version matches hosting platform (check `package.json` engines if specified)

### Custom Domain Issues

1. DNS changes can take 24-48 hours to propagate
2. Verify DNS records are correct using `nslookup` or `dig`
3. Check SSL certificate status in hosting platform

## Support

For issues specific to:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Azure**: Check [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
