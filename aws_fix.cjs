const AWS = require("aws-sdk");
const REGION = "ap-south-1";
const ENV_NAME = "brs-connect-prod";
AWS.config.update({ region: REGION });
const eb = new AWS.ElasticBeanstalk();

// Step 1: Request log retrieval
const reqLog = await eb.requestEnvironmentInfo({ EnvironmentName: ENV_NAME, InfoType: "tail" }).promise();
console.log("Log request sent. Waiting 15s...");
await new Promise(r => setTimeout(r, 15000));

// Step 2: Retrieve logs
const logs = await eb.retrieveEnvironmentInfo({ EnvironmentName: ENV_NAME, InfoType: "tail" }).promise();
for (const log of logs.EnvironmentInfo || []) {
  console.log(`\n=== LOG FROM ${log.Ec2InstanceId} ===`);
  console.log(log.Message);
}
