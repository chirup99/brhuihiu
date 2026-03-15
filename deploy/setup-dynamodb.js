import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Users";

async function setupTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`Table "${TABLE_NAME}" already exists — no action needed.`);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`Table "${TABLE_NAME}" not found. Creating...`);
      await client.send(
        new CreateTableCommand({
          TableName: TABLE_NAME,
          AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
          KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );
      console.log(`Table "${TABLE_NAME}" created successfully.`);
    } else {
      console.error("Unexpected error:", err);
      process.exit(1);
    }
  }
}

setupTable();
