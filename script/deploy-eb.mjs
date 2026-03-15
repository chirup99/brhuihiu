import AWS from "aws-sdk";
import { readFileSync, existsSync } from "fs";

const REGION = "ap-south-1";
const APP_NAME = "brs-connect";
const ENV_NAME = "brs-connect-prod-v2";
const ZIP_PATH = "./brs-connect-latest.zip";
const S3_BUCKET = `brs-eb-${Date.now()}`.slice(0, 63).toLowerCase();
const VERSION_LABEL = `v${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}`;

AWS.config.update({
  region: REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
});

const s3 = new AWS.S3();
const eb = new AWS.ElasticBeanstalk();

async function step(label, fn) {
  process.stdout.write(`\n→ ${label}... `);
  try {
    const result = await fn();
    console.log("✓");
    return result;
  } catch (err) {
    console.log("✗");
    throw err;
  }
}

(async () => {
  if (!existsSync(ZIP_PATH)) {
    console.error("ZIP not found:", ZIP_PATH);
    process.exit(1);
  }

  // 1. Create S3 bucket
  await step(`Creating S3 bucket: ${S3_BUCKET}`, () =>
    s3.createBucket({
      Bucket: S3_BUCKET,
      CreateBucketConfiguration: { LocationConstraint: REGION },
    }).promise()
  );

  // 2. Upload ZIP
  const zipKey = `${VERSION_LABEL}/persona-eb-deployment.zip`;
  await step("Uploading ZIP to S3", () =>
    s3.putObject({
      Bucket: S3_BUCKET,
      Key: zipKey,
      Body: readFileSync(ZIP_PATH),
    }).promise()
  );

  // 3. Create EB Application (if needed)
  await step(`Creating EB application: ${APP_NAME}`, async () => {
    const { Applications } = await eb.describeApplications({ ApplicationNames: [APP_NAME] }).promise();
    if (Applications.length === 0) {
      await eb.createApplication({ ApplicationName: APP_NAME, Description: "BRS Connect" }).promise();
    } else {
      process.stdout.write("(exists) ");
    }
  });

  // 4. Create Application Version
  await step(`Creating version: ${VERSION_LABEL}`, () =>
    eb.createApplicationVersion({
      ApplicationName: APP_NAME,
      VersionLabel: VERSION_LABEL,
      Description: "Deployed from Replit",
      SourceBundle: { S3Bucket: S3_BUCKET, S3Key: zipKey },
    }).promise()
  );

  // 5. Create Environment
  await step(`Creating environment: ${ENV_NAME} in Mumbai (ap-south-1)`, async () => {
    const { Environments } = await eb.describeEnvironments({
      ApplicationName: APP_NAME,
      EnvironmentNames: [ENV_NAME],
    }).promise();
    const active = Environments.filter(e => e.Status !== "Terminated");
    if (active.length > 0) {
      process.stdout.write("(exists — updating to new version) ");
      await eb.updateEnvironment({
        EnvironmentName: ENV_NAME,
        VersionLabel: VERSION_LABEL,
      }).promise();
      return;
    }

    await eb.createEnvironment({
      ApplicationName: APP_NAME,
      EnvironmentName: ENV_NAME,
      VersionLabel: VERSION_LABEL,
      SolutionStackName: "64bit Amazon Linux 2023 v6.9.0 running Node.js 20",
      Tier: { Name: "WebServer", Type: "Standard" },
      OptionSettings: [
        { Namespace: "aws:elasticbeanstalk:application:environment", OptionName: "NODE_ENV",              Value: "production" },
        { Namespace: "aws:elasticbeanstalk:application:environment", OptionName: "PORT",                  Value: "8080" },
        { Namespace: "aws:elasticbeanstalk:application:environment", OptionName: "AWS_REGION",            Value: "ap-south-1" },
        { Namespace: "aws:elasticbeanstalk:application:environment", OptionName: "DYNAMODB_TABLE_NAME",   Value: process.env.DYNAMODB_TABLE_NAME || "Users" },
        { Namespace: "aws:elasticbeanstalk:application:environment", OptionName: "AWS_ACCESS_KEY_ID",     Value: process.env.AWS_ACCESS_KEY_ID.trim() },
        { Namespace: "aws:elasticbeanstalk:application:environment", OptionName: "AWS_SECRET_ACCESS_KEY", Value: process.env.AWS_SECRET_ACCESS_KEY.trim() },
        { Namespace: "aws:elasticbeanstalk:application:environment", OptionName: "LIVEKIT_API_KEY",       Value: process.env.LIVEKIT_API_KEY || "" },
        { Namespace: "aws:elasticbeanstalk:application:environment", OptionName: "LIVEKIT_API_SECRET",    Value: process.env.LIVEKIT_API_SECRET || "" },
        { Namespace: "aws:elasticbeanstalk:container:nodejs",        OptionName: "ProxyServer",           Value: "nginx" },
        { Namespace: "aws:autoscaling:launchconfiguration",          OptionName: "IamInstanceProfile",    Value: "aws-elasticbeanstalk-ec2-role" },
      ],
    }).promise();
  });

  console.log("\n\n✅ Deployment initiated successfully!");
  console.log(`   Application: ${APP_NAME}`);
  console.log(`   Environment: ${ENV_NAME}`);
  console.log(`   Region:      ${REGION} (Mumbai)`);
  console.log(`   Version:     ${VERSION_LABEL}`);
  console.log(`   S3 Bucket:   ${S3_BUCKET}`);
  console.log("\n⏳ Environment is launching — typically takes 5-10 minutes.");
  console.log("   Track progress at:");
  console.log("   https://ap-south-1.console.aws.amazon.com/elasticbeanstalk/home?region=ap-south-1#/environments");
})().catch(err => {
  console.error("\n❌ Deployment failed:", err.message || err);
  process.exit(1);
});
