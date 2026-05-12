---
name: react-doctor
description: Use when finishing a feature, fixing a bug, before committing React code, or when the user wants to improve code quality or clean up a codebase. Checks for score regression. Covers lint, dead code, accessibility, bundle size, architecture diagnostics.
version: "1.0.0"
---

# React Doctor

Scans React codebases for security, performance, correctness, and architecture issues. Outputs a 0-100 health score.

## After making React code changes:

Run `npm run doctor:react` and check the score did not regress.

If the score dropped, fix the regressions before committing.

## For general cleanup or code improvement:

Run `npm run doctor:react` to scan the full codebase. Fix issues by severity: errors first, then warnings.

## Command

```bash
npm run doctor:react
```

| Flag | Purpose |
| --- | --- |
| `.` | Scan current directory |
| `--verbose` | Show affected files and line numbers per rule |
| `--full` | Scan the full codebase |
| `--score` | Output only the numeric score |
