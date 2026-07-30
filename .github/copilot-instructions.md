# Copilot Instructions

## Definition of Done

Task incomplete until ALL pass:

- Build succeeds
- TypeScript: zero errors
- ESLint: zero errors
- No unused imports, variables, or dead code
- No duplicate implementations
- Existing functionality preserved
- Feature fully integrated
- Docs updated if needed

## Before Creating

- Search for existing components, hooks, services, utils, types first
- Reuse; never duplicate

## Code Quality

- `any`, `@ts-ignore`, `@ts-nocheck` — forbidden
- Avoid `!` (non-null assertion) and bare `unknown`
- Remove unused/duplicate imports; organize consistently
- Components: single responsibility, small, no duplicated JSX
- Extract duplicated logic (>1 occurrence) into hook/util/component/service

## Error Handling

- Never ignore errors
- Every async op must handle failures; no silent failures

## API Changes

If API changes, update: types, SDK, RTK Query, docs, all consuming components.
No broken references.

## Large Tasks

- One module at a time → verify TS + ESLint → refactor → continue
- Never leave accumulated errors across files

## Existing Errors

- Fix if related to task; report if unrelated
- Never introduce new errors

## Self Review (before completion)

Verify: no broken imports, missing exports, TS errors, ESLint errors, duplicated code, dead code, unused imports/vars, broken routes, broken API refs, invalid types, inconsistent architecture.

## Responsiveness

Every file edit must produce responsive output. All UI changes must work at: mobile, tablet, laptop, desktop, ultra-wide.

- Prefer Flexbox, CSS Grid, responsive Tailwind utils, relative sizing, mobile-first
- Never hardcode dimensions that break layouts
- Verify at common breakpoints before marking task complete
- Try to use container queries for components that need to adapt to parent size

## Design System

Reuse existing components, hooks, utils, layouts, form controls, tables, modals, buttons, inputs.
Search before creating. Never introduce new patterns when reusable ones exist.

## Performance

- Lazy loading, tree-shakable imports
- Memoize only when beneficial
- Minimal re-renders
- Avoid unnecessary abstractions

## Task Size

- One logical feature per task
- Leave project buildable after every task

## Completion

Never claim "feature implemented" until all DoD checks pass.
If TS/ESLint errors remain → task incomplete → keep fixing.
Quality > speed. Smaller correct > larger broken.

After completing work, respond with exactly in highlight italic code block:

```
I've followed the instructions file
```
