# Project Overview

A persona/profile sharing web app built with React + Express (TypeScript). Users can create profiles with cards (pitch, reel, revenue, product), and share via unique slug links.

## Architecture

- **Frontend**: React 18 + Vite, Wouter routing, TailwindCSS, shadcn/ui components, TanStack Query
- **Backend**: Express 5, TypeScript via tsx, single server serving both API and frontend (via Vite middleware in dev)
- **Storage**: DynamoDB when AWS credentials are configured; falls back to in-memory storage automatically
- **Auth**: bcrypt password hashing, session-based auth via express-session + passport

## Key Files

- `server/index.ts` — Express app entry point
- `server/routes.ts` — API route handlers
- `server/storage.ts` — IStorage interface, MemStorage and DynamoDBStorage implementations
- `server/vite.ts` — Vite dev server middleware setup
- `server/static.ts` — Production static file serving
- `shared/schema.ts` — Zod schemas and TypeScript types (User, CardData, etc.)
- `shared/routes.ts` — Typed API route definitions
- `client/src/App.tsx` — React router
- `client/src/pages/` — AuthPage, Dashboard, NotFound
- `vite.config.ts` — Vite config with path aliases (@, @shared, @assets)

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| PORT | No | Server port (default: 5000) |
| AWS_ACCESS_KEY_ID | No | AWS credentials for DynamoDB |
| AWS_SECRET_ACCESS_KEY | No | AWS credentials for DynamoDB |
| AWS_REGION | No | AWS region (default: ap-south-1) |
| DYNAMODB_TABLE_NAME | No | DynamoDB table name (default: Users) |

## Running the Project

- **Development**: `npm run dev` (runs tsx server/index.ts with NODE_ENV=development)
- **Build**: `npm run build`
- **Production**: `npm start`

## Port Configuration

The app always runs on port 5000 (mapped to external port 80 in .replit).

## AWS Elastic Beanstalk Deployment

The app is deployed to AWS Elastic Beanstalk in **ap-south-1 (Mumbai)**.

- **Application**: `brs-connect`
- **Environment**: `brs-connect-prod-v4`
- **AWS credentials**: stored as Replit secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)

### To redeploy from Replit:
```bash
node deploy/deploy-eb.mjs
```
This builds the app, creates a deployment ZIP (with real credentials from Replit secrets), uploads to S3, and triggers an EB environment update (~3-5 min).

### Deploy files:
- `deploy/deploy-eb.mjs` — automated deploy script (build + package + push to EB)
- `deploy/package-eb.sh` — manual packaging script (ZIP only, no deploy)
- `deploy/BRS-CONNECT-DEPLOYMENT-GUIDE.md` — full architecture and setup guide
