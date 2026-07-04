# Deployment

## Production

Production deploys from GitHub Actions to GitHub Pages and serves https://draggonlab.org.

Production must set PUBLIC_DEPLOY_ENV=production.

Production behavior: drafts excluded, published-to-draft references fail, analytics enabled, sitemap and robots enabled, production site graph contains only published content. The Lab Notes RSS feed at `/lab-notes/rss.xml` includes published Lab Notes only.

## Preview

Cloudflare Pages preview deployments must set PUBLIC_DEPLOY_ENV=preview.

Preview behavior: drafts may be visible, draft badges shown, preview banner shown, no production analytics, noindex pages, preview graph may include draft nodes and draft-related edges. The Lab Notes RSS feed remains published-only in preview so feed subscribers never receive draft items.

## Local

pnpm dev sets development explicitly. Missing environment defaults to development only for local convenience. The Lab Notes RSS feed remains published-only in local development for consistency with production and preview.

## Domain

Registrar: Namecheap. DNS: Cloudflare. Canonical domain: https://draggonlab.org. www redirects to bare domain.

## Email

Public contact email: contact@draggonlab.org, routed privately to the appropriate Bristol email.
