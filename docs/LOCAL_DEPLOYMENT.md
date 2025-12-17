# Local Deployment Guide

This guide covers deploying the Chat with Google Maps application locally on Ubuntu/WSL2.

## Prerequisites

- **Node.js**: v18.x or higher (tested with v22.19.0)
- **npm**: v8.x or higher (tested with v11.6.4)
- **Git**: For cloning the repository

### Verifying Prerequisites

```bash
node --version  # Should output v18.x or higher
npm --version   # Should output v8.x or higher
```

## Quick Start

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd chat_with_google_maps
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:

   ```bash
   GEMINI_API_KEY=your-gemini-api-key
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Open your browser to `http://localhost:3003`
   - If port 3003 is in use, Vite will automatically try port 3004, 3005, etc.

## Required API Keys

### Gemini API Key

- Purpose: Powers the real-time voice conversation feature
- Get it from: [Google AI Studio](https://aistudio.google.com/app/apikey)

### Google Maps API Key

- Purpose: Map rendering, Places API, Geocoding, Elevation, and Grounding
- Get it from: [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)

**Required Google Maps APIs to enable:**

- Maps JavaScript API
- Places API (New)
- Geocoding API
- Maps Elevation API
- Maps Grounding API

## Server Configuration

The Vite configuration (`vite.config.ts`) includes:

| Setting | Value   | Description                              |
| ------- | ------- | ---------------------------------------- |
| Port    | 3003    | Default port (auto-increments if in use) |
| Host    | 0.0.0.0 | Allows access from network               |

### Accessing from Other Devices on Your Network

When running on WSL2, the server binds to `0.0.0.0`, making it accessible via:

- `http://localhost:3003` - From the WSL2 instance itself
- `http://<wsl-ip>:3003` - From Windows host or other network devices

To find your WSL2 IP address:

```bash
ip addr show eth0 | grep inet | awk '{print $2}' | cut -d/ -f1
```

## Available npm Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build for production                     |
| `npm run preview` | Preview production build locally         |

## Troubleshooting

### Port Already in Use

If you see "Port 3003 is in use, trying another one...", Vite automatically finds the next available port. Check the terminal output for the actual port being used.

To find and kill processes using a specific port:

```bash
# Find process using port 3003
lsof -i :3003

# Kill process by PID
kill -9 <PID>
```

### Missing Environment Variables

If the map fails to load or API calls fail, verify your `.env` file:

```bash
cat .env | grep -E "^(GEMINI_API_KEY|GOOGLE_MAPS_API_KEY)="
```

Both keys should have values (not placeholder text).

### Node.js Version Issues

If you encounter compatibility issues, ensure you're using Node.js v18 or higher:

```bash
# Using nvm to switch Node versions
nvm install 22
nvm use 22
```

### Build Errors

If `npm install` or `npm run dev` fails:

1. Clear npm cache and reinstall:

   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

2. Check for TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

### WSL2-Specific Issues

**Network connectivity issues:**

```bash
# Restart WSL2 network
wsl --shutdown  # Run from Windows PowerShell
# Then restart your WSL2 terminal
```

**Slow file system performance:**

- Keep the project within the WSL2 filesystem (`~/projects/`) rather than `/mnt/c/`
- This significantly improves npm install and dev server performance

## Production Deployment

To build for production:

```bash
npm run build
```

This creates a `dist/` folder with optimized static files. These can be served by any static file server (nginx, Apache, Vercel, Netlify, etc.).

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing before deployment.

## Environment Variables Reference

| Variable              | Required | Description                             |
| --------------------- | -------- | --------------------------------------- |
| `GEMINI_API_KEY`      | Yes      | Gemini API key for voice conversations  |
| `GOOGLE_MAPS_API_KEY` | Yes      | Google Maps Platform API key            |
| `CLIENT_ID`           | No       | OAuth 2.0 Client ID (for user auth)     |
| `CLIENT_SECRET`       | No       | OAuth 2.0 Client Secret (for user auth) |

## Security Notes

- Never commit `.env` to version control (it's in `.gitignore`)
- Restrict API key usage in Google Cloud Console:
  - Set HTTP referrer restrictions
  - Limit to specific APIs
- Rotate keys if they're ever exposed publicly

## Related Documentation

- [Vercel Deployment](./VERCEL_DEPLOYMENT.md) - Production hosting
- [Architecture](./ARCHITECTURE.md) - Application structure
- [Customization](./CUSTOMIZATION.md) - Creating personas and tools
- [Prompts](./PROMPTS.md) - System prompt management
