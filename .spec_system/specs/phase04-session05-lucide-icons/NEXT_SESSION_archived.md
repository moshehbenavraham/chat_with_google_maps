# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-21
**Project State**: Phase 04 - Frontend Overhaul
**Completed Sessions**: 20

---

## Recommended Next Session

**Session ID**: `phase04-session05-lucide-icons`
**Session Name**: Lucide React Icons
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: 15-20

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01: Tailwind CSS 4 Foundation (completed)
- [x] Session 02: cn() Utility Setup (completed)

### Dependencies
- **Builds on**: Session 04 (shadcn/ui components - provides component base to add icons to)
- **Enables**: Session 06 (Theme System - requires Lucide icons for Sun/Moon/Monitor toggle)

### Project Progression
This is the natural next step in Phase 04's frontend overhaul. With Tailwind CSS, the cn() utility, Framer Motion animations, and shadcn/ui components all in place, replacing Material Symbols with Lucide React icons is the next logical step to:

1. **Eliminate external dependencies** - Remove the Material Symbols Google Font, reducing network requests and improving load performance
2. **Enable tree-shaking** - Lucide icons are individually importable, so only used icons are bundled
3. **Standardize icon styling** - Use Tailwind's `size-*` utilities for consistent icon sizing
4. **Unblock Session 06** - The theme toggle component requires Lucide icons (Sun, Moon, Monitor)

---

## Session Overview

### Objective
Replace Material Symbols font icons with tree-shakeable Lucide React icons, eliminating external font dependencies and enabling consistent icon styling via Tailwind utilities.

### Key Deliverables
1. Lucide React package installed
2. All Material Symbols icons replaced with Lucide equivalents
3. Material Symbols font link removed from `index.html`
4. Material Symbols CSS classes removed
5. Consistent icon sizing via Tailwind (`size-*` utilities)

### Scope Summary
- **In Scope (MVP)**: Install Lucide, migrate all icons, remove Material Symbols font, standardize sizing
- **Out of Scope**: Custom SVG icon creation, animated icons, icon sprites

---

## Technical Considerations

### Technologies/Patterns
- `lucide-react` - Tree-shakeable React icon library
- Tailwind `size-*` utilities - Consistent icon sizing (size-4, size-5, size-6)
- Direct imports - `import { Settings } from 'lucide-react'`

### Icon Mapping Reference

| Material Symbol | Lucide Equivalent |
|-----------------|-------------------|
| `settings` | `Settings` |
| `mic` | `Mic` |
| `mic_off` | `MicOff` |
| `send` | `Send` |
| `close` | `X` |
| `menu` | `Menu` |
| `place` | `MapPin` |
| `error` | `AlertCircle` |
| `person` | `User` |
| `logout` | `LogOut` |
| `visibility` | `Eye` |
| `visibility_off` | `EyeOff` |

### Potential Challenges
- Identifying all Material Symbols usage across the codebase
- Ensuring visual consistency with existing design after icon swap
- Verifying no Material Symbols CSS remnants remain

---

## Alternative Sessions

If this session is blocked:
1. **phase04-session06-theme-system** - Cannot proceed, requires Lucide icons for theme toggle
2. **Return to Phase 04 polish** - Address any outstanding issues from sessions 01-04

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
