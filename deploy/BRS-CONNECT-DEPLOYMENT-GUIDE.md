# BRS Connect — AWS Elastic Beanstalk Deployment Guide

Region: **ap-south-1 (Mumbai)**  
Environment: **brs-connect-prod-v4**

---

## Architecture Overview

```
Internet
   │
   ▼
Route 53 (connectbrsvc.xyz)
   │
   ▼
Application Load Balancer  ← SSL certificate (HTTPS 443)
   │
   ▼
EC2 Instance
   │
   ▼
nginx (port 80 → 8081)
   │
   ▼
Node.js / Express (port 8081)
```

---

## Quick Deploy (Every Time You Push Code)

```bash
# From the Replit shell:
bash deploy/package-eb.sh
```

This script:
1. Runs `npm run build` to compile frontend + server
2. Assembles the correct files into a staging folder
3. Produces `brs-connect-eb.zip` ready to upload

Then upload via the AWS Console:
> Elastic Beanstalk → brs-connect → brs-connect-prod-v4 → **Upload and deploy** → select `brs-connect-eb.zip`

Or deploy automatically using the deployment script:
```bash
node deploy/deploy-eb.mjs
```

---

## Package Contents

```
brs-connect-eb.zip
├── dist/
│   ├── index.cjs        ← bundled Node.js server
│   └── public/          ← built React frontend
├── .ebextensions/
│   └── nodeport.config  ← tells nginx to proxy port 80 → 8081
├── Procfile             ← web: node dist/index.cjs
├── package.json
└── package-lock.json
```

---

## Environment Variables (EB Console)

Set these in: **Configuration → Environment properties**

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `8081` |
| `AWS_REGION` | `ap-south-1` |
| `DYNAMODB_TABLE_NAME` | `Users` |
| `AWS_ACCESS_KEY_ID` | *(your IAM key)* |
| `AWS_SECRET_ACCESS_KEY` | *(your IAM secret)* |

---

## First-Time Setup

### 1. Create DynamoDB Table

Run this once to create the `Users` table:
```bash
AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy node deploy/setup-dynamodb.js
```

### 2. SSL Certificate (ACM)

1. Go to: https://console.aws.amazon.com/acm/home?region=ap-south-1
2. Request a public certificate for:
   - `connectbrsvc.xyz`
   - `www.connectbrsvc.xyz`
3. Use DNS validation → click "Create records in Route 53"
4. Wait for status: **Issued** ✅
5. Copy the Certificate ARN — you'll need it for the Load Balancer

### 3. EB Environment Configuration

**Platform settings:**
- Platform: Node.js 20
- Platform branch: Node.js 20 running on 64bit Amazon Linux 2023

**Load Balancer → Edit:**
- Add HTTPS listener on port 443 with your ACM certificate ARN
- Health check path: `/health`
- Health check HTTP code: `200`

**Instance type:** t3.small or larger recommended

### 4. Route 53 DNS

In your `connectbrsvc.xyz` hosted zone, create two A records:

| Name | Type | Target |
|---|---|---|
| *(empty)* | A – Alias | Alias to Application Load Balancer → ap-south-1 |
| `www` | A – Alias | Alias to Application Load Balancer → ap-south-1 |

---

## Health Check

The app exposes a dedicated health check endpoint:
```
GET /health → 200 { "status": "ok" }
```

Configure your EB process health check to use path `/health` (not `/`).
This ensures the Load Balancer confirms the Node.js app is actually running.

---

## Security Groups

After the environment is created:

**Load Balancer SG — Inbound:**
| Port | Protocol | Source |
|------|----------|--------|
| 80 | HTTP | 0.0.0.0/0 |
| 443 | HTTPS | 0.0.0.0/0 |

**EC2 Instance SG — Inbound:**
| Port | Protocol | Source |
|------|----------|--------|
| 80 | HTTP | *Load Balancer SG only* |

> The EC2 instance must NOT be directly accessible from the internet.

---

## Troubleshooting

### "Severe" / Target.Timeout
Causes (in order of likelihood):
1. `dist/` folder was not included in the ZIP — always run `bash deploy/package-eb.sh`
2. `PORT` env var is not set to `8081` in EB environment properties
3. App crashed on startup — pull EB tail logs to see the error:
   > EB Console → Logs → Request tail logs

### "HTTPS redirect loop"
- Ensure nginx.conf passes `X-Forwarded-Proto $http_x_forwarded_proto` (not `$scheme`)

### "502 Bad Gateway"
- App is running but nginx can't reach it — confirm `PORT=8081` is set and `nodeport.config` is in the ZIP

### Viewing Logs
> EB Console → brs-connect-prod-v2 → Logs → Request tail logs → Download

---

## File Reference

| File | Purpose |
|---|---|
| `deploy/package-eb.sh` | Build + package for EB (run this to deploy) |
| `deploy/setup-dynamodb.js` | Create DynamoDB table (run once) |
| `deploy/BRS-CONNECT-DEPLOYMENT-GUIDE.md` | This guide |
| `.ebextensions/nodeport.config` | Tells EB/nginx to use port 8081 |
| `Procfile` | Tells EB how to start the app |
| `script/build.ts` | Build script (called by npm run build) |
