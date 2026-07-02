# Contributing

Thank you for helping improve the DRAGGON Lab website.

## Local setup

```bash
pnpm install
pnpm dev
```

## Before opening a PR

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm test:content:preview
pnpm build
```

## Content rules

- Do not commit confidential collaborations, student information, private grant plans, private emails, credentials, tokens, or private institutional data.
- Drafts are public in preview deployments. Treat draft content as non-confidential.
- Published content must not reference draft content.
- Use stable slugs for published pages.
- Add redirects when published URLs change.
- Prefer existing tags and relationship values.
