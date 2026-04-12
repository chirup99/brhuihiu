import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { type InsertUser, type User } from "@shared/schema";

export interface BRSEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  createdAt: string;
}

const EVENTS_RECORD_ID = "brs_system_events";
const FEATURED_SLUGS_RECORD_ID = "brs_system_featured_slugs";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Users";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySlug(slug: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  incrementLike(id: string): Promise<number>;
  incrementDislike(id: string): Promise<number>;
  getVoteStatus(userId: string, voterId: string): Promise<"like" | "dislike" | null>;
  recordVote(userId: string, voterId: string, type: "like" | "dislike"): Promise<{ likeCount: number; dislikeCount: number; alreadyVoted: boolean }>;
  getEvents(): Promise<BRSEvent[]>;
  saveEvents(events: BRSEvent[]): Promise<void>;
  getFeaturedSlugs(): Promise<string[]>;
  saveFeaturedSlugs(slugs: string[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: BRSEvent[] = [];
  private votes: Map<string, Map<string, "like" | "dislike">> = new Map();

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async getUserBySlug(slug: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.uniqueSlug === slug);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const newUser: User = {
      ...insertUser,
      id,
      createdAt: new Date().toISOString() as any,
      email: insertUser.email || "",
      password: insertUser.password || "",
      name: insertUser.name || null,
      role: insertUser.role || null,
      bio: insertUser.bio || null,
      instagram: insertUser.instagram || null,
      linkedin: insertUser.linkedin || null,
      whatsapp: insertUser.whatsapp || null,
      website: insertUser.website || null,
      youtube: insertUser.youtube || null,
      industry: insertUser.industry || null,
      uniqueSlug: insertUser.uniqueSlug || null,
      connections: insertUser.connections || [],
      cards: insertUser.cards || [],
      notes: insertUser.notes || [],
      pin: insertUser.pin || null,
      reachCount: 0,
      instaClicks: 0,
      linkedinClicks: 0,
      whatsappClicks: 0,
      websiteClicks: 0,
      likeCount: 0,
      dislikeCount: 0,
      reachHistory: [],
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, partialUser: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...partialUser };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async incrementLike(id: string): Promise<number> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const newCount = (user.likeCount || 0) + 1;
    this.users.set(id, { ...user, likeCount: newCount });
    return newCount;
  }

  async incrementDislike(id: string): Promise<number> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const newCount = (user.dislikeCount || 0) + 1;
    this.users.set(id, { ...user, dislikeCount: newCount });
    return newCount;
  }

  async getVoteStatus(userId: string, voterId: string): Promise<"like" | "dislike" | null> {
    return this.votes.get(userId)?.get(voterId) ?? null;
  }

  async recordVote(userId: string, voterId: string, type: "like" | "dislike"): Promise<{ likeCount: number; dislikeCount: number; alreadyVoted: boolean }> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const existing = await this.getVoteStatus(userId, voterId);
    if (existing) {
      return { likeCount: user.likeCount || 0, dislikeCount: user.dislikeCount || 0, alreadyVoted: true };
    }
    if (!this.votes.has(userId)) this.votes.set(userId, new Map());
    this.votes.get(userId)!.set(voterId, type);
    const updated = {
      ...user,
      likeCount: type === "like" ? (user.likeCount || 0) + 1 : (user.likeCount || 0),
      dislikeCount: type === "dislike" ? (user.dislikeCount || 0) + 1 : (user.dislikeCount || 0),
    };
    this.users.set(userId, updated);
    return { likeCount: updated.likeCount, dislikeCount: updated.dislikeCount, alreadyVoted: false };
  }

  async getEvents(): Promise<BRSEvent[]> {
    return this.events;
  }

  async saveEvents(events: BRSEvent[]): Promise<void> {
    this.events = events;
  }

  private featuredSlugs: string[] = [];

  async getFeaturedSlugs(): Promise<string[]> {
    return this.featuredSlugs;
  }

  async saveFeaturedSlugs(slugs: string[]): Promise<void> {
    this.featuredSlugs = slugs;
  }
}

export class DynamoDBStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const { Item } = await ddbDocClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      }));
      return Item as User | undefined;
    } catch (e) {
      console.error("DynamoDB Get Error:", e);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log("Searching user by email:", email);
      const { Items } = await ddbDocClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      }));
      const user = (Items && Items.length > 0) ? (Items[0] as User) : undefined;
      console.log("User found by email:", user ? user.id : "none");
      return user;
    } catch (error) {
      console.error("Error getting user by email from DynamoDB:", error);
      throw error;
    }
  }

  async getUserBySlug(slug: string): Promise<User | undefined> {
    try {
      console.log("Searching user by slug:", slug);
      const { Items } = await ddbDocClient.send(new ScanCommand({
        TableName: TABLE_NAME,
      }));
      
      const user = Items?.find(item => 
        String(item.uniqueSlug).toLowerCase() === String(slug).toLowerCase()
      ) as User | undefined;

      console.log("User found by slug:", user ? user.id : "none");
      return user;
    } catch (error) {
      console.error("Error getting user by slug from DynamoDB:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const items: User[] = [];
      let lastKey: Record<string, any> | undefined;
      do {
        const { Items, LastEvaluatedKey } = await ddbDocClient.send(new ScanCommand({
          TableName: TABLE_NAME,
          ExclusiveStartKey: lastKey,
        }));
        if (Items) items.push(...(Items as User[]));
        lastKey = LastEvaluatedKey as Record<string, any> | undefined;
      } while (lastKey);
      return items.filter(u => u.id && !u.id.startsWith("brs_system_") && u.uniqueSlug);
    } catch (e) {
      console.error("DynamoDB getAllUsers Error:", e);
      return [];
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log("Creating user in DynamoDB:", insertUser.email);
    const newUser: User = {
      ...insertUser,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString() as any,
      email: insertUser.email || "",
      password: insertUser.password || "",
      name: insertUser.name || null,
      role: insertUser.role || null,
      bio: insertUser.bio || null,
      instagram: insertUser.instagram || null,
      linkedin: insertUser.linkedin || null,
      whatsapp: insertUser.whatsapp || null,
      website: insertUser.website || null,
      youtube: insertUser.youtube || null,
      industry: insertUser.industry || null,
      uniqueSlug: insertUser.uniqueSlug || null,
      connections: insertUser.connections || [],
      cards: insertUser.cards || [],
      notes: insertUser.notes || [],
      pin: insertUser.pin || null,
      reachCount: 0,
      instaClicks: 0,
      linkedinClicks: 0,
      whatsappClicks: 0,
      websiteClicks: 0,
      likeCount: 0,
      dislikeCount: 0,
      reachHistory: [],
    };
    try {
      // Attempt to describe table to check if it exists
      try {
        await ddbDocClient.send(new ScanCommand({ TableName: TABLE_NAME, Limit: 1 }));
      } catch (e: any) {
        if (e.name === "ResourceNotFoundException" || e.name === "UnrecognizedClientException") {
          console.error(`DynamoDB Error: ${e.name}. Ensure table "${TABLE_NAME}" exists and credentials are correct.`);
          throw new Error(`Database table "${TABLE_NAME}" not found. Please wait a moment if it was just created.`);
        }
        throw e;
      }

      await ddbDocClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: newUser,
      }));
      console.log("Successfully created user:", newUser.id);
      return newUser;
    } catch (error) {
      console.error("Error creating user in DynamoDB:", error);
      throw error;
    }
  }

  async updateUser(id: string, partialUser: Partial<InsertUser>): Promise<User> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(partialUser).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpression.length === 0) {
      const user = await this.getUser(id);
      if (!user) throw new Error("User not found");
      return user;
    }

    const { Attributes } = await ddbDocClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    }));

    return Attributes as User;
  }

  async incrementLike(id: string): Promise<number> {
    try {
      const { Attributes } = await ddbDocClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: "ADD #likeCount :inc",
        ExpressionAttributeNames: { "#likeCount": "likeCount" },
        ExpressionAttributeValues: { ":inc": 1 },
        ReturnValues: "ALL_NEW",
      }));
      return (Attributes?.likeCount as number) || 1;
    } catch (e) {
      console.error("DynamoDB incrementLike error:", e);
      throw e;
    }
  }

  async incrementDislike(id: string): Promise<number> {
    try {
      const { Attributes } = await ddbDocClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: "ADD #dislikeCount :inc",
        ExpressionAttributeNames: { "#dislikeCount": "dislikeCount" },
        ExpressionAttributeValues: { ":inc": 1 },
        ReturnValues: "ALL_NEW",
      }));
      return (Attributes?.dislikeCount as number) || 1;
    } catch (e) {
      console.error("DynamoDB incrementDislike error:", e);
      throw e;
    }
  }

  async getVoteStatus(userId: string, voterId: string): Promise<"like" | "dislike" | null> {
    try {
      const safeKey = "voter_" + voterId.replace(/[^a-zA-Z0-9]/g, "_");
      const { Item } = await ddbDocClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: userId },
        ProjectionExpression: "#vk",
        ExpressionAttributeNames: { "#vk": safeKey },
      }));
      return (Item?.[safeKey] as "like" | "dislike") || null;
    } catch (e) {
      console.error("DynamoDB getVoteStatus error:", e);
      return null;
    }
  }

  async recordVote(userId: string, voterId: string, type: "like" | "dislike"): Promise<{ likeCount: number; dislikeCount: number; alreadyVoted: boolean }> {
    const safeKey = "voter_" + voterId.replace(/[^a-zA-Z0-9]/g, "_");
    const countField = type === "like" ? "likeCount" : "dislikeCount";
    try {
      const { Attributes } = await ddbDocClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: userId },
        UpdateExpression: "ADD #count :inc SET #voterKey = :voteType",
        ConditionExpression: "attribute_not_exists(#voterKey)",
        ExpressionAttributeNames: { "#count": countField, "#voterKey": safeKey },
        ExpressionAttributeValues: { ":inc": 1, ":voteType": type },
        ReturnValues: "ALL_NEW",
      }));
      return {
        likeCount: (Attributes?.likeCount as number) || 0,
        dislikeCount: (Attributes?.dislikeCount as number) || 0,
        alreadyVoted: false,
      };
    } catch (e: any) {
      if (e.name === "ConditionalCheckFailedException") {
        const user = await this.getUser(userId);
        return {
          likeCount: user?.likeCount || 0,
          dislikeCount: user?.dislikeCount || 0,
          alreadyVoted: true,
        };
      }
      console.error("DynamoDB recordVote error:", e);
      throw e;
    }
  }

  async getEvents(): Promise<BRSEvent[]> {
    try {
      const { Item } = await ddbDocClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: EVENTS_RECORD_ID },
      }));
      return (Item?.events as BRSEvent[]) || [];
    } catch (e) {
      console.error("DynamoDB getEvents error:", e);
      return [];
    }
  }

  async saveEvents(events: BRSEvent[]): Promise<void> {
    try {
      await ddbDocClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { id: EVENTS_RECORD_ID, events },
      }));
    } catch (e) {
      console.error("DynamoDB saveEvents error:", e);
      throw e;
    }
  }

  async getFeaturedSlugs(): Promise<string[]> {
    try {
      const { Item } = await ddbDocClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: FEATURED_SLUGS_RECORD_ID },
      }));
      return (Item?.slugs as string[]) || [];
    } catch (e) {
      console.error("DynamoDB getFeaturedSlugs error:", e);
      return [];
    }
  }

  async saveFeaturedSlugs(slugs: string[]): Promise<void> {
    try {
      await ddbDocClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { id: FEATURED_SLUGS_RECORD_ID, slugs },
      }));
    } catch (e) {
      console.error("DynamoDB saveFeaturedSlugs error:", e);
      throw e;
    }
  }
}

// Use DynamoDBStorage when AWS credentials are configured, otherwise fall back to in-memory
const hasAwsCredentials =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_ACCESS_KEY_ID.length > 0 &&
  process.env.AWS_SECRET_ACCESS_KEY.length > 0;

export const storage: IStorage = hasAwsCredentials
  ? new DynamoDBStorage()
  : new MemStorage();
