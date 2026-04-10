import { storage } from "./storage";

const DEFAULT_PROFILES = [
  {
    uniqueSlug: "brsparty",
    name: "BRS — Bharat Rashtra Samithi",
    role: "people",
    bio: "Voice of the People. Strength of the Nation. Building a prosperous Telangana for every citizen.",
    email: "brsparty@brsconnect.in",
    password: "",
    pin: "00000",
    instagram: "https://www.instagram.com/brspartyofficial/",
    linkedin: "https://x.com/BRSparty",
    whatsapp: null,
    website: "https://brsparty.in",
    youtube: "https://www.youtube.com/@KTRofficial",
    industry: "Hyderabad",
    avatarUrl: "/brs-telangana.png",
    cards: [],
    notes: [],
    connections: [],
    latitude: 17.385044,
    longitude: 78.486671,
    locationName: "Hyderabad, Telangana",
  },
];

export async function seedDefaultProfiles() {
  for (const profile of DEFAULT_PROFILES) {
    try {
      const existing = await storage.getUserBySlug(profile.uniqueSlug);
      if (!existing) {
        await storage.createUser(profile as any);
        console.log(`[seed] Created default profile: ${profile.uniqueSlug}`);
      }
    } catch (e) {
      console.error(`[seed] Failed to seed profile ${profile.uniqueSlug}:`, e);
    }
  }
}
