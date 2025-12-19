# Session 04: Social OAuth (Optional)

**Session ID**: `phase03-session04-social-oauth`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Add social OAuth providers (Google and GitHub) to enable one-click sign-in as an alternative to email/password authentication.

---

## Scope

### In Scope (MVP)
- Configure Google OAuth provider in Better Auth
- Configure GitHub OAuth provider in Better Auth
- Create OAuth callback handling
- Add Google sign-in button to auth forms
- Add GitHub sign-in button to auth forms
- Link social accounts to existing users (by email)
- Handle OAuth errors gracefully
- Document OAuth provider setup
- Test OAuth flows end-to-end

### Out of Scope
- Additional OAuth providers (Apple, Microsoft, etc.)
- Account unlinking
- Multiple accounts per user
- Custom OAuth provider
- SAML/OIDC enterprise auth

---

## Prerequisites

- [ ] Session 03 complete (Protected routes and auth UI working)
- [ ] Google Cloud Console project with OAuth credentials
- [ ] GitHub OAuth App registered
- [ ] Understanding of OAuth 2.0 flow

---

## Deliverables

1. Updated `api/lib/auth.ts` - OAuth provider configuration
2. `src/components/auth/SocialButtons.tsx` - OAuth sign-in buttons
3. Updated `.env.example` - OAuth credentials variables
4. `docs/OAUTH_SETUP.md` - OAuth provider setup guide

---

## Technical Details

### Better Auth OAuth Configuration

```typescript
// api/lib/auth.ts (additions)
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  // ... existing config
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github'],
    },
  },
});
```

### Environment Variables

```bash
# .env.example additions
# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Social Buttons Component

```typescript
// src/components/auth/SocialButtons.tsx
import { authClient } from '@/lib/auth-client';

export function SocialButtons() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.origin,
    });
  };

  const handleGitHubSignIn = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: window.location.origin,
    });
  };

  return (
    <div className="social-buttons">
      <button onClick={handleGoogleSignIn}>
        <GoogleIcon /> Continue with Google
      </button>
      <button onClick={handleGitHubSignIn}>
        <GitHubIcon /> Continue with GitHub
      </button>
    </div>
  );
}
```

### OAuth Provider Setup

#### Google OAuth Setup
1. Go to Google Cloud Console
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:5173/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`

#### GitHub OAuth Setup
1. Go to GitHub Developer Settings
2. Create new OAuth App
3. Set callback URL:
   - Development: `http://localhost:5173/api/auth/callback/github`
   - Production: `https://your-domain.com/api/auth/callback/github`

---

## Success Criteria

- [ ] Google OAuth provider configured in Better Auth
- [ ] GitHub OAuth provider configured in Better Auth
- [ ] Google sign-in button works end-to-end
- [ ] GitHub sign-in button works end-to-end
- [ ] New users created via OAuth
- [ ] Existing users linked by email
- [ ] OAuth errors display user-friendly messages
- [ ] Callback URLs correctly configured for dev/prod
- [ ] Documentation explains OAuth provider setup
- [ ] No TypeScript errors
- [ ] All existing tests still pass
