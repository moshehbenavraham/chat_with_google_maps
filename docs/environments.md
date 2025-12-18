# Environments

## Environment Overview

| Environment | Frontend              | Backend               | Purpose           |
| ----------- | --------------------- | --------------------- | ----------------- |
| Development | http://localhost:3003 | http://localhost:3011 | Local development |
| Production  | Vercel deployment     | Vercel serverless     | Live system       |

## Environment Variables

### Required in All Environments

| Variable              | Description                            |
| --------------------- | -------------------------------------- |
| `GEMINI_API_KEY`      | Gemini API key for voice conversations |
| `GOOGLE_MAPS_API_KEY` | Google Maps Platform API key           |

### Optional

| Variable        | Description                  |
| --------------- | ---------------------------- |
| `API_PORT`      | Backend port (default: 3011) |
| `CLIENT_ID`     | OAuth 2.0 Client ID          |
| `CLIENT_SECRET` | OAuth 2.0 Client Secret      |

## Configuration Differences

| Config      | Development              | Production                   |
| ----------- | ------------------------ | ---------------------------- |
| API Keys    | `.env` file              | Vercel environment variables |
| API Server  | Node.js (localhost:3011) | Vercel serverless functions  |
| Source Maps | Enabled                  | Disabled                     |
| Hot Reload  | Yes                      | No                           |

## Security Notes

- Never commit `.env` to version control
- Restrict API keys in Google Cloud Console
- Set HTTP referrer restrictions for production keys
