# Session Specification

**Session ID**: `phase03-session03-protected-routes-ui`
**Phase**: 03 - Authentication (Better Auth)
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session completes the authentication user experience by creating polished UI components for displaying user state and enabling a modal-based auth flow. While Session 02 successfully implemented the core auth infrastructure (ProtectedRoute, AuthProvider, SignInForm, SignUpForm, AuthPage), the current user interface consists of a basic inline sign-out button in the AppPage.

The focus of this session is to create proper, reusable UI components: a dropdown UserMenu showing user info with sign-out functionality, an Avatar component displaying user initials or image, and an AuthModal for modal-based authentication without full page navigation. These components will provide a polished, professional auth experience matching modern application standards.

By the end of this session, authenticated users will see a proper user menu in the top-right corner with their avatar, and the application will support both page-based and modal-based auth flows.

---

## 2. Objectives

1. Create a reusable `UserMenu` dropdown component with user info and sign-out
2. Create an `Avatar` component displaying user initials or profile image
3. Create an `AuthModal` component for modal-based sign-in/sign-up
4. Integrate UserMenu into the app header, replacing the inline button

---

## 3. Prerequisites

### Required Sessions
- [x] `phase03-session01-better-auth-server-setup` - Auth backend configured
- [x] `phase03-session02-react-client-integration` - Auth hooks, forms, ProtectedRoute working

### Required Tools/Knowledge
- React component patterns (controlled components, portals)
- CSS styling for dropdowns and modals
- Better Auth useSession/signOut API

### Environment Requirements
- PostgreSQL database running (for auth verification)
- Better Auth server endpoints functional

---

## 4. Scope

### In Scope (MVP)
- `UserMenu` dropdown component with toggle, user info, and sign-out
- `Avatar` component with initials fallback
- `AuthModal` component wrapping existing SignInForm/SignUpForm
- CSS styling for all new components (matching app theme)
- Integration into AppPage replacing inline button
- Click-outside-to-close behavior for dropdown
- Keyboard accessibility (Escape to close)

### Out of Scope (Deferred)
- Profile page/editing - *Reason: Separate feature scope*
- Password change UI - *Reason: Not in MVP auth flow*
- Settings dropdown items - *Reason: No settings to link to yet*
- Account deletion - *Reason: Separate admin feature*
- Dark/light theme toggle - *Reason: No theme system implemented*

---

## 5. Technical Approach

### Architecture

```
src/components/auth/
  index.ts              (update exports)
  UserMenu.tsx          (new - dropdown menu)
  UserMenu.css          (new - dropdown styles)
  Avatar.tsx            (new - user avatar)
  Avatar.css            (new - avatar styles)
  AuthModal.tsx         (new - modal wrapper)
  AuthModal.css         (new - modal styles)
```

### Design Patterns
- **Compound Component**: UserMenu with Avatar integration
- **Portal Rendering**: Modal uses React Portal for z-index stacking
- **Controlled State**: Dropdown open/close managed internally with external trigger option

### Technology Stack
- React 19
- React DOM createPortal (for modal)
- CSS (vanilla, no additional libraries)
- Better Auth client hooks

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `src/components/auth/Avatar.tsx` | User avatar with initials | ~60 |
| `src/components/auth/Avatar.css` | Avatar styling | ~40 |
| `src/components/auth/UserMenu.tsx` | Dropdown menu component | ~120 |
| `src/components/auth/UserMenu.css` | Dropdown styling | ~100 |
| `src/components/auth/AuthModal.tsx` | Modal auth wrapper | ~80 |
| `src/components/auth/AuthModal.css` | Modal styling | ~80 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `src/components/auth/index.ts` | Add new exports | ~5 |
| `src/pages/AppPage.tsx` | Replace inline button with UserMenu | ~20 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `Avatar` displays user initials when no image
- [ ] `Avatar` displays user image when available
- [ ] `UserMenu` shows avatar and opens dropdown on click
- [ ] `UserMenu` dropdown shows user email and name
- [ ] `UserMenu` dropdown has working sign-out button
- [ ] `UserMenu` closes when clicking outside
- [ ] `UserMenu` closes when pressing Escape
- [ ] `AuthModal` opens/closes without page navigation
- [ ] `AuthModal` switches between sign-in and sign-up
- [ ] `AuthModal` closes on successful authentication
- [ ] AppPage displays UserMenu instead of inline button

### Testing Requirements
- [ ] Manual testing of all dropdown interactions
- [ ] Manual testing of modal open/close/auth flows
- [ ] Verify sign-out redirects to landing page

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Prettier formatting applied
- [ ] All existing tests pass

---

## 8. Implementation Notes

### Key Considerations
- **Z-index management**: UserMenu dropdown needs z-index above map but below modals
- **Portal mounting**: AuthModal should render to document.body via Portal
- **Event propagation**: Prevent map click events when interacting with dropdown
- **Focus management**: Trap focus in modal when open

### Potential Challenges
- **Click-outside detection**: Use document event listener with cleanup
- **Dropdown positioning**: May need adjustment if near viewport edge
- **Modal scrolling**: Body scroll should be locked when modal open

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Use HTML entities or escape sequences for special characters.

---

## 9. Testing Strategy

### Unit Tests
- Not required for this session (UI components, manual testing preferred)

### Integration Tests
- Not required for this session

### Manual Testing
1. Click avatar - dropdown opens
2. Click outside dropdown - closes
3. Press Escape - dropdown closes
4. Click sign-out - redirects to landing
5. Open auth modal - displays sign-in form
6. Switch to sign-up - form changes
7. Successful auth - modal closes

### Edge Cases
- User with very long email (truncation)
- User with no name set (show email only)
- User with image URL (display image not initials)
- Rapid open/close of dropdown (no state issues)

---

## 10. Dependencies

### External Libraries
- react: 19.x (existing)
- react-dom: 19.x (existing, for Portal)
- react-router-dom: 6.x (existing)

### Other Sessions
- **Depends on**: `phase03-session02-react-client-integration`

---

## Component Specifications

### Avatar Component

```typescript
interface AvatarProps {
  user: { name?: string | null; email: string; image?: string | null };
  size?: 'sm' | 'md' | 'lg';  // 24px, 32px, 40px
  className?: string;
}
```

- Shows first letter of name, or first letter of email if no name
- Uppercase white text on colored background
- Background color derived from email hash for consistency

### UserMenu Component

```typescript
interface UserMenuProps {
  className?: string;
}
```

- Uses useAuth() internally to get user data
- Renders Avatar as trigger button
- Dropdown shows: user email, name (if set), divider, Sign Out button
- Positions dropdown below and right-aligned with trigger

### AuthModal Component

```typescript
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}
```

- Renders to Portal (document.body)
- Backdrop with click-to-close
- Contains SignInForm or SignUpForm with mode switching
- Closes automatically on successful auth

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
