<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Skill Policy

Skills are vendored at the project level only. Do not add a repository-root
`skills/` directory or install this project's skills into user-level agent
folders.

Before implementation, use the official project-local skills for the primitive
being changed:

- Next.js: `.agents/skills/next-best-practices/SKILL.md`; for Cache Components
  or PPR, also read `.agents/skills/next-cache-components/SKILL.md`.
- React: `.agents/skills/vercel-react-best-practices/SKILL.md` and
  `.agents/skills/vercel-composition-patterns/SKILL.md`.
- Convex: `convex/_generated/ai/guidelines.md` first, then
  `.agents/skills/convex/SKILL.md` to route to the workflow-specific Convex
  skill.
- React Doctor: `.agents/skills/react-doctor/SKILL.md`; run
  `npm run doctor:react` after React changes and keep the score at 100.

Claude adapter sessions should use the mirrored skills under `.claude/skills`.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
