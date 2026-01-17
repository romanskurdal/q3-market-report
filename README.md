# Market Analysis App

A Next.js application for market analysis with Azure SQL database integration.

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with your database credentials:
```
DB_SERVER=your-server.database.windows.net
DB_DATABASE=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password

# Admin mode - set to 'true' to enable access to diagnostic tools
ADMIN_MODE=false
```

3. Run the development server:
```bash
npm run dev
```

4. Navigate to `http://localhost:3000` to view the app.

## Production Deployment

**Ready to deploy to your website?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

Quick summary:
- **Recommended**: Deploy to Vercel (free, easy, auto-deployments)
- **Alternative**: Deploy to Azure App Service
- Set environment variables in your hosting platform
- Configure custom subdomain (e.g., `market-analysis.yourwebsite.com`)

## API Endpoints

- `/api/health/db` - Basic connection test (returns `ok: true/false`)
- `/api/health/db-info` - Returns database name and login name
- `/api/health/schema` - Checks if required tables exist (FinMaster, FinData, Folders, PdfAnalysis, AIWeeklySummary)