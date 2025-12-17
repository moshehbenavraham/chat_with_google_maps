# Vercel Deployment Guide

This guide covers deploying the Chat with Google Maps application to Vercel for production hosting.

## Prerequisites

- **Vercel Account**: Free tier available at [vercel.com](https://vercel.com)
- **Vercel CLI** (optional): For command-line deployments
- **Node.js**: v18.x or higher (for local builds)
- **API Keys**: Gemini API key and Google Maps API key (see [Required API Keys](#required-api-keys))

### Installing Vercel CLI (Optional)

```bash
npm install -g vercel
vercel --version  # Verify installation
```

## Quick Start (CLI)

The fastest way to deploy using the Vercel CLI:

1. **Login to Vercel**:

   ```bash
   vercel login
   ```

2. **Deploy to production**:

   ```bash
   vercel --prod --yes
   ```

3. **Add environment variables** (required for the app to function):

   ```bash
   echo "YOUR_GEMINI_API_KEY" | vercel env add GEMINI_API_KEY production --force
   echo "YOUR_GOOGLE_MAPS_API_KEY" | vercel env add GOOGLE_MAPS_API_KEY production --force
   ```

4. **Redeploy** to apply environment variables:

   ```bash
   vercel --prod --yes
   ```

5. **Access your app** at the URL shown in the output (e.g., `https://your-project.vercel.app`)

## Deployment via Vercel Dashboard (No CLI)

### Step 1: Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Connect your GitHub/GitLab/Bitbucket account if not already connected
4. Select the `chat_with_google_maps` repository
5. Click **Import**

### Step 2: Configure Project Settings

Vercel auto-detects Vite projects, but verify these settings:

| Setting          | Value           |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Step 3: Add Environment Variables

Before deploying, add the required environment variables:

1. Expand the **"Environment Variables"** section
2. Add each variable:

| Name                  | Value                    | Environment                      |
| --------------------- | ------------------------ | -------------------------------- |
| `GEMINI_API_KEY`      | Your Gemini API key      | Production, Preview, Development |
| `GOOGLE_MAPS_API_KEY` | Your Google Maps API key | Production, Preview, Development |

3. Click **Deploy**

### Step 4: Verify Deployment

Once deployed:

1. Click the generated URL to open your app
2. Verify the map loads correctly
3. Test the voice conversation feature

## Required API Keys

### Gemini API Key

- **Purpose**: Powers the real-time voice conversation feature
- **Get it from**: [Google AI Studio](https://aistudio.google.com/app/apikey)

### Google Maps API Key

- **Purpose**: Map rendering, Places API, Geocoding, Elevation, and Grounding
- **Get it from**: [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)

**Required Google Maps APIs to enable:**

- Maps JavaScript API
- Places API (New)
- Geocoding API
- Maps Elevation API
- Maps Grounding API

> **Important**: Restrict your API keys in the Google Cloud Console for production use. Add your Vercel domain to the HTTP referrer allowlist.

## Project Configuration

The repository includes a `vercel.json` configuration file:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Configuration Explained

| Property          | Purpose                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `framework`       | Tells Vercel this is a Vite project for optimized builds            |
| `buildCommand`    | Command to build the production bundle                              |
| `outputDirectory` | Where Vite outputs the built files                                  |
| `rewrites`        | SPA routing - all routes serve `index.html` for client-side routing |

## Auto-Deployment from GitHub

When you connect your GitHub repository to Vercel:

- **Production deployments**: Triggered on every push to `main` branch
- **Preview deployments**: Triggered on every pull request
- **Automatic HTTPS**: SSL certificates are provisioned automatically

### Branch Configuration

To customize which branches trigger deployments:

1. Go to your project in the Vercel Dashboard
2. Navigate to **Settings** > **Git**
3. Configure **Production Branch** and **Preview Branches**

## Managing Environment Variables

### Via CLI

```bash
# List all environment variables
vercel env ls

# Add a variable to production
echo "value" | vercel env add VARIABLE_NAME production

# Add a variable to all environments
echo "value" | vercel env add VARIABLE_NAME production preview development

# Remove a variable
vercel env rm VARIABLE_NAME production

# Pull environment variables to local .env file
vercel env pull
```

### Via Dashboard

1. Go to your project in the Vercel Dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add, edit, or remove variables as needed
4. Redeploy for changes to take effect

## Custom Domains

### Adding a Custom Domain

1. Go to your project in the Vercel Dashboard
2. Navigate to **Settings** > **Domains**
3. Enter your domain name and click **Add**
4. Configure DNS as instructed:
   - For apex domains (example.com): Add an `A` record pointing to `76.76.21.21`
   - For subdomains (app.example.com): Add a `CNAME` record pointing to `cname.vercel-dns.com`

### SSL Certificates

Vercel automatically provisions and renews SSL certificates for all domains, including custom domains.

## Useful CLI Commands

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `vercel`                | Deploy to preview environment       |
| `vercel --prod`         | Deploy to production                |
| `vercel --prod --yes`   | Deploy to production (skip prompts) |
| `vercel ls`             | List all deployments                |
| `vercel logs <url>`     | View deployment logs                |
| `vercel inspect <url>`  | View deployment details             |
| `vercel env ls`         | List environment variables          |
| `vercel domains ls`     | List configured domains             |
| `vercel rm <project>`   | Remove a project                    |
| `vercel redeploy <url>` | Redeploy a specific deployment      |

## Troubleshooting

### Build Fails

**Check build logs:**

```bash
vercel logs <deployment-url>
```

**Common causes:**

- Missing environment variables (build-time)
- TypeScript errors
- Missing dependencies

**Solution:** Run `npm run build` locally first to identify issues.

### Map Doesn't Load

**Cause:** Missing or invalid `GOOGLE_MAPS_API_KEY` environment variable.

**Solution:**

1. Verify the environment variable is set:
   ```bash
   vercel env ls
   ```
2. Check the API key is valid and has the required APIs enabled
3. Ensure your Vercel domain is in the API key's HTTP referrer allowlist

### Voice Feature Doesn't Work

**Cause:** Missing or invalid `GEMINI_API_KEY` environment variable.

**Solution:**

1. Verify the environment variable is set
2. Check the API key is valid at [Google AI Studio](https://aistudio.google.com)
3. Ensure the browser has microphone permissions

### Environment Variables Not Taking Effect

**Cause:** Environment variables are injected at build time for Vite apps.

**Solution:** Redeploy after changing environment variables:

```bash
vercel --prod --yes
```

### SPA Routing Issues (404 on Refresh)

**Cause:** Missing rewrite rules for client-side routing.

**Solution:** Ensure `vercel.json` includes the rewrite rule:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Deployment Stuck or Slow

**Possible causes:**

- Large `node_modules` being uploaded
- Build cache issues

**Solutions:**

1. Ensure `.vercelignore` or `.gitignore` excludes `node_modules`
2. Clear build cache in Vercel Dashboard: **Settings** > **General** > **Build Cache** > **Clear**

## Removing a Deployment

### Remove Specific Deployment

```bash
vercel rm <deployment-url>
```

### Remove Entire Project

```bash
vercel rm <project-name>
```

Or via Dashboard:

1. Go to your project
2. Navigate to **Settings** > **General**
3. Scroll to **Delete Project**
4. Confirm deletion

## Security Best Practices

1. **Restrict API Keys**: In Google Cloud Console, add HTTP referrer restrictions for your Vercel domains
2. **Use Environment Variables**: Never commit API keys to the repository
3. **Review Preview Deployments**: Be cautious with preview deployments that may expose your app publicly
4. **Monitor Usage**: Set up billing alerts in Google Cloud to monitor API usage

## Cost Considerations

### Vercel

- **Hobby (Free)**: Suitable for personal projects
- **Pro ($20/month)**: For teams and commercial projects
- See [Vercel Pricing](https://vercel.com/pricing) for details

### Google Cloud

- **Gemini API**: Pay-per-use, see [pricing](https://ai.google.dev/pricing)
- **Google Maps Platform**: $200/month free credit, then pay-per-use, see [pricing](https://developers.google.com/maps/billing-and-pricing/pricing)

## Related Documentation

- [Local Deployment](./LOCAL_DEPLOYMENT.md) - Development setup
- [Architecture](./ARCHITECTURE.md) - Application structure
- [Customization](./CUSTOMIZATION.md) - Creating personas and tools
- [Prompts](./PROMPTS.md) - System prompt management
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
