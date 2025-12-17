# Deployment

## Build Process

```bash
npm run build
```

Creates optimized static files in `dist/`.

## Deployment Options

### Vercel (Recommended)

See [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md) for detailed instructions.

### Other Static Hosts

The `dist/` folder can be served by any static file server:

- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- nginx
- Apache

## Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

## Release Process

1. Ensure all tests pass: `npm run quality`
2. Merge to `main`
3. Vercel auto-deploys from `main`

## Environment Variables

Configure in your hosting platform:

| Variable              | Required | Description         |
| --------------------- | -------- | ------------------- |
| `GEMINI_API_KEY`      | Yes      | Gemini API key      |
| `GOOGLE_MAPS_API_KEY` | Yes      | Google Maps API key |

## Monitoring

- Check browser console for runtime errors
- Monitor Google Cloud Console for API usage
- Review Vercel deployment logs

## Rollback

On Vercel, use the Deployments tab to rollback to a previous deployment.

## Related Documentation

- [Vercel Deployment](./VERCEL_DEPLOYMENT.md) - Detailed Vercel setup
- [Environments](./environments.md) - Environment configuration
