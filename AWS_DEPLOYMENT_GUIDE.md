# Complete AWS Deployment Guide — BRS Connect
## Beginner's Step-by-Step: From Zero to Secure Production

---

## What You're Building

```
Internet
   │
   ▼
Route 53 (DNS — connectbrsvc.xyz)
   │
   ▼
Load Balancer (accepts traffic on port 80 & 443)
   │  ← SSL Certificate lives here (HTTPS)
   │  ← Security Group A: allows 80 + 443 from internet
   │
   ▼
EC2 Instance (your actual server)
   │  ← Security Group B: allows port 80 ONLY from Load Balancer
   │
   ▼
Node.js App (running on port 8081)
   ▲
  nginx (proxy: port 80 → 8081)
```

Every layer is explained below. Follow in order.

---

## PART 1 — Concepts (Read This First)

### What is EC2?
An EC2 instance is a virtual computer (server) on AWS. Your Node.js app runs here.
Think of it as renting a computer in Amazon's data center.

### What is Elastic Beanstalk (EB)?
EB is a service that automatically manages your EC2 instances for you.
You give it your app ZIP file, it handles: starting the server, load balancing, health checks, auto-scaling, deployments.
You don't have to manually SSH into servers.

### What is a Load Balancer?
A Load Balancer is a traffic router that sits in front of your servers.
- It receives all internet traffic
- It forwards traffic to one or more EC2 instances
- It handles HTTPS (SSL) so your app doesn't have to
- It keeps serving traffic even if one instance crashes (using the healthy one)

### What is a Security Group?
A Security Group is a firewall for AWS resources.
- You define rules: "allow traffic on port 443 from anywhere"
- Resources not listed are blocked by default
- You use two security groups: one for the Load Balancer, one for EC2

### What is an ACM Certificate?
ACM (AWS Certificate Manager) provides free SSL/TLS certificates.
This is what makes the padlock (🔒) appear in the browser.
It attaches to the Load Balancer, not the server.

### What is Route 53?
Route 53 is AWS's DNS service. It connects your domain name (connectbrsvc.xyz)
to your Load Balancer's address. Without it, users can't find your app.

### What is nginx?
nginx is a web server that runs inside the EC2 instance.
EB installs it automatically. It listens on port 80 and forwards requests to your
Node.js app on port 8081.

---

## PART 2 — Prerequisites

Before starting, make sure you have:
- [ ] An AWS account
- [ ] Your domain name (e.g. connectbrsvc.xyz) registered — either in Route 53 or another registrar
- [ ] Your project code ready to build (npm run build works locally)
- [ ] AWS IAM user with these permissions (ask your AWS admin):
  - AWSElasticBeanstalkFullAccess
  - AmazonS3FullAccess
  - AmazonDynamoDBFullAccess
  - AmazonRoute53FullAccess
  - AWSCertificateManagerFullAccess
  - AmazonEC2FullAccess

---

## PART 3 — Step 1: Request an SSL Certificate (ACM)

Do this FIRST because validation takes time.

1. Go to: https://console.aws.amazon.com/acm/home?region=ap-south-1
   ⚠️ Make sure the region selector (top-right) says **ap-south-1 (Mumbai)**

2. Click **"Request a certificate"**

3. Choose **"Request a public certificate"** → click Next

4. Under **"Fully qualified domain name"** enter:
   ```
   connectbrsvc.xyz
   ```

5. Click **"Add another name to this certificate"** and enter:
   ```
   www.connectbrsvc.xyz
   ```
   This covers both the main domain AND www.

6. Validation method: choose **"DNS validation"** (recommended)

7. Click **"Request"**

8. You'll see your new certificate in a **"Pending validation"** state.
   Click on it to open it.

9. Under "Domains" you'll see two rows with a button **"Create records in Route 53"**
   Click that button — AWS automatically adds the validation DNS records for you.

10. Wait 5–10 minutes. Refresh the page until Status shows **"Issued"** ✅

11. **Copy the Certificate ARN** — it looks like:
    ```
    arn:aws:acm:ap-south-1:YOUR_ACCOUNT_ID:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    ```
    You'll need this later.

---

## PART 4 — Step 2: Build Your Application

On your computer (or in Replit terminal):

```bash
# Step 1: Install dependencies
npm install

# Step 2: Build the project (creates /dist folder)
npm run build

# Step 3: Create staging folder
mkdir -p aws-eb-staging/.ebextensions
mkdir -p aws-eb-staging/.platform/nginx
```

### Create the required config files:

**File: aws-eb-staging/.ebextensions/port.config**
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    PORT: 8081
  aws:elasticbeanstalk:container:nodejs:
    ProxyServer: nginx
```
What this does: Tells EB your app runs on port 8081 and to use nginx as proxy.

**File: aws-eb-staging/Procfile**
```
web: npm start
```
What this does: Tells EB which command to run to start your app.

**File: aws-eb-staging/.platform/nginx/nginx.conf**
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /var/run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  access_log    /var/log/nginx/access.log combined;
  sendfile      on;
  keepalive_timeout 65;
  types_hash_max_size 4096;
  types_hash_bucket_size 128;

  upstream nodejs {
    server 127.0.0.1:8081;
    keepalive 256;
  }

  server {
    listen 80;
    server_name _;

    location / {
      proxy_pass          http://nodejs;
      proxy_http_version  1.1;
      proxy_set_header    Connection        "";
      proxy_set_header    Host              $host;
      proxy_set_header    X-Real-IP         $remote_addr;
      proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header    X-Forwarded-Proto $http_x_forwarded_proto;
      proxy_buffer_size   128k;
      proxy_buffers       4 256k;
      proxy_busy_buffers_size 256k;
    }
  }
}
```
⚠️ The critical line is:
```
proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
```
This tells nginx to forward the original protocol (https or http) from the Load Balancer
to your Node.js app. Without this, your app always sees "http" and creates redirect loops.

### Copy files into staging:
```bash
cp -r dist        aws-eb-staging/
cp package.json   aws-eb-staging/
cp package-lock.json aws-eb-staging/
cp -r server      aws-eb-staging/
cp -r shared      aws-eb-staging/
cp tsconfig.json  aws-eb-staging/
```

### Create the ZIP:
```bash
cd aws-eb-staging && zip -r ../persona-eb-deployment.zip . && cd ..
rm -rf aws-eb-staging
```

---

## PART 5 — Step 3: Create Elastic Beanstalk Application & Environment

### 3A. Create the Application

1. Go to: https://console.aws.amazon.com/elasticbeanstalk/home?region=ap-south-1

2. Click **"Create application"**

3. Fill in:
   - Application name: `brs-connect`
   - Click **"Create"**

### 3B. Create the Environment

1. Inside the brs-connect application, click **"Create a new environment"**

2. Choose **"Web server environment"** → click Select

3. Fill in:
   - **Environment name**: `brs-connect-prod`
   - **Domain**: leave blank (auto-generated) or type a name
   - **Platform**: Node.js
   - **Platform branch**: Node.js 20 running on 64bit Amazon Linux 2023
   - **Platform version**: (pick the latest)

4. Under **"Application code"**:
   - Choose **"Upload your code"**
   - Click **"Choose file"** → select your `persona-eb-deployment.zip`
   - Version label: `v1` (or any name)

5. Click **"Configure more options"** (don't click Create yet)

---

## PART 6 — Step 4: Configure Security Groups

This is where you lock down who can talk to what.

### In the "Configure more options" screen:

**Click "Edit" next to "Load balancer":**

1. Load balancer type: **Classic Load Balancer**

2. Under **Listeners**, you should see:
   - HTTP port 80 — keep this (for redirect)
   - Click **"Add listener"**:
     - Protocol: HTTPS
     - Port: 443
     - SSL certificate: paste your Certificate ARN from Step 1
     - Click Add

3. Under **Processes**:
   - Port: 80
   - Protocol: HTTP
   - Health check path: `/`

4. Click **"Save"**

**Click "Edit" next to "Security":**

Leave as default for now — EB creates two security groups automatically:
- **Load Balancer SG**: will allow 80 and 443 from internet
- **Instance SG**: will allow 80 only from Load Balancer SG

Click **"Save"**

**Click "Edit" next to "Environment properties":**

Add these environment variables (click "Add" for each):

| Property name | Value |
|---|---|
| NODE_ENV | production |
| PORT | 8081 |
| AWS_REGION | ap-south-1 |
| DYNAMODB_TABLE_NAME | Users |
| AWS_ACCESS_KEY_ID | your_key_here |
| AWS_SECRET_ACCESS_KEY | your_secret_here |
| LIVEKIT_API_KEY | your_key_here |
| LIVEKIT_API_SECRET | your_secret_here |

Click **"Save"**

**Click "Edit" next to "Monitoring":**

- Health reporting: choose **"Enhanced"**
- Click **"Save"**

5. Now click **"Create environment"** at the bottom

⏳ Wait 10–15 minutes. EB will:
- Launch an EC2 instance
- Install Node.js and nginx
- Deploy your app
- Create a Load Balancer
- Set up health checks

When done, the status will show **"Ok"** (green) ✅

---

## PART 7 — Step 5: Harden Security Groups After Creation

Once the environment is created, we tighten the security groups.

### 5A. Find your Security Groups

1. Go to: https://console.aws.amazon.com/ec2/home?region=ap-south-1#SecurityGroups

2. Filter by your environment name (brs-connect-prod)
   You'll see two groups:
   - One named `...AWSEBLoadBalancerSecurityGroup...` — this is the LB SG
   - One named `...AWSEBSecurityGroup...` — this is the EC2 instance SG

### 5B. Load Balancer Security Group Rules

Click the LB security group. Check the **"Inbound rules"** tab.

It should have (add if missing):
| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP from internet |
| HTTP | TCP | 80 | ::/0 | HTTP from internet (IPv6) |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS from internet |
| HTTPS | TCP | 443 | ::/0 | HTTPS from internet (IPv6) |

To add a rule: click **"Edit inbound rules"** → **"Add rule"** → fill in values → **"Save rules"**

**Outbound rules** should have:
| Type | Protocol | Port | Destination |
|------|----------|------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 |

### 5C. EC2 Instance Security Group Rules

Click the Instance security group. **Inbound rules** should show ONLY:

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| HTTP | TCP | 80 | (the LB Security Group ID — e.g. sg-0abc123...) |

This means: the EC2 instance ONLY accepts traffic from the Load Balancer. Nobody can connect directly to your server from the internet. This is correct and secure.

If the source is `0.0.0.0/0` (all internet), remove it and replace with the LB Security Group ID.

---

## PART 8 — Step 6: Add HTTP-to-HTTPS Redirect in Your App

The Load Balancer keeps port 80 open so it can redirect users to HTTPS.
The redirect happens inside your Express app by reading the `X-Forwarded-Proto` header
that the Load Balancer adds to every request.

In your `server/index.ts`, add this right after `const app = express();`:

```typescript
app.set("trust proxy", 1); // Trust the Load Balancer's headers

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    // Get the protocol the USER used (http or https), set by the Load Balancer
    const proto = (req.headers["x-forwarded-proto"] as string | undefined)
      ?.split(",")[0]
      ?.trim();

    if (proto === "http") {
      // User came via HTTP — redirect them to HTTPS
      const host = (req.headers["host"] || "").replace(/:\d+$/, "");
      return res.redirect(301, `https://${host}${req.url}`);
    }
    next(); // User came via HTTPS — proceed normally
  });
}
```

**Why `trust proxy`?**
Without this, Express ignores the `X-Forwarded-Proto` header (security feature).
Setting it to `1` tells Express: "trust the first proxy in the chain" (our Load Balancer).

**Why check `X-Forwarded-Proto` and not just `req.secure`?**
The Load Balancer terminates SSL. Your app always receives plain HTTP from nginx.
`req.secure` would always be false. The Load Balancer tells the app whether the
original request was HTTPS via this header.

**Why `.split(",")[0]`?**
If multiple proxies are in the chain, the header can be `"https, http"`. We only
want the first value (the outermost proxy = the Load Balancer).

After making this change, rebuild and redeploy your ZIP.

---

## PART 9 — Step 7: Configure Route 53 DNS

This connects your domain name to your Load Balancer.

1. Go to: https://console.aws.amazon.com/route53/home

2. Click **"Hosted zones"** in the left menu

3. If `connectbrsvc.xyz` is NOT listed:
   - Click **"Create hosted zone"**
   - Domain name: `connectbrsvc.xyz`
   - Type: Public hosted zone
   - Click Create
   - **Important**: Copy the 4 nameserver values (NS records) and update them at your domain registrar

4. Click on `connectbrsvc.xyz` to open it

5. Click **"Create record"** (do this twice):

**Record 1 — Root domain:**
- Record name: *(leave empty)*
- Record type: **A**
- Toggle **"Alias"** to ON
- Route traffic to: **Alias to Classic Load Balancer**
- Region: **Asia Pacific (Mumbai) ap-south-1**
- Load balancer: select your LB from the dropdown
- Click **"Create records"**

**Record 2 — www subdomain:**
- Record name: `www`
- Record type: **A**
- Toggle **"Alias"** to ON
- Route traffic to: **Alias to Classic Load Balancer**
- Region: **Asia Pacific (Mumbai) ap-south-1**
- Load balancer: select your LB from the dropdown
- Click **"Create records"**

After saving, DNS propagates within 1–2 minutes inside AWS.

---

## PART 10 — Step 8: Final Health Check Configuration

Make sure EB's health check uses HTTP (not TCP) so it verifies the app actually responds.

1. Go to your EB environment → **Configuration** → **Load balancer** → Edit

2. Under **Processes** → click the default process → Edit:
   - **Health check path**: `/`
   - **HTTP code**: `200`

3. Under **Health check** (main section):
   - Interval: `15`
   - Timeout: `5`
   - Healthy threshold: `2`
   - Unhealthy threshold: `3`

4. Enable **Cross-zone load balancing**: toggle ON
   This distributes traffic evenly across all availability zones.

5. Click **"Save"** → **"Apply"**

---

## PART 11 — Complete Security Checklist

Go through each item to verify your setup is complete:

### DNS ✅
- [ ] Route 53 hosted zone exists for your domain
- [ ] A record (apex/root) → Load Balancer alias
- [ ] A record (www) → Load Balancer alias
- [ ] NS records match your domain registrar's nameservers

### SSL Certificate ✅
- [ ] ACM certificate status is "Issued"
- [ ] Certificate covers both `connectbrsvc.xyz` AND `www.connectbrsvc.xyz`
- [ ] Certificate is attached to the Load Balancer on port 443

### Load Balancer ✅
- [ ] Port 80 listener exists (HTTP → EC2:80)
- [ ] Port 443 listener exists (HTTPS → EC2:80) with your ACM cert
- [ ] Cross-zone load balancing is ON
- [ ] Health check uses HTTP:80/ (not TCP)
- [ ] Connection draining is enabled (20s timeout)

### Security Groups ✅
- [ ] LB Security Group allows: 80 + 443 inbound from 0.0.0.0/0 and ::/0
- [ ] LB Security Group allows: 80 outbound to 0.0.0.0/0
- [ ] EC2 Security Group allows: 80 inbound ONLY from LB Security Group
- [ ] EC2 Security Group has NO direct internet inbound access

### Application ✅
- [ ] `app.set("trust proxy", 1)` is set
- [ ] HTTP→HTTPS redirect middleware is in place
- [ ] nginx config forwards `X-Forwarded-Proto` from LB to app
- [ ] `NODE_ENV=production` is set in EB environment variables

### EB Environment ✅
- [ ] Enhanced health reporting is enabled
- [ ] All environment variables are set (AWS keys, DynamoDB, etc.)
- [ ] Platform: Node.js 20 on Amazon Linux 2023

---

## PART 12 — How to Redeploy (Every Time You Change Code)

```bash
# 1. Build
npm run build

# 2. Create ZIP
mkdir -p aws-eb-staging/.ebextensions aws-eb-staging/.platform/nginx
cp aws-eb-staging/.ebextensions/port.config  (recreate from Step 4)
cp aws-eb-staging/Procfile                   (recreate from Step 4)
cp aws-eb-staging/.platform/nginx/nginx.conf (recreate from Step 4)
cp -r dist server shared aws-eb-staging/
cp package.json package-lock.json tsconfig.json aws-eb-staging/
cd aws-eb-staging && zip -r ../persona-eb-deployment.zip . && cd ..
rm -rf aws-eb-staging

# 3. Upload via AWS Console
# Go to: EB → brs-connect → brs-connect-prod → Upload and deploy
# Select persona-eb-deployment.zip → Deploy
```

---

## PART 13 — Troubleshooting Common Problems

### "Health is Red / Degraded"
- Check EB environment events (click "Recent events")
- Get logs: EB environment → Logs → "Request tail logs"
- Common cause: app not starting, check for missing environment variables

### "HTTPS redirect loops / assets returning 301"
- Cause: nginx is overwriting `X-Forwarded-Proto` with `$scheme` (always http)
- Fix: Use the nginx.conf from Step 2 with `$http_x_forwarded_proto`

### "Certificate error on www.connectbrsvc.xyz"
- Cause: ACM cert doesn't include `www` as a Subject Alternative Name
- Fix: Request a new certificate that includes both the apex and www domains

### "Site not loading after DNS change"
- DNS can take up to 48 hours to propagate globally (usually 1-5 minutes for Route 53)
- Test with: https://dnschecker.org/#A/connectbrsvc.xyz

### "EB overwrites my Load Balancer changes"
- Never manually change the LB directly — always change through EB configuration
- Manual changes get overwritten when EB updates the environment

---

## Summary — The Request Flow for a Secure Request

```
Browser types: https://connectbrsvc.xyz
        │
        ▼
Route 53: resolves connectbrsvc.xyz → Load Balancer IP
        │
        ▼
Load Balancer (port 443):
  - Validates ACM SSL certificate ← padlock appears here
  - Decrypts HTTPS traffic
  - Adds header: X-Forwarded-Proto: https
  - Forwards plain HTTP to EC2 instance on port 80
        │
        ▼
EC2 Instance / nginx (port 80):
  - Forwards to Node.js on port 8081
  - Preserves X-Forwarded-Proto: https header
        │
        ▼
Node.js / Express (port 8081):
  - Sees X-Forwarded-Proto: https
  - Serves the response normally (no redirect)
        │
        ▼
Response travels back up the chain
Browser shows the page with 🔒 padlock
```

---

*Guide written for BRS Connect deployment — ap-south-1 (Mumbai) region*
