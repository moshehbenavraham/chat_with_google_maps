# Session 03: Deployment Verification

**Session ID**: `phase01-session03-deployment-verification`
**Status**: Not Started
**Estimated Tasks**: ~15
**Estimated Duration**: 2-3 hours

---

## Objective

Verify the Hono backend deploys correctly on Vercel and document deployment options for alternative platforms (Cloudflare Workers, AWS Lambda, self-hosted).

---

## Scope

### In Scope (MVP)
- Configure Vercel for Hono serverless functions
- Create `vercel.json` configuration if needed
- Verify API routes work in production deployment
- Test health check endpoint in production
- Test Gemini proxy in production
- Test Maps proxy in production
- Document environment variable setup for Vercel
- Create deployment documentation for alternatives

### Out of Scope
- Actually deploying to alternative platforms
- CI/CD pipeline setup (future consideration)
- Custom domain configuration
- Advanced Vercel features (Edge Functions, ISR)

---

## Prerequisites

- [ ] Session 02 complete (API key protection working locally)
- [ ] Vercel account configured
- [ ] Access to production environment variables

---

## Deliverables

1. `vercel.json` - Vercel configuration (if needed)
2. `/docs/deployment.md` - Deployment documentation
3. Verified production deployment
4. Environment variable setup documentation
5. Troubleshooting guide for common deployment issues

---

## Technical Details

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

### Vercel Function Structure
```
api/
├── index.ts          # Exports Hono app as default
└── [[...route]].ts   # Catch-all route (if needed)
```

### Environment Variables on Vercel
```bash
# Set via Vercel dashboard or CLI
vercel env add GEMINI_API_KEY
vercel env add GOOGLE_MAPS_API_KEY
```

### Alternative Platform Documentation
```markdown
## Cloudflare Workers
1. Install wrangler: `npm install -g wrangler`
2. Create wrangler.toml with configuration
3. Deploy: `wrangler deploy`

## AWS Lambda
1. Use SST or Serverless Framework
2. Configure function handlers
3. Deploy: `sst deploy` or `serverless deploy`

## Self-Hosted (Node.js/Bun)
1. Add serve script: `node api/index.ts` or `bun api/index.ts`
2. Configure reverse proxy (nginx/caddy)
3. Set environment variables
```

---

## Success Criteria

- [ ] `vercel.json` configuration correct (if needed)
- [ ] Production deployment succeeds without errors
- [ ] `GET /api/health` works in production
- [ ] Gemini API proxy works in production
- [ ] Maps API proxy works in production
- [ ] Environment variables properly configured on Vercel
- [ ] No API keys exposed in production network requests
- [ ] Deployment documentation created
- [ ] Alternative deployment options documented
- [ ] Troubleshooting guide covers common issues
