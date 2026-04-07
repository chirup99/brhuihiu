/**
 * BRS Connect — Elastic Beanstalk deployment script
 * Builds the app, packages it, and deploys to EB in ap-south-1
 * Usage: node deploy/deploy-eb.mjs
 */

import { execSync } from "child_process";
import { createReadStream, rmSync, mkdirSync, writeFileSync, existsSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const AWS_REGION = "ap-south-1";
const EB_APP_NAME = "brs-connect";
const EB_ENV_NAME = "brs-connect-prod-v4";
const ZIP_NAME = "brs-connect-eb.zip";
const ZIP_PATH = resolve(ROOT, ZIP_NAME);
const STAGING = resolve(ROOT, "eb_staging");

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const SESSION_SECRET = process.env.SESSION_SECRET || "brs-connect-secret";

if (!ACCESS_KEY || !SECRET_KEY) {
  console.error("ERROR: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set.");
  process.exit(1);
}

function run(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
}

function createPackage() {
  // Clean staging dir
  if (existsSync(STAGING)) rmSync(STAGING, { recursive: true });
  mkdirSync(`${STAGING}/.ebextensions`, { recursive: true });

  // Copy built assets
  run(`cp -r ${ROOT}/dist ${STAGING}/dist`);
  run(`cp -r ${ROOT}/server ${STAGING}/server`);
  run(`cp -r ${ROOT}/shared ${STAGING}/shared`);
  run(`cp ${ROOT}/package-lock.json ${STAGING}/package-lock.json`);

  // Minimal package.json — EB only installs bufferutil native addon (~2s), skipping all 600+ packages
  writeFileSync(`${STAGING}/package.json`, JSON.stringify({
    name: "brs-connect",
    version: "1.0.0",
    scripts: { start: "node dist/index.cjs" },
    optionalDependencies: { bufferutil: "^4.1.0" }
  }, null, 2));

  // Procfile — tells EB how to start the app
  writeFileSync(`${STAGING}/Procfile`, "web: npm start\n");

  // EB port config — nginx proxies port 80 → 8081
  writeFileSync(`${STAGING}/.ebextensions/port.config`,
`option_settings:
  aws:elasticbeanstalk:application:environment:
    PORT: 8081
  aws:elasticbeanstalk:container:nodejs:
    ProxyServer: nginx
`);

  // .env with real credentials from Replit secrets
  writeFileSync(`${STAGING}/.env`,
`PORT=8081
NODE_ENV=production
AWS_REGION=${AWS_REGION}
AWS_ACCESS_KEY_ID=${ACCESS_KEY}
AWS_SECRET_ACCESS_KEY=${SECRET_KEY}
DYNAMODB_TABLE_NAME=Users
SESSION_SECRET=${SESSION_SECRET}
`);

  // Create ZIP using system zip command
  if (existsSync(ZIP_PATH)) rmSync(ZIP_PATH);
  run(`cd "${STAGING}" && zip -r "${ZIP_PATH}" . --quiet`);

  const sizeMB = (statSync(ZIP_PATH).size / 1024 / 1024).toFixed(2);
  console.log(`\nZIP created: ${ZIP_NAME} (${sizeMB} MB)`);

  // Clean up staging dir
  rmSync(STAGING, { recursive: true });

  // Verify contents
  console.log("\nVerifying ZIP contents...");
  run(`unzip -l "${ZIP_PATH}" | grep -E "(dist/index|dist/public/index|\.ebextensions|Procfile|package\.json|\.env)" | head -20`);
}

async function deployToEB() {
  const {
    ElasticBeanstalkClient,
    CreateStorageLocationCommand,
    CreateApplicationVersionCommand,
    UpdateEnvironmentCommand,
    DescribeEnvironmentsCommand,
  } = await import("@aws-sdk/client-elastic-beanstalk");

  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

  const credentials = { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY };
  const ebClient = new ElasticBeanstalkClient({ region: AWS_REGION, credentials });
  const s3Client = new S3Client({ region: AWS_REGION, credentials });

  // 1. Verify environment exists
  console.log(`\nVerifying EB environment: ${EB_ENV_NAME}...`);
  const envRes = await ebClient.send(new DescribeEnvironmentsCommand({
    ApplicationName: EB_APP_NAME,
    EnvironmentNames: [EB_ENV_NAME],
    IncludeDeleted: false,
  }));

  if (!envRes.Environments || envRes.Environments.length === 0) {
    console.error(`\nERROR: EB environment '${EB_ENV_NAME}' not found under application '${EB_APP_NAME}'.`);
    console.error(`Please create the environment first in the AWS Console.`);
    console.error(`Region: ${AWS_REGION}`);
    process.exit(1);
  }

  const env = envRes.Environments[0];
  console.log(`  Found: ${env.EnvironmentName} (${env.Status}) — ${env.CNAME || "no CNAME"}`);

  // 2. Get the EB-managed S3 bucket for this region
  console.log("\nGetting EB S3 storage location...");
  const storageRes = await ebClient.send(new CreateStorageLocationCommand({}));
  const bucket = storageRes.S3Bucket;
  console.log(`  EB S3 bucket: ${bucket}`);

  // 3. Upload ZIP to S3
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const versionLabel = `v-${timestamp}`;
  const s3Key = `${EB_APP_NAME}/${versionLabel}.zip`;

  console.log(`\nUploading to s3://${bucket}/${s3Key} ...`);
  const sizeMB = (statSync(ZIP_PATH).size / 1024 / 1024).toFixed(2);
  console.log(`  File size: ${sizeMB} MB`);

  await s3Client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    Body: createReadStream(ZIP_PATH),
    ContentType: "application/zip",
  }));
  console.log("  Upload complete.");

  // 4. Create application version
  console.log(`\nCreating application version: ${versionLabel} ...`);
  await ebClient.send(new CreateApplicationVersionCommand({
    ApplicationName: EB_APP_NAME,
    VersionLabel: versionLabel,
    SourceBundle: { S3Bucket: bucket, S3Key: s3Key },
    AutoCreateApplication: false,
  }));
  console.log("  Version created.");

  // 5. Deploy to environment
  console.log(`\nDeploying ${versionLabel} to ${EB_ENV_NAME} ...`);
  await ebClient.send(new UpdateEnvironmentCommand({
    ApplicationName: EB_APP_NAME,
    EnvironmentName: EB_ENV_NAME,
    VersionLabel: versionLabel,
  }));

  console.log(`
============================================================
Deployment initiated successfully!

  Application : ${EB_APP_NAME}
  Environment : ${EB_ENV_NAME}
  Version     : ${versionLabel}
  Region      : ${AWS_REGION}

The environment is updating — this takes about 3-5 minutes.
Monitor in the AWS Console:
  https://ap-south-1.console.aws.amazon.com/elasticbeanstalk/home?region=ap-south-1#/environments
============================================================
`);
}

async function main() {
  console.log("=== BRS Connect — Elastic Beanstalk Deployer ===\n");
  console.log(`Region    : ${AWS_REGION}`);
  console.log(`App       : ${EB_APP_NAME}`);
  console.log(`Env       : ${EB_ENV_NAME}`);
  console.log(`Timestamp : ${new Date().toISOString()}\n`);

  // Step 1: Build frontend + server
  console.log("[1/3] Building app (frontend + server bundle)...");
  run("npm run build");
  console.log("Build complete.");

  // Step 2: Package for EB
  console.log("\n[2/3] Packaging for Elastic Beanstalk...");
  createPackage();

  // Step 3: Deploy
  console.log("\n[3/3] Deploying to AWS Elastic Beanstalk...");
  await deployToEB();
}

main().catch((err) => {
  console.error("\nDeployment failed:", err.message || err);
  if (err.Code) console.error("AWS Error Code:", err.Code);
  process.exit(1);
});
