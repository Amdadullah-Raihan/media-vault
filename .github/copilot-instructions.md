# Code Quality & Completion Rules (Mandatory)

These rules are mandatory for every task. A task is **NOT complete** until all of the following conditions are satisfied.

---

# Definition of Done

A task is only considered complete when:

- The project builds successfully.
- TypeScript has **zero errors**.
- ESLint has **zero errors**.
- There are no unused imports.
- There are no unused variables.
- There are no duplicate implementations.
- The new feature is fully integrated.
- Existing functionality is not broken.
- Documentation is updated when required.

Never stop after implementing only the requested feature.

---

# Before Finishing Any Task

Always complete this checklist.

## 1. Search For Existing Code

Before creating:

- Components
- Hooks
- Services
- Utilities
- Types
- Interfaces

Search the project first.

If a reusable implementation already exists, reuse it.

Never duplicate functionality.

---

## 2. TypeScript Validation

After every file modification:

Check for:

- Type errors
- Missing imports
- Incorrect imports
- Missing exports
- Invalid generic types
- Invalid interfaces
- Invalid return types
- Incorrect async handling

Never leave TypeScript errors unresolved.

Never assume they will be fixed later.

---

## 3. ESLint

After every modification:

Resolve all lint errors.

Examples:

- no-unused-vars
- no-explicit-any
- no-shadow
- no-console (unless intentional)
- react-hooks rules
- import ordering
- formatting issues

Never ignore lint errors.

Never disable ESLint rules without justification.

---

## 4. Strict TypeScript

Never use:

- any
- @ts-ignore
- @ts-nocheck

Avoid:

- unknown without narrowing
- non-null assertions (!) unless absolutely necessary

Always prefer proper typing.

---

## 5. Imports

Remove:

- unused imports
- duplicate imports

Organize imports consistently.

---

## 6. Component Quality

Components should:

- Have one responsibility.
- Remain reasonably small.
- Avoid duplicated JSX.
- Reuse shared UI components.

---

## 7. Reusability

If code is duplicated more than once:

Extract:

- Hook
- Utility
- Component
- Service

Never copy-paste logic.

---

## 8. Error Handling

Never ignore errors.

Every async operation must:

- handle failures
- return consistent errors
- avoid silent failures

---

## 9. API Changes

If an API changes:

Update:

- Types
- SDK
- RTK Query
- Documentation
- Components using that API

Never leave broken references.

---

## 10. Project Consistency

After implementing a feature:

Search the project for:

- broken imports
- outdated types
- duplicated constants
- dead code
- unreachable code

Fix them before finishing.

---

# Large Tasks

Never modify dozens of files blindly.

Instead:

1. Complete one module.
2. Verify TypeScript.
3. Verify ESLint.
4. Refactor.
5. Continue.

Do not accumulate errors across multiple files.

---

# Existing Errors

If existing TypeScript or ESLint errors are discovered:

Do not ignore them.

Determine whether they are related to the current task.

If they are:

Fix them.

If they are unrelated:

Report them before continuing.

Never introduce additional errors.

---

# Self Review

Before marking a task complete, review the changes and verify:

✓ No broken imports

✓ No missing exports

✓ No TypeScript errors

✓ No ESLint errors

✓ No duplicated code

✓ No dead code

✓ No unused imports

✓ No unused variables

✓ No broken routes

✓ No broken API references

✓ No invalid types

✓ Consistent architecture

---

# Completion Policy

Never respond with:

"The feature has been implemented."

Until all quality checks above have been completed.

If any TypeScript or ESLint error remains:

The task is considered incomplete.

Continue fixing errors until the project is clean.

Quality is more important than speed.

A smaller, correct implementation is always preferred over a larger implementation that leaves compilation or linting errors.

## Output Format

After completing work, respond with exactly in bold and italic with background highlight:

```
I've followed the instructions file

```
