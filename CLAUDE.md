# PWA App

## Goals
- Progressive Web App with offline support
- TypeScript for type safety
- Fast development iteration

## Non-Goals
- Complex state management (keep it simple)
- SSR/SSG (client-side only)
- Over-engineering the architecture

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (localhost:5173) |
| `npm run build` | Production build to dist/ |
| `npm run preview` | Preview build (localhost:4173) |
| `npx tsc --noEmit` | Type check |

## Quality Gates
- TypeScript strict mode enabled
- `npx tsc --noEmit` passes
- `npm run build` succeeds

## Staging
- **URL**: https://arnass-mac-mini.tail2509f8.ts.net:4173
- **Start**: `npm run build && npm run preview -- --host`
- **Stop**: Ctrl+C or kill the process

## Deployment (from Mac mini)

```bash
cd ~/projects/pwa-app
git pull
npm install
npm run build
npm run preview -- --host
```

## Project Location
- Mac mini: `/Users/aj/projects/pwa-app`
- SSH: `ssh aj@100.71.249.98`
