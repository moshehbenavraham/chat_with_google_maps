# Session 01: TypeScript Strict Mode

**Session ID**: `phase00-session01-typescript-strict-mode`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Enable TypeScript strict mode and fix all type errors to establish a type-safe foundation for the codebase.

---

## Scope

### In Scope (MVP)
- Enable `strict: true` in tsconfig.json
- Enable all strict sub-flags (strictNullChecks, noImplicitAny, etc.)
- Fix all resulting TypeScript errors
- Establish proper type patterns for React components
- Add type annotations where inference is insufficient
- Configure path aliases for cleaner imports

### Out of Scope
- Adding comprehensive JSDoc comments (Session 02 concern)
- Setting up monorepo tsconfig (future consideration)
- Adding declaration file generation for library usage

---

## Prerequisites

- [ ] Existing codebase compiles without strict mode
- [ ] Understanding of current type error locations

---

## Deliverables

1. Updated `tsconfig.json` with strict configuration
2. All TypeScript errors resolved
3. Type utilities file if common patterns emerge
4. Documentation of type patterns used

---

## Technical Details

### Configuration Changes
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Common Patterns to Apply
- Explicit return types on exported functions
- Proper null/undefined handling with optional chaining
- Type guards for narrowing union types
- Generic constraints for reusable components

---

## Success Criteria

- [ ] `strict: true` enabled in tsconfig.json
- [ ] `npm run build` succeeds with zero type errors
- [ ] `npx tsc --noEmit` passes
- [ ] No `any` types except where explicitly necessary (documented)
- [ ] All React component props are properly typed
- [ ] All hooks have correct return type inference
