import { storage } from "./storage";

const KTR_LINKS = {
  instagram: "https://www.instagram.com/ktrtrs/",
  linkedin: "https://x.com/ktrbrs",
  website: "https://brsparty.in",
  youtube: "https://youtube.com/@ktarakaramarao",
};

const CONSTITUENCY_AVATAR = "/assets/brs-car-logo.png";

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

// All 119 Telangana Assembly Constituencies
const CONSTITUENCY_PROFILES = [
  // Adilabad District
  { slug: "brssirpur",             name: "BRS — Sirpur",                    lat: 19.493, lng: 79.603, area: "Komaram Bheem Asifabad" },
  { slug: "brschennur",            name: "BRS — Chennur",                   lat: 18.867, lng: 79.850, area: "Mancherial" },
  { slug: "brsbellampalli",        name: "BRS — Bellampalli",               lat: 18.967, lng: 79.500, area: "Mancherial" },
  { slug: "brsmancherial",         name: "BRS — Mancherial",                lat: 18.870, lng: 79.460, area: "Mancherial" },
  { slug: "brsasifabad",           name: "BRS — Asifabad",                  lat: 19.370, lng: 79.283, area: "Komaram Bheem Asifabad" },
  { slug: "brskhanapur",           name: "BRS — Khanapur",                  lat: 19.467, lng: 78.933, area: "Adilabad" },
  { slug: "brsadilabad",           name: "BRS — Adilabad",                  lat: 19.665, lng: 78.530, area: "Adilabad" },
  { slug: "brsboath",              name: "BRS — Boath",                     lat: 19.220, lng: 78.433, area: "Nirmal" },
  { slug: "brsnirmal",             name: "BRS — Nirmal",                    lat: 19.093, lng: 78.352, area: "Nirmal" },

  // Nizamabad District
  { slug: "brsmudhole",            name: "BRS — Mudhole",                   lat: 18.983, lng: 77.667, area: "Nizamabad" },
  { slug: "brsarmur",              name: "BRS — Armur",                     lat: 18.790, lng: 78.290, area: "Nizamabad" },
  { slug: "brsnizamabadrural",     name: "BRS — Nizamabad Rural",           lat: 18.600, lng: 78.100, area: "Nizamabad" },
  { slug: "brsnizamabad",          name: "BRS — Nizamabad Urban",           lat: 18.672, lng: 78.094, area: "Nizamabad" },
  { slug: "brsbodhan",             name: "BRS — Bodhan",                    lat: 18.663, lng: 77.902, area: "Nizamabad" },
  { slug: "brsbanswada",           name: "BRS — Banswada",                  lat: 18.380, lng: 77.867, area: "Kamareddy" },
  { slug: "brsyellareddy",         name: "BRS — Yellareddy",                lat: 18.467, lng: 78.017, area: "Kamareddy" },

  // Karimnagar District
  { slug: "brsbalkonda",           name: "BRS — Balkonda",                  lat: 18.857, lng: 78.293, area: "Nizamabad" },
  { slug: "brskoratla",            name: "BRS — Koratla",                   lat: 18.822, lng: 78.708, area: "Jagityal" },
  { slug: "brsjagtial",            name: "BRS — Jagtial",                   lat: 18.795, lng: 78.917, area: "Jagityal" },
  { slug: "brsdharmapuri",         name: "BRS — Dharmapuri",                lat: 18.883, lng: 78.833, area: "Jagityal" },
  { slug: "brsmetpalli",           name: "BRS — Metpalli",                  lat: 18.822, lng: 78.587, area: "Jagityal" },
  { slug: "brskarimnagar",         name: "BRS — Karimnagar",                lat: 18.433, lng: 79.130, area: "Karimnagar" },
  { slug: "brschoppadandi",        name: "BRS — Choppadandi",               lat: 18.547, lng: 79.333, area: "Karimnagar" },
  { slug: "brsvemulawada",         name: "BRS — Vemulawada",                lat: 18.467, lng: 79.333, area: "Rajanna Sircilla" },
  { slug: "brssiricilla",          name: "BRS — Sircilla",                  lat: 18.387, lng: 78.833, area: "Rajanna Sircilla" },
  { slug: "brsmanakondur",         name: "BRS — Manakondur",                lat: 18.233, lng: 78.983, area: "Rajanna Sircilla" },
  { slug: "brshuzurabad",          name: "BRS — Huzurabad",                 lat: 18.200, lng: 79.420, area: "Karimnagar" },
  { slug: "brshusnabad",           name: "BRS — Husnabad",                  lat: 18.283, lng: 79.267, area: "Siddipet" },

  // Medak District
  { slug: "brskamareddy",          name: "BRS — Kamareddy",                 lat: 18.323, lng: 78.342, area: "Kamareddy" },
  { slug: "brsbhiknoor",           name: "BRS — Bhiknoor",                  lat: 18.200, lng: 78.150, area: "Kamareddy" },
  { slug: "brsandole",             name: "BRS — Andole",                    lat: 18.000, lng: 78.017, area: "Medak" },
  { slug: "brsnarayankhed",        name: "BRS — Narayankhed",               lat: 17.917, lng: 77.700, area: "Sangareddy" },
  { slug: "brszahirabad",          name: "BRS — Zahirabad",                 lat: 17.683, lng: 77.617, area: "Sangareddy" },
  { slug: "brssangareddy",         name: "BRS — Sangareddy",                lat: 17.617, lng: 78.067, area: "Sangareddy" },
  { slug: "brspatancheru",         name: "BRS — Patancheru",                lat: 17.533, lng: 78.267, area: "Sangareddy" },
  { slug: "brsdubbaka",            name: "BRS — Dubbaka",                   lat: 17.983, lng: 78.600, area: "Siddipet" },
  { slug: "brsgajwel",             name: "BRS — Gajwel",                    lat: 17.833, lng: 78.667, area: "Siddipet" },
  { slug: "brssiddipet",           name: "BRS — Siddipet",                  lat: 18.100, lng: 78.850, area: "Siddipet" },
  { slug: "brsmedak",              name: "BRS — Medak",                     lat: 18.050, lng: 78.267, area: "Medak" },
  { slug: "brsnarsapur",           name: "BRS — Narsapur",                  lat: 17.683, lng: 78.483, area: "Medak" },

  // Hyderabad
  { slug: "brssecunderabadcantonment", name: "BRS — Secunderabad Cantonment", lat: 17.440, lng: 78.498, area: "Hyderabad" },
  { slug: "brssecunderabad",       name: "BRS — Secunderabad",              lat: 17.439, lng: 78.498, area: "Hyderabad" },
  { slug: "brsmusheerabad",        name: "BRS — Musheerabad",               lat: 17.400, lng: 78.505, area: "Hyderabad" },
  { slug: "brsmalakpet",           name: "BRS — Malakpet",                  lat: 17.382, lng: 78.510, area: "Hyderabad" },
  { slug: "brsbahadurpura",        name: "BRS — Bahadurpura",               lat: 17.345, lng: 78.475, area: "Hyderabad" },
  { slug: "brskayakutpura",        name: "BRS — Yakutpura",                 lat: 17.363, lng: 78.502, area: "Hyderabad" },
  { slug: "brschandrayangutta",    name: "BRS — Chandrayangutta",           lat: 17.340, lng: 78.485, area: "Hyderabad" },
  { slug: "brscharminar",          name: "BRS — Charminar",                 lat: 17.361, lng: 78.475, area: "Hyderabad" },
  { slug: "brsgoshamahal",         name: "BRS — Goshamahal",                lat: 17.382, lng: 78.472, area: "Hyderabad" },
  { slug: "brskarwan",             name: "BRS — Karwan",                    lat: 17.383, lng: 78.467, area: "Hyderabad" },
  { slug: "brsnampally",           name: "BRS — Nampally",                  lat: 17.385, lng: 78.467, area: "Hyderabad" },
  { slug: "brssanathnagar",        name: "BRS — Sanathnagar",               lat: 17.435, lng: 78.432, area: "Hyderabad" },
  { slug: "brskhairatabad",        name: "BRS — Khairatabad",               lat: 17.417, lng: 78.450, area: "Hyderabad" },
  { slug: "brsjubileehills",       name: "BRS — Jubilee Hills",             lat: 17.432, lng: 78.405, area: "Hyderabad" },
  { slug: "brsamberpet",           name: "BRS — Amberpet",                  lat: 17.400, lng: 78.517, area: "Hyderabad" },

  // Rangareddy / Medchal-Malkajgiri
  { slug: "brsquthbullapur",       name: "BRS — Quthbullapur",              lat: 17.542, lng: 78.440, area: "Medchal-Malkajgiri" },
  { slug: "brskukatpally",         name: "BRS — Kukatpally",                lat: 17.485, lng: 78.414, area: "Medchal-Malkajgiri" },
  { slug: "brsserilingampally",    name: "BRS — Serilingampally",           lat: 17.495, lng: 78.332, area: "Rangareddy" },
  { slug: "brschevella",           name: "BRS — Chevella",                  lat: 17.282, lng: 78.138, area: "Rangareddy" },
  { slug: "brspargi",              name: "BRS — Pargi",                     lat: 17.107, lng: 77.883, area: "Rangareddy" },
  { slug: "brsvikarabad",          name: "BRS — Vikarabad",                 lat: 17.330, lng: 77.902, area: "Vikarabad" },
  { slug: "brstanpur",             name: "BRS — Tandur",                    lat: 17.247, lng: 77.575, area: "Vikarabad" },
  { slug: "brsmominpet",           name: "BRS — Mominpet",                  lat: 17.370, lng: 77.500, area: "Rangareddy" },
  { slug: "brsrajendranagar",      name: "BRS — Rajendranagar",             lat: 17.317, lng: 78.400, area: "Rangareddy" },
  { slug: "brsmaheswaram",         name: "BRS — Maheswaram",                lat: 17.085, lng: 78.447, area: "Rangareddy" },
  { slug: "brslbnagar",            name: "BRS — LB Nagar",                  lat: 17.345, lng: 78.558, area: "Rangareddy" },
  { slug: "brsibrahimpatnam",      name: "BRS — Ibrahimpatnam",             lat: 17.238, lng: 78.670, area: "Rangareddy" },
  { slug: "brsmalkajgiri",         name: "BRS — Malkajgiri",                lat: 17.462, lng: 78.537, area: "Medchal-Malkajgiri" },

  // Medchal
  { slug: "brsmedchal",            name: "BRS — Medchal",                   lat: 17.628, lng: 78.482, area: "Medchal-Malkajgiri" },
  { slug: "brsuppal",              name: "BRS — Uppal",                     lat: 17.402, lng: 78.562, area: "Medchal-Malkajgiri" },
  { slug: "brsboduppal",           name: "BRS — Boduppal",                  lat: 17.415, lng: 78.582, area: "Medchal-Malkajgiri" },

  // Nalgonda District
  { slug: "brsbhongir",            name: "BRS — Bhongir",                   lat: 17.508, lng: 78.888, area: "Yadadri Bhongir" },
  { slug: "brsnakrekal",           name: "BRS — Nakrekal",                  lat: 17.050, lng: 79.533, area: "Nalgonda" },
  { slug: "brsmunugode",           name: "BRS — Munugode",                  lat: 17.085, lng: 79.178, area: "Nalgonda" },
  { slug: "brsnalgonda",           name: "BRS — Nalgonda",                  lat: 17.057, lng: 79.267, area: "Nalgonda" },
  { slug: "brsmiryalaguda",        name: "BRS — Miryalaguda",               lat: 16.873, lng: 79.565, area: "Nalgonda" },
  { slug: "brshuzurnagar",         name: "BRS — Huzurnagar",                lat: 16.905, lng: 79.885, area: "Suryapet" },
  { slug: "brskodad",              name: "BRS — Kodad",                     lat: 16.993, lng: 79.977, area: "Suryapet" },
  { slug: "brssuryapet",           name: "BRS — Suryapet",                  lat: 17.140, lng: 79.623, area: "Suryapet" },
  { slug: "brsmothkur",            name: "BRS — Mothkur",                   lat: 17.533, lng: 79.550, area: "Yadadri Bhongir" },
  { slug: "brstungaturthi",        name: "BRS — Tungaturthi",               lat: 17.007, lng: 79.470, area: "Nalgonda" },
  { slug: "brsalair",              name: "BRS — Alair",                     lat: 17.533, lng: 79.067, area: "Yadadri Bhongir" },

  // Jangaon / Warangal
  { slug: "brsjangaon",            name: "BRS — Jangaon",                   lat: 17.723, lng: 79.152, area: "Jangaon" },
  { slug: "brsghanpurstation",     name: "BRS — Ghanpur Station",           lat: 17.900, lng: 79.267, area: "Jangaon" },
  { slug: "brspalakurthi",         name: "BRS — Palakurthi",                lat: 17.867, lng: 79.400, area: "Jangaon" },
  { slug: "brsdornakal",           name: "BRS — Dornakal",                  lat: 17.450, lng: 80.167, area: "Mahabubabad" },
  { slug: "brsmahabubabad",        name: "BRS — Mahabubabad",               lat: 17.603, lng: 80.002, area: "Mahabubabad" },
  { slug: "brsnarsampet",          name: "BRS — Narsampet",                 lat: 17.933, lng: 79.900, area: "Warangal" },
  { slug: "brswarangalwest",       name: "BRS — Warangal West",             lat: 17.978, lng: 79.594, area: "Warangal" },
  { slug: "brswarangaleast",       name: "BRS — Warangal East",             lat: 17.978, lng: 79.614, area: "Warangal" },
  { slug: "brswardhannapet",       name: "BRS — Wardhannapet",              lat: 18.098, lng: 79.655, area: "Warangal" },
  { slug: "brsparkal",             name: "BRS — Parkal",                    lat: 18.212, lng: 79.727, area: "Warangal Rural" },
  { slug: "brsmulug",              name: "BRS — Mulug",                     lat: 18.200, lng: 80.050, area: "Mulugu" },

  // Bhadradri Kothagudem / Khammam
  { slug: "brspinapaka",           name: "BRS — Pinapaka",                  lat: 17.900, lng: 80.500, area: "Bhadradri Kothagudem" },
  { slug: "brsyellandu",           name: "BRS — Yellandu",                  lat: 17.600, lng: 80.333, area: "Bhadradri Kothagudem" },
  { slug: "brspalwancha",          name: "BRS — Palwancha",                 lat: 17.610, lng: 80.738, area: "Bhadradri Kothagudem" },
  { slug: "brsbhadrachalam",       name: "BRS — Bhadrachalam",              lat: 17.667, lng: 80.883, area: "Bhadradri Kothagudem" },
  { slug: "brsaswaraopeta",        name: "BRS — Aswaraopeta",               lat: 17.250, lng: 80.667, area: "Bhadradri Kothagudem" },
  { slug: "brsnellipaka",          name: "BRS — Nellipaka",                 lat: 17.783, lng: 81.000, area: "Bhadradri Kothagudem" },
  { slug: "brskothagudem",         name: "BRS — Kothagudem",                lat: 17.550, lng: 80.617, area: "Bhadradri Kothagudem" },

  // Khammam District
  { slug: "brskhammam",            name: "BRS — Khammam",                   lat: 17.248, lng: 80.151, area: "Khammam" },
  { slug: "brspalair",             name: "BRS — Palair",                    lat: 17.133, lng: 79.983, area: "Khammam" },
  { slug: "brsmadhira",            name: "BRS — Madhira",                   lat: 16.900, lng: 80.350, area: "Khammam" },
  { slug: "brswyra",               name: "BRS — Wyra",                      lat: 17.150, lng: 80.317, area: "Khammam" },
  { slug: "brssathupally",         name: "BRS — Sathupally",                lat: 17.250, lng: 80.000, area: "Khammam" },

  // Mahabubagar District
  { slug: "brsnagarkurnool",       name: "BRS — Nagarkurnool",              lat: 16.480, lng: 78.327, area: "Nagarkurnool" },
  { slug: "brsachampet",           name: "BRS — Achampet",                  lat: 16.455, lng: 78.735, area: "Nagarkurnool" },
  { slug: "brsalampur",            name: "BRS — Alampur",                   lat: 15.883, lng: 78.137, area: "Jogulamba Gadwal" },
  { slug: "brsgadwal",             name: "BRS — Gadwal",                    lat: 16.225, lng: 77.797, area: "Jogulamba Gadwal" },
  { slug: "brswanaparthy",         name: "BRS — Wanaparthy",                lat: 16.362, lng: 78.062, area: "Wanaparthy" },
  { slug: "brsdevarkadra",         name: "BRS — Devarkadra",                lat: 16.705, lng: 77.800, area: "Mahabubnagar" },
  { slug: "brsmahabubnagar",       name: "BRS — Mahabubnagar",              lat: 16.738, lng: 78.000, area: "Mahabubnagar" },
  { slug: "brsjadcherla",          name: "BRS — Jadcherla",                 lat: 17.017, lng: 78.150, area: "Mahabubnagar" },
  { slug: "brskalwakurthy",        name: "BRS — Kalwakurthy",               lat: 16.907, lng: 78.497, area: "Nagarkurnool" },
  { slug: "brskodangal",           name: "BRS — Kodangal",                  lat: 17.085, lng: 77.710, area: "Vikarabad" },
  { slug: "brsmakthal",            name: "BRS — Makthal",                   lat: 17.050, lng: 77.783, area: "Narayanpet" },
  { slug: "brsnarayanpet",         name: "BRS — Narayanpet",                lat: 16.745, lng: 77.490, area: "Narayanpet" },
  { slug: "brsshadnagar",          name: "BRS — Shadnagar",                 lat: 17.068, lng: 78.202, area: "Rangareddy" },
  { slug: "brskollapur",           name: "BRS — Kollapur",                  lat: 16.935, lng: 78.083, area: "Narayanpet" },

  // Peddapalli / Karimnagar North
  { slug: "brspeddapalli",         name: "BRS — Peddapalli",                lat: 18.617, lng: 79.383, area: "Peddapalli" },
  { slug: "brsramagundam",         name: "BRS — Ramagundam",                lat: 18.800, lng: 79.500, area: "Peddapalli" },
  { slug: "brsmanthani",           name: "BRS — Manthani",                  lat: 18.633, lng: 79.667, area: "Peddapalli" },
  { slug: "brsjammikunta",         name: "BRS — Jammikunta",                lat: 18.067, lng: 79.517, area: "Karimnagar" },
  { slug: "brssulthanabad",        name: "BRS — Sulthanabad",               lat: 18.433, lng: 79.300, area: "Karimnagar" },
  { slug: "brsbhupalpally",        name: "BRS — Bhupalpally",               lat: 18.433, lng: 79.983, area: "Mulugu" },
];

function makeProfile(c: typeof CONSTITUENCY_PROFILES[0]) {
  return {
    uniqueSlug: c.slug,
    name: c.name,
    role: "people",
    bio: null,
    email: `${c.slug}@brsconnect.in`,
    password: "",
    pin: "12345",
    ...KTR_LINKS,
    whatsapp: null,
    industry: c.area,
    avatarUrl: CONSTITUENCY_AVATAR,
    cards: [],
    notes: [],
    connections: [],
    latitude: c.lat,
    longitude: c.lng,
    locationName: `${c.name.replace("BRS — ", "")}, Telangana`,
  };
}

const CORRECT_FIELDS = {
  ...KTR_LINKS,
  avatarUrl: CONSTITUENCY_AVATAR,
  bio: null,
};

export async function seedDefaultProfiles() {
  // Seed main BRS party profile
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

  // Seed all 119 constituency profiles — create if missing, always update social links + avatar
  const constituencySlugs: string[] = [];
  for (const c of CONSTITUENCY_PROFILES) {
    try {
      const existing = await storage.getUserBySlug(c.slug);
      if (!existing) {
        await storage.createUser(makeProfile(c) as any);
        console.log(`[seed] Created constituency profile: ${c.slug}`);
      } else {
        // Always sync the correct social links and avatar
        const needsUpdate =
          existing.instagram !== CORRECT_FIELDS.instagram ||
          existing.linkedin !== CORRECT_FIELDS.linkedin ||
          existing.youtube !== CORRECT_FIELDS.youtube ||
          existing.website !== CORRECT_FIELDS.website ||
          existing.avatarUrl !== CORRECT_FIELDS.avatarUrl ||
          existing.bio !== CORRECT_FIELDS.bio;
        if (needsUpdate) {
          await storage.updateUser(existing.id, CORRECT_FIELDS as any);
          console.log(`[seed] Updated constituency profile: ${c.slug}`);
        }
      }
      constituencySlugs.push(c.slug);
    } catch (e) {
      console.error(`[seed] Failed to seed constituency ${c.slug}:`, e);
    }
  }

  // Update featured slugs — merge with any existing slugs already saved by admin
  try {
    const existing = await storage.getFeaturedSlugs();
    const allSlugs = Array.from(new Set([
      "brsparty",
      ...constituencySlugs,
      ...existing,
    ]));
    await storage.saveFeaturedSlugs(allSlugs);
    console.log(`[seed] Featured slugs updated: ${allSlugs.length} total`);
  } catch (e) {
    console.error("[seed] Failed to update featured slugs:", e);
  }
}
