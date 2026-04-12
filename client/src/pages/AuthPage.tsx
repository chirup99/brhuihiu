import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import { BrowserMultiFormatReader } from "@zxing/library";
// ... existing imports
import { useState, useMemo, useEffect, useRef, forwardRef } from "react";
import { useLocation } from "wouter";
import {
  Infinity as InfinityIcon,
  ArrowRight,
  Loader2,
  Play,
  Mic,
  QrCode,
  Instagram,
  MessageCircle,
  Globe,
  Save,
  Check,
  ChevronDown,
  Plus,
  X,
  Trash2,
  TrendingUp,
  Video,
  ImageIcon,
  PenLine,
  User,
  Pencil,
  Palette,
  Layout,
  Mail,
  Search,
  Newspaper,
  Download,
  MapPin,
  Navigation,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertUserSchema,
  type InsertUser,
  type CardData,
} from "@shared/schema";
import { useLogin, useRegister, useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import clsx from "clsx";
import { SiInstagram, SiWhatsapp, SiX, SiYoutube } from "react-icons/si";
import avatarKcr from "@assets/kcr.png";
import avatarKtr from "@assets/ktr.png";
import avatarFist from "@assets/telangana-fist.png";
import avatarBrsCar from "@assets/brs-car-logo.png";
import pinkCarSrc from "@assets/pink-car.png";
import brsLogoSlider from "@assets/brs-logo-slider.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

type AuthMode = "login" | "register" | "customize" | "swipe";

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
];

const CARD_TYPES = [
  {
    type: "reel",
    label: "Reel",
    icon: Video,
    color: "from-zinc-950 to-black",
  },
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    color: "from-zinc-900 to-black",
  },
  {
    type: "post",
    label: "Post",
    icon: PenLine,
    color: "from-[#1a0510] to-[#2d0a1e]",
  },
  {
    type: "xpost",
    label: "X Post",
    icon: SiX,
    color: "from-[#0a0a0a] to-[#1a1a1a]",
  },
];

const CAMPAIGN_THEMES = [
  {
    id: "brs-classic",
    label: "BRS Classic",
    category: "Brand",
    preview: "linear-gradient(135deg,#be185d,#9d174d)",
    canvasBg: "#ffffff",
    headerBg: "linear-gradient(135deg,#be185d,#9d174d)",
    cardStyle: "light" as const,
    textColor: "#111",
    accentColor: "#be185d",
    badge: null as string | null,
  },
  {
    id: "victory-gold",
    label: "Victory Gold",
    category: "Premium",
    preview: "linear-gradient(135deg,#1a1200,#3a2800,#c9962a)",
    canvasBg: "linear-gradient(160deg,#0d0b00,#1c1500)",
    headerBg: "linear-gradient(135deg,#c9962a,#9a6e10)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#f0c040",
    badge: "✨ Best",
  },
  {
    id: "ktr-blue",
    label: "KTR Official",
    category: "Premium",
    preview: "linear-gradient(135deg,#0a2472,#0e5fb5)",
    canvasBg: "linear-gradient(160deg,#040d2e,#061d4a)",
    headerBg: "linear-gradient(135deg,#0a2472,#0e5fb5)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#4da6ff",
    badge: "🔥 Popular",
  },
  {
    id: "telangana-pride",
    label: "Telangana Pride",
    category: "Premium",
    preview: "linear-gradient(135deg,#c2185b,#e65100,#f57c00)",
    canvasBg: "linear-gradient(160deg,#1a0010,#2d1200)",
    headerBg: "linear-gradient(135deg,#c2185b,#e65100)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#ff8a50",
    badge: "⭐ Top",
  },
  {
    id: "news-flash",
    label: "News Flash",
    category: "Media",
    preview: "linear-gradient(135deg,#1a1a1a,#2d0000)",
    canvasBg: "linear-gradient(160deg,#111,#1a0000)",
    headerBg: "linear-gradient(90deg,#cc0000,#990000)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#ff1111",
    badge: "📰 News",
  },
  {
    id: "digital-wave",
    label: "Digital Wave",
    category: "Modern",
    preview: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
    canvasBg: "linear-gradient(160deg,#060416,#0d0933)",
    headerBg: "linear-gradient(135deg,#7c3aed,#2563eb)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#a78bfa",
    badge: null,
  },
  {
    id: "before-after",
    label: "Before & After",
    category: "Development",
    preview: "linear-gradient(90deg,#2d4a2d 50%,#c2185b 50%)",
    canvasBg: "linear-gradient(90deg,#1a2e1a 50%,#2d0a1e 50%)",
    headerBg: "linear-gradient(90deg,#1a3a1a,#4a0e2e)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#4caf50",
    badge: null,
  },
  {
    id: "opposition-expose",
    label: "Expose",
    category: "Opposition",
    preview: "linear-gradient(135deg,#1a0a0a,#3a0a0a)",
    canvasBg: "linear-gradient(160deg,#0d0d0d,#2a0808)",
    headerBg: "#1a0000",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#e53935",
    badge: null,
  },
  {
    id: "growth-metrics",
    label: "Growth Data",
    category: "Analytics",
    preview: "linear-gradient(135deg,#0a0a1a,#1a1500)",
    canvasBg: "linear-gradient(160deg,#050510,#0a0f00)",
    headerBg: "#0a0a20",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#f59e0b",
    badge: null,
  },
  {
    id: "farmers",
    label: "Farmers",
    category: "Agriculture",
    preview: "linear-gradient(135deg,#0f2e0f,#1a4a0a)",
    canvasBg: "linear-gradient(160deg,#091a09,#0f2e0f)",
    headerBg: "linear-gradient(135deg,#0f2e0f,#1a4a0a)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#66bb6a",
    badge: null,
  },
  {
    id: "public-issues",
    label: "Public Issues",
    category: "Issues",
    preview: "linear-gradient(135deg,#1a0000,#0a0a0a)",
    canvasBg: "linear-gradient(160deg,#120000,#0a0a0a)",
    headerBg: "linear-gradient(135deg,#2a0000,#1a0000)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#f44336",
    badge: null,
  },
  {
    id: "telangana-model",
    label: "Telangana Model",
    category: "Development",
    preview: "linear-gradient(135deg,#0a2e1a,#1a4a2a)",
    canvasBg: "linear-gradient(160deg,#071a0f,#0a2e1a)",
    headerBg: "linear-gradient(135deg,#0a2e1a,#1a4a2a)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#26a69a",
    badge: null,
  },
  {
    id: "financial",
    label: "Finance",
    category: "Analytics",
    preview: "linear-gradient(135deg,#2a1a00,#1a0a0a)",
    canvasBg: "linear-gradient(160deg,#1a1000,#1a0000)",
    headerBg: "linear-gradient(135deg,#3a2000,#2a0000)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#ffd54f",
    badge: null,
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    category: "Development",
    preview: "linear-gradient(135deg,#0a1a3a,#0a2a3a)",
    canvasBg: "linear-gradient(160deg,#050f20,#020f20)",
    headerBg: "linear-gradient(135deg,#0a1a3a,#0a2a4a)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#29b6f6",
    badge: null,
  },
  {
    id: "peoples-voice",
    label: "People's Voice",
    category: "Brand",
    preview: "linear-gradient(135deg,#7b1fa2,#c2185b)",
    canvasBg: "linear-gradient(160deg,#1a0030,#2d0020)",
    headerBg: "linear-gradient(135deg,#7b1fa2,#c2185b)",
    cardStyle: "dark" as const,
    textColor: "#fff",
    accentColor: "#ce93d8",
    badge: null,
  },
];

const STICKER_CATEGORIES = [
  {
    label: "VS / Politics",
    items: [
      { id: "vs", e: "VS", label: "VS", color: "#ef4444", bold: true },
      { id: "expose", e: "EXPOSE", label: "Expose", color: "#f97316", bold: true },
      { id: "scam", e: "⚠️", label: "Scam" },
      { id: "vote", e: "🗳️", label: "Vote" },
      { id: "mic", e: "📢", label: "Protest" },
      { id: "corrupt", e: "💰", label: "Corrupt" },
      { id: "ban", e: "❌", label: "Ban" },
      { id: "check", e: "✅", label: "Fact" },
      { id: "news", e: "📰", label: "News" },
      { id: "mask", e: "🎭", label: "Expose" },
    ],
  },
  {
    label: "Public Issues",
    items: [
      { id: "water", e: "💧", label: "Water" },
      { id: "power", e: "⚡", label: "Power" },
      { id: "house", e: "🏚️", label: "Demolish" },
      { id: "flood", e: "🌊", label: "Musi" },
      { id: "fire", e: "🔥", label: "Crisis" },
      { id: "build", e: "🏗️", label: "Construct" },
      { id: "tap", e: "🚰", label: "Tap" },
      { id: "land", e: "📋", label: "Land" },
      { id: "angry", e: "😤", label: "Struggle" },
      { id: "alert", e: "🚨", label: "Alert" },
      { id: "tractor", e: "🚜", label: "Rythu" },
    ],
  },
  {
    label: "Development",
    items: [
      { id: "factory", e: "🏭", label: "Industry" },
      { id: "worker", e: "👷", label: "Jobs" },
      { id: "farm", e: "🌾", label: "Agri" },
      { id: "fish", e: "🐟", label: "Fisher" },
      { id: "goat", e: "🐐", label: "Goat" },
      { id: "milk", e: "🥛", label: "Milk" },
      { id: "palm", e: "🌴", label: "Palm" },
      { id: "dam", e: "🏞️", label: "Dam" },
      { id: "bridge", e: "🌉", label: "Bridge" },
      { id: "road", e: "🛣️", label: "Road" },
      { id: "home", e: "🏠", label: "House" },
      { id: "school", e: "🏫", label: "School" },
      { id: "hospital", e: "🏥", label: "Medical" },
      { id: "bus", e: "🚌", label: "Transport" },
    ],
  },
];

const VOICE_DEMO_CARDS = [
  JSON.stringify({ type: "post", title: "Voice", content: "Share your voice with the world. Post updates, raise issues, and let your community hear what matters to you." }),
  JSON.stringify({ type: "image", title: "Image Card", imageUrl: "/brs-telangana.png" }),
  JSON.stringify({ type: "xpost", title: "Reel Card", subtype: "video", url: "https://x.com/BRSparty/status/1731318832508404183" }),
];

const ROLE_GROUPS: { group: string | null; items: { value: string; label: string }[] }[] = [
  {
    group: null,
    items: [{ value: "people", label: "People" }],
  },
  {
    group: "Senior Leadership",
    items: [
      { value: "working-president", label: "Working President" },
    ],
  },
  {
    group: "Village / Local Level",
    items: [
      { value: "ward-member", label: "Ward Member" },
      { value: "panchayat-member", label: "Panchayat Member" },
      { value: "sarpanch", label: "Sarpanch (Village Head)" },
      { value: "booth-president", label: "Party Booth President" },
      { value: "booth-committee-member", label: "Booth Committee Member" },
      { value: "village-party-president", label: "Village Party President" },
    ],
  },
  {
    group: "Mandal Level",
    items: [
      { value: "mptc", label: "MPTC – Mandal Parishad Territorial Constituency" },
      { value: "mpp", label: "Mandal Parishad President (MPP)" },
      { value: "mandal-party-president", label: "Mandal Party President" },
      { value: "mandal-party-committee", label: "Mandal Party Committee Member" },
    ],
  },
  {
    group: "District Level",
    items: [
      { value: "zptc", label: "ZPTC – Zilla Parishad Territorial Constituency" },
      { value: "zp-chairman", label: "Zilla Parishad Chairman" },
      { value: "district-president", label: "District Party President" },
      { value: "district-committee", label: "District Party Committee Member" },
    ],
  },
  {
    group: "City / Municipal Level",
    items: [
      { value: "ward-councillor", label: "Ward Councillor" },
      { value: "municipal-chairman", label: "Municipal Chairman" },
      { value: "mayor", label: "Mayor" },
      { value: "municipal-party-president", label: "Municipal Party President" },
    ],
  },
  {
    group: "State Level",
    items: [
      { value: "cm", label: "CM – Chief Minister" },
      { value: "mla", label: "MLA – Member of Legislative Assembly" },
      { value: "mlc", label: "MLC – Member of Legislative Council" },
      { value: "state-president", label: "State Party President" },
      { value: "state-general-secretary", label: "State Party General Secretary" },
      { value: "state-committee", label: "State Party Committee Member" },
    ],
  },
  {
    group: "National Level",
    items: [
      { value: "mp-lok-sabha", label: "MP (Lok Sabha) – Member of Parliament" },
      { value: "mp-rajya-sabha", label: "MP (Rajya Sabha)" },
      { value: "national-president", label: "National Party President" },
      { value: "national-general-secretary", label: "National General Secretary" },
      { value: "national-executive", label: "National Executive Member" },
    ],
  },
  {
    group: "Minister Level",
    items: [
      { value: "cabinet-minister-state", label: "Cabinet Minister (State)" },
      { value: "minister-of-state-state", label: "Minister of State (State)" },
      { value: "cabinet-minister-central", label: "Cabinet Minister (Central)" },
      { value: "minister-of-state-central", label: "Minister of State (Central)" },
      { value: "deputy-minister", label: "Deputy Minister" },
      { value: "prime-minister", label: "Prime Minister (PM)" },
    ],
  },
  {
    group: "Party / Org Roles",
    items: [
      { value: "general-secretary", label: "General Secretary" },
      { value: "secretary", label: "Secretary" },
      { value: "joint-secretary", label: "Joint Secretary" },
      { value: "treasurer", label: "Treasurer" },
      { value: "party-spokesperson", label: "Party Spokesperson" },
      { value: "party-observer", label: "Party Observer" },
      { value: "party-incharge", label: "Party Incharge" },
      { value: "party-leader", label: "Party Leader" },
      { value: "party-coordinator", label: "Party Coordinator" },
      { value: "party-convener", label: "Party Convener" },
      { value: "youth-wing-president", label: "Youth Wing President" },
      { value: "women-wing-president", label: "Women Wing President" },
      { value: "party-member", label: "Party Member" },
    ],
  },
  {
    group: "BRS Team",
    items: [
      { value: "brs-team-head", label: "BRS Team Head" },
      { value: "brs-team-lead", label: "BRS Team Lead" },
      { value: "brs-team-member", label: "BRS Team Member" },
      { value: "brs-social-media", label: "BRS Social Media Team" },
      { value: "brs-it-team", label: "BRS IT Team" },
      { value: "brs-media-team", label: "BRS Media Team" },
      { value: "brs-research-team", label: "BRS Research Team" },
      { value: "brs-campaign-team", label: "BRS Campaign Team" },
      { value: "brs-volunteer", label: "BRS Volunteer" },
    ],
  },
  {
    group: "Legal Team",
    items: [
      { value: "legal-head", label: "Legal Head" },
      { value: "senior-advocate", label: "Senior Advocate" },
      { value: "advocate", label: "Advocate" },
      { value: "legal-advisor", label: "Legal Advisor" },
      { value: "legal-coordinator", label: "Legal Coordinator" },
      { value: "legal-team-member", label: "Legal Team Member" },
    ],
  },
];
const ROLES = ROLE_GROUPS.flatMap((g) => g.items);

const ADMIN_SLUG = "ktrbrs";

const CONSTITUENCIES = [
  {
    region: "Adilabad",
    items: ["Adilabad", "Boath"],
  },
  {
    region: "Kumuram Bheem Asifabad",
    items: ["Sirpur", "Asifabad"],
  },
  {
    region: "Mancherial",
    items: ["Chennur", "Bellampalli", "Mancherial"],
  },
  {
    region: "Nirmal",
    items: ["Khanapur", "Nirmal", "Mudhole"],
  },
  {
    region: "Nizamabad",
    items: ["Bodhan", "Nizamabad Urban", "Nizamabad Rural", "Balkonda", "Armur"],
  },
  {
    region: "Kamareddy",
    items: ["Jukkal", "Banswada", "Yellareddy", "Kamareddy"],
  },
  {
    region: "Jagtial",
    items: ["Koratla", "Jagtial", "Dharmapuri"],
  },
  {
    region: "Peddapalli",
    items: ["Ramagundam", "Manthani", "Peddapalle"],
  },
  {
    region: "Karimnagar",
    items: ["Karimnagar", "Choppadandi", "Manakondur", "Huzurabad"],
  },
  {
    region: "Rajanna Sircilla",
    items: ["Vemulawada", "Sircilla"],
  },
  {
    region: "Siddipet",
    items: ["Siddipet", "Husnabad", "Dubbak", "Gajwel"],
  },
  {
    region: "Medak",
    items: ["Medak", "Narsapur"],
  },
  {
    region: "Sangareddy",
    items: ["Narayankhed", "Andole", "Zahirabad", "Sangareddy", "Patancheru"],
  },
  {
    region: "Medchal–Malkajgiri",
    items: ["Medchal", "Malkajgiri", "Quthbullapur", "Kukatpally", "Uppal"],
  },
  {
    region: "Rangareddy",
    items: ["Ibrahimpatnam", "Lal Bahadur Nagar", "Maheshwaram", "Rajendranagar", "Serilingampally", "Chevella"],
  },
  {
    region: "Vikarabad",
    items: ["Pargi", "Vikarabad", "Tandur", "Kodangal"],
  },
  {
    region: "Hyderabad",
    items: ["Musheerabad", "Malakpet", "Amberpet", "Khairatabad", "Jubilee Hills", "Sanath Nagar", "Nampally", "Karwan", "Goshamahal", "Charminar", "Chandrayangutta", "Yakutpura", "Bahadurpura"],
  },
  {
    region: "Secunderabad",
    items: ["Secunderabad", "Secunderabad Cantt"],
  },
  {
    region: "Mahabubnagar",
    items: ["Mahabubnagar", "Jadcherla", "Devarkadra"],
  },
  {
    region: "Narayanpet",
    items: ["Narayanpet", "Makthal"],
  },
  {
    region: "Wanaparthy",
    items: ["Wanaparthy"],
  },
  {
    region: "Jogulamba Gadwal",
    items: ["Gadwal", "Alampur"],
  },
  {
    region: "Nagarkurnool",
    items: ["Nagarkurnool", "Achampet", "Kalwakurthy", "Kollapur"],
  },
  {
    region: "Nalgonda",
    items: ["Nalgonda", "Munugode", "Nagarjuna Sagar"],
  },
  {
    region: "Suryapet",
    items: ["Suryapet", "Kodad", "Huzurnagar", "Thungathurthy"],
  },
  {
    region: "Yadadri Bhuvanagiri",
    items: ["Bhongir", "Nakrekal", "Alair"],
  },
  {
    region: "Warangal / Hanumakonda",
    items: ["Warangal West", "Warangal East", "Parkal", "Wardhannapet"],
  },
  {
    region: "Jangaon",
    items: ["Jangaon", "Ghanpur Station", "Palakurthi"],
  },
  {
    region: "Mahabubabad",
    items: ["Mahabubabad", "Dornakal"],
  },
  {
    region: "Mulugu",
    items: ["Mulug"],
  },
  {
    region: "Jayashankar Bhupalpally",
    items: ["Bhupalpalle"],
  },
  {
    region: "Khammam",
    items: ["Khammam", "Palair", "Madhira", "Wyra"],
  },
  {
    region: "Bhadradri Kothagudem",
    items: ["Kothagudem", "Yellandu", "Pinapaka", "Aswaraopeta", "Bhadrachalam"],
  },
];

const CARDS = [
  {
    id: 1,
    title: "Networking",
    name: "Collaborate",
    subname: "Connect",
    color: "from-blue-500 to-blue-600",
    bgStack1: "bg-blue-900/40",
    bgStack2: "bg-indigo-900/40",
  },
  {
    id: 2,
    title: "Startup Expo",
    name: "Pitch",
    subname: "Growth",
    color: "from-purple-500 to-purple-600",
    bgStack1: "bg-purple-900/40",
    bgStack2: "bg-fuchsia-900/40",
  },
  {
    id: 3,
    title: "Marketing",
    name: "Exposure",
    subname: "Reach",
    color: "from-emerald-500 to-emerald-600",
    bgStack1: "bg-emerald-900/40",
    bgStack2: "bg-teal-900/40",
  },
  {
    id: 4,
    title: "AI Analysis",
    name: "Insights",
    subname: "Strategy",
    color: "from-orange-500 to-orange-600",
    bgStack1: "bg-orange-900/40",
    bgStack2: "bg-amber-900/40",
  },
  {
    id: 5,
    title: "Voice Hub",
    name: "Digital",
    subname: "Identity",
    color: "from-rose-500 to-rose-600",
    bgStack1: "bg-rose-900/40",
    bgStack2: "bg-rose-900/40",
  },
  {
    id: 6,
    title: "Revenue",
    name: "$1.2M",
    subname: "Annual Revenue",
    type: "revenue",
    color: "from-emerald-600 to-teal-700",
    bgStack1: "bg-emerald-900/40",
    bgStack2: "bg-teal-900/40",
  },
  {
    id: 7,
    title: "Traction",
    name: "50k+",
    subname: "Active Users",
    type: "traction",
    color: "from-amber-500 to-orange-600",
    bgStack1: "bg-amber-900/40",
    bgStack2: "bg-orange-900/40",
  },
];

interface SwipeCardProps {
  card: {
    title: string;
    name: string;
    subname: string;
    color: string;
    bgStack1: string;
    bgStack2: string;
  };
  currentIndex: number;
  totalCards: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onVideoPlayStateChange?: (isPlaying: boolean) => void;
  isVideoPlaying?: boolean;
  disableDrag?: boolean;
}

const getThumbnailUrl = (url: string) => {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|v\/|embed\/|reels\/))([\w-]{11})/,
  );
  if (ytMatch)
    return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
  return null;
};

const TrendLine = () => (
  <div className="w-full h-24 relative mt-4 overflow-hidden rounded-lg bg-black/10 backdrop-blur-sm border border-white/10">
    <svg
      viewBox="0 0 200 100"
      className="w-full h-full preserve-3d"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
        </linearGradient>
        <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 0 80 C 20 85, 40 60, 60 75 S 100 50, 120 70 S 160 30, 200 20"
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
      />
      <motion.path
        d="M 0 80 C 20 85, 40 60, 60 75 S 100 50, 120 70 S 160 30, 200 20 L 200 100 L 0 100 Z"
        fill="url(#fillGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
      />
    </svg>
  </div>
);

const PostCardInline = ({ content, onPlayStateChange }: { content: string; onPlayStateChange?: (b: boolean) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      const el = containerRef.current;
      if (el) setIsOverflowing(el.scrollHeight > el.clientHeight + 2);
    };
    check();
    const t = setTimeout(check, 100);
    return () => clearTimeout(t);
  }, [content]);

  const handleExpand = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isOverflowing) return;
    e.stopPropagation();
    setExpanded(true);
    onPlayStateChange?.(true);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(false);
    onPlayStateChange?.(false);
  };

  if (!expanded) {
    return (
      <div
        className="w-full h-full absolute inset-0 overflow-hidden rounded-[24px]"
        style={{ cursor: isOverflowing ? "pointer" : "default" }}
        onClick={handleExpand}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", padding: 14, gap: 10, borderRadius: 20 }}>
          <div ref={containerRef} style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: isOverflowing ? "flex-start" : "center" }}>
            <p ref={contentRef} style={{ color: "rgba(255,255,255,0.92)", fontSize: 13, lineHeight: 1.6, margin: 0, wordBreak: "break-word", whiteSpace: "pre-wrap", textAlign: isOverflowing ? "left" : "center" }}>
              {content}
            </p>
            {isOverflowing && (
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.55))", pointerEvents: "none" }} />
            )}
          </div>
          {isOverflowing && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", flexShrink: 0 }}>
              <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.65)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", padding: "4px 10px", borderRadius: 20 }}>
                Tap to read
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ position: "absolute", inset: 0, borderRadius: 20, background: "#0d0d0d", overflowY: "auto", WebkitOverflowScrolling: "touch" as any }}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "#0d0d0d", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ color: "white", fontWeight: 700, fontSize: 12 }}>Post</span>
        <button
          onClick={handleReset}
          style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <X style={{ width: 11, height: 11 }} />
        </button>
      </div>
      <div style={{ padding: "14px 14px 20px" }}>
        <p style={{ color: "white", fontSize: 14, lineHeight: 1.65, margin: 0, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{content}</p>
      </div>
    </div>
  );
};

const TweetCardInline = ({ tweetId, xUrl, onPlayStateChange }: { tweetId: string; xUrl: string; onPlayStateChange?: (b: boolean) => void }) => {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery<{
    id: string; text: string; createdAt: string | null;
    author: { name: string; screenName: string; profileImageUrl: string | null; verified: boolean };
    photos: string[]; hasVideo: boolean;
    likeCount: number | null; replyCount: number | null; retweetCount: number | null;
  }>({
    queryKey: ["/api/tweet-content", tweetId],
    queryFn: async () => {
      const res = await fetch(`/api/tweet-content/${tweetId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
  });

  const handleExpand = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setExpanded(true);
    onPlayStateChange?.(true);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(false);
    onPlayStateChange?.(false);
  };

  const formatCount = (n: number | null) => {
    if (n == null) return null;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "";
    try { return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); }
    catch { return ""; }
  };

  if (!expanded) {
    return (
      <div
        className="w-full h-full absolute inset-0 overflow-hidden rounded-[24px] cursor-pointer"
        onClick={handleExpand}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", flexDirection: "column", padding: 14, gap: 10, borderRadius: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {data?.author.profileImageUrl ? (
              <img src={data.author.profileImageUrl} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <SiX style={{ width: 13, height: 13, color: "white" }} />
              </div>
            )}
            {data ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "white", fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{data.author.name}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>@{data.author.screenName}</div>
              </div>
            ) : isLoading ? (
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Loading…</div>
            ) : null}
            <SiX style={{ width: 15, height: 15, color: "white", flexShrink: 0 }} />
          </div>

          {data && (
            <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 1.55, margin: 0, wordBreak: "break-word", whiteSpace: "pre-wrap", flexShrink: 0 }}>
                {data.text}
              </p>
              {data.photos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: data.photos.length === 1 ? "1fr" : "1fr 1fr", gap: 3, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                  {data.photos.slice(0, 4).map((photo, i) => (
                    <img key={i} src={photo} alt="" style={{ width: "100%", aspectRatio: data.photos.length === 1 ? "16/9" : "1/1", objectFit: "cover", display: "block" }} />
                  ))}
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.65))", pointerEvents: "none" }} />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.65)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", padding: "4px 10px", borderRadius: 20 }}>
              Tap to read
            </div>
            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ width: 30, height: 30, borderRadius: "50%", background: "black", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.12)", flexShrink: 0 }}
            >
              <SiX style={{ width: 13, height: 13, color: "white" }} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ position: "absolute", inset: 0, borderRadius: 20, background: "#0d0d0d", overflowY: "auto", WebkitOverflowScrolling: "touch" as any }}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "#0d0d0d", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SiX style={{ width: 12, height: 12, color: "white" }} />
          <span style={{ color: "white", fontWeight: 700, fontSize: 12 }}>X Post</span>
        </div>
        <button
          onClick={handleReset}
          style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <X style={{ width: 11, height: 11 }} />
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", gap: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Loading…</span>
        </div>
      ) : !data ? (
        <div style={{ padding: "24px 14px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>Could not load tweet</p>
        </div>
      ) : (
        <div style={{ padding: "12px 12px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            {data.author.profileImageUrl ? (
              <img src={data.author.profileImageUrl} alt={data.author.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1d1d1f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <SiX style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>{data.author.name}</span>
                {data.author.verified && (
                  <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: "#1d9bf0", flexShrink: 0 }}><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.92.81c.66 1.31 1.9 2.19 3.33 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/></svg>
                )}
              </div>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>@{data.author.screenName}</span>
            </div>
            <SiX style={{ width: 14, height: 14, color: "white", flexShrink: 0 }} />
          </div>

          <p style={{ color: "white", fontSize: 14, lineHeight: 1.6, margin: "0 0 10px", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{data.text}</p>

          {data.photos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: data.photos.length === 1 ? "1fr" : "1fr 1fr", gap: 3, marginBottom: 10, borderRadius: 10, overflow: "hidden" }}>
              {data.photos.map((photo, i) => (
                <img key={i} src={photo} alt="" style={{ width: "100%", aspectRatio: data.photos.length === 1 ? "16/9" : "1/1", objectFit: "cover", display: "block" }} />
              ))}
            </div>
          )}

          {data.createdAt && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: "0 0 10px" }}>{formatDate(data.createdAt)}</p>
          )}

          {(data.likeCount != null || data.retweetCount != null || data.replyCount != null) && (
            <div style={{ display: "flex", gap: 14, padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
              {data.replyCount != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: "none", stroke: "rgba(255,255,255,0.4)", strokeWidth: 1.8, strokeLinecap: "round" }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>{formatCount(data.replyCount)}</span>
                </div>
              )}
              {data.retweetCount != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: "rgba(255,255,255,0.4)" }}><path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z"/></svg>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>{formatCount(data.retweetCount)}</span>
                </div>
              )}
              {data.likeCount != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: "rgba(255,255,255,0.4)" }}><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/></svg>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>{formatCount(data.likeCount)}</span>
                </div>
              )}
            </div>
          )}

          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "white", color: "black", fontWeight: 700, fontSize: 12, padding: "9px 0", borderRadius: 20, textDecoration: "none" }}
          >
            <SiX style={{ width: 11, height: 11 }} />
            Open on X
          </a>
        </div>
      )}
    </div>
  );
};

const SwipeCardContent = forwardRef(
  ({ card, currentIndex, totalCards, onSwipeLeft, onSwipeRight, onVideoPlayStateChange, isVideoPlaying, disableDrag }: SwipeCardProps, ref) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = async (text: string) => {
      if (isSpeaking) {
        const audio = document.getElementById(
          "edge-tts-audio",
        ) as HTMLAudioElement;
        if (audio) {
          audio.pause();
          audio.src = "";
        }
        setIsSpeaking(false);
        return;
      }

      if (!text) return;

      setIsSpeaking(true);
      try {
        // Prioritize Edge Neural voices if available in the browser
        const voices = window.speechSynthesis.getVoices();
        const edgeNaturalVoice = voices.find(
          (v) =>
            v.name.includes("Natural") &&
            v.name.includes("Microsoft") &&
            v.lang.startsWith("en"),
        );

        if (edgeNaturalVoice && !window.chrome) {
          // window.chrome check is a rough proxy for "might be in Edge/Chrome with online voices"
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.voice = edgeNaturalVoice;
          utterance.pitch = 1;
          utterance.rate = 1;
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        } else {
          // Fallback to a high-quality neural-like TTS proxy that uses Microsoft Edge voices
          // This is a common public endpoint used for accessing Edge TTS without an API key
          const voice = "en-US-AndrewNeural";
          const url = `https://api.lowline.ai/v1/tts?text=${encodeURIComponent(text)}&voice=${voice}`;

          let audio = document.getElementById(
            "edge-tts-audio",
          ) as HTMLAudioElement;
          if (!audio) {
            audio = document.createElement("audio");
            audio.id = "edge-tts-audio";
            audio.style.display = "none";
            document.body.appendChild(audio);
          }

          audio.src = url;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => {
            // Final fallback to Google TTS if the neural proxy fails
            audio.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(text)}`;
            audio.play().catch(() => setIsSpeaking(false));
          };
          await audio.play();
        }
      } catch (error) {
        console.error("TTS Error:", error);
        setIsSpeaking(false);
      }
    };

    const thumbnailUrl = useMemo(() => {
      if (card.type !== "reel") return null;
      const url = (card as any).url;
      if (!url) return null;
      const ytMatch = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|v\/|embed\/|reels\/))([\w-]{11})/,
      );
      if (ytMatch)
        return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
      return null;
    }, [card.type, (card as any).url]);

    const embedUrl = useMemo(() => {
      if (card.type !== "reel") return null;
      const url = (card as any).url;
      if (!url) return null;
      const ytMatch = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|v\/|embed\/|reels\/))([\w-]{11})/,
      );
      if (ytMatch)
        return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0&loop=1&playlist=${ytMatch[1]}&modestbranding=1&rel=0`;
      const igMatch = url.match(
        /(?:instagram\.com\/(?:reels|reel|p|tv)\/)([\w-]+)/,
      );
      if (igMatch) return `https://www.instagram.com/reel/${igMatch[1]}/embed/`;
      return null;
    }, [card.type, (card as any).url]);

    return (
      <motion.div
        ref={ref}
        key={currentIndex}
        style={{ x, rotate, opacity }}
        drag={(disableDrag || isVideoPlaying) ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) onSwipeLeft();
          else if (info.offset.x > 80) onSwipeRight();
        }}
        className={clsx(
          "absolute inset-0 bg-gradient-to-b rounded-[24px] p-4 shadow-2xl overflow-hidden group",
          isVideoPlaying ? "cursor-default" : "cursor-grab active:cursor-grabbing",
          card.color,
        )}
      >
        {isPlaying && card.type === "reel" ? (
          <div className="absolute inset-0 z-50 bg-black rounded-[24px] overflow-hidden">
            {embedUrl ? (
              <div className="w-full h-full overflow-hidden flex items-center justify-center">
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-white text-xs p-4 text-center h-full flex items-center justify-center">
                Invalid Video URL
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(false);
                onVideoPlayStateChange?.(false);
              }}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white z-[60]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full items-center justify-between relative z-10">
            {/* Card counter badge — top-right */}
            {totalCards > 1 && (
              <div className="absolute top-0 right-0 px-2 py-0.5 rounded-full text-white/90 font-bold text-[9px] tracking-widest select-none" style={{ background: "rgba(0,0,0,0.28)" }}>
                {currentIndex + 1}/{totalCards}
              </div>
            )}
            {!(card as any).empty && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/90 text-[9px] font-bold tracking-[0.2em] uppercase">
                  {card.title}
                </span>
                {card.type !== "product" && card.type !== "post" && (
                  <Mic className="w-3.5 h-3.5 text-white/90" />
                )}
              </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center w-full space-y-3">
              {(card as any).empty ? (
                <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold text-center">No voice yet</p>
              ) : card.type === "reel" ? (
                thumbnailUrl ? (
                  <div
                    className="w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10 cursor-pointer group/thumb relative"
                    onClick={() => { setIsPlaying(true); onVideoPlayStateChange?.(true); }}
                  >
                    <img
                      src={thumbnailUrl}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                      alt="Thumbnail"
                      loading="eager"
                      fetchPriority="high"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          thumbnailUrl.replace("maxresdefault", "hqdefault");
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center space-y-3 py-4 cursor-pointer"
                    onClick={() => { setIsPlaying(true); onVideoPlayStateChange?.(true); }}
                  >
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-white text-xl font-bold">
                        {card.name}
                      </h3>
                      <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                        Watch Reel
                      </p>
                    </div>
                  </div>
                )
              ) : card.type === "image" || card.type === "product" ? (
                (card as any).imageUrl ? (
                  <div className="w-full aspect-square rounded-xl overflow-hidden shadow-lg border border-white/10 mb-4">
                    <img
                      src={(card as any).imageUrl}
                      className="w-full h-full object-cover"
                      alt={card.name}
                      loading="eager"
                      fetchPriority="high"
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-0.5">
                    <h3 className="text-white text-2xl font-bold leading-tight">
                      {card.name}
                    </h3>
                  </div>
                )
              ) : card.type === "post" ? (
                (card as any).content ? (
                  <PostCardInline content={(card as any).content} onPlayStateChange={onVideoPlayStateChange} />
                ) : (
                  <p className="text-white/30 text-[10px] uppercase tracking-widest">No content</p>
                )
              ) : card.type === "xpost" ? (
                (() => {
                  const xUrl = (card as any).url || "";
                  const subtype = (card as any).subtype || "tweet";
                  const tweetIdMatch = xUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
                  const tweetId = tweetIdMatch?.[1];
                  const broadcastMatch = xUrl.match(/(?:twitter\.com|x\.com)\/i\/(?:broadcasts|live)\/([\w]+)/);
                  const broadcastId = broadcastMatch?.[1];
                  if (broadcastId) return (
                    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black rounded-[24px] overflow-hidden">
                      <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 40%, #e11d48, transparent 70%)" }} />
                      <div className="flex items-center gap-2 relative z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                        <span className="text-white font-black text-sm uppercase tracking-[0.2em]">Live</span>
                      </div>
                      <SiX className="w-8 h-8 text-white/60 relative z-10" />
                      <a
                        href={xUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 bg-white text-black font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 active:scale-95 transition-transform shadow-xl"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Watch Live on X
                      </a>
                    </div>
                  );
                  if (!tweetId) return (
                    <div className="text-center space-y-3">
                      {subtype === "video" ? (
                        <Play className="w-10 h-10 text-white/30 mx-auto fill-current" />
                      ) : (
                        <SiX className="w-10 h-10 text-white/30 mx-auto" />
                      )}
                      <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                        {subtype === "video" ? "No video added" : "No post added"}
                      </p>
                    </div>
                  );
                  if (subtype === "video") return (
                    <XVideoCard tweetId={tweetId} xUrl={xUrl} onPlayStateChange={onVideoPlayStateChange} />
                  );
                  return (
                    <TweetCardInline tweetId={tweetId} xUrl={xUrl} onPlayStateChange={onVideoPlayStateChange} />
                  );
                })()
              ) : (
                <div className="text-center space-y-0.5">
                  <h3 className="text-white text-2xl font-bold leading-tight">
                    {card.name}
                  </h3>
                  <h3 className="text-white text-sm opacity-60 font-medium leading-tight line-clamp-2 px-2">
                    {card.subname}
                  </h3>
                  {card.type === "pitch" && (card as any).content && (
                    <p className="text-white/80 text-xs mt-2 px-4 line-clamp-3">
                      {(card as any).content}
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>
    );
  },
);

SwipeCardContent.displayName = "SwipeCardContent";

const PamphletXVideoThumb = ({ url }: { url: string }) => {
  const tweetIdMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  const tweetId = tweetIdMatch?.[1];
  const { data } = useQuery<{ videoUrl: string; thumbnailUrl: string | null }>({
    queryKey: ["/api/tweet-video", tweetId],
    queryFn: async () => {
      const res = await fetch(`/api/tweet-video/${tweetId}`);
      if (!res.ok) throw new Error("No video found");
      return res.json();
    },
    enabled: !!tweetId,
    retry: 1,
    staleTime: 1000 * 60 * 30,
  });
  if (!data?.thumbnailUrl) return null;
  return (
    <img
      src={data.thumbnailUrl}
      alt=""
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

const XVideoCard = ({ tweetId, xUrl, onEditClick, onPlayStateChange }: { tweetId: string; xUrl: string; onEditClick?: (e: React.MouseEvent) => void; onPlayStateChange?: (isPlaying: boolean) => void }) => {
  const { data, isLoading, isError } = useQuery<{ videoUrl: string; thumbnailUrl: string | null }>({
    queryKey: ["/api/tweet-video", tweetId],
    queryFn: async () => {
      const res = await fetch(`/api/tweet-video/${tweetId}`);
      if (!res.ok) throw new Error("No video found");
      return res.json();
    },
    retry: 1,
    staleTime: 1000 * 60 * 30,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v) { v.pause(); v.src = ""; }
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      v.play().catch(() => {});
      setIsPlaying(true);
      onPlayStateChange?.(true);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  const handleMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setIsLandscape(v.videoWidth > v.videoHeight);
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[20px] bg-black flex items-center justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Loading…</span>
        </div>
      ) : isError || !data?.videoUrl ? (
        <div className="flex flex-col items-center gap-3">
          <Play className="w-10 h-10 text-white/30 fill-current" />
          <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold text-center px-4">Tap X to view video</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={data.videoUrl}
            poster={data.thumbnailUrl || undefined}
            className={isLandscape ? "w-full h-auto" : "w-full h-full object-cover"}
            loop
            playsInline
            onLoadedMetadata={handleMetadata}
            onEnded={() => { setIsPlaying(false); onPlayStateChange?.(false); }}
          />
          <button
            type="button"
            onClick={handlePlay}
            onTouchStart={(e) => {
              const t = e.touches[0];
              touchStartRef.current = { x: t.clientX, y: t.clientY };
            }}
            onTouchEnd={(e) => {
              const start = touchStartRef.current;
              if (!start) return;
              const t = e.changedTouches[0];
              const dx = Math.abs(t.clientX - start.x);
              const dy = Math.abs(t.clientY - start.y);
              touchStartRef.current = null;
              if (dx < 10 && dy < 10) {
                e.stopPropagation();
                e.preventDefault();
                togglePlay();
              }
            }}
            className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity ${isPlaying ? "opacity-0 active:opacity-100" : "opacity-100"}`}
            style={{ background: isPlaying ? "transparent" : "rgba(0,0,0,0.35)", touchAction: "pan-y" }}
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-2xl active:scale-95 transition-transform">
                <Play className="w-7 h-7 text-white fill-current ml-1" />
              </div>
            )}
          </button>
        </>
      )}
      {onEditClick && (
        <button
          type="button"
          onClick={onEditClick}
          className="absolute top-3 left-3 p-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 text-white/70 hover:text-white transition-colors z-20"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-lg border border-white/10 z-20 active:scale-90 transition-transform"
      >
        <SiX className="w-3.5 h-3.5 text-white" />
      </a>
    </div>
  );
};

const InstaVideoCard = ({ reelId, reelUrl, onEditClick, onPlayStateChange }: { reelId: string; reelUrl: string; onEditClick?: (e: React.MouseEvent) => void; onPlayStateChange?: (isPlaying: boolean) => void }) => {
  const { data, isLoading, isError } = useQuery<{ videoUrl: string; thumbnailUrl: string | null }>({
    queryKey: ["/api/insta-video", reelId],
    queryFn: async () => {
      const res = await fetch(`/api/insta-video/${reelId}`);
      if (!res.ok) throw new Error("No video found");
      return res.json();
    },
    retry: 1,
    staleTime: 1000 * 60 * 30,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v) { v.pause(); v.src = ""; }
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      v.play().catch(() => {});
      setIsPlaying(true);
      onPlayStateChange?.(true);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[20px] bg-black flex items-center justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Loading…</span>
        </div>
      ) : isError || !data?.videoUrl ? (
        <div className="flex flex-col items-center gap-3">
          <SiInstagram className="w-10 h-10 text-white/30" />
          <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold text-center px-4">Tap Instagram to view</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={data.videoUrl}
            poster={data.thumbnailUrl || undefined}
            className={isLandscape ? "w-full h-auto" : "w-full h-full object-cover"}
            loop
            playsInline
            onLoadedMetadata={() => {
              const v = videoRef.current;
              if (v) setIsLandscape(v.videoWidth > v.videoHeight);
            }}
            onEnded={() => { setIsPlaying(false); onPlayStateChange?.(false); }}
          />
          <button
            type="button"
            onClick={handlePlay}
            onTouchStart={(e) => {
              const t = e.touches[0];
              touchStartRef.current = { x: t.clientX, y: t.clientY };
            }}
            onTouchEnd={(e) => {
              const start = touchStartRef.current;
              if (!start) return;
              const t = e.changedTouches[0];
              const dx = Math.abs(t.clientX - start.x);
              const dy = Math.abs(t.clientY - start.y);
              touchStartRef.current = null;
              if (dx < 10 && dy < 10) {
                e.stopPropagation();
                e.preventDefault();
                togglePlay();
              }
            }}
            className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity ${isPlaying ? "opacity-0 active:opacity-100" : "opacity-100"}`}
            style={{ background: isPlaying ? "transparent" : "rgba(0,0,0,0.35)", touchAction: "pan-y" }}
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-2xl active:scale-95 transition-transform">
                <Play className="w-7 h-7 text-white fill-current ml-1" />
              </div>
            )}
          </button>
        </>
      )}
      {onEditClick && (
        <button
          type="button"
          onClick={onEditClick}
          className="absolute top-3 left-3 p-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 text-white/70 hover:text-white transition-colors z-20"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
      <a
        href={reelUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg z-20 active:scale-90 transition-transform"
      >
        <SiInstagram className="w-3.5 h-3.5 text-white" />
      </a>
    </div>
  );
};

const SwipeCard = ({
  cards,
  user: propsUser,
  voiceMode = false,
  isActive = true,
}: {
  cards: string[];
  user?: any;
  voiceMode?: boolean;
  isActive?: boolean;
}) => {
  const parseCardJson = (c: string) => {
    try {
      const card = JSON.parse(c);
      if (!card || !card.type) return null;
      const typeInfo = CARD_TYPES.find((t) => t.type === card.type);
      let name = card.title || "Untitled";
      if (card.type === "reel") name = card.title || "Video";
      else if (card.type === "image" || card.type === "product") name = card.title || "Image";
      else if (card.type === "post") name = card.title || "Post";
      else if (card.type === "xpost") name = card.title || "X Post";
      let subname = "";
      if (card.type === "reel") subname = card.url || "";
      else if (card.type === "post") subname = card.content || "";
      else if (card.type === "xpost") subname = card.url || "";
      else subname = card.url || "Voice";
      return {
        ...card,
        type: card.type,
        title: card.title || "Untitled",
        name,
        subname,
        thumbnailUrl: card.type === "reel" ? getThumbnailUrl(card.url) : null,
        color: typeInfo?.color || "from-gray-700 to-gray-800",
      };
    } catch (e) {
      return null;
    }
  };

  const displayCards = useMemo(() => {
    if (cards.length > 0) {
      return cards.map((c) => parseCardJson(c) || (voiceMode ? parseCardJson(VOICE_DEMO_CARDS[0])! : CARDS[0]));
    }
    if (voiceMode) {
      if (!propsUser && window.location.pathname === "/") {
        return VOICE_DEMO_CARDS.map((c) => parseCardJson(c)!).filter(Boolean);
      }
      return [{ title: "", name: "", subname: "", color: "from-pink-300 to-pink-400", empty: true }];
    }
    if (propsUser || (cards.length === 0 && window.location.pathname !== "/")) {
      return [{ title: "NO CARDS", name: "EMPTY", subname: "PERSONA", color: "from-gray-800 to-gray-900" }];
    }
    return CARDS.map((c) => ({ ...c, name: c.name.toUpperCase(), subname: c.subname.toUpperCase() }));
  }, [cards, propsUser, voiceMode]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [contentResetKey, setContentResetKey] = useState(0);

  useEffect(() => {
    if (activeIndex >= displayCards.length) setActiveIndex(0);
  }, [displayCards]);

  useEffect(() => {
    if (!isActive) {
      setIsVideoPlaying(false);
      setActiveIndex(0);
      setContentResetKey((k) => k + 1);
    }
  }, [isActive]);

  // Motion values for top card drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const frontOpacity = useTransform(x, [-180, -80, 0, 80, 180], [0.4, 1, 1, 1, 0.4]);

  // Motion values for stack cards (animate independently) — right-peek offset
  const midX = useMotionValue(12);
  const midScale = useMotionValue(0.96);
  const backX = useMotionValue(22);
  const backScale = useMotionValue(0.92);

  // Live sync: stack cards inch forward as top card is dragged
  useEffect(() => {
    const unsub = x.on("change", (v) => {
      if (isAnimating) return;
      const p = Math.min(Math.abs(v) / 180, 1);
      midX.set(12 - p * 12);
      midScale.set(0.96 + p * 0.04);
      backX.set(22 - p * 10);
      backScale.set(0.92 + p * 0.04);
    });
    return unsub;
  }, [isAnimating]);

  const triggerSwipe = async (dir: number) => {
    if (isAnimating || displayCards.length <= 1 || isVideoPlaying) return;
    setIsVideoPlaying(false);
    setIsAnimating(true);
    await Promise.all([
      animate(x, dir * 440, { duration: 0.28, ease: [0.4, 0, 0.85, 1] }),
      animate(midX, 0, { duration: 0.28, ease: [0.25, 0, 0.5, 1] }),
      animate(midScale, 1, { duration: 0.28, ease: [0.25, 0, 0.5, 1] }),
      animate(backX, 12, { duration: 0.28, ease: [0.25, 0, 0.5, 1] }),
      animate(backScale, 0.96, { duration: 0.28, ease: [0.25, 0, 0.5, 1] }),
    ]);
    setActiveIndex((prev) =>
      dir === -1
        ? (prev + 1) % displayCards.length
        : (prev - 1 + displayCards.length) % displayCards.length,
    );
    x.set(0);
    midX.set(12);
    midScale.set(0.96);
    backX.set(22);
    backScale.set(0.92);
    setIsAnimating(false);
  };

  const snapBack = () => {
    animate(x, 0, { type: "spring", stiffness: 340, damping: 30 });
    animate(midX, 12, { type: "spring", stiffness: 340, damping: 30 });
    animate(midScale, 0.96, { type: "spring", stiffness: 340, damping: 30 });
    animate(backX, 22, { type: "spring", stiffness: 340, damping: 30 });
    animate(backScale, 0.92, { type: "spring", stiffness: 340, damping: 30 });
  };

  if (!displayCards.length) return null;

  const frontCard = displayCards[activeIndex];
  if (!frontCard) return null;

  const midCard = displayCards[(activeIndex + 1) % displayCards.length];
  const bkCard = displayCards[(activeIndex + 2) % displayCards.length];

  return (
    <div className="relative w-full max-w-[300px] mx-auto" style={{ perspective: "1200px", aspectRatio: "3/4.5" }}>
      {/* Back card — peeks from the right */}
      {displayCards.length > 2 && (
        <motion.div
          className={clsx("absolute inset-0 rounded-[24px] bg-gradient-to-b overflow-hidden shadow-md", bkCard.color)}
          style={{ x: backX, scale: backScale, zIndex: 10 }}
        >
          {/* Top-right bright tint so the card is clearly visible behind the stack */}
          <div className="absolute inset-0 rounded-[24px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 30%, transparent 60%)" }} />
          <div className="absolute top-0 right-0 w-3/4 h-1/2 rounded-tr-[24px]" style={{ background: "radial-gradient(ellipse at top right, rgba(255,255,255,0.80) 0%, transparent 70%)" }} />
        </motion.div>
      )}

      {/* Middle card — peeks from the right */}
      {displayCards.length > 1 && (
        <motion.div
          className={clsx("absolute inset-0 rounded-[24px] bg-gradient-to-b overflow-hidden shadow-lg", midCard.color)}
          style={{ x: midX, scale: midScale, zIndex: 20 }}
        >
          {/* Top-right bright tint so the card is clearly visible behind the front */}
          <div className="absolute inset-0 rounded-[24px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.40) 30%, transparent 60%)" }} />
          <div className="absolute top-0 right-0 w-3/4 h-1/2 rounded-tr-[24px]" style={{ background: "radial-gradient(ellipse at top right, rgba(255,255,255,0.65) 0%, transparent 70%)" }} />
        </motion.div>
      )}

      {/* Front card — fully interactive */}
      <motion.div
        key={`${activeIndex}-${contentResetKey}`}
        style={{ x, rotate, opacity: frontOpacity, zIndex: 30 }}
        drag={isAnimating || isVideoPlaying ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        whileDrag={{ scale: 1.03 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70) triggerSwipe(-1);
          else if (info.offset.x > 70) triggerSwipe(1);
          else snapBack();
        }}
        className={clsx(
          "absolute inset-0 bg-gradient-to-b rounded-[24px] p-4 shadow-2xl overflow-hidden",
          isVideoPlaying ? "cursor-default" : "cursor-grab active:cursor-grabbing",
          frontCard.color,
        )}
      >
        <SwipeCardContent
          card={frontCard}
          currentIndex={activeIndex}
          totalCards={displayCards.length}
          onSwipeLeft={() => triggerSwipe(-1)}
          onSwipeRight={() => triggerSwipe(1)}
          onVideoPlayStateChange={setIsVideoPlaying}
          isVideoPlaying={isVideoPlaying}
          disableDrag={true}
        />
      </motion.div>
    </div>
  );
};

const MiniCard = ({
  idx,
  cardJson,
  onUpdate,
  onDelete,
}: {
  idx: number;
  cardJson?: string;
  onUpdate: (json: string) => void;
  onDelete: () => void;
}) => {
  const card: CardData | null = useMemo(() => {
    try {
      return cardJson ? JSON.parse(cardJson) : null;
    } catch (e) {
      return null;
    }
  }, [cardJson]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [visibleWords, setVisibleWords] = useState(18);

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|v\/|embed\/|reels\/))([\w-]{11})/,
    );
    if (ytMatch)
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0&loop=1&playlist=${ytMatch[1]}&modestbranding=1&rel=0`;
    const igMatch = url.match(
      /(?:instagram\.com\/(?:reels|reel|p|tv)\/)([\w-]+)/,
    );
    if (igMatch) return `https://www.instagram.com/reel/${igMatch[1]}/embed/`;
    return null;
  };

  const getThumbnailUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|v\/|embed\/|reels\/))([\w-]{11})/,
    );
    if (ytMatch)
      return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    return null;
  };

  const embedUrl = useMemo(
    () => (card.type === "reel" ? getEmbedUrl((card as any).url) : null),
    [card.type, (card as any).url],
  );
  const thumbnailUrl = useMemo(
    () => (card.type === "reel" ? getThumbnailUrl((card as any).url) : null),
    [card.type, (card as any).url],
  );

  if (!card) return null;

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      const audio = document.getElementById(
        "edge-tts-audio-mini",
      ) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      setIsSpeaking(false);
      return;
    }

    if (!text) return;

    setIsSpeaking(true);
    try {
      const voices = window.speechSynthesis.getVoices();
      const edgeNaturalVoice = voices.find(
        (v) =>
          v.name.includes("Natural") &&
          v.name.includes("Microsoft") &&
          v.lang.startsWith("en"),
      );

      if (edgeNaturalVoice) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = edgeNaturalVoice;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        let audio = document.getElementById(
          "edge-tts-audio-mini",
        ) as HTMLAudioElement;
        if (!audio) {
          audio = document.createElement("audio");
          audio.id = "edge-tts-audio-mini";
          audio.style.display = "none";
          document.body.appendChild(audio);
        }

        const voice = "en-US-AndrewNeural";
        audio.src = `https://api.lowline.ai/v1/tts?text=${encodeURIComponent(text)}&voice=${voice}`;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          audio.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(text)}`;
          audio.play().catch(() => setIsSpeaking(false));
        };
        await audio.play();
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(false);
    }
  };

  const cardTypeInfo = CARD_TYPES.find((t) => t.type === card.type);

  return (
    <motion.div
      layoutId={`card-${idx}`}
      className={clsx(
        "h-full rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl bg-gradient-to-b",
        card.type === "reel" || card.type === "image" || card.type === "xpost" ? "p-0" : "p-4",
        cardTypeInfo?.color || "from-gray-700 to-gray-800",
      )}
    >
      {(!isPlaying || card.type !== "reel") && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute top-2 right-2 p-1 bg-black/20 rounded-full text-white/60 hover:text-white transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {card.type !== "reel" && card.type !== "image" && card.type !== "xpost" && (
        <div className="space-y-2">
          <h5 className="text-white font-bold text-lg leading-tight">
            {card.type === "post" ? "Post" : card.title}
          </h5>
        </div>
      )}
      <div
        className={clsx(
          "flex-1 flex items-center justify-center relative",
          isPlaying && card.type === "reel" ? "w-full h-full" : "",
        )}
      >
        {isEditing ? (
          <div className={clsx(
            "w-full space-y-2 z-10",
            card.type === "reel" || card.type === "image" || card.type === "xpost"
              ? "absolute inset-0 flex flex-col justify-center p-4 bg-black/70 backdrop-blur-md"
              : "bg-black/40 p-3 rounded-xl backdrop-blur-sm",
          )}>
            {card.type !== "image" && card.type !== "post" && card.type !== "reel" && card.type !== "xpost" && (
              <input
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                placeholder="Title"
                defaultValue={card.title}
                onBlur={(e) => {
                  onUpdate(JSON.stringify({ ...card, title: e.target.value }));
                }}
              />
            )}
            {card.type === "pitch" && (
              <textarea
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white h-20"
                placeholder="Pitch content"
                defaultValue={(card as any).content}
                onBlur={(e) => {
                  onUpdate(
                    JSON.stringify({ ...card, content: e.target.value }),
                  );
                }}
              />
            )}
            {card.type === "reel" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(236,72,153,0.25)", border: "1px solid rgba(236,72,153,0.4)" }}>
                    <Video className="w-3 h-3 text-pink-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-pink-300/70">Add Reel URL</span>
                </div>
                <input
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400/40"
                  placeholder="YouTube / Instagram URL"
                  defaultValue={(card as any).url}
                  onBlur={(e) => {
                    onUpdate(JSON.stringify({ ...card, url: e.target.value }));
                  }}
                />
              </div>
            )}
            {card.type === "post" && (
              <textarea
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white h-20 resize-none"
                placeholder="Write your post content..."
                defaultValue={(card as any).content}
                onBlur={(e) => {
                  onUpdate(JSON.stringify({ ...card, content: e.target.value }));
                }}
              />
            )}
            {card.type === "xpost" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 border border-white/20">
                    {(card as any).subtype === "video" ? (
                      <Play className="w-3 h-3 text-white fill-current" />
                    ) : (
                      <SiX className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    {(card as any).subtype === "video" ? "Add X Video / Live URL" : "Add X Post URL"}
                  </span>
                </div>
                <input
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
                  placeholder={(card as any).subtype === "video" ? "https://x.com/user/status/... or /i/broadcasts/..." : "https://x.com/user/status/..."}
                  defaultValue={(card as any).url}
                  onBlur={(e) => {
                    onUpdate(JSON.stringify({ ...card, url: e.target.value }));
                  }}
                />
              </div>
            )}
            {(card.type === "image" || card.type === "product") && (
              <div className="space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id={`card-image-${idx}`}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Compress image before storing
                      const canvas = document.createElement("canvas");
                      const ctx = canvas.getContext("2d");
                      const img = new Image();
                      
                      img.onload = () => {
                        // Set max dimensions
                        const maxWidth = 800;
                        const maxHeight = 600;
                        let width = img.width;
                        let height = img.height;
                        
                        if (width > height) {
                          if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                          }
                        } else {
                          if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                          }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        ctx?.drawImage(img, 0, 0, width, height);
                        
                        // Convert to WebP with quality 0.7 for better compression
                        const compressedData = canvas.toDataURL("image/webp", 0.7);
                        onUpdate(
                          JSON.stringify({
                            ...card,
                            imageUrl: compressedData,
                          }),
                        );
                      };
                      
                      img.src = URL.createObjectURL(file);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(`card-image-${idx}`)?.click()
                  }
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-2 text-[10px] text-white flex items-center justify-center gap-2 hover:bg-white/20"
                >
                  <Plus className="w-3 h-3" />{" "}
                  {(card as any).imageUrl ? "Change Image" : "Upload Image"}
                </button>
                {(card as any).imageUrl && (
                  <div className="relative w-full aspect-video rounded overflow-hidden border border-white/10">
                    <img
                      src={(card as any).imageUrl}
                      className="w-full h-full object-cover"
                      alt="Product"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate(JSON.stringify({ ...card, imageUrl: "" }))
                      }
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-full bg-white text-black py-1 rounded text-[10px] font-bold"
            >
              Done
            </button>
          </div>
        ) : card.type === "reel" && !isEditing && isPlaying ? (
          <div className="w-full h-full relative group bg-black">
            {embedUrl ? (
              <div className="w-full h-full overflow-hidden flex items-center justify-center">
                <iframe
                  src={embedUrl}
                  className="w-full h-[calc(100%+80px)] -mt-[40px] border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-pink-300/50 text-xs font-medium">Invalid video URL</p>
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
              className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 text-white/70 hover:text-white transition-colors z-30"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : card.type === "reel" && !isEditing && !isPlaying ? (
          <div
            className="w-full h-full cursor-pointer group relative overflow-hidden"
            onClick={() => { if ((card as any).url) { setIsPlaying(true); } else { setIsEditing(true); } }}
          >
            {thumbnailUrl ? (
              <>
                <img
                  src={thumbnailUrl}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Video thumbnail"
                  onError={(e) => { (e.target as HTMLImageElement).src = thumbnailUrl.replace("maxresdefault", "hqdefault"); }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(236,72,153,0.25)", border: "1px solid rgba(236,72,153,0.4)" }}>
                    <Video className="w-2.5 h-2.5 text-pink-400" />
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-pink-300/70">Reel</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 bg-black/30 group-hover:scale-110 transition-transform shadow-xl">
                    <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-2 drop-shadow">
                    {card.title || "Reel"}
                  </p>
                </div>
              </>
            ) : (card as any).url ? (
              <>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center border border-pink-400/30 bg-pink-400/10 group-hover:border-pink-400/60 group-hover:bg-pink-400/20 transition-all">
                    <Play className="w-6 h-6 text-pink-400 fill-current ml-0.5" />
                  </div>
                  <span className="text-pink-300/50 text-[9px] font-bold uppercase tracking-widest">Tap to play</span>
                </div>
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(236,72,153,0.25)", border: "1px solid rgba(236,72,153,0.4)" }}>
                    <Video className="w-2.5 h-2.5 text-pink-400" />
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-pink-300/70">Reel</span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 group">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-pink-400/30 flex items-center justify-center group-hover:border-pink-400/60 transition-colors">
                    <Video className="w-7 h-7 text-pink-400/50 group-hover:text-pink-400 transition-colors" />
                  </div>
                  <span className="text-pink-300/40 text-[9px] font-bold uppercase tracking-widest group-hover:text-pink-300/70 transition-colors">
                    Add reel URL
                  </span>
                </div>
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(236,72,153,0.2)", border: "1px solid rgba(236,72,153,0.3)" }}>
                    <Video className="w-2.5 h-2.5 text-pink-400" />
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-pink-300/60">Reel</span>
                </div>
              </>
            )}
          </div>
        ) : card.type === "pitch" ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 overflow-hidden">
            <div
              className="w-full h-full overflow-y-auto custom-scrollbar flex items-start pt-2"
              onScroll={(e) => {
                const element = e.currentTarget;
                // If we've scrolled near the bottom, show more words
                if (
                  element.scrollHeight - element.scrollTop <=
                  element.clientHeight + 20
                ) {
                  const content = (card as any).content || "";
                  const totalWords = content.split(/\s+/).length;
                  if (visibleWords < totalWords) {
                    setVisibleWords((prev) => prev + 18);
                  }
                }
              }}
            >
              <p
                onClick={() => setIsEditing(true)}
                className="text-white/90 text-sm text-center italic leading-relaxed cursor-pointer hover:bg-white/5 p-4 rounded-lg transition-colors w-full break-words"
              >
                {(() => {
                  const content =
                    (card as any).content || "No pitch content yet...";
                  const words = content.split(/\s+/);
                  if (words.length <= 18) return `"${content}"`;

                  const displayed = words.slice(0, visibleWords).join(" ");
                  return `"${displayed}${visibleWords < words.length ? "..." : ""}"`;
                })()}
              </p>
            </div>
          </div>
        ) : card.type === "image" || card.type === "product" ? (
          <div className="w-full h-full relative">
            {(card as any).imageUrl ? (
              <>
                <img
                  src={(card as any).imageUrl}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  onClick={() => setIsEditing(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-3 right-3 p-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-white/20 text-white/70 hover:text-white transition-colors z-10"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full h-full flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-pink-400/30 flex items-center justify-center group-hover:border-pink-400/60 transition-colors">
                  <ImageIcon className="w-7 h-7 text-pink-400/50 group-hover:text-pink-400 transition-colors" />
                </div>
                <span className="text-pink-300/40 text-[9px] font-bold uppercase tracking-widest group-hover:text-pink-300/70 transition-colors">
                  Tap to upload
                </span>
              </button>
            )}
          </div>
        ) : card.type === "post" ? (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(236,72,153,0.2)", border: "1px solid rgba(236,72,153,0.3)" }}>
                <PenLine className="w-2.5 h-2.5 text-pink-400" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-pink-300/60">Post</span>
            </div>
            <div
              className="flex-1 overflow-y-auto custom-scrollbar cursor-pointer rounded-xl p-2 hover:bg-white/5 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {(card as any).content ? (
                <p className="text-white/80 text-xs leading-relaxed break-words">
                  {(card as any).content}
                </p>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50">
                  <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, transparent, rgba(236,72,153,0.5), transparent)" }} />
                  <p className="text-pink-300/60 text-[9px] text-center font-medium leading-relaxed">
                    Tap to write<br />your post…
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : card.type === "xpost" ? (
          (() => {
            const xUrl = (card as any).url || "";
            const subtype = (card as any).subtype || "tweet";
            const tweetIdMatch = xUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
            const tweetId = tweetIdMatch?.[1];
            const broadcastMatch = xUrl.match(/(?:twitter\.com|x\.com)\/i\/(?:broadcasts|live)\/([\w]+)/);
            const broadcastId = broadcastMatch?.[1];
            if (broadcastId) return (
              <div className="w-full h-full relative flex flex-col items-center justify-center gap-3 bg-black rounded-[18px] overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 40%, #e11d48, transparent 70%)" }} />
                <div className="flex items-center gap-2 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                  <span className="text-white font-black text-xs uppercase tracking-[0.2em]">Live</span>
                </div>
                <SiX className="w-6 h-6 text-white/60 relative z-10" />
                <a
                  href={xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 bg-white text-black font-bold text-[10px] px-4 py-2 rounded-full flex items-center gap-1.5 active:scale-95 transition-transform shadow-lg"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Watch Live on X
                </a>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  className="absolute top-2 left-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 text-white/70 hover:text-white transition-colors z-20"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            );
            if (!tweetId) return (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full h-full flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                  {subtype === "video" ? (
                    <Play className="w-7 h-7 text-white/40 group-hover:text-white/70 transition-colors fill-current" />
                  ) : (
                    <SiX className="w-7 h-7 text-white/40 group-hover:text-white/70 transition-colors" />
                  )}
                </div>
                <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest group-hover:text-white/60 transition-colors">
                  {subtype === "video" ? "Add X video URL" : "Add X post URL"}
                </span>
              </button>
            );
            if (subtype === "video") return (
              <XVideoCard
                tweetId={tweetId}
                xUrl={xUrl}
                onEditClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              />
            );
            return (
              <div className="w-full h-full relative overflow-hidden rounded-[20px]">
                <iframe
                  src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark&chrome=nofooter&conversation=none`}
                  className="w-full border-0"
                  style={{ height: "100%", pointerEvents: "none" }}
                  allow="autoplay; encrypted-media"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
                  scrolling="no"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 text-white/70 hover:text-white transition-colors z-10"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <a
                  href={xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-black flex items-center justify-center shadow-lg border border-white/10 z-10 active:scale-90 transition-transform"
                >
                  <SiX className="w-3 h-3 text-white" />
                </a>
              </div>
            );
          })()
        ) : card.type === "revenue" && isPlaying ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <div className="w-full h-24 relative overflow-visible">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M 10 90 L 90 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <motion.circle
                  cx="90"
                  cy="10"
                  r="5"
                  fill="white"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.3 }}
                />
              </svg>
              <motion.div
                className="absolute -top-2 right-0 text-white font-bold text-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                {(card as any).value}
              </motion.div>
            </div>
          </div>
        ) : card.type === "revenue" || card.type === "traction" ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer group/card-content"
            onClick={() => setIsEditing(true)}
          >
            <div className="text-center mb-4">
              <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
                {card.type === "revenue" ? "Live Revenue" : "User Growth"}
              </div>
              <div className="text-white text-3xl font-bold tracking-tight">
                {(card as any).value ||
                  (card.type === "revenue" ? "$1.2M" : "50k+")}
              </div>
            </div>
            <div className="w-full h-32 relative group/chart">
              <TrendLine />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/chart:opacity-100 transition-opacity rounded-xl -m-2" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card-content:opacity-100 transition-opacity">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all group"
          >
            <Plus className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>
      {card.type !== "reel" && card.type !== "image" && card.type !== "post" && card.type !== "product" && (
        <div className="pt-2">
          {card.type === "pitch" ? (
            <button
              onClick={() => handleSpeak((card as any).content || "")}
              className={clsx(
                "w-full rounded-full py-2 text-xs font-bold flex items-center justify-center gap-2 transition-colors",
                isSpeaking ? "bg-red-500 text-white" : "bg-white text-black",
              )}
            >
              {isSpeaking ? (
                <>
                  <X className="w-3 h-3" /> Stop Pitch
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" /> Play Pitch
                </>
              )}
            </button>
          ) : null}
        </div>
      )}
    </motion.div>
  );
};

const CustomSwipeCard = ({ cards }: { cards: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handleSwipeRight = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const parsedCards = useMemo(() => {
    return cards
      .map((c) => {
        try {
          const card = JSON.parse(c);
          const typeInfo = CARD_TYPES.find((t) => t.type === card.type);
          return {
            title: card.title,
            name: card.type.toUpperCase(),
            subname: card.value || card.url || "Voice",
            color: typeInfo?.color || "from-gray-700 to-gray-800",
            bgStack1: "bg-black/20",
            bgStack2: "bg-black/10",
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  }, [cards]);

  if (parsedCards.length === 0) {
    return (
      <div className="relative w-full max-w-[240px] aspect-[3/4] mx-auto perspective-1000">
        <div className="absolute inset-0 translate-y-4 translate-x-2 rounded-[24px] -z-20 opacity-40 scale-95 bg-black/10" />
        <div className="absolute inset-0 translate-y-2 translate-x-1 rounded-[24px] -z-10 opacity-70 scale-[0.98] bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0510] to-[#2d0a1e] rounded-[24px] p-4 shadow-2xl overflow-hidden flex flex-col items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-white/90 text-[9px] font-bold tracking-[0.2em] uppercase">Your Voice</span>
            <PenLine className="w-3 h-3 text-white/60" />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 flex-1 py-6">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <PenLine className="w-7 h-7 text-pink-300/70" />
            </div>
            <div className="text-center space-y-2 px-2">
              <p className="text-white/80 text-xs font-semibold leading-relaxed">
                Speak up for your community.
              </p>
              <p className="text-white/40 text-[10px] leading-relaxed">
                Your voice matters. Rise and be heard.
              </p>
            </div>
          </div>
          <div className="w-full h-px bg-white/10 mb-2" />
          <p className="text-white/20 text-[9px] uppercase tracking-widest">No cards yet</p>
        </div>
      </div>
    );
  }

  const currentCard = parsedCards[currentIndex]!;
  const nextCard = parsedCards[(currentIndex + 1) % parsedCards.length]!;
  const nextNextCard = parsedCards[(currentIndex + 2) % parsedCards.length]!;

  return (
    <div className="relative w-full max-w-[240px] aspect-[3/4] mx-auto perspective-1000">
      <div
        key={`stack2-${(currentIndex + 2) % parsedCards.length}`}
        className={clsx(
          "absolute inset-0 translate-y-4 translate-x-2 rounded-[24px] -z-20 transition-all duration-700 opacity-40 scale-95",
          nextNextCard.bgStack2,
        )}
      />
      <div
        key={`stack1-${(currentIndex + 1) % parsedCards.length}`}
        className={clsx(
          "absolute inset-0 translate-y-2 translate-x-1 rounded-[24px] -z-10 transition-all duration-700 opacity-70 scale-[0.98]",
          nextCard.bgStack1,
        )}
      />

      <AnimatePresence mode="popLayout" initial={false}>
        <SwipeCardContent
          key={currentIndex}
          card={currentCard}
          currentIndex={currentIndex}
          totalCards={parsedCards.length}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </AnimatePresence>
    </div>
  );
};

export default function AuthPage({ slug }: { slug?: string }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const tabDirectionRef = useRef<1 | -1>(1);

  type CarPhase = "ltr" | "pause" | "empty";
  const [carPhase, setCarPhase] = useState<CarPhase>("ltr");
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.src = brsLogoSlider;
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (carPhase === "ltr") {
      t = setTimeout(() => setCarPhase("pause"), 2200);
    } else if (carPhase === "pause") {
      t = setTimeout(() => setCarPhase("empty"), 5000);
    } else {
      t = setTimeout(() => { setCarPhase("ltr"); setMsgIndex(0); }, 20000);
    }
    return () => clearTimeout(t);
  }, [carPhase]);

  useEffect(() => {
    if (carPhase !== "pause") return;
    let i = 0;
    const iv = setInterval(() => {
      i = (i + 1) % 3;
      setMsgIndex(i);
    }, 1600);
    return () => clearInterval(iv);
  }, [carPhase]);

  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+91");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [constituencyOpen, setConstituencyOpen] = useState(false);
  const [constituencySearch, setConstituencySearch] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const [localUser, setLocalUser] = useState<any>(() => {
    const saved = localStorage.getItem("persona_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Use authUser if available, otherwise fallback to localUser
  // This ensures that as soon as the useQuery finishes, it takes precedence
  const loggedInUser = authUser || localUser;
  const [publicUser, setPublicUser] = useState<any>(null);
  const [lastLoadedSlug, setLastLoadedSlug] = useState<string | null>(null);

  // When viewing another persona, we want to make sure registration starts fresh
  // unless we are explicitly trying to "claim" or "edit" that persona (which requires PIN)
  const user = slug ? publicUser : loggedInUser;
  const isOtherPersona =
    slug && loggedInUser && loggedInUser.uniqueSlug !== slug;

  const fetchingSlugRef = useRef<string | null>(null);

  const DEFAULT_SLUG = "brs";

  useEffect(() => {
    // If not logged in and at root, redirect to the default brsparty profile
    if (!slug && !authUser && !isAuthLoading) {
      setLocation(`/${DEFAULT_SLUG}`);
      return;
    }

    // If we are switching from viewing a persona to the root path,
    // and we are NOT logged in, redirect to default instead of showing blank
    if (!slug && !authUser && publicUser) {
      setPublicUser(null);
      setLastLoadedSlug(null);
      setLocation(`/${DEFAULT_SLUG}`);
      return;
    }

    // Only fetch if the slug changed to a new slug we haven't loaded yet,
    // and no concurrent fetch is already in flight for this slug.
    if (slug && lastLoadedSlug !== slug && fetchingSlugRef.current !== slug) {
      fetchingSlugRef.current = slug;
      const isSelf = loggedInUser?.uniqueSlug === slug;
      fetch(`/api/user/slug/${slug}${isSelf ? "?self=true" : ""}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setPublicUser(data);
            // For unauthenticated visitors landing on the default profile, open in voice/swipe mode.
            // For all other cases, keep existing mode or switch to login.
            setMode((currentMode) => {
              if (currentMode === "swipe") return "swipe";
              if (!authUser && slug === DEFAULT_SLUG) return "swipe";
              return "login";
            });
            setLastLoadedSlug(slug);
            // Populate form with the fetched profile data
            Object.entries(data).forEach(([key, value]) => {
              if (value !== null && value !== undefined && key !== "password") {
                form.setValue(key as any, value);
              }
            });
            if (data.cards) {
              setSelectedCards(data.cards);
            }
          }
        })
        .finally(() => {
          fetchingSlugRef.current = null;
        });
    } else if (user && window.location.pathname === "/" && !slug) {
      // If we are logged in but at root, go to our own slug
      if (user.uniqueSlug) {
        setLocation(`/${user.uniqueSlug}`);
      }
    }
  }, [slug, setLocation, loggedInUser, lastLoadedSlug, authUser, isAuthLoading]);

  const trackClick = async (
    type: "insta" | "linkedin" | "whatsapp" | "website",
  ) => {
    if (!publicUser?.id) return;
    try {
      await apiRequest("POST", `/api/user/${publicUser.id}/click`, { type });
    } catch (err) {
      console.error("Failed to track click:", err);
    }
  };

  const getVoterId = () => {
    let id = localStorage.getItem("brs_voter_uuid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("brs_voter_uuid", id);
    }
    return id;
  };

  useEffect(() => {
    const profileId = user?.id;
    if (!profileId) return;
    setLocalLikeCount(user?.likeCount || 0);
    setLocalDislikeCount(user?.dislikeCount || 0);
    const stored = localStorage.getItem(`vote_anon_${profileId}`);
    if (stored) {
      setHasVoted(stored as "like" | "dislike");
    }
    const voterId = getVoterId();
    fetch(`/api/user/${profileId}/vote-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.vote) {
          setHasVoted(data.vote as "like" | "dislike");
          localStorage.setItem(`vote_anon_${profileId}`, data.vote);
        } else {
          setHasVoted(null);
        }
      })
      .catch(() => {});
  }, [user?.id, user?.likeCount, user?.dislikeCount, loggedInUser?.id]);

  const handleVote = async (type: "like" | "dislike") => {
    const profileId = user?.id;
    if (!profileId) return;
    if (hasVoted || voteLoading) return;
    setVoteLoading(true);
    const voterId = getVoterId();
    try {
      const res = await fetch(`/api/user/${profileId}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId }),
      });
      const data = await res.json();
      if (data.likeCount !== undefined) setLocalLikeCount(data.likeCount);
      if (data.dislikeCount !== undefined) setLocalDislikeCount(data.dislikeCount);
      const voted = data.alreadyVoted ? (data.vote ?? type) : type;
      setHasVoted(voted);
      localStorage.setItem(`vote_anon_${profileId}`, voted);
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setVoteLoading(false);
    }
  };

  const onSubmit = async (values: InsertUser) => {
    try {
      let result;
      const isRegistering = mode === "register" && !loggedInUser;
      const isCustomizing = mode === "customize";
      const isUpdatingProfile = !!loggedInUser?.id;

      if (isUpdatingProfile) {
        // If logged in and viewing own profile, update data
        const { id, password, createdAt, uniqueSlug, ...updateData } =
          values as any;
        const payload = {
          ...updateData,
          cards: selectedCards.filter(
            (c): c is string =>
              typeof c === "string" && c !== "null" && c !== "",
          ),
        };
        result = await updateProfileMutation.mutateAsync(payload);
      } else if (mode === "login") {
        result = await loginMutation.mutateAsync(values);
      } else if (isRegistering || isCustomizing) {
        const payload = {
          ...values,
          cards: selectedCards.filter(
            (c): c is string =>
              typeof c === "string" && c !== "null" && c !== "",
          ),
        };
        result = await registerMutation.mutateAsync(payload);
      }

      if (result) {
        setLocalUser(result);
        localStorage.setItem("persona_user", JSON.stringify(result));
        localStorage.setItem("persona_user_id", result.id);

        // If it's a new registration or missing pin, show the PIN setup dialog
        if (isRegistering || (isCustomizing && !result.pin && !isUpdatingProfile)) {
          setShowHomeDialog(true);
          setMode("login");
        } else if (result.uniqueSlug && (isCustomizing || isRegistering) && (result.pin || isUpdatingProfile)) {
          // If we were in customize mode and have a pin (or are updating an existing profile), show QR
          setShowQRDialog(true);
          setMode("login");
          // Also redirect to the profile after a short delay or when they close
          setTimeout(() => {
            setLocation(`/${result.uniqueSlug}`);
          }, 500);
        } else if (isUpdatingProfile) {
          // For profile updates of logged in users, just stay on login/dashboard view
          setMode("login");
        } else {
          // For other cases (like login)
          setMode("login");
          if (result.uniqueSlug && (isRegistering || isCustomizing)) {
            setLocation(`/${result.uniqueSlug}`);
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const [selectedCards, setSelectedCards] = useState<string[]>(() => {
    // Get initial cards from the current user being viewed
    const currentUser = slug ? null : loggedInUser;
    return currentUser?.cards || [];
  });

  useEffect(() => {
    // Sync selectedCards whenever user data changes
    if (publicUser?.cards) {
      setSelectedCards(publicUser.cards);
    } else if (user?.cards) {
      setSelectedCards(user.cards);
    } else if (!user?.cards && user) {
      // If user exists but has no cards, set empty array
      setSelectedCards([]);
    }
  }, [publicUser?.cards, user?.cards, publicUser, user]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const { language: appLanguage, setLanguage: handleLanguageChange, t } = useLanguage();
  const LANG_OPTIONS: { code: "en" | "te" | "hi" | "ur"; label: string; native: string }[] = [
    { code: "en", label: "English", native: "EN" },
    { code: "te", label: "Telugu", native: "తె" },
    { code: "hi", label: "Hindi", native: "हि" },
    { code: "ur", label: "Urdu", native: "اردو" },
  ];

  type NearbyVoice = {
    name: string | null;
    role: string | null;
    uniqueSlug: string | null;
    avatarUrl?: string | null;
    locationName?: string | null;
    industry?: string | null;
    distanceKm: number | null;
  };
  const [showNearbyDropdown, setShowNearbyDropdown] = useState(false);
  const [nearbyVoices, setNearbyVoices] = useState<NearbyVoice[]>([]);
  const [constituencyVoices, setConstituencyVoices] = useState<NearbyVoice[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [nearbyLocationLabel, setNearbyLocationLabel] = useState<string | null>(null);
  const [nearbyDetectedDistrict, setNearbyDetectedDistrict] = useState<string | null>(null);
  const [nearbyRegionalCard, setNearbyRegionalCard] = useState<typeof featuredProfiles[0] | null>(null);

  const reverseGeocode = async (lat: number, lng: number): Promise<{ display: string; district: string }> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
        { headers: { "User-Agent": "BRS-Connect/1.0" } }
      );
      const data = await res.json();
      const addr = data.address || {};
      const village = addr.village || addr.suburb || addr.town || addr.city_block || "";
      const city = addr.city || addr.town || addr.municipality || "";
      const district = addr.county || addr.state_district || addr.district || "";
      const state = addr.state || "";
      const parts = [village || city, district].filter(Boolean);
      const display = parts.length > 0 ? parts.join(", ") : (state || "India");
      return { display, district: district || city || village || "" };
    } catch {
      return { display: "", district: "" };
    }
  };

  const fetchNearbyByCoords = async (lat: number, lng: number, locationDisplay: string | null, district: string | null) => {
    if (locationDisplay) setNearbyLocationLabel(locationDisplay);
    if (district) setNearbyDetectedDistrict(district);

    if (district) {
      const districtLower = district.toLowerCase();
      const match = featuredProfiles.find((p) => {
        const nameLower = (p.name || "").toLowerCase();
        const industryLower = (p.industry || "").toLowerCase();
        return nameLower.includes(districtLower) || industryLower.includes(districtLower) ||
          districtLower.includes(nameLower.replace(/^brs\s*/i, "").trim());
      });
      if (match) setNearbyRegionalCard(match);
    }

    if (user?.id) {
      await fetch(`/api/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, locationName: locationDisplay || null }),
      });
    }

    const excludeSlug = user?.uniqueSlug || "";
    const districtParam = district ? `&district=${encodeURIComponent(district)}` : "";
    const res = await fetch(`/api/users/nearby?lat=${lat}&lng=${lng}&radius=75${excludeSlug ? `&exclude=${excludeSlug}` : ""}${districtParam}`);
    if (!res.ok) throw new Error("Failed to fetch nearby users");
    const data = await res.json();
    setNearbyVoices(data.users || []);
    setConstituencyVoices(data.constituencyVoices || []);
  };

  const getLocationByIP = async (): Promise<{ lat: number; lng: number; display: string; district: string | null }> => {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("IP location unavailable");
    const data = await res.json();
    if (!data.latitude || !data.longitude) throw new Error("No coordinates from IP");
    const city = data.city || "";
    const region = data.region || "";
    const display = [city, region].filter(Boolean).join(", ");
    return {
      lat: data.latitude,
      lng: data.longitude,
      display: display ? `${display} (approx.)` : "Approximate location",
      district: city || region || null,
    };
  };

  const handleNearbyVoices = async () => {
    if (showNearbyDropdown) {
      setShowNearbyDropdown(false);
      return;
    }
    setNearbyError(null);
    setNearbyLoading(true);
    setShowNearbyDropdown(true);
    setNearbyVoices([]);
    setConstituencyVoices([]);
    setNearbyLocationLabel(null);
    setNearbyDetectedDistrict(null);
    setNearbyRegionalCard(null);

    const fallbackToIP = async () => {
      try {
        const { lat, lng, display, district } = await getLocationByIP();
        await fetchNearbyByCoords(lat, lng, display, district);
      } catch {
        setNearbyError("Could not determine your location.");
      } finally {
        setNearbyLoading(false);
      }
    };

    if (!navigator.geolocation) {
      await fallbackToIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const { display: locationDisplay, district } = await reverseGeocode(lat, lng);
          await fetchNearbyByCoords(lat, lng, locationDisplay, district);
        } catch {
          setNearbyError("Could not load nearby voices.");
        } finally {
          setNearbyLoading(false);
        }
      },
      async () => {
        await fallbackToIP();
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };
  const [newPinValue, setNewPinValue] = useState("");

  const updatePinMutation = useMutation({
    mutationFn: async (newPin: string) => {
      const res = await apiRequest("PATCH", `/api/user/${user?.id}`, {
        pin: newPin,
      });
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/me"], updatedUser);
      toast({
        title: "Success",
        description: "PIN updated successfully",
      });
      setIsEditingPin(false);
      setNewPinValue("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update PIN",
        variant: "destructive",
      });
    },
  });

  const handlePinUpdate = () => {
    if (newPinValue.length !== 5) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 5 digits",
        variant: "destructive",
      });
      return;
    }
    updatePinMutation.mutate(newPinValue);
  };
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#ffffff");
  const professionalAvatars = [avatarKcr, avatarKtr, avatarFist, avatarBrsCar];

  const normalizeAvatarUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith("data:")) return url;
    if (url.includes("kcr")) return avatarKcr;
    if (url.includes("ktr")) return avatarKtr;
    if (url.includes("telangana-fist") || url.includes("fist")) return avatarFist;
    if (url.includes("brs-car") || url.includes("brsCar")) return avatarBrsCar;
    return url;
  };

  // Detect iOS / Safari so we can use share-sheet instead of anchor download
  const isIOSSafari = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // Safari-safe image download: share as File on iOS, anchor-click elsewhere
  const downloadPng = async (dataUrl: string, filename: string, shareTitle: string) => {
    if (isIOSSafari() && navigator.share) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: shareTitle });
          return;
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") console.warn("Share failed, falling back:", e);
      }
    }
    // Fallback: open in new tab (Safari) or trigger anchor download (Chrome/Firefox)
    if (isIOSSafari()) {
      const w = window.open();
      if (w) { w.document.write(`<img src="${dataUrl}" style="max-width:100%">`); return; }
    }
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  // Converts any image src (URL or data URL) to a base64 data URL via fetch+FileReader.
  // This avoids canvas-taint issues on mobile (iOS Safari) that occur with crossOrigin canvas tricks.
  const toBase64 = async (src: string): Promise<string> => {
    if (!src) return "";
    if (src.startsWith("data:")) return src;
    try {
      const cacheBust = src.includes("?") ? `&_cb=${Date.now()}` : `?_cb=${Date.now()}`;
      const resp = await fetch(src + cacheBust);
      const blob = await resp.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return src;
    }
  };

  const [avatarUrl, setAvatarUrl] = useState(professionalAvatars[0]);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>("");
  const [avatarConverting, setAvatarConverting] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Sync avatarUrl with the logged-in user's stored avatar when user data loads
  useEffect(() => {
    if (loggedInUser?.avatarUrl) {
      setAvatarUrl(normalizeAvatarUrl(loggedInUser.avatarUrl) || professionalAvatars[0]);
    }
  }, [loggedInUser?.id]);

  // Compress an uploaded image to ≤200×200 and return a data URL
  const compressImageToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const MAX = 200;
          const scale = Math.min(MAX / img.width, MAX / img.height, 1);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

  const persistAvatar = async (newUrl: string) => {
    if (!loggedInUser?.id) return;
    await apiRequest("PATCH", `/api/user/${loggedInUser.id}`, { avatarUrl: newUrl });
    // Update TanStack Query cache for /api/me
    queryClient.setQueryData(["/api/me"], (old: any) => old ? { ...old, avatarUrl: newUrl } : old);
    // Update publicUser state so the home page card re-renders immediately
    setPublicUser((old: any) => old ? { ...old, avatarUrl: newUrl } : old);
    // Update loggedInUser local state
    setLocalUser((old: any) => old ? { ...old, avatarUrl: newUrl } : old);
    // Also update localStorage-cached user
    try {
      const saved = localStorage.getItem("persona_user");
      if (saved) {
        localStorage.setItem("persona_user", JSON.stringify({ ...JSON.parse(saved), avatarUrl: newUrl }));
      }
    } catch {}
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImageToDataUrl(file);
    setAvatarUrl(dataUrl);
    setShowAvatarDialog(false);
    await persistAvatar(dataUrl);
    e.target.value = "";
  };

  const selectPresetAvatar = async (src: string) => {
    setAvatarUrl(src);
    setShowAvatarDialog(false);
    await persistAvatar(src);
  };

  const removeAvatar = async () => {
    setAvatarUrl(professionalAvatars[0]);
    setShowAvatarDialog(false);
    if (!loggedInUser?.id) return;
    await apiRequest("PATCH", `/api/user/${loggedInUser.id}`, { avatarUrl: null });
    queryClient.setQueryData(["/api/me"], (old: any) => old ? { ...old, avatarUrl: null } : old);
    try {
      const saved = localStorage.getItem("persona_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed.avatarUrl;
        localStorage.setItem("persona_user", JSON.stringify(parsed));
      }
    } catch {}
  };

  // Convert avatar to base64 data URL whenever it changes so html-to-image can embed it.
  // Uses fetch+FileReader instead of canvas to avoid iOS Safari canvas-taint issues.
  useEffect(() => {
    let cancelled = false;
    setAvatarConverting(true);
    toBase64(avatarUrl).then((dataUrl) => {
      if (!cancelled) {
        setAvatarDataUrl(dataUrl);
        setAvatarConverting(false);
      }
    });
    return () => { cancelled = true; };
  }, [avatarUrl]);

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const [qrLayout, setQrLayout] = useState<"standard" | "compact" | "minimal">(
    "standard",
  );

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState<number>(0);
  const [localDislikeCount, setLocalDislikeCount] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState<"like" | "dislike" | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [showPamphletDialog, setShowPamphletDialog] = useState(false);
  const [isCapturingPamphlet, setIsCapturingPamphlet] = useState(false);
  const [pamphletBgImage, setPamphletBgImage] = useState<string | null>(null);
  const [pamphletTheme, setPamphletTheme] = useState(CAMPAIGN_THEMES[0]);
  const [pamphletPostImages, setPamphletPostImages] = useState<Record<number, string>>({});
  const [pamphletCardSizes, setPamphletCardSizes] = useState<Record<number, {w: number; h: number}>>({});
  const [pamphletResizingId, setPamphletResizingId] = useState<string | null>(null);
  const [pamphletStickers, setPamphletStickers] = useState<Array<{id: string; e: string; x: number; y: number; size: number; color?: string; bold?: boolean}>>([]);
  const [showStickerTray, setShowStickerTray] = useState(false);
  const [bottomSheetCollapsed, setBottomSheetCollapsed] = useState(false);
  const [stickerCategory, setStickerCategory] = useState(0);
  const [activePamphletPostIdx, setActivePamphletPostIdx] = useState<number | null>(null);
  const [pamphletGalleryImages, setPamphletGalleryImages] = useState<Array<{id: string; src: string; x: number; y: number; w: number; h: number}>>([]);
  const [pamphletTextCards, setPamphletTextCards] = useState<Array<{id: string; text: string; x: number; y: number; w: number; fontSize: number; color: string; bold: boolean}>>([]);
  const [editingTextCardId, setEditingTextCardId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [pamphletDateBlocks, setPamphletDateBlocks] = useState<Array<{ id: string; x: number; y: number; date: Date; mode: "all" | "month" | "year" | "count"; count?: number }>>([]);
  const [pamphletBABlocks, setPamphletBABlocks] = useState<Array<{ id: string; label: "before" | "after"; x: number; y: number }>>([]);
  const [editingDateBlockId, setEditingDateBlockId] = useState<string | null>(null);
  const [datePickerMonth, setDatePickerMonth] = useState(() => new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"all" | "month" | "year" | "count">("all");
  const [showAllYearPicker, setShowAllYearPicker] = useState(false);
  const [datePickerCount, setDatePickerCount] = useState<number>(100);
  const [pamphletQrSize, setPamphletQrSize] = useState(92);
  const [xpostPickerIdx, setXpostPickerIdx] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showScannerDialog, setShowScannerDialog] = useState(false);
  const [scannerTab, setScannerTab] = useState<"scan" | "code">("scan");
  const [showNavToggle, setShowNavToggle] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isTradersExpanded, setIsTradersExpanded] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [showTradersModal, setShowTradersModal] = useState(false);
  const [voiceCardSearch, setVoiceCardSearch] = useState("");
  const [adminFeaturedSlugs, setAdminFeaturedSlugs] = useState<string[]>([]);
  const [featuredProfiles, setFeaturedProfiles] = useState<any[]>([]);
  const [showAddProfileDialog, setShowAddProfileDialog] = useState(false);
  const [addProfileSearch, setAddProfileSearch] = useState("");
  const [addProfileResult, setAddProfileResult] = useState<any | "not_found" | null>(null);
  const [addProfileLoading, setAddProfileLoading] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{ id: string; title: string; description: string; date: string; time?: string; location?: string } | null>(null);
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: "", time: "", location: "" });
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("/api/featured-slugs")
      .then((r) => r.ok ? r.json() : { slugs: [] })
      .then(({ slugs }) => setAdminFeaturedSlugs(slugs || []))
      .catch(() => setAdminFeaturedSlugs([]));
  }, []);

  useEffect(() => {
    if (adminFeaturedSlugs.length === 0) { setFeaturedProfiles([]); return; }
    Promise.all(
      adminFeaturedSlugs.map((s) =>
        fetch(`/api/user/slug/${s}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
      )
    ).then((profiles) => setFeaturedProfiles(profiles.filter(Boolean)));
  }, [adminFeaturedSlugs]);

  const saveFeaturedSlugsToServer = async (slugs: string[]) => {
    try {
      await fetch("/api/featured-slugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs }),
      });
    } catch (e) {
      console.error("Failed to save featured slugs", e);
    }
  };

  const addFeaturedSlug = (slug: string) => {
    if (adminFeaturedSlugs.includes(slug)) return;
    const updated = [...adminFeaturedSlugs, slug];
    setAdminFeaturedSlugs(updated);
    saveFeaturedSlugsToServer(updated);
    setShowAddProfileDialog(false);
    setAddProfileSearch("");
    setAddProfileResult(null);
  };

  const removeFeaturedSlug = (slug: string) => {
    const updated = adminFeaturedSlugs.filter((s) => s !== slug);
    setAdminFeaturedSlugs(updated);
    saveFeaturedSlugsToServer(updated);
  };

  const searchAdminProfile = async () => {
    if (!addProfileSearch.trim()) return;
    setAddProfileLoading(true);
    setAddProfileResult(null);
    try {
      const res = await fetch(`/api/user/slug/${addProfileSearch.trim().toLowerCase()}`);
      if (!res.ok) { setAddProfileResult("not_found"); return; }
      const data = await res.json();
      setAddProfileResult(data);
    } catch {
      setAddProfileResult("not_found");
    } finally {
      setAddProfileLoading(false);
    }
  };

  const { data: eventsData, isLoading: eventsLoading } = useQuery<any[]>({
    queryKey: ["/api/events"],
    refetchInterval: 60000,
  });

  const activeEvents = (eventsData || []).filter((e) => {
    const today = new Date().toISOString().split("T")[0];
    return e.date >= today;
  });

  const createEventMutation = useMutation({
    mutationFn: (data: typeof eventForm) => apiRequest("POST", "/api/events", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/events"] }); closeEventDialog(); },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof eventForm> }) => apiRequest("PATCH", `/api/events/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/events"] }); closeEventDialog(); },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/events"] }),
  });

  const openCreateEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: "", description: "", date: "", time: "", location: "" });
    setShowEventDialog(true);
  };

  const openEditEvent = (ev: any) => {
    setEditingEvent(ev);
    setEventForm({ title: ev.title, description: ev.description || "", date: ev.date, time: ev.time || "", location: ev.location || "" });
    setShowEventDialog(true);
  };

  const closeEventDialog = () => {
    setShowEventDialog(false);
    setEditingEvent(null);
    setEventForm({ title: "", description: "", date: "", time: "", location: "" });
  };

  const submitEventForm = () => {
    if (!eventForm.title.trim() || !eventForm.date) return;
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data: eventForm });
    } else {
      createEventMutation.mutate(eventForm);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isAtBottom = documentHeight - currentScrollY - windowHeight < 100;
      const isScrollingDown = currentScrollY > lastScrollY;

      setShowMobileNav(isAtBottom && showNavToggle);
      setIsScrolledToBottom(isAtBottom);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, showNavToggle]);
  const personaCardRef = useRef<HTMLDivElement>(null);
  const tradersRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "events" | "connect">(
    "notes",
  );
  const [connections, setConnections] = useState<
    { name: string; industry: string; slug: string; expiresAt: string }[]
  >([]);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/user/${user.id}/connections`)
        .then((res) => res.json())
        .then((data) => setConnections(data))
        .catch(console.error);
    }
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isTradersExpanded &&
        tradersRef.current &&
        !tradersRef.current.contains(event.target as Node)
      ) {
        setIsTradersExpanded(false);
      }
    };

    if (isTradersExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isTradersExpanded]);

  useEffect(() => {
    const handleScroll = () => {
      if (personaCardRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          personaCardRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setShowNavToggle(isAtBottom);
      }
    };

    const ref = personaCardRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll);
      return () => ref.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    // Only save connections for logged-in users visiting someone else's profile
    if (
      authUser &&
      isOtherPersona &&
      publicUser &&
      authUser.uniqueSlug !== publicUser.uniqueSlug
    ) {
      apiRequest("POST", "/api/user/connect", {
        userId: authUser.id,
        targetSlug: publicUser.uniqueSlug,
      })
        .then(() => {
          fetch(`/api/user/${authUser.id}/connections`)
            .then((res) => res.json())
            .then((data) => setConnections(data));
        })
        .catch(console.error);
    }
  }, [isOtherPersona, authUser, publicUser]);

  const getRemainingTime = (expiresAt: string) => {
    if (!expiresAt) return "48H";
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    if (diffMs <= 0) return "0H";
    const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
    return `${diffHrs}H`;
  };
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugValue, setSlugValue] = useState(user?.uniqueSlug || "");

  const [isSlugTaken, setIsSlugTaken] = useState(false);

  const checkSlugMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await apiRequest("GET", `/api/user/check-slug/${slug}`);
      return res.json();
    },
    onSuccess: (data) => {
      setIsSlugTaken(data.taken);
    },
  });

  const [displaySlug, setDisplaySlug] = useState<string>("");

  const updateSlugMutation = useMutation({
    mutationFn: async (newSlug: string) => {
      const res = await apiRequest("PATCH", "/api/user/slug", {
        uniqueSlug: newSlug,
        userId: user?.id,
      });
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/me"], updatedUser);
      setIsEditingSlug(false);
      setDisplaySlug(updatedUser.uniqueSlug);
      toast({
        title: "Success",
        description: "Persona code updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSlug = async () => {
    if (slugValue === user?.uniqueSlug) {
      setIsEditingSlug(false);
      return;
    }
    try {
      await updateSlugMutation.mutateAsync(slugValue);
      setIsEditingSlug(false);
      setShowQRDialog(true);
    } catch (error) {
      console.error("Failed to update persona code:", error);
    }
  };
  const [notes, setNotes] = useState<
    { id: string; text: string; completed: boolean; expiresAt: string }[]
  >([]);
  const [newNote, setNewNote] = useState("");

  // Sync displaySlug with user whenever user changes
  useEffect(() => {
    if (user?.uniqueSlug) {
      setDisplaySlug(user.uniqueSlug);
    }
  }, [user?.uniqueSlug]);

  // Sync notes from user object
  useEffect(() => {
    if (user?.notes) {
      setNotes(user.notes);
    }
  }, [user?.notes]);

  // Auto-expire notes
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setNotes((prev) => {
        const filtered = prev.filter((note) => new Date(note.expiresAt) > now);
        if (filtered.length !== prev.length && user) {
          updateProfileMutation.mutate({ notes: filtered });
        }
        return filtered;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [user]);

  const addNote = () => {
    if (!newNote.trim() || notes.length >= 5) return;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const note = {
      id: Math.random().toString(36).substr(2, 9),
      text: newNote,
      completed: false,
      expiresAt,
    };
    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    setNewNote("");
    if (user) {
      updateProfileMutation.mutate({ notes: updatedNotes });
    }
  };

  const toggleNote = (id: string) => {
    const updatedNotes = notes.map((n) =>
      n.id === id ? { ...n, completed: !n.completed } : n,
    );
    setNotes(updatedNotes);
    if (user) {
      updateProfileMutation.mutate({ notes: updatedNotes });
    }
  };

  const getTimerColor = (expiresAt: string) => {
    const hoursLeft =
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft > 12) return "text-green-400";
    if (hoursLeft > 3) return "text-white";
    return "text-red-500 font-bold";
  };

  const formatTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };
  const [showHomeDialog, setShowHomeDialog] = useState(false);
  const [homeSlugEditing, setHomeSlugEditing] = useState(false);
  const [homeSlugValue, setHomeSlugValue] = useState("");
  const [homeSlugStatus, setHomeSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [showPersonaDialog, setShowPersonaDialog] = useState(false);
  const [personaSlug, setPersonaSlug] = useState("");
  const [personaPin, setPersonaPin] = useState("");
  const [personaCode, setPersonaCode] = useState("");
  const [pin, setPin] = useState("");
  const [verifyPin, setVerifyPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Debounced slug availability check for home dialog
  useEffect(() => {
    if (!homeSlugEditing) return;
    if (!homeSlugValue || homeSlugValue === user?.uniqueSlug) {
      setHomeSlugStatus("idle");
      return;
    }
    if (homeSlugValue.length < 3) {
      setHomeSlugStatus("idle");
      return;
    }
    setHomeSlugStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/user/check-slug/${homeSlugValue}`);
        const data = await res.json();
        setHomeSlugStatus(data.taken ? "taken" : "available");
      } catch {
        setHomeSlugStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [homeSlugValue, homeSlugEditing, user?.uniqueSlug]);

  const handleScan = async (data: string | null) => {
    if (data) {
      // The QR code contains the URL like "https://domain.com/slug" or just "slug"
      const slug = data.split("/").pop() || data;

      if (user?.id) {
        try {
          // Connect first
          await apiRequest("POST", "/api/user/connect", {
            userId: user.id,
            targetSlug: slug,
          });

          // Then refresh connections
          const res = await fetch(`/api/user/${user.id}/connections`);
          const updatedConnections = await res.json();
          setConnections(updatedConnections);

          toast({
            title: "Connected!",
            description: `Added ${slug} to your connections.`,
          });
        } catch (err) {
          console.error("Connect error during scan:", err);
        }
      }

      setLocation(`/${slug}`);
      setShowScannerDialog(false);
    }
  };

  const qrRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pamphletBgInputRef = useRef<HTMLInputElement>(null);
  const pamphletPostImgRef = useRef<HTMLInputElement>(null);
  const pamphletGalleryInputRef = useRef<HTMLInputElement>(null);
  const pamphletCanvasRef = useRef<HTMLDivElement>(null);

  // Preload all videos when component mounts for instant playback
  useEffect(() => {
    const videoUrls = ["/1.mp4", "/2.mp4", "/3.mp4", "/4.mp4"];
    videoUrls.forEach((url) => {
      const video = document.createElement("video");
      video.src = url;
      video.preload = "auto";
      video.load();
    });
  }, []);

  useEffect(() => {
    let controls: any = null;
    let isMounted = true;
    const codeReader = new BrowserMultiFormatReader();

    const startScanner = async () => {
      if (showScannerDialog && scannerTab === "scan" && videoRef.current) {
        try {
          const ctrl = await codeReader.decodeFromVideoDevice(
            null,
            videoRef.current,
            async (result, err) => {
              if (result && isMounted) {
                const text = result.getText();
                const slug = text.includes("/") ? text.split("/").pop() : text;
                if (slug) {
                  // Verify if persona exists on backend before navigating
                  try {
                    const res = await fetch(`/api/user/slug/${slug}`);
                    if (res.ok) {
                      setLocation(`/${slug}`);
                      setShowScannerDialog(false);
                      toast({
                        title: "QR Code Scanned",
                        description: `Loading persona: ${slug}`,
                      });
                    } else {
                      toast({
                        title: "Not Found",
                        description: "Scanned persona does not exist.",
                        variant: "destructive",
                      });
                    }
                  } catch (e) {
                    console.error("Scan verification error:", e);
                  }
                }
              }
            },
          );

          if (!isMounted || !showScannerDialog || scannerTab !== "scan") {
            if (ctrl && typeof ctrl.stop === "function") {
              ctrl.stop();
            }
          } else {
            controls = ctrl;
          }
        } catch (err) {
          console.error("Scanner error:", err);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (controls) {
        if (typeof controls.stop === "function") {
          controls.stop();
        }
      }
      codeReader.reset();
    };
  }, [showScannerDialog, scannerTab, setLocation, toast]);

  useEffect(() => {
    if (user && !publicUser) {
      // Check if we need to update form values from the authenticated user
      const currentValues = form.getValues();

      Object.entries(user).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== "password") {
          if (currentValues[key as keyof InsertUser] !== value) {
            form.setValue(key as any, value);
          }
        }
      });

      if (
        user.cards &&
        JSON.stringify(user.cards) !== JSON.stringify(selectedCards)
      ) {
        setSelectedCards(user.cards);
      }

      // Keep local storage in sync with the latest auth data
      if (!isOtherPersona) {
        localStorage.setItem("persona_user", JSON.stringify(user));
        localStorage.setItem("persona_user_id", user.id);
      }
    }
  }, [user, publicUser, isOtherPersona]);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isPending = loginMutation.isPending || registerMutation.isPending;

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      password: "",
      name: user?.name || "",
      role: user?.role || "people",
      bio: user?.bio || "Voice of the People. Strength of the Nation.",
      instagram: user?.instagram || "",
      linkedin: user?.linkedin || "",
      whatsapp: user?.whatsapp || "",
      website: user?.website || "",
      youtube: (user as any)?.youtube || "",
      cards: user?.cards || [],
    },
  });

  const handleVerifyPersona = async () => {
    if (!personaSlug) {
      toast({
        title: "Error",
        description: "Please enter a persona code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // First check if persona exists on backend
      const checkRes = await fetch(`/api/user/slug/${personaSlug}`);
      if (!checkRes.ok) {
        toast({
          title: "Not Found",
          description: "Voice code doesn't exist.",
          variant: "destructive",
        });
        setIsVerifying(false);
        return;
      }

      // If no pin is provided, we're just loading public data
      if (!personaPin) {
        setLocation(`/${personaSlug}`);
        setShowScannerDialog(false);
        setShowPersonaDialog(false);
        return;
      }

      const res = await apiRequest("POST", "/api/auth/verify-persona", {
        slug: personaSlug,
        pin: personaPin,
      });
      const userData = await res.json();

      // Update local state and cache
      setLocalUser(userData);
      queryClient.setQueryData(["/api/me"], userData);

      localStorage.setItem("persona_user", JSON.stringify(userData));
      localStorage.setItem("persona_user_id", userData.id);

      toast({
        title: "Success",
        description: `Verified persona: ${userData.name}`,
      });
      setShowPersonaDialog(false);
      setShowScannerDialog(false);
      setLocation(`/${userData.uniqueSlug}`);
    } catch (err) {
      toast({
        title: "Verification failed",
        description: "Invalid persona code or pin",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  const logout = () => {
    localStorage.removeItem("persona_user");
    localStorage.removeItem("persona_user_id");
    setLocalUser(null);
    queryClient.setQueryData(["/api/me"], null);
    setLocation("/");
  };
  const shareQR = async () => {
    if (avatarConverting) {
      toast({ title: "Please wait", description: "Avatar is still loading, try again in a moment." });
      return;
    }

    const element = document.getElementById("qr-fullscreen-wallpaper");
    if (!element) {
      toast({ title: "Error", description: "QR element not found", variant: "destructive" });
      return;
    }

    try {
      // Use the same avatar source logic as the QR card template
      const actualAvatarSrc = normalizeAvatarUrl(user?.avatarUrl || loggedInUser?.avatarUrl) || avatarUrl;

      // Convert the actual displayed avatar to base64 using fetch+FileReader.
      // This works on mobile (iOS Safari) where canvas-taint prevents toDataURL().
      const freshDataUrl = await toBase64(actualAvatarSrc);
      setAvatarDataUrl(freshDataUrl);

      // Hide UI controls so they don't appear in the wallpaper
      setIsCapturing(true);
      // Wait for React to re-render and the browser to paint the new avatar.
      // 300ms gives mobile devices enough time to fully render the base64 image.
      await new Promise<void>((resolve) => setTimeout(resolve, 300));

      const captureOpts = {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: true,
        filter: (node: HTMLElement) => {
          if (node.tagName === "LINK" && (node as HTMLLinkElement).rel === "stylesheet") return false;
          return true;
        },
      };

      // Safari requires two renders — first pass primes the canvas, second is correct
      await htmlToImage.toPng(element, captureOpts);
      await new Promise<void>((resolve) => setTimeout(resolve, 150));
      const dataUrl = await htmlToImage.toPng(element, captureOpts);

      setIsCapturing(false);

      const filename = `brs-voice-card-${user?.uniqueSlug || "connect"}.png`;
      await downloadPng(dataUrl, filename, `BRS Connect — ${user?.name || "Profile"}`);

      toast({ title: "Saved!", description: "Voice card saved to your downloads." });
    } catch (err: any) {
      setIsCapturing(false);
      console.error("Download error:", err);
      toast({
        title: "Download failed",
        description: "Could not generate image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sharePamphlet = async () => {
    const element = document.getElementById("pamphlet-fullscreen");
    if (!element) return;
    try {
      const actualAvatarSrc = normalizeAvatarUrl(user?.avatarUrl || loggedInUser?.avatarUrl) || avatarUrl;
      const freshDataUrl = await toBase64(actualAvatarSrc);
      setAvatarDataUrl(freshDataUrl);
      setIsCapturingPamphlet(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 300));

      const captureOpts = {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: true,
        filter: (node: HTMLElement) => {
          if (node.tagName === "LINK" && (node as HTMLLinkElement).rel === "stylesheet") return false;
          return true;
        },
      };

      // Safari requires two renders — first pass primes the canvas, second is correct
      await htmlToImage.toPng(element, captureOpts);
      await new Promise<void>((resolve) => setTimeout(resolve, 150));
      const dataUrl = await htmlToImage.toPng(element, captureOpts);

      setIsCapturingPamphlet(false);

      const filename = `brs-campaign-${user?.uniqueSlug || "pamphlet"}.png`;
      const profileUrl = window.location.origin + "/" + (user?.uniqueSlug || loggedInUser?.uniqueSlug || "");
      const shareText = `${user?.name || loggedInUser?.name || "BRS"} — BRS Connect\n${profileUrl}`;

      // Try native share (mobile) — includes image + URL text for direct social sharing
      if (navigator.share) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], filename, { type: "image/png" });
          const shareData: ShareData = { files: [file], title: `BRS Campaign — ${user?.name || "Pamphlet"}`, text: shareText };
          if (navigator.canShare?.(shareData)) {
            await navigator.share(shareData);
            toast({ title: "Shared!", description: "Campaign pamphlet shared successfully." });
            return;
          }
        } catch (e: any) {
          if (e?.name === "AbortError") return;
          console.warn("Share with file failed, falling back:", e);
        }
      }

      // Fallback: plain download
      await downloadPng(dataUrl, filename, `BRS Campaign — ${user?.name || "Pamphlet"}`);
      toast({ title: "Downloaded!", description: "Campaign pamphlet saved to your downloads." });
    } catch (err: any) {
      setIsCapturingPamphlet(false);
      console.error("Pamphlet download error:", err);
      toast({ title: "Download failed", description: "Could not generate pamphlet. Please try again.", variant: "destructive" });
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertUser>) => {
      if (!user?.id) throw new Error("Not authenticated");
      const res = await apiRequest("PATCH", `/api/user/${user.id}`, data);
      return res.json();
    },
    onSuccess: (updatedUser, variables) => {
      queryClient.setQueryData(["/api/me"], updatedUser);
      setLocalUser(updatedUser);
      localStorage.setItem("persona_user", JSON.stringify(updatedUser));
      localStorage.setItem("persona_user_id", updatedUser.id);
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });

      // If we just set the pin, show QR
      if (updatedUser.pin && variables.pin) {
        setShowQRDialog(true);
      }

      // Silent update for notes or completed (checklist)
      const isSilentUpdate =
        "notes" in variables ||
        "cards" in variables ||
        "completed" in variables;
      if (!isSilentUpdate) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    },
    onError: (error: Error, variables) => {
      const isSilentUpdate = "notes" in variables || "cards" in variables;
      if (!isSilentUpdate) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  useEffect(() => {
    if (user && !publicUser) {
      // Check if we need to update form values from the authenticated user
      const currentValues = form.getValues();

      Object.entries(user).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== "password") {
          if (currentValues[key as keyof InsertUser] !== value) {
            form.setValue(key as any, value);
          }
        }
      });

      if (
        user.cards &&
        JSON.stringify(user.cards) !== JSON.stringify(selectedCards)
      ) {
        setSelectedCards(user.cards);
      }

      // Keep local storage in sync with the latest auth data
      if (!isOtherPersona) {
        localStorage.setItem("persona_user", JSON.stringify(user));
        localStorage.setItem("persona_user_id", user.id);
      }
    }
  }, [user, publicUser, isOtherPersona]);

  const [isPersonaExpanded, setIsPersonaExpanded] = useState(false);

  if (isAuthLoading && localStorage.getItem("persona_user_id")) {
    return (
      <div className="min-h-[100dvh] bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-mesh overflow-hidden relative">
      <div className="hidden" aria-hidden="true">
        {professionalAvatars.map((src, i) => (
          <img key={i} src={src} alt="" loading="eager" />
        ))}
        {featuredProfiles.map((p, i) =>
          normalizeAvatarUrl(p.avatarUrl) ? (
            <img key={`fp-${i}`} src={normalizeAvatarUrl(p.avatarUrl)!} alt="" loading="eager" />
          ) : null
        )}
        {loggedInUser?.avatarUrl && normalizeAvatarUrl(loggedInUser.avatarUrl) && (
          <img src={normalizeAvatarUrl(loggedInUser.avatarUrl)!} alt="" loading="eager" />
        )}
      </div>
      <div className="absolute inset-0 flex flex-col justify-start items-end p-12 pt-24 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : 20 }}
          className="space-y-3 pointer-events-auto mb-4 pr-2"
        >
          {loggedInUser ? (
            <div className="flex flex-col items-end gap-1.5">
              <button
                onClick={logout}
                className="flex items-center gap-3 p-1 pr-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all group ml-auto backdrop-blur-md shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover:border-pink-500/30 transition-colors">
                  <User className="w-4 h-4 text-pink-400/80 group-hover:text-pink-400 transition-colors" />
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs tracking-tight">
                      {loggedInUser.name || "Voice User"}
                    </span>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-black" strokeWidth={4} />
                    </div>
                  </div>
                  <span className="text-[8px] text-white/40 uppercase tracking-[0.2em] font-bold">
                    {t("logout")}
                  </span>
                </div>
              </button>

              <div className="w-full mt-1 space-y-3">
                <button
                  onClick={() => setIsPersonaExpanded(!isPersonaExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all group shrink-0"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-pink-400" />
                    <span className="font-bold text-[10px] tracking-widest uppercase">
                      BRS
                    </span>
                  </div>
                  {isPersonaExpanded ? (
                    <ChevronDown className="w-3 h-3 text-white/40 rotate-180 transition-transform" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-white/40 transition-transform" />
                  )}
                </button>

                <AnimatePresence>
                  {isPersonaExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[8px] text-white/40 uppercase tracking-widest font-bold">
                            Voice Code
                          </label>
                          <div className="flex items-center justify-between group/item gap-2">
                            {isEditingSlug ? (
                              <div className="flex-1 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                                <input
                                  type="text"
                                  value={slugValue}
                                  onChange={(e) => {
                                    setSlugValue(e.target.value);
                                    if (
                                      e.target.value !== loggedInUser.uniqueSlug
                                    ) {
                                      checkSlugMutation.mutate(e.target.value);
                                    } else {
                                      setIsSlugTaken(false);
                                    }
                                  }}
                                  className="flex-1 bg-transparent border-none text-xs font-mono text-white focus:outline-none"
                                  autoFocus
                                />
                                <div className="flex flex-col items-end gap-0.5">
                                  <button
                                    onClick={handleSaveSlug}
                                    disabled={
                                      updateSlugMutation.isPending ||
                                      isSlugTaken
                                    }
                                    className={clsx(
                                      "p-0.5 rounded-full transition-colors disabled:opacity-50",
                                      isSlugTaken
                                        ? "bg-red-500/20 text-red-400 cursor-not-allowed"
                                        : "bg-white/10 text-green-400 hover:text-green-300",
                                    )}
                                  >
                                    {updateSlugMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : isSlugTaken ? (
                                      <X className="w-3 h-3" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </button>
                                  {isSlugTaken && (
                                    <span className="text-[7px] text-red-400 uppercase tracking-tighter font-bold">
                                      Taken
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="text-xs font-mono text-white">
                                  {loggedInUser.uniqueSlug || "---"}
                                </span>
                                <button
                                  onClick={() => {
                                    setSlugValue(loggedInUser.uniqueSlug || "");
                                    setIsEditingSlug(true);
                                  }}
                                  className="p-1 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors opacity-0 group-hover/item:opacity-100"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[8px] text-white/40 uppercase tracking-widest font-bold">
                            Change PIN
                          </label>
                          <div className="flex items-center justify-between group/item">
                            {isEditingPin ? (
                              <div className="flex items-center gap-1.5 w-full">
                                <input
                                  type="text"
                                  maxLength={5}
                                  value={newPinValue}
                                  onChange={(e) =>
                                    setNewPinValue(
                                      e.target.value.replace(/\D/g, ""),
                                    )
                                  }
                                  placeholder="New PIN"
                                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-pink-500/50"
                                  autoFocus
                                />
                                <button
                                  onClick={handlePinUpdate}
                                  disabled={updatePinMutation.isPending}
                                  className="p-1 bg-pink-500/20 rounded-lg text-pink-400 hover:bg-pink-500/30 transition-colors disabled:opacity-50"
                                >
                                  {updatePinMutation.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setIsEditingPin(false);
                                    setNewPinValue("");
                                  }}
                                  className="p-1 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="text-xs tracking-[0.3em] text-white/60">
                                  •••••
                                </span>
                                <button
                                  onClick={() => setIsEditingPin(true)}
                                  className="p-1 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors opacity-0 group-hover/item:opacity-100"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reach & Analytics Window */}
                {(() => {
                  const history = [...(loggedInUser.reachHistory || [])].sort(
                    (a, b) => a.timestamp.localeCompare(b.timestamp),
                  );
                  const counts = history.map((h) => h.count);
                  const maxCount = Math.max(...counts, 1);
                  const minCount = Math.min(...counts, 0);
                  const lastEntry = history.length > 0 ? history[history.length - 1] : { count: 0 };
                  const prevEntry = history.length > 1 ? history[history.length - 2] : { count: 0 };
                  const isRising = lastEntry.count >= prevEntry.count;

                  const getPoints = () => {
                    const base = { count: 0 };
                    const allPts = [base, ...history];
                    const allCounts = allPts.map((h) => h.count);
                    const aMax = Math.max(...allCounts, 1);
                    const pts = allPts.map((h, i) => {
                      const x = (i / (allPts.length - 1)) * 100;
                      const y = 100 - (h.count / aMax) * 75 - 10;
                      return { x, y, count: h.count };
                    });
                    const pathData = pts.reduce((acc, p, i) => {
                      if (i === 0) return `M ${p.x},${p.y}`;
                      const prev = pts[i - 1];
                      const cp1x = prev.x + (p.x - prev.x) / 2;
                      return `${acc} C ${cp1x},${prev.y} ${cp1x},${p.y} ${p.x},${p.y}`;
                    }, "");
                    const areaData = `${pathData} L 100,100 L 0,100 Z`;
                    return { pathData, areaData, pts };
                  };
                  const { pathData, areaData, pts } = getPoints();

                  return (
                    <div className="rounded-2xl overflow-hidden border border-pink-500/30 shrink-0" style={{ background: "linear-gradient(145deg, rgba(20,4,12,0.95) 0%, rgba(40,6,22,0.95) 100%)" }}>
                      {/* Header strip */}
                      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_6px_#ec4899]" />
                          <span className="text-[9px] text-pink-400 uppercase tracking-[0.22em] font-black">{t("voiceReach")}</span>
                        </div>
                        <span className={`text-[9px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${isRising ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                          {isRising ? <TrendingUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                          {isRising ? t("rising") : t("slowing")}
                        </span>
                      </div>

                      {/* Reach count hero */}
                      <div className="px-4 pt-3 pb-1 flex items-end justify-between">
                        <div>
                          <p className="text-[8px] text-white/30 uppercase tracking-[0.18em] font-bold mb-0.5">{t("totalReach")}</p>
                          <p className="text-3xl font-black text-white leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {(loggedInUser.reachCount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-white/30 uppercase tracking-widest font-bold mb-0.5">{t("todaysReach")}</p>
                          <p className="text-sm font-bold text-pink-400">
                            {history
                              .filter((h) => new Date(h.timestamp).toDateString() === new Date().toDateString())
                              .reduce((sum, h) => sum + (h.count || 0), 0)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Chart */}
                      <div className="px-3 pt-2 pb-0">
                        <div className="h-16 w-full relative">
                          <svg
                            className="w-full h-full"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.02" />
                              </linearGradient>
                            </defs>
                            <motion.path
                              key={pathData}
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              d={pathData}
                              fill="none"
                              stroke="#ec4899"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <motion.path
                              key={`area-${areaData}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 1.4, delay: 0.3 }}
                              d={areaData}
                              fill="url(#reachGrad)"
                            />
                            {pts.map((p, i) => (
                              <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 2.5 : 1.5} fill="#ec4899" opacity={i === pts.length - 1 ? 1 : i === 0 ? 0.2 : 0.5} />
                            ))}
                          </svg>
                        </div>
                        <div className="flex justify-between px-0.5 pb-2">
                          <span className="text-[7px] text-white/20 uppercase font-bold">{t("start")}</span>
                          <span className="text-[7px] text-white/20 uppercase font-bold">{t("today")}</span>
                        </div>
                      </div>

                      {/* Social stats */}
                      <div className="grid grid-cols-4 gap-px border-t border-white/5">
                        {[
                          { label: "Insta", value: loggedInUser.instaClicks || 0, color: "text-pink-400" },
                          { label: "X", value: loggedInUser.linkedinClicks || 0, color: "text-white" },
                          { label: "WA", value: loggedInUser.whatsappClicks || 0, color: "text-emerald-400" },
                          { label: "Web", value: loggedInUser.websiteClicks || 0, color: "text-sky-400" },
                        ].map((stat) => (
                          <div key={stat.label} className="flex flex-col items-center gap-0.5 py-2.5 bg-white/2">
                            <span className={`text-sm font-black ${stat.color}`}>{stat.value}</span>
                            <span className="text-[7px] text-white/25 uppercase tracking-widest font-bold">{stat.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tips section */}
                      <div className="px-4 py-3 border-t border-white/5 space-y-2">
                        <p className="text-[8px] text-pink-400/70 uppercase tracking-[0.18em] font-black">{t("growYourReach")}</p>
                        <div className="space-y-1.5">
                          {[
                            t("tip1"),
                            t("tip2"),
                            t("tip3"),
                          ].map((tip, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1 h-1 rounded-full bg-pink-500 mt-1.5 shrink-0 shadow-[0_0_4px_#ec4899]" />
                              <p className="text-[9px] text-white/50 leading-relaxed">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowPersonaDialog(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all group ml-auto"
            >
              <User className="w-4 h-4 text-pink-400" />
              <span className="font-bold text-[10px] tracking-widest uppercase">
                {t("myBrs")}
              </span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center gap-1 mt-2 ml-auto">
            {LANG_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                data-testid={`button-lang-${lang.code}`}
                onClick={() => handleLanguageChange(lang.code)}
                title={lang.label}
                className={clsx(
                  "px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                  appLanguage === lang.code
                    ? "bg-pink-500/30 border-pink-400/60 text-pink-300"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
                )}
              >
                {lang.native}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
      <motion.div
        animate={{
          x: isMenuOpen ? "-80%" : "0%",
          scale: isMenuOpen ? 0.9 : 1,
          borderRadius: isMenuOpen ? "40px" : "0px",
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        onClick={() => isMenuOpen && setIsMenuOpen(false)}
        className={clsx(
          "min-h-[100dvh] bg-mesh flex flex-col items-center justify-center p-4 pt-16 pb-24-safe relative z-20",
          isMenuOpen ? "cursor-pointer select-none" : "",
        )}
      >
        <div
          className="absolute inset-0 bg-black/20 pointer-events-none opacity-0 transition-opacity duration-500"
          style={{ opacity: isMenuOpen ? 1 : 0 }}
        ></div>

        {/* Nearby Voices Button */}
        <button
          onClick={handleNearbyVoices}
          data-testid="button-nearby-voices"
          className="absolute top-8-safe right-16 z-50 p-2 group"
          title={t("nearbyVoices")}
        >
          <MapPin
            className={`w-5 h-5 transition-colors duration-200 ${showNearbyDropdown ? "text-pink-400" : "text-white/80 group-hover:text-white"}`}
          />
        </button>

        {/* Nearby Voices Dropdown */}
        {showNearbyDropdown && (
          <div
            className="absolute top-[calc(var(--safe-area-inset-top,0px)+56px)] right-4 z-[60] w-72 rounded-2xl bg-pink-500 shadow-2xl overflow-hidden"
            data-testid="nearby-voices-dropdown"
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm">{t("nearbyVoices")}</span>
                </div>
                {nearbyLocationLabel && (
                  <p className="text-white/80 text-[10px] mt-0.5 ml-6 leading-tight truncate max-w-[170px]">
                    📍 {nearbyLocationLabel}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowNearbyDropdown(false)}
                className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0"
                data-testid="button-close-nearby"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* BRS Regional Voice Card */}
            {nearbyRegionalCard && (
              <div className="px-2 pt-2">
                <p className="text-[9px] text-white/80 uppercase tracking-widest font-semibold px-2 mb-1.5">{t("yourLocalBrsVoice")}</p>
                <button
                  onClick={() => { setShowNearbyDropdown(false); setLocation("/" + nearbyRegionalCard.uniqueSlug); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white hover:bg-white/90 transition-colors text-left shadow-sm"
                  data-testid={`nearby-regional-card-${nearbyRegionalCard.uniqueSlug}`}
                >
                  <div className="w-9 h-9 rounded-full bg-pink-100 flex-shrink-0 overflow-hidden border-2 border-pink-300">
                    {nearbyRegionalCard.avatarUrl ? (
                      <img src={normalizeAvatarUrl(nearbyRegionalCard.avatarUrl) || ""} alt={nearbyRegionalCard.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-pink-600 font-bold text-sm">{(nearbyRegionalCard.name || "B").charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-semibold truncate">{nearbyRegionalCard.name}</p>
                    <p className="text-pink-500 text-[10px] truncate">
                      {ROLES.find((r) => r.value === nearbyRegionalCard.role)?.label || nearbyRegionalCard.role || "BRS"}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-pink-400 flex-shrink-0" />
                </button>
                <div className="mt-2 mx-2 border-t border-white/20" />
              </div>
            )}

            <div className="px-2 pb-3 pt-1">
              {nearbyLoading && (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span className="text-white text-sm">{t("findingVoices")}</span>
                </div>
              )}
              {!nearbyLoading && nearbyError && (
                <div className="text-center py-6 px-3">
                  <MapPin className="w-8 h-8 text-white/60 mx-auto mb-2" />
                  <p className="text-white/80 text-xs leading-relaxed">{nearbyError}</p>
                </div>
              )}
              {!nearbyLoading && !nearbyError && nearbyVoices.length === 0 && constituencyVoices.length === 0 && (
                <div className="text-center py-6 px-3">
                  <MapPin className="w-8 h-8 text-white/60 mx-auto mb-2" />
                  <p className="text-white/80 text-xs leading-relaxed">{t("noVoicesFound")}</p>
                </div>
              )}

              {/* Geo-nearby voices */}
              {!nearbyLoading && nearbyVoices.length > 0 && (
                <p className="text-[9px] text-white/80 uppercase tracking-widest font-semibold px-2 mb-1">
                  {nearbyVoices.length} {nearbyVoices.length !== 1 ? t("voicesNearYou") : t("voice")}
                </p>
              )}

              {/* Scrollable list — shows ~7 items, rest scrollable */}
              {!nearbyLoading && (nearbyVoices.length > 0 || constituencyVoices.length > 0) && (
                <div className="max-h-[392px] overflow-y-auto space-y-1.5 pr-0.5">
                  {nearbyVoices.map((voice, idx) => (
                    <button
                      key={voice.uniqueSlug || idx}
                      data-testid={`nearby-voice-${voice.uniqueSlug}`}
                      onClick={() => { setShowNearbyDropdown(false); setLocation("/" + voice.uniqueSlug); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white hover:bg-white/90 transition-colors text-left shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-full bg-pink-100 flex-shrink-0 overflow-hidden border-2 border-pink-200">
                        {normalizeAvatarUrl(voice.avatarUrl)
                          ? <img src={normalizeAvatarUrl(voice.avatarUrl)!} alt={voice.name || ""} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; const fb = e.currentTarget.nextElementSibling as HTMLElement | null; if (fb) fb.style.display = "flex"; }} />
                          : null}
                        <div className="w-full h-full flex items-center justify-center" style={{ display: normalizeAvatarUrl(voice.avatarUrl) ? "none" : "flex" }}><span className="text-pink-600 font-bold text-sm">{(voice.name || "?").charAt(0).toUpperCase()}</span></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-semibold truncate">{voice.name || "BRS Member"}</p>
                        <p className="text-gray-500 text-[10px] truncate leading-tight">
                          {voice.locationName || (ROLES.find(r => r.value === voice.role)?.label || voice.role || "")}
                        </p>
                        {voice.locationName && voice.role && (
                          <p className="text-pink-400 text-[9px] truncate">{ROLES.find(r => r.value === voice.role)?.label || voice.role}</p>
                        )}
                      </div>
                      <span className="text-pink-500 text-xs font-bold flex-shrink-0">{voice.distanceKm} km</span>
                    </button>
                  ))}

                  {/* Constituency voices */}
                  {constituencyVoices.length > 0 && (
                    <>
                      {nearbyVoices.length > 0 && <div className="mx-2 my-1 border-t border-white/20" />}
                      <p className="text-[9px] text-white/80 uppercase tracking-widest font-semibold px-2 mb-1">
                        🗳️ {nearbyDetectedDistrict ? nearbyDetectedDistrict.charAt(0).toUpperCase() + nearbyDetectedDistrict.slice(1) : ""} {t("constituencyVoices")}
                      </p>
                      {constituencyVoices.map((voice, idx) => (
                        <button
                          key={voice.uniqueSlug || idx}
                          data-testid={`constituency-voice-${voice.uniqueSlug}`}
                          onClick={() => { setShowNearbyDropdown(false); setLocation("/" + voice.uniqueSlug); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white hover:bg-white/90 transition-colors text-left shadow-sm"
                        >
                          <div className="w-9 h-9 rounded-full bg-amber-100 flex-shrink-0 overflow-hidden border-2 border-amber-200">
                            {normalizeAvatarUrl(voice.avatarUrl)
                              ? <img src={normalizeAvatarUrl(voice.avatarUrl)!} alt={voice.name || ""} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; const fb = e.currentTarget.nextElementSibling as HTMLElement | null; if (fb) fb.style.display = "flex"; }} />
                              : null}
                            <div className="w-full h-full flex items-center justify-center" style={{ display: normalizeAvatarUrl(voice.avatarUrl) ? "none" : "flex" }}><span className="text-amber-600 font-bold text-sm">{(voice.name || "?").charAt(0).toUpperCase()}</span></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm font-semibold truncate">{voice.name || "BRS Member"}</p>
                            <p className="text-gray-500 text-[10px] truncate leading-tight">
                              {voice.industry || (ROLES.find(r => r.value === voice.role)?.label || voice.role || "")}
                            </p>
                          </div>
                          <span className="text-amber-500 text-[10px] font-semibold flex-shrink-0">Constituency</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="absolute top-8-safe right-8 z-50 p-2 group"
        >
          {isMenuOpen ? (
            <div className="flex flex-col gap-[5px] items-end justify-center w-6 h-6">
              <div className="w-6 h-0.5 bg-white rounded-full transition-all duration-300 rotate-45 translate-y-[7px]"></div>
              <div className="w-6 h-0.5 bg-white rounded-full transition-all duration-300 opacity-0"></div>
              <div className="w-6 h-0.5 bg-white rounded-full transition-all duration-300 -rotate-45 -translate-y-[7px]"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-[5px] items-end">
              <div className="w-6 h-0.5 bg-white rounded-full transition-all duration-300"></div>
              <div className="w-4 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-6"></div>
              <div className="w-6 h-0.5 bg-white rounded-full transition-all duration-300"></div>
            </div>
          )}
        </button>

        <AnimatePresence>
          {!showScannerDialog && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => setShowScannerDialog(true)}
              className="fixed bottom-8-safe right-8 z-50 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-white/20"
            >
              <QrCode className="w-6 h-6 text-black" strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={tradersRef}
          className="fixed left-0 bottom-8-safe z-50"
        >
          <button
            onClick={() => setShowTradersModal(true)}
            className="w-12 h-12 bg-black/60 hover:bg-black/80 border border-white/15 rounded-r-xl flex items-center justify-center shadow-lg transition-all group"
          >
            <img
              src="/brs-telangana.png"
              alt="BRS Telangana"
              className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
            />
          </button>
        </div>

        {/* Traders Bottom Sheet Modal */}
        <AnimatePresence>
          {showTradersModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setShowTradersModal(false); setVoiceCardSearch(""); }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 via-black/90 to-black/80 rounded-t-3xl max-h-[70vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between p-6 pb-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-white">
                      {t("voiceCards")}
                    </h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">
                      {t("riseYourVoiceTagline")}
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowTradersModal(false); setVoiceCardSearch(""); }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-6 pb-3 flex items-center gap-2">
                  <div className="flex-1 bg-white/8 border border-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    <input
                      value={voiceCardSearch}
                      onChange={(e) => setVoiceCardSearch(e.target.value)}
                      placeholder={t("searchVoiceCards")}
                      className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 outline-none"
                    />
                    {voiceCardSearch && (
                      <button onClick={() => setVoiceCardSearch("")} className="text-white/30 hover:text-white/60 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {loggedInUser?.uniqueSlug === ADMIN_SLUG && (
                    <button
                      onClick={() => setShowAddProfileDialog(true)}
                      className="w-9 h-9 bg-pink-500 hover:bg-pink-600 rounded-xl flex items-center justify-center transition-colors shadow-lg flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto scrollbar-hide px-6 pb-6">
                  <div className="flex gap-4">
                    {(() => {
                      const PINNED_ORDER = ["brsparty", "ktrbrs", "brslegalteam", "musi", "hydra", "ktroffice"];
                      const q = voiceCardSearch.toLowerCase();
                      return featuredProfiles.filter((p) => {
                        return !q || (p.name || "").toLowerCase().includes(q) || (p.uniqueSlug || "").toLowerCase().includes(q) || (p.role || "").toLowerCase().includes(q);
                      }).slice().sort((a, b) => {
                        const aPinned = PINNED_ORDER.indexOf(a.uniqueSlug ?? "");
                        const bPinned = PINNED_ORDER.indexOf(b.uniqueSlug ?? "");
                        if (aPinned !== -1 && bPinned !== -1) return aPinned - bPinned;
                        if (aPinned !== -1) return -1;
                        if (bPinned !== -1) return 1;
                        const aIdx = nearbyVoices.findIndex(v => v.uniqueSlug === a.uniqueSlug);
                        const bIdx = nearbyVoices.findIndex(v => v.uniqueSlug === b.uniqueSlug);
                        const aIsNearby = aIdx !== -1;
                        const bIsNearby = bIdx !== -1;
                        if (aIsNearby && bIsNearby) return aIdx - bIdx;
                        if (aIsNearby) return -1;
                        if (bIsNearby) return 1;
                        return 0;
                      }).map((profile, idx) => (
                      <motion.div
                        key={profile.uniqueSlug || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.06 }}
                        className="flex-shrink-0 w-48 h-56 relative"
                      >
                        <div
                          onClick={() => { setShowTradersModal(false); setLocation(`/${profile.uniqueSlug}`); }}
                          className="w-full h-full rounded-2xl overflow-hidden relative flex flex-col justify-between p-4 bg-gradient-to-b from-[#1a0510] to-[#2d0a1e] shadow-xl border border-white/5 cursor-pointer"
                        >
                          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                          <div className="flex-1 flex flex-col items-center justify-center py-2 gap-2">
                            {(() => {
                              const isOwnCard = loggedInUser?.id === profile.id;
                              const avatarSrc = normalizeAvatarUrl(profile.avatarUrl);
                              return (
                                <div
                                  className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-white/20 bg-pink-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 relative"
                                >
                                  {avatarSrc ? (
                                    <img
                                      src={avatarSrc}
                                      alt={profile.name}
                                      className="w-full h-full object-cover"
                                      loading="eager"
                                      fetchPriority="high"
                                      onError={(e) => {
                                        const t = e.currentTarget;
                                        t.style.display = "none";
                                        const fallback = t.nextElementSibling as HTMLElement | null;
                                        if (fallback) fallback.style.display = "flex";
                                      }}
                                    />
                                  ) : null}
                                  <span
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ display: avatarSrc ? "none" : "flex" }}
                                  >
                                    {profile.name?.[0]?.toUpperCase() || "?"}
                                  </span>
                                </div>
                              );
                            })()}
                            <div className="text-center">
                              <p className="text-white text-xs font-semibold leading-tight line-clamp-1">{profile.name}</p>
                              <p className="text-white/50 text-[9px] mt-0.5 uppercase tracking-wider line-clamp-1">
                                {ROLES.find((r) => r.value === profile.role)?.label || profile.role || "Member"}
                              </p>
                            </div>
                          </div>
                          {(profile.bio || profile.industry) && (
                            <div>
                              <p className="text-white/50 text-[9px] leading-relaxed line-clamp-2 italic">
                                {profile.bio || profile.industry}
                              </p>
                            </div>
                          )}
                        </div>
                        {loggedInUser?.uniqueSlug === ADMIN_SLUG && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFeaturedSlug(profile.uniqueSlug); }}
                            className="absolute top-2 right-2 w-5 h-5 bg-red-500/90 hover:bg-red-600 rounded-full flex items-center justify-center z-10 shadow-lg transition-colors"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        )}
                      </motion.div>
                    ))})()}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddProfileDialog && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setShowAddProfileDialog(false); setAddProfileSearch(""); setAddProfileResult(null); }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[61] bg-gray-950 border border-white/10 rounded-2xl p-5 shadow-2xl max-w-sm mx-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-sm">Add Voice Profile</h3>
                    <p className="text-white/40 text-[10px] mt-0.5">Search by voice code to feature on the board</p>
                  </div>
                  <button
                    onClick={() => { setShowAddProfileDialog(false); setAddProfileSearch(""); setAddProfileResult(null); }}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 bg-white/8 border border-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    <input
                      autoFocus
                      value={addProfileSearch}
                      onChange={(e) => setAddProfileSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchAdminProfile()}
                      placeholder="Enter voice code..."
                      className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 outline-none"
                    />
                  </div>
                  <button
                    onClick={searchAdminProfile}
                    disabled={addProfileLoading || !addProfileSearch.trim()}
                    className="bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-white text-xs font-bold transition-colors"
                  >
                    {addProfileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                  </button>
                </div>
                {addProfileResult === "not_found" && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-white/40 text-xs">No profile found for this voice code.</p>
                  </div>
                )}
                {addProfileResult && addProfileResult !== "not_found" && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {addProfileResult.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{addProfileResult.name}</p>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider truncate">{addProfileResult.uniqueSlug}</p>
                        <p className="text-white/30 text-[9px] truncate">
                          {ROLES.find((r) => r.value === addProfileResult.role)?.label || addProfileResult.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => addFeaturedSlug(addProfileResult.uniqueSlug)}
                      disabled={adminFeaturedSlugs.includes(addProfileResult.uniqueSlug)}
                      className="w-9 h-9 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors shadow-lg flex-shrink-0"
                    >
                      {adminFeaturedSlugs.includes(addProfileResult.uniqueSlug)
                        ? <Check className="w-4 h-4 text-white" />
                        : <Plus className="w-4 h-4 text-white" />
                      }
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {false && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeEventDialog}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 24 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[calc(100vw-32px)] max-w-sm max-h-[calc(100dvh-32px)] bg-white rounded-2xl shadow-2xl overflow-y-auto"
                style={{ touchAction: "auto" }}
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-gray-900 font-bold text-base leading-tight">
                        {editingEvent ? "Edit Event" : "New Event"}
                      </h3>
                      <p className="text-gray-400 text-[10px] mt-0.5 uppercase tracking-widest">
                        {editingEvent ? "Update details" : "Schedule for all members"}
                      </p>
                    </div>
                    <button
                      onClick={closeEventDialog}
                      className="p-1.5 rounded-full bg-gray-100 hover:bg-pink-50 hover:text-pink-500 transition-colors text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1">
                        Event Title <span className="text-pink-500">*</span>
                      </label>
                      <input
                        autoFocus
                        type="text"
                        value={eventForm.title}
                        onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. BRS Rally Hyderabad"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-pink-400 focus:bg-white transition-colors placeholder:text-gray-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1">
                          Date <span className="text-pink-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={eventForm.date}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Time</label>
                        <input
                          type="time"
                          value={eventForm.time}
                          onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Location</label>
                      <input
                        type="text"
                        value={eventForm.location}
                        onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))}
                        placeholder="Venue / City"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-pink-400 focus:bg-white transition-colors placeholder:text-gray-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Description</label>
                      <textarea
                        value={eventForm.description}
                        onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Brief details about this event..."
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-pink-400 focus:bg-white transition-colors resize-none placeholder:text-gray-300"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={closeEventDialog}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl py-2.5 font-semibold text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={submitEventForm}
                        disabled={!eventForm.title.trim() || !eventForm.date || createEventMutation.isPending || updateEventMutation.isPending}
                        className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-2.5 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {(createEventMutation.isPending || updateEventMutation.isPending)
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <>{editingEvent ? "Save Changes" : "Create Event"}</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center mb-6 z-10"
        >
          {/* BRS Logo + Name — compact horizontal row */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 shrink-0 rounded-full bg-white shadow-md ring-2 ring-pink-500/30 flex items-center justify-center overflow-hidden">
              <img
                src="/brs-logo.png"
                alt="BRS Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-display font-black tracking-widest uppercase text-white leading-none">
                BRS
              </h1>
              <p className="text-[9px] tracking-[0.18em] text-white/70 font-medium mt-0.5 whitespace-nowrap">
                Bharat Rashtra Samithi
              </p>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-1">
            BRS Connect
          </h2>
          <p className="text-white/70 text-xs mb-3 max-w-xs mx-auto leading-relaxed">
            {t("appTagline")}
          </p>

          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-[9px] font-semibold text-white bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full">
              {t("peoplesVoice")}
            </span>
            <span className="text-[9px] font-semibold text-white bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full">
              {t("speedActionChange")}
            </span>
          </div>
        </motion.div>

        <motion.div
          ref={personaCardRef}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ touchAction: "auto" }}
          className="w-full max-w-md bg-white border border-pink-200 rounded-2xl shadow-2xl p-5 sm:p-6 z-10 relative overflow-hidden mt-[30px] mb-[30px] pt-[20px] pb-[20px]"
        >
          {/* Pink car animation strip */}
          {(() => {
            const pauseMessages = [
              { text: "జనం గొంతు — BRS స్పందన!", sub: "ప్రతి సమస్యకు వేగమైన పరిష్కారం · People First" },
              { text: "जनता की आवाज़ — BRS की ताकत!", sub: "हर समस्या का तेज़ समाधान · Speed. Action. Change." },
              { text: "عوام کی آواز — BRS کا عزم!", sub: "ہر مسئلے کا فوری حل · Connect. Rise. Deliver." },
            ];
            const SpeedLines = () => (
              <div className="flex flex-col gap-[3px] mr-1.5">
                <div className="h-px bg-pink-400 opacity-80" style={{ width: 20 }} />
                <div className="h-px bg-pink-300 opacity-55" style={{ width: 13 }} />
                <div className="h-px bg-pink-400 opacity-80" style={{ width: 17 }} />
              </div>
            );
            const CarImg = ({ small }: { small?: boolean }) => (
              <img
                src={pinkCarSrc}
                alt="pink car"
                className="object-contain flex-shrink-0"
                style={{
                  height: small ? 18 : 22,
                  width: "auto",
                  transform: "scaleX(1.08) scaleY(0.92)",
                  filter: "drop-shadow(2px 0 3px rgba(236,72,153,0.4))",
                }}
              />
            );
            return (
              <div className="relative overflow-hidden h-10 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-4 bg-pink-50 border-b border-pink-100">
                {carPhase === "ltr" && (
                  <div
                    className="absolute top-0 h-full flex items-center"
                    style={{ animation: "carDriveRight 2.2s linear forwards" }}
                  >
                    <SpeedLines />
                    <CarImg />
                  </div>
                )}
                {carPhase === "pause" && (
                  <div className="absolute inset-0 flex items-center gap-2.5 px-3 animate-fadeIn">
                    <img
                      src={brsLogoSlider}
                      alt="BRS"
                      className="object-contain flex-shrink-0"
                      style={{ height: 30, width: 30 }}
                    />
                    <div className="flex flex-col justify-center leading-none min-w-0 flex-1">
                      <span
                        key={msgIndex}
                        className="text-[11px] font-bold text-pink-700 whitespace-nowrap animate-fadeIn truncate"
                        style={{ direction: msgIndex === 2 ? "rtl" : "ltr" }}
                      >
                        {pauseMessages[msgIndex].text}
                      </span>
                      <span
                        key={`sub-${msgIndex}`}
                        className="text-[8px] text-pink-400 tracking-wide animate-fadeIn truncate"
                      >
                        {pauseMessages[msgIndex].sub}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {(mode === "login" || mode === "swipe") && (
            <div className="flex p-0.5 bg-pink-50 border border-pink-200 rounded-xl mb-5 relative">
              <button
                onClick={() => { tabDirectionRef.current = -1; setMode("login"); }}
                className={clsx(
                  "flex-1 py-2 text-xs font-bold rounded-[10px] z-10 transition-all",
                  mode === "login" || mode === "register"
                    ? "text-pink-700"
                    : "text-pink-300",
                )}
              >
                BRS
              </button>
              <button
                onClick={() => { tabDirectionRef.current = 1; setMode("swipe"); }}
                className={clsx(
                  "flex-1 py-2 text-xs font-bold rounded-[10px] z-10 transition-all",
                  mode === "swipe" ? "text-pink-700" : "text-pink-300",
                )}
              >
                Voice
              </button>
              <motion.div
                layoutId="activeTab"
                className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-white border border-pink-200 rounded-[10px] shadow-sm pointer-events-none"
                animate={{ left: mode === "swipe" ? "calc(50%)" : "2px" }}
              />
            </div>
          )}

          <div className="space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              style={{ touchAction: "auto" }}
              className="space-y-3"
            >
              {mode === "login" ? (
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="flex flex-col items-center text-center space-y-4 py-2 relative">
                    <div className="absolute top-0 right-0 flex flex-col gap-1.5 z-10">
                      <button
                        type="button"
                        onClick={() => setShowQRDialog(true)}
                        className="p-2 bg-pink-50 hover:bg-pink-100 rounded-lg text-pink-400 hover:text-pink-600 transition-all"
                        title="View QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPamphletCardSizes({}); setShowPamphletDialog(true); }}
                        className="p-2 bg-pink-50 hover:bg-pink-100 rounded-lg text-pink-400 hover:text-pink-600 transition-all"
                        title="Campaign Pamphlet"
                      >
                        <Newspaper className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={hasVoted !== null || voteLoading}
                        onClick={() => handleVote("like")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all border mt-3 ${
                          hasVoted === "like"
                            ? "bg-green-100 text-green-600 border-green-200"
                            : hasVoted !== null
                            ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                            : "bg-pink-50 hover:bg-green-50 text-pink-400 hover:text-green-600 border-pink-100 hover:border-green-200 cursor-pointer"
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3 flex-shrink-0" />
                        <span>{hasVoted === "like" ? "Unlike" : "Like"}</span>
                      </button>
                      <button
                        type="button"
                        disabled={hasVoted !== null || voteLoading}
                        onClick={() => handleVote("dislike")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                          hasVoted === "dislike"
                            ? "bg-red-100 text-red-500 border-red-200"
                            : hasVoted !== null
                            ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                            : "bg-pink-50 hover:bg-red-50 text-pink-400 hover:text-red-500 border-pink-100 hover:border-red-200 cursor-pointer"
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3 flex-shrink-0" />
                        <span>{hasVoted === "dislike" ? "Voted" : "Dislike"}</span>
                      </button>
                    </div>
                    {(() => {
                      const isOwnProfile = loggedInUser?.id === user?.id;
                      const displayAvatar = normalizeAvatarUrl(user?.avatarUrl);
                      return (
                        <button
                          type="button"
                          onClick={() => isOwnProfile && setShowAvatarDialog(true)}
                          className={`relative w-16 h-16 rounded-full mx-auto shadow-lg focus:outline-none ${isOwnProfile ? "group cursor-pointer" : "cursor-default"}`}
                        >
                          {displayAvatar ? (
                            <img
                              src={displayAvatar}
                              alt="Avatar"
                              className="w-full h-full rounded-full object-cover"
                              loading="eager"
                             
                              onError={(e) => {
                                const t = e.currentTarget;
                                t.style.display = "none";
                                const fallback = t.nextElementSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          {(!displayAvatar) && (
                            <div className="w-full h-full rounded-full bg-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                              {form.watch("name")?.[0] || "P"}
                            </div>
                          )}
                          {isOwnProfile && form.watch("role") !== "people" && (
                            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })()}
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-1.5">
                      {form.watch("name") || "Your Name"}
                      {loggedInUser?.uniqueSlug === ADMIN_SLUG && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)] flex-shrink-0">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-500 text-xs">
                      {ROLES.find((r) => r.value === form.watch("role"))
                        ?.label || "Founder"}
                    </p>
                    <p className="text-gray-400 text-[10px]">
                      {form.watch("industry") || ""}
                    </p>
                    <p className="text-gray-400 text-[10px] italic">
                      {form.watch("bio") || "Voice of the People. Strength of the Nation."}
                    </p>
                    <div className="flex items-center justify-center gap-3 w-full pt-1">
                      {(() => {
                        const linkedin = form.watch("linkedin");
                        const hasLinkedin =
                          !!linkedin &&
                          linkedin.trim() !== "" &&
                          linkedin !== "#";
                        return (
                          <a
                            href={hasLinkedin ? linkedin : undefined}
                            target={hasLinkedin ? "_blank" : undefined}
                            rel={hasLinkedin ? "noreferrer" : undefined}
                            onClick={(e) => {
                              if (!hasLinkedin) {
                                e.preventDefault();
                                return;
                              }
                              trackClick("linkedin");
                            }}
                            className={clsx(
                              "p-2.5 rounded-lg transition-all",
                              hasLinkedin
                                ? "bg-pink-50 text-pink-500 hover:bg-pink-100 hover:text-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.15)]"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed",
                            )}
                            title={
                              hasLinkedin
                                ? "X (Twitter)"
                                : "X (Not Available)"
                            }
                          >
                            <SiX className="w-4 h-4" />
                          </a>
                        );
                      })()}
                      {(() => {
                        const instagram = form.watch("instagram");
                        const hasInstagram =
                          !!instagram &&
                          instagram.trim() !== "" &&
                          instagram !== "#";
                        return (
                          <a
                            href={hasInstagram ? instagram : undefined}
                            target={hasInstagram ? "_blank" : undefined}
                            rel={hasInstagram ? "noreferrer" : undefined}
                            onClick={(e) => {
                              if (!hasInstagram) {
                                e.preventDefault();
                                return;
                              }
                              trackClick("insta");
                            }}
                            className={clsx(
                              "p-2.5 rounded-lg transition-all",
                              hasInstagram
                                ? "bg-pink-50 text-pink-500 hover:bg-pink-100 hover:text-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.15)]"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed",
                            )}
                            title={
                              hasInstagram
                                ? "Instagram"
                                : "Instagram (Not Available)"
                            }
                          >
                            <SiInstagram className="w-4 h-4" />
                          </a>
                        );
                      })()}
                      {(() => {
                        const whatsapp = form.watch("whatsapp");
                        const hasWhatsapp =
                          !!whatsapp &&
                          whatsapp.trim() !== "" &&
                          whatsapp !== "#";
                        const whatsappUrl = hasWhatsapp
                          ? whatsapp.includes("http") ||
                            whatsapp.includes("wa.me")
                            ? whatsapp
                            : `https://wa.me/${whatsappCountryCode}${whatsapp.replace(/\D/g, "")}`
                          : undefined;
                        return (
                          <a
                            href={whatsappUrl}
                            target={hasWhatsapp ? "_blank" : undefined}
                            rel={hasWhatsapp ? "noreferrer" : undefined}
                            onClick={(e) => {
                              if (!hasWhatsapp) {
                                e.preventDefault();
                                return;
                              }
                              trackClick("whatsapp");
                            }}
                            className={clsx(
                              "p-2.5 rounded-lg transition-all",
                              hasWhatsapp
                                ? "bg-pink-50 text-pink-500 hover:bg-pink-100 hover:text-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.15)]"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed",
                            )}
                            title={
                              hasWhatsapp
                                ? "WhatsApp"
                                : "WhatsApp (Not Available)"
                            }
                          >
                            <SiWhatsapp className="w-4 h-4" />
                          </a>
                        );
                      })()}
                      {(() => {
                        const youtube = form.watch("youtube" as any);
                        const hasYoutube =
                          !!youtube && youtube.trim() !== "" && youtube !== "#";
                        return (
                          <a
                            href={hasYoutube ? youtube : undefined}
                            target={hasYoutube ? "_blank" : undefined}
                            rel={hasYoutube ? "noreferrer" : undefined}
                            onClick={(e) => {
                              if (!hasYoutube) {
                                e.preventDefault();
                                return;
                              }
                              trackClick("youtube");
                            }}
                            className={clsx(
                              "p-2.5 rounded-lg transition-all",
                              hasYoutube
                                ? "bg-pink-50 text-pink-500 hover:bg-pink-100 hover:text-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.15)]"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed",
                            )}
                            title={hasYoutube ? "YouTube" : "YouTube (Not Available)"}
                          >
                            <SiYoutube className="w-4 h-4" />
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                  {(() => {
                    const websiteUrl = form.watch("website");
                    const hasWebsite =
                      !!websiteUrl &&
                      websiteUrl.trim() !== "" &&
                      websiteUrl !== "#";
                    return (
                      <a
                        href={hasWebsite ? websiteUrl : undefined}
                        target={hasWebsite ? "_blank" : undefined}
                        rel={hasWebsite ? "noreferrer" : undefined}
                        onClick={(e) => {
                          if (!hasWebsite) {
                            e.preventDefault();
                            return;
                          }
                          trackClick("website");
                        }}
                        className={clsx(
                          "w-full rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 group no-underline transition-all",
                          hasWebsite
                            ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm cursor-pointer"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200",
                        )}
                      >
                        {hasWebsite ? t("viewWebsite") : t("noWebsite")}
                        <ArrowRight
                          className={clsx(
                            "w-3.5 h-3.5 transition-transform",
                            hasWebsite
                              ? "group-hover:translate-x-1"
                              : "opacity-0",
                          )}
                        />
                      </a>
                    );
                  })()}
                  {loggedInUser && user && loggedInUser.id === user.id && mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        form.reset({
                          password: "",
                          name: user?.name || "",
                          role: user?.role || "people",
                          bio: user?.bio || "",
                          instagram: user?.instagram || "",
                          linkedin: user?.linkedin || "",
                          whatsapp: user?.whatsapp || "",
                          website: user?.website || "",
                          youtube: (user as any)?.youtube || "",
                          cards: user?.cards || [],
                        });
                        setSelectedCards(user?.cards || []);
                      }}
                      className="w-full bg-pink-500 text-white hover:bg-pink-600 rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg mb-4"
                    >
                      <Pencil className="w-4 h-4" /> Edit Profile
                    </button>
                  )}
                  {loggedInUser && user && loggedInUser.id === user.id && (
                    <div className="pt-4 border-t border-pink-100">
                      {/* Tabs Navigation */}
                      <div className="flex p-1 bg-pink-50 border border-pink-200 rounded-xl mb-4">
                        <button
                          type="button"
                          onClick={() => setActiveTab("notes")}
                          className={clsx(
                            "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider",
                            activeTab === "notes"
                              ? "bg-white text-pink-700 shadow-sm"
                              : "text-pink-400 hover:text-pink-600",
                          )}
                        >
                          Notes
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("connect")}
                          className={clsx(
                            "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider flex items-center justify-center gap-1.5",
                            activeTab === "connect"
                              ? "bg-white text-pink-700 shadow-sm"
                              : "text-pink-400 hover:text-pink-600",
                          )}
                        >
                          <div className="w-3 h-3 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/40">
                            <div className="w-1 h-1 rounded-full bg-pink-400 shadow-[0_0_4px_#f472b6]" />
                          </div>
                          Connect
                        </button>
                      </div>

                      {/* Tab Content */}
                      <AnimatePresence mode="wait">
                        {activeTab === "notes" ? (
                          <motion.div
                            key="notes"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                onKeyPress={(e) =>
                                  e.key === "Enter" && addNote()
                                }
                                placeholder={
                                  notes.length >= 5
                                    ? "Limit of 5 notes reached"
                                    : "Add a quick note..."
                                }
                                disabled={notes.length >= 5}
                                className="flex-1 bg-pink-50 border border-pink-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-pink-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <button
                                type="button"
                                onClick={addNote}
                                disabled={notes.length >= 5}
                                className="bg-pink-100 hover:bg-pink-200 text-pink-700 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-2">
                              {notes.map((note) => (
                                <div
                                  key={note.id}
                                  className="flex items-center gap-3 group"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleNote(note.id)}
                                    className={clsx(
                                      "w-4 h-4 rounded-full border transition-all flex items-center justify-center",
                                      note.completed
                                        ? "bg-pink-500 border-pink-500"
                                        : "border-gray-300 hover:border-pink-400",
                                    )}
                                  >
                                    {note.completed && (
                                      <Check className="w-2.5 h-2.5 text-white" />
                                    )}
                                  </button>
                                  <div className="flex flex-col flex-1">
                                    <span
                                      className={clsx(
                                        "text-xs transition-all",
                                        note.completed
                                          ? "text-gray-300 line-through"
                                          : "text-gray-700",
                                      )}
                                    >
                                      {note.text}
                                    </span>
                                    <span
                                      className={clsx(
                                        "text-[8px] uppercase tracking-tighter",
                                        getTimerColor(note.expiresAt),
                                      )}
                                    >
                                      Expires in{" "}
                                      {formatTimeLeft(note.expiresAt)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {notes.length === 0 && (
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center py-4">
                                  No notes yet
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="connect"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            <div className="space-y-2">
                              {connections.map((conn, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setLocation(`/${conn.slug}`)}
                                  className="flex items-center justify-between p-2 rounded-lg bg-pink-50 border border-pink-100 hover:bg-pink-100 transition-all cursor-pointer group"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-900 group-hover:text-pink-500 transition-colors">
                                      {conn.name}
                                    </span>
                                    <span className="text-[8px] uppercase tracking-widest text-gray-400">
                                      {conn.industry}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-pink-500 bg-pink-100 px-1.5 py-0.5 rounded border border-pink-200">
                                      {getRemainingTime(conn.expiresAt)}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-pink-300 group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all" />
                                  </div>
                                </div>
                              ))}
                              {connections.length === 0 && (
                                <div className="h-[100px] flex items-center justify-center border border-dashed border-pink-200 rounded-2xl bg-pink-50">
                                  <div className="text-center space-y-2">
                                    <p className="text-[10px] text-pink-400 uppercase tracking-[0.2em] font-bold">
                                      Exclusive Connect
                                    </p>
                                    <p className="text-xs text-gray-400 font-medium">
                                      No connections yet
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </form>
              ) : mode === "register" ? (
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3 pr-2 pb-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      Name
                    </label>
                    <input
                      {...form.register("name")}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-pink-400"
                      placeholder="Your Name"
                      onFocus={() => { setRoleOpen(false); setConstituencyOpen(false); }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      Role
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setRoleOpen(!roleOpen); setRoleSearch(""); }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 flex items-center justify-between"
                      >
                        <span className={form.watch("role") ? "text-gray-900" : "text-gray-400"}>
                          {ROLES.find((r) => r.value === form.watch("role"))?.label || "Select Role"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                      {roleOpen && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-30 max-h-56 flex flex-col">
                          <div className="p-2 border-b border-gray-100">
                            <input
                              autoFocus
                              type="text"
                              value={roleSearch}
                              onChange={(e) => setRoleSearch(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-pink-400"
                              placeholder="Search role..."
                            />
                          </div>
                          <div className="overflow-y-auto flex-1">
                            {ROLE_GROUPS.map((group, gi) => {
                              const filtered = group.items.filter((r) =>
                                r.label.toLowerCase().includes(roleSearch.toLowerCase())
                              );
                              if (filtered.length === 0) return null;
                              return (
                                <div key={gi}>
                                  {group.group && (
                                    <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 sticky top-0">
                                      {group.group}
                                    </div>
                                  )}
                                  {filtered.map((r) => (
                                    <button
                                      key={r.value}
                                      type="button"
                                      onClick={() => {
                                        form.setValue("role", r.value);
                                        setRoleOpen(false);
                                        setRoleSearch("");
                                      }}
                                      className={clsx(
                                        "w-full text-left px-4 py-2 text-sm transition-colors",
                                        form.watch("role") === r.value
                                          ? "bg-pink-50 text-pink-700 font-semibold"
                                          : "text-gray-700 hover:bg-gray-50"
                                      )}
                                    >
                                      {r.label}
                                    </button>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      Constituency
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setConstituencyOpen(!constituencyOpen); setConstituencySearch(""); }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 appearance-none flex items-center justify-between"
                      >
                        <span className={form.watch("industry") ? "text-gray-900" : "text-gray-400"}>
                          {form.watch("industry") || "Select Constituency"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                      {constituencyOpen && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-30 max-h-56 flex flex-col">
                          <div className="p-2 border-b border-gray-100">
                            <input
                              autoFocus
                              type="text"
                              value={constituencySearch}
                              onChange={(e) => setConstituencySearch(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-pink-400"
                              placeholder="Search constituency..."
                            />
                          </div>
                          <div className="overflow-y-auto flex-1">
                            {CONSTITUENCIES.map((group) => {
                              const filtered = group.items.filter((c) =>
                                c.toLowerCase().includes(constituencySearch.toLowerCase())
                              );
                              if (filtered.length === 0) return null;
                              return (
                                <div key={group.region}>
                                  <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 sticky top-0">
                                    {group.region}
                                  </div>
                                  {filtered.map((c) => (
                                    <button
                                      key={c}
                                      type="button"
                                      onClick={() => {
                                        form.setValue("industry", c);
                                        setConstituencyOpen(false);
                                        setConstituencySearch("");
                                      }}
                                      className={clsx(
                                        "w-full text-left px-4 py-2 text-sm transition-colors",
                                        form.watch("industry") === c
                                          ? "bg-pink-50 text-pink-700 font-semibold"
                                          : "text-gray-700 hover:bg-gray-50"
                                      )}
                                    >
                                      {c}
                                    </button>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      Bio
                    </label>
                    <input
                      {...form.register("bio")}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
                      placeholder="Your voice / bio description"
                      onFocus={() => { setRoleOpen(false); setConstituencyOpen(false); }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        Instagram
                      </label>
                      <input
                        {...form.register("instagram")}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
                        placeholder="URL"
                        onFocus={() => { setRoleOpen(false); setConstituencyOpen(false); }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        X (Twitter)
                      </label>
                      <input
                        {...form.register("linkedin")}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
                        placeholder="https://x.com/username"
                        onFocus={() => { setRoleOpen(false); setConstituencyOpen(false); }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1">
                        WhatsApp <span className="normal-case text-gray-400 font-normal tracking-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <div className="flex gap-2">
                          {(() => {
                            const whatsappValue =
                              form.watch("whatsapp")?.toString() || "";
                            const isUrl =
                              whatsappValue.includes("http") ||
                              whatsappValue.includes("whatsapp");
                            // Only show country dropdown if it's NOT a URL AND (it's empty OR contains a number)
                            const shouldShowCountry =
                              !isUrl &&
                              (whatsappValue === "" ||
                                /\d/.test(whatsappValue));

                            if (!shouldShowCountry) return null;

                            return (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowCountryDropdown(!showCountryDropdown)
                                  }
                                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 flex items-center gap-2 hover:bg-gray-100 transition-colors"
                                >
                                  {
                                    COUNTRY_CODES.find(
                                      (c) => c.code === whatsappCountryCode,
                                    )?.flag
                                  }
                                  <span className="text-xs font-semibold">
                                    {whatsappCountryCode}
                                  </span>
                                  <ChevronDown className="w-3 h-3 text-gray-400" />
                                </button>
                                {showCountryDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-2xl z-20 max-h-48 overflow-y-auto w-48"
                                  >
                                    {COUNTRY_CODES.map((country) => (
                                      <button
                                        key={country.code}
                                        type="button"
                                        onClick={() => {
                                          setWhatsappCountryCode(country.code);
                                          setShowCountryDropdown(false);
                                        }}
                                        className={clsx(
                                          "w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 transition-colors",
                                          whatsappCountryCode === country.code
                                            ? "bg-pink-50 text-pink-700"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                                        )}
                                      >
                                        <span className="text-sm">
                                          {country.flag}
                                        </span>
                                        <span className="font-semibold">
                                          {country.code}
                                        </span>
                                        <span className="text-gray-400 text-[10px]">
                                          {country.country}
                                        </span>
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </div>
                            );
                          })()}
                          <input
                            {...form.register("whatsapp")}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                            placeholder="Phone number / WB community URL"
                            onFocus={() => { setRoleOpen(false); setConstituencyOpen(false); }}
                            onChange={(e) => {
                              const value = e.target.value;
                              const isUrl =
                                value.includes("http") ||
                                value.includes("whatsapp");
                              if (isUrl && showCountryDropdown) {
                                setShowCountryDropdown(false);
                              }
                            }}
                          />
                        </div>
                        {form.watch("whatsapp") &&
                          !form
                            .watch("whatsapp")
                            .toString()
                            .includes("http") && (
                            <p className="text-[9px] text-emerald-400/70 mt-1 ml-1">
                              Will direct to: wa.me/{whatsappCountryCode}
                              {form
                                .watch("whatsapp")
                                ?.toString()
                                .replace(/\D/g, "")}
                            </p>
                          )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1">
                        YouTube <span className="normal-case text-gray-400 font-normal tracking-normal">(optional)</span>
                      </label>
                      <input
                        {...form.register("youtube" as any)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
                        placeholder="https://youtube.com/@channel"
                        onFocus={() => { setRoleOpen(false); setConstituencyOpen(false); }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1">
                      Website URL <span className="normal-case text-gray-400 font-normal tracking-normal">(optional)</span>
                    </label>
                    <input
                      {...form.register("website")}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
                      placeholder="https://your-website.com"
                      onFocus={() => { setRoleOpen(false); setConstituencyOpen(false); }}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      disabled={!form.watch("name") || !form.watch("role") || !form.watch("industry")}
                      onClick={() => setMode("customize")}
                      className="flex-1 bg-pink-500 text-white hover:bg-pink-600 rounded-lg py-3 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        form.reset({
                          password: "",
                          name: "",
                          role: "people",
                          bio: "",
                          instagram: "",
                          linkedin: "",
                          whatsapp: "",
                          website: "",
                          youtube: "",
                          cards: [],
                        });
                        setSelectedCards([]);
                        setMode("login");
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg py-3 px-3 font-bold text-sm flex items-center justify-center transition-all border border-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : mode === "customize" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Choose Your Voice ({selectedCards.length}
                      /7)
                    </h4>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 px-1 custom-scrollbar snap-x">
                    {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                      <div
                        key={idx}
                        className="min-w-[220px] aspect-[3/4] snap-center"
                      >
                        {selectedCards[idx] ? (
                          <MiniCard
                            idx={idx}
                            cardJson={selectedCards[idx]}
                            onUpdate={(newJson) => {
                              const currentCards = [...selectedCards];
                              currentCards[idx] = newJson;
                              setSelectedCards(currentCards);
                            }}
                            onDelete={() => {
                              const currentCards = [...selectedCards];
                              currentCards.splice(idx, 1);
                              setSelectedCards(currentCards);
                            }}
                          />
                        ) : (
                          <div className="h-full border-2 border-dashed border-pink-200 rounded-2xl flex flex-col items-center justify-center p-4">
                            {xpostPickerIdx === idx ? (
                              <div className="w-full space-y-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <SiX className="w-3.5 h-3.5 text-gray-700" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Choose type</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentCards = [...selectedCards];
                                    currentCards[idx] = JSON.stringify({ type: "xpost", subtype: "tweet", title: "X Post", url: "" });
                                    setSelectedCards(currentCards);
                                    setXpostPickerIdx(null);
                                  }}
                                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200"
                                >
                                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                                    <SiX className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-[10px] font-black text-gray-800 uppercase tracking-wide">Tweet</p>
                                    <p className="text-[8px] text-gray-400">Display a post or thread</p>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentCards = [...selectedCards];
                                    currentCards[idx] = JSON.stringify({ type: "xpost", subtype: "video", title: "X Video", url: "" });
                                    setSelectedCards(currentCards);
                                    setXpostPickerIdx(null);
                                  }}
                                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200"
                                >
                                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                                    <Play className="w-3.5 h-3.5 text-white fill-current" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-[10px] font-black text-gray-800 uppercase tracking-wide">Video</p>
                                    <p className="text-[8px] text-gray-400">Display a video tweet</p>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setXpostPickerIdx(null)}
                                  className="w-full text-[8px] text-pink-400 uppercase tracking-widest font-bold py-1 hover:text-pink-600 transition-colors"
                                >
                                  ← Back
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2 w-full">
                                {CARD_TYPES.map((t) => {
                                  return (
                                    <button
                                      key={t.type}
                                      type="button"
                                      onClick={() => {
                                        if (t.type === "xpost") {
                                          setXpostPickerIdx(idx);
                                          return;
                                        }
                                        const currentCards = [...selectedCards];
                                        const newCard =
                                          t.type === "reel"
                                            ? { type: "reel", title: "New Reel", url: "" }
                                            : t.type === "image"
                                              ? { type: "image", title: "Image Card", imageUrl: "" }
                                              : { type: "post", title: "Post Card", content: "" };
                                        currentCards[idx] = JSON.stringify(newCard);
                                        setSelectedCards(currentCards);
                                      }}
                                      className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all bg-pink-50 hover:bg-pink-100"
                                    >
                                      <t.icon className="w-5 h-5 text-pink-400" />
                                      <span className="text-[8px] text-pink-500 uppercase font-bold">
                                        {t.label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={updateProfileMutation.isPending}
                    onClick={() => form.handleSubmit(onSubmit)()}
                    className="w-full bg-pink-500 text-white hover:bg-pink-600 rounded-lg py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save All"
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-2">
                  <SwipeCard cards={selectedCards} user={user} voiceMode={true} isActive={mode === "swipe"} />
                </div>
              )}
            </motion.div>
            </AnimatePresence>

            {mode === "swipe" && (
              <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase tracking-wider font-bold px-4 mt-3">
                <span>← Left Swipe</span>
                <span>Right Swipe →</span>
              </div>
            )}

            {isOtherPersona ? (
              <button
                type="button"
                onClick={() => { setLocation(`/${loggedInUser.uniqueSlug}`); }}
                className="w-full bg-pink-500 text-white hover:bg-pink-600 rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg mt-2"
              >
                Back to My Voice
              </button>
            ) : null}

            {!loggedInUser && mode === "login" && (
              <button
                type="button"
                onClick={() => {
                  if (mode === "login") {
                    setMode("register");
                    form.reset({
                      password: "",
                      name: "",
                      role: "people",
                      bio: "",
                      instagram: "",
                      linkedin: "",
                      whatsapp: "",
                      website: "",
                      youtube: "",
                      cards: [],
                    });
                    setSelectedCards([]);
                  } else {
                    setMode("login");
                  }
                }}
                className="w-full bg-pink-500 text-white hover:bg-pink-600 rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg mt-2"
              >
                {t("riseYourVoice")}
              </button>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {showScannerDialog && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowScannerDialog(false)}
                className="absolute inset-0 backdrop-blur-md"
                style={{ background: "rgba(190,24,93,0.55)" }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="relative w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(160deg, #ec4899 0%, #be185d 60%, #9d174d 100%)" }}
              >
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-25 blur-2xl pointer-events-none" style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }} />
                <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: "radial-gradient(circle, #fce7f3, transparent)" }} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-6 pb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white overflow-hidden shadow">
                      <img src="/brs-logo.png" alt="BRS" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-white font-black text-sm tracking-tight">BRS Connect</p>
                  </div>
                  <button
                    onClick={() => setShowScannerDialog(false)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:scale-90 transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex mx-5 mb-1 relative z-10 bg-white/15 rounded-2xl p-1 gap-1">
                  <button
                    onClick={() => setScannerTab("scan")}
                    className={clsx(
                      "flex-1 py-2 text-xs font-black rounded-xl transition-all",
                      scannerTab === "scan"
                        ? "bg-white text-pink-600 shadow"
                        : "text-white/70 hover:text-white",
                    )}
                  >
                    Scan QR
                  </button>
                  <button
                    onClick={() => setScannerTab("code")}
                    className={clsx(
                      "flex-1 py-2 text-xs font-black rounded-xl transition-all",
                      scannerTab === "code"
                        ? "bg-white text-pink-600 shadow"
                        : "text-white/70 hover:text-white",
                    )}
                  >
                    Voice Code
                  </button>
                </div>

                <div className="p-5 pt-4 relative z-10">
                  {scannerTab === "scan" ? (
                    <div className="space-y-5 text-center">
                      {/* Camera viewfinder */}
                      <div className="relative aspect-square max-w-[210px] mx-auto rounded-3xl overflow-hidden shadow-lg" style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                        <video
                          ref={videoRef}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <QrCode className="w-12 h-12 text-white/30" />
                        </div>
                        <div className="absolute bottom-3 left-0 right-0 text-center">
                          <p className="text-[9px] text-white/60 uppercase tracking-[0.25em] font-bold">Scanner Active</p>
                        </div>
                        {/* Pink scanning corners */}
                        <div className="absolute top-3 left-3 w-5 h-5 border-t-[3px] border-l-[3px] border-white rounded-tl-lg" />
                        <div className="absolute top-3 right-3 w-5 h-5 border-t-[3px] border-r-[3px] border-white rounded-tr-lg" />
                        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-[3px] border-l-[3px] border-white rounded-bl-lg" />
                        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-[3px] border-r-[3px] border-white rounded-br-lg" />
                      </div>
                      <div className="space-y-1 pb-1">
                        <h3 className="text-lg font-black text-white tracking-tight">
                          Scan to Connect
                        </h3>
                        <p className="text-white/70 text-xs">
                          Point your camera at a BRS Connect QR code
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="text-center space-y-1">
                        <h3 className="text-lg font-black text-white tracking-tight">
                          Enter Voice Code
                        </h3>
                        <p className="text-white/70 text-xs">
                          Connect using a unique voice code
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-white/70 uppercase tracking-widest font-bold ml-1">
                            Voice Code
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. x8y2z"
                            value={personaSlug}
                            onChange={(e) =>
                              setPersonaSlug(e.target.value.toLowerCase())
                            }
                            className="w-full rounded-2xl px-4 py-3 text-pink-800 font-mono font-bold placeholder:text-pink-300 focus:outline-none transition-all shadow-inner"
                            style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(255,255,255,0.5)" }}
                          />
                        </div>
                        <button
                          onClick={handleVerifyPersona}
                          className="w-full bg-white text-pink-600 rounded-2xl py-3.5 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg hover:bg-pink-50"
                        >
                          Connect <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-6 relative z-10">
                  <button
                    onClick={() => setShowScannerDialog(false)}
                    className="w-full py-3 text-[10px] text-white/60 hover:text-white uppercase tracking-[0.3em] font-bold transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPersonaDialog && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPersonaDialog(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-card border border-white/10 rounded-[24px] p-8 shadow-2xl z-10"
              >
                <button
                  onClick={() => setShowPersonaDialog(false)}
                  className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-widest">
                    Welcome Back
                  </h3>
                  <p className="text-white/40 text-xs uppercase tracking-wider">
                    Enter your voice code and PIN
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold ml-1">
                      Voice Code
                    </label>
                    <input
                      type="text"
                      value={personaSlug}
                      onChange={(e) => setPersonaSlug(e.target.value)}
                      placeholder="e.g. x8y2z"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold ml-1">
                      5-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={5}
                      value={personaPin}
                      onChange={(e) => setPersonaPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="•••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors tracking-[0.5em]"
                    />
                  </div>

                  <button
                    onClick={handleVerifyPersona}
                    disabled={isVerifying}
                    className="w-full bg-white text-pink-600 rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-pink-50 transition-all shadow-lg group"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showQRDialog && (
            <motion.div
              id="qr-fullscreen-wallpaper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col"
              style={{ background: "linear-gradient(160deg, #ec4899 0%, #be185d 50%, #9d174d 100%)" }}
            >
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }} />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fce7f3, transparent)" }} />

              {/* Top bar — fixed height, never shrinks */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 pt-10-safe pb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white overflow-hidden shadow-md">
                    <img src="/brs-logo.png" alt="BRS" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm tracking-tight leading-none">BRS Connect</p>
                    <p className="text-white/60 text-[9px] uppercase tracking-widest">Bharat Rashtra Samithi</p>
                  </div>
                </div>
                {!isCapturing && (
                  <button
                    onClick={() => setShowQRDialog(false)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:scale-90 transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto relative z-10">
                <div className="flex flex-col items-center px-6 py-4 gap-4 min-h-full justify-center">

                  {/* QR Card */}
                  <div
                    id="qr-card-share"
                    className="w-full max-w-[280px] rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                    style={{ background: "linear-gradient(175deg, #ffffff 0%, #fff0f7 100%)" }}
                  >
                    <div className="flex flex-col items-center px-6 pt-6 pb-5 gap-3">

                      {/* Avatar */}
                      {(() => {
                        const displayAvatarSrc = normalizeAvatarUrl(user?.avatarUrl || loggedInUser?.avatarUrl) || avatarUrl;
                        const displayName = user?.name || loggedInUser?.name || "P";
                        return isCapturing ? (
                          <div style={{ width: 72, height: 72, borderRadius: "50%", padding: 3, background: "linear-gradient(135deg, #ec4899, #be185d)", flexShrink: 0 }}>
                            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#ffffff" }}>
                              <img src={avatarDataUrl || displayAvatarSrc} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowAvatarDialog(true)}
                            className="relative focus:outline-none"
                          >
                            <div className="w-18 h-18 rounded-full p-[3px] shadow-lg" style={{ background: "linear-gradient(135deg, #ec4899, #be185d)", width: 72, height: 72 }}>
                              <div className="w-full h-full rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
                                {displayAvatarSrc ? (
                                  <img
                                    src={displayAvatarSrc}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                    fetchPriority="high"
                                    onError={(e) => {
                                      const t = e.currentTarget;
                                      t.style.display = "none";
                                      const fallback = t.nextElementSibling as HTMLElement | null;
                                      if (fallback) fallback.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="w-full h-full bg-pink-500 items-center justify-center text-white text-2xl font-bold"
                                  style={{ display: displayAvatarSrc ? "none" : "flex" }}
                                >
                                  {displayName[0]?.toUpperCase() || "P"}
                                </div>
                              </div>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white" style={{ background: "linear-gradient(135deg, #ec4899, #be185d)" }}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </div>
                          </button>
                        );
                      })()}

                      {/* Name + role */}
                      <div className="text-center space-y-1">
                        <h5 className="text-gray-900 text-base font-black tracking-tight leading-none">
                          {user?.name || form.watch("name") || "Your Name"}
                        </h5>
                        {(user?.role || form.watch("role")) && (
                          <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full text-pink-600 whitespace-nowrap" style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.25)" }}>
                            {ROLES.find((r) => r.value === (user?.role || form.watch("role")))?.label || (user?.role || form.watch("role") || "").replace(/[_-]/g, " ")}
                          </span>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(236,72,153,0.3), transparent)" }} />

                      {/* QR Code */}
                      <div className="rounded-2xl p-3 shadow-inner" style={{ background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.15)" }}>
                        <QRCodeSVG
                          value={
                            window.location.origin +
                            "/" +
                            (displaySlug || user?.uniqueSlug || window.location.pathname.split("/")[1] || "")
                          }
                          size={140}
                          level="H"
                          includeMargin={false}
                          fgColor="#be185d"
                          bgColor="transparent"
                        />
                      </div>

                      {/* Voice Code */}
                      <div className="text-center space-y-1 w-full">
                        <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-pink-400">Voice Code</p>
                        <div className="bg-pink-50 border border-pink-200 rounded-xl py-1.5 px-4">
                          <p className="text-pink-700 font-black font-mono text-sm tracking-[0.25em] uppercase">
                            {displaySlug || user?.uniqueSlug || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest whitespace-nowrap">brsconnect.in · Scan to Connect · స్కాన్ చేయండి</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download + Share button — hidden during image capture */}
              {!isCapturing && (
                <div className="flex-shrink-0 px-6 pb-8-safe pt-3 relative z-10 space-y-2">
                  <p className="text-center text-white/70 text-xs leading-relaxed">
                    Download as wallpaper — set it on your phone so anyone can scan to connect instantly.
                  </p>
                  <button
                    onClick={shareQR}
                    disabled={avatarConverting}
                    className="w-full bg-white text-pink-600 rounded-2xl py-4 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 hover:bg-pink-50 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {avatarConverting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                        </svg>
                        Preparing Avatar…
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download QR Wallpaper
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Campaign Pamphlet Dialog ── */}
        {/* Hidden inputs for pamphlet editor */}
        <input
          ref={pamphletBgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => setPamphletBgImage(ev.target?.result as string);
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />
        <input
          ref={pamphletPostImgRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && activePamphletPostIdx !== null) {
              const reader = new FileReader();
              reader.onload = (ev) => setPamphletPostImages((prev) => ({ ...prev, [activePamphletPostIdx!]: ev.target?.result as string }));
              reader.readAsDataURL(file);
            }
            e.target.value = "";
          }}
        />
        <input
          ref={pamphletGalleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach((file) => {
              const reader = new FileReader();
              reader.onload = (ev) => {
                const src = ev.target?.result as string;
                setPamphletGalleryImages((prev) => [
                  ...prev,
                  {
                    id: `gal-${Date.now()}-${Math.random()}`,
                    src,
                    x: Math.floor(Math.random() * 120) + 40,
                    y: Math.floor(Math.random() * 120) + 60,
                    w: 130,
                    h: 100,
                  },
                ]);
              };
              reader.readAsDataURL(file);
            });
            e.target.value = "";
          }}
        />
        <AnimatePresence>
          {showPamphletDialog && (() => {
            const rawCards = (user?.cards || selectedCards || []).filter(Boolean);
            const pamphletCards = rawCards.map((c: string) => {
              try { const card = JSON.parse(c); return card?.type ? card : null; } catch { return null; }
            }).filter(Boolean);

            const displayAvatarSrc = normalizeAvatarUrl(user?.avatarUrl || loggedInUser?.avatarUrl) || avatarUrl;
            const displayName = user?.name || form.watch("name") || "Your Name";
            const roleLabel = ROLES.find((r) => r.value === (user?.role || form.watch("role")))?.label || (user?.role || form.watch("role") || "Member").replace(/[_-]/g, " ");
            const profileQrValue = window.location.origin + "/" + (displaySlug || user?.uniqueSlug || "");

            const CANVAS_W = 360;
            const CANVAS_H = 500;
            const HEADER_H = 48;
            const PAD = 10;
            const GAP = 7;

            // QR block dimensions (based on default size for layout calc)
            const QR_DEFAULT_SIZE = 92;
            const QR_BOX_W = QR_DEFAULT_SIZE + 24; // QR + white padding both sides
            const QR_BLOCK_H = QR_DEFAULT_SIZE + 12 + 5 + 14; // white box + gap + text label
            const QR_ZONE = QR_BLOCK_H + PAD;

            const n = pamphletCards.length;

            // Special 2-card layout: any two cards
            // → first card as full-width landscape banner on top, second card bottom-left, QR bottom-right
            const isSpecialTwoCard = n === 2;
            const mediaCardIdx = 0; // banner (top)
            const postCardIdx = 1;  // below-left

            // Special layout measurements
            const BANNER_H = 134;
            const bottomRowY = HEADER_H + PAD + BANNER_H + GAP;
            const bottomRowH = CANVAS_H - bottomRowY - PAD;
            const postCardW = CANVAS_W - PAD * 2 - GAP - QR_BOX_W;

            // Standard grid layout
            const cols = !isSpecialTwoCard && n >= 2 ? 2 : 1;
            const rows = Math.ceil(n / Math.max(cols, 1));
            const availableH = CANVAS_H - HEADER_H - QR_ZONE - PAD;
            const baseCardW = Math.floor((CANVAS_W - PAD * 2 - GAP * (cols - 1)) / cols);
            const baseCardH = Math.max(65, Math.floor((availableH - GAP * Math.max(rows - 1, 0)) / Math.max(rows, 1)));

            const getCardSize = (idx: number) => {
              if (isSpecialTwoCard) {
                if (idx === mediaCardIdx) return { w: pamphletCardSizes[idx]?.w ?? CANVAS_W - PAD * 2, h: pamphletCardSizes[idx]?.h ?? BANNER_H };
                if (idx === postCardIdx) return { w: pamphletCardSizes[idx]?.w ?? postCardW, h: pamphletCardSizes[idx]?.h ?? bottomRowH };
              }
              return { w: pamphletCardSizes[idx]?.w ?? baseCardW, h: pamphletCardSizes[idx]?.h ?? baseCardH };
            };

            const getInitPos = (idx: number) => {
              if (isSpecialTwoCard) {
                if (idx === mediaCardIdx) return { x: PAD, y: HEADER_H + PAD };
                if (idx === postCardIdx) return { x: PAD, y: bottomRowY };
              }
              const col = cols === 2 ? idx % 2 : 0;
              const row = cols === 2 ? Math.floor(idx / 2) : idx;
              return {
                x: PAD + col * (baseCardW + GAP),
                y: HEADER_H + PAD + row * (baseCardH + GAP),
              };
            };

            // QR position: bottom-right in special layout, centered-bottom otherwise
            const qrInitLeft = isSpecialTwoCard
              ? CANVAS_W - PAD - QR_BOX_W
              : Math.floor((CANVAS_W - QR_BOX_W) / 2);
            const qrInitTop = isSpecialTwoCard
              ? bottomRowY + Math.max(0, Math.floor((bottomRowH - QR_BLOCK_H) / 2))
              : CANVAS_H - QR_BLOCK_H - PAD;

            const getYtThumb = (url: string) => {
              const m = (url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|v\/|embed\/|reels\/))([\w-]{11})/);
              return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
            };

            return (
              <motion.div
                key="pamphlet-dialog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                className="fixed inset-0 z-[110] flex flex-col"
                style={{ background: "#0a0a0a" }}
              >
                {/* Close */}
                {!isCapturingPamphlet && (
                  <div className="absolute top-4 right-4 z-[120]">
                    <button
                      onClick={() => { setShowPamphletDialog(false); setShowAddMenu(false); setEditingTextCardId(null); }}
                      className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90 border border-white/15"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}

                {/* Canvas scroll area */}
                <div
                  className="flex-1 overflow-y-auto flex items-start justify-center py-5 px-4 relative"
                  onClick={() => { if (!bottomSheetCollapsed) setBottomSheetCollapsed(true); }}
                >
                  {/* ── THE POSTER CANVAS ── */}
                  <div
                    id="pamphlet-fullscreen"
                    ref={pamphletCanvasRef}
                    className="relative flex-shrink-0 overflow-hidden"
                    style={{
                      width: CANVAS_W,
                      height: CANVAS_H,
                      borderRadius: 16,
                      boxShadow: "0 24px 80px rgba(0,0,0,0.9)",
                      background: pamphletBgImage
                        ? `url(${pamphletBgImage}) center/cover no-repeat`
                        : pamphletTheme.canvasBg,
                    }}
                  >
                    {/* Bg overlay when image is set */}
                    {pamphletBgImage && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 1, pointerEvents: "none" }} />
                    )}

                    {/* ── MINIMAL HEADER (non-draggable) ── */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0,
                        height: HEADER_H,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "0 12px",
                        background: pamphletBgImage
                          ? "rgba(0,0,0,0.55)"
                          : pamphletTheme.headerBg,
                        backdropFilter: pamphletBgImage ? "blur(10px)" : undefined,
                        zIndex: 20,
                      }}
                    >
                      {/* Avatar */}
                      <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid rgba(255,255,255,0.35)", background: "#fce7f3" }}>
                        {isCapturingPamphlet ? (
                          <img src={avatarDataUrl || displayAvatarSrc} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : displayAvatarSrc ? (
                          <img src={displayAvatarSrc} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#ec4899", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 14 }}>
                            {displayName[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      {/* Name + role */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "white", fontWeight: 800, fontSize: 13, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{displayName}</div>
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{roleLabel}</div>
                      </div>
                      {/* BRS logo */}
                      <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", background: "white", flexShrink: 0 }}>
                        <img src="/brs-logo.png" alt="BRS" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    </div>

                    {/* ── DRAGGABLE VOICE CARDS ── */}
                    {pamphletCards.map((card: any, idx: number) => {
                      const initPos = getInitPos(idx);
                      const { w: cardW, h: cardH } = getCardSize(idx);
                      const ytThumb = getYtThumb(card.url || "");
                      const postImg = pamphletPostImages[idx];
                      const isPost = card.type === "post";
                      const isReel = card.type === "reel";
                      const isXpost = card.type === "xpost";
                      const isImageCard = card.type === "image" || card.type === "product";
                      const isXVideo = isXpost && card.subtype === "video" && !!card.url && !card.imageUrl;
                      const hasBgMedia = (isReel && ytThumb) || (isImageCard && card.imageUrl) || (isPost && postImg) || (isXpost && !!card.imageUrl) || isXVideo;
                      const isDarkTheme = pamphletTheme.cardStyle === "dark";
                      const cardBg = isPost
                        ? "#0f0f0f"
                        : isXpost
                          ? "#0a0a0a"
                          : isDarkTheme ? "#111111" : "#1a1a2e";

                      return (
                        <motion.div
                          key={idx}
                          drag={pamphletResizingId !== `card-${idx}`}
                          dragConstraints={pamphletCanvasRef}
                          dragElastic={0}
                          dragMomentum={false}
                          whileDrag={{ scale: 1.03, zIndex: 60 }}
                          onTouchStart={(e) => {
                            if (isCapturingPamphlet || e.touches.length !== 2) return;
                            e.stopPropagation();
                            const t0 = e.touches[0], t1 = e.touches[1];
                            const startDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
                            const startW = cardW;
                            const startH = cardH;
                            const onTouchMove = (me: TouchEvent) => {
                              if (me.touches.length !== 2) return;
                              me.preventDefault();
                              me.stopPropagation();
                              const a = me.touches[0], b = me.touches[1];
                              const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
                              const scale = dist / startDist;
                              setPamphletCardSizes(prev => ({
                                ...prev,
                                [idx]: {
                                  w: Math.max(60, Math.round(startW * scale)),
                                  h: Math.max(50, Math.round(startH * scale)),
                                }
                              }));
                            };
                            const onTouchEnd = () => {
                              document.removeEventListener("touchmove", onTouchMove);
                              document.removeEventListener("touchend", onTouchEnd);
                            };
                            document.addEventListener("touchmove", onTouchMove, { passive: false });
                            document.addEventListener("touchend", onTouchEnd);
                          }}
                          style={{
                            position: "absolute",
                            left: initPos.x,
                            top: initPos.y,
                            width: cardW,
                            height: cardH,
                            borderRadius: 10,
                            overflow: "hidden",
                            zIndex: 10,
                            touchAction: "none",
                            cursor: isCapturingPamphlet ? "default" : "grab",
                            boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
                            background: cardBg,
                          }}
                        >
                          {/* Reel thumbnail */}
                          {isReel && ytThumb && (
                            <img src={ytThumb} alt={card.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                          {/* Reel play overlay */}
                          {isReel && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: ytThumb ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.6)", zIndex: 2 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: "white", marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
                              </div>
                            </div>
                          )}
                          {/* Image/product media */}
                          {isImageCard && card.imageUrl && (
                            <img src={card.imageUrl} alt={card.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                          {/* Post card — Voice-tab style layout */}
                          {isPost && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "7px 8px", zIndex: 3, overflow: "hidden" }}>
                              {/* Header */}
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5, flexShrink: 0 }}>
                                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(236,72,153,0.2)", border: "1px solid rgba(236,72,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <svg viewBox="0 0 24 24" style={{ width: 8, height: 8, fill: "none", stroke: "rgb(244,114,182)", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                </div>
                                <span style={{ fontSize: 7, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(216,180,254,0.6)" }}>Post</span>
                              </div>
                              {/* Content */}
                              <div style={{ flex: 1, overflow: "hidden" }}>
                                {card.content ? (
                                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 9, lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 10, overflow: "hidden", wordBreak: "break-words" }}>
                                    {card.content}
                                  </p>
                                ) : (
                                  <p style={{ color: "rgba(236,72,153,0.4)", fontSize: 8, textAlign: "center", marginTop: 8, fontWeight: 500 }}>
                                    Tap to write your post…
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          {/* X post media — image cover */}
                          {isXpost && card.imageUrl && (
                            <img src={card.imageUrl} alt={card.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                          {/* X video thumb */}
                          {isXpost && !card.imageUrl && card.subtype === "video" && card.url && (
                            <PamphletXVideoThumb url={card.url} />
                          )}
                          {/* X tweet card — iframe embed in normal view, styled fallback during capture */}
                          {isXpost && !card.imageUrl && card.subtype !== "video" && (() => {
                            const tweetIdMatch = (card.url || "").match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
                            const tweetId = tweetIdMatch?.[1];
                            if (!isCapturingPamphlet && tweetId) {
                              return (
                                <div style={{ position: "absolute", inset: 0, zIndex: 3, overflow: "hidden", borderRadius: 10 }}>
                                  <iframe
                                    src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark&chrome=nofooter&conversation=none`}
                                    style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none", display: "block" }}
                                    sandbox="allow-scripts allow-same-origin allow-popups"
                                    scrolling="no"
                                  />
                                </div>
                              );
                            }
                            // Capture mode or no tweet ID → styled X card
                            return (
                              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "8px 9px", zIndex: 3, overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, flexShrink: 0 }}>
                                  <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, fill: "rgba(255,255,255,0.55)", flexShrink: 0 }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                  <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>X Post</span>
                                </div>
                                <div style={{ flex: 1, overflow: "hidden" }}>
                                  {card.url ? (
                                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 8, lineHeight: 1.45, margin: 0, wordBreak: "break-all" }}>{card.url}</p>
                                  ) : (
                                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 8, textAlign: "center", marginTop: 12 }}>No URL</p>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                          {/* X video play overlay */}
                          {isXVideo && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.28)", zIndex: 2 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: "white", marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
                              </div>
                            </div>
                          )}
                          {/* X icon badge — bottom-right corner for image/video X cards only */}
                          {isXpost && (card.imageUrl || isXVideo) && (
                            <div style={{ position: "absolute", bottom: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
                              <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, fill: "white" }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </div>
                          )}

                          {/* Content layer — hidden for X post/video cards and post cards (which have their own layout) */}
                          {!isXpost && !isPost && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0, right: 0,
                              padding: "7px 9px",
                              background: hasBgMedia
                                ? "linear-gradient(to top, rgba(0,0,0,0.88) 60%, transparent)"
                                : "transparent",
                              zIndex: 3,
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                            }}
                          >
                            {/* Type label */}
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              {isReel && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 8, fontWeight: 700 }}>రీల్</span>}
                              {isImageCard && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 8, fontWeight: 700 }}>చిత్రం</span>}
                            </div>
                            {/* Title */}
                            <div
                              style={{
                                color: "white",
                                fontWeight: 800,
                                fontSize: 10,
                                lineHeight: 1.3,
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 2,
                                overflow: "hidden",
                              }}
                            >
                              {card.title || ""}
                            </div>
                          </div>
                          )}

                          {/* Post image upload button */}
                          {isPost && !isCapturingPamphlet && (
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePamphletPostIdx(idx);
                                setTimeout(() => pamphletPostImgRef.current?.click(), 0);
                              }}
                              style={{
                                position: "absolute",
                                top: 5, right: 5,
                                width: 22, height: 22,
                                borderRadius: "50%",
                                background: "#be185d",
                                border: "none",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer",
                                zIndex: 20,
                              }}
                            >
                              <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, fill: "none", stroke: "white", strokeWidth: 2.5, strokeLinecap: "round" }}>
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                              </svg>
                            </button>
                          )}

                          {/* Drag hint */}
                          {!isCapturingPamphlet && (
                            <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.28)", borderRadius: 3, padding: "1px 3px", zIndex: 20, pointerEvents: "none" }}>
                              <svg viewBox="0 0 24 24" style={{ width: 7, height: 7, fill: isPost ? "#be185d" : "rgba(255,255,255,0.6)" }}><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>
                            </div>
                          )}
                          {/* Resize handle — bottom-right corner */}
                          {!isCapturingPamphlet && (
                            <div
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setPamphletResizingId(`card-${idx}`);
                                const startX = e.clientX;
                                const startY = e.clientY;
                                const startW = cardW;
                                const startH = cardH;
                                const onMove = (me: PointerEvent) => {
                                  const newW = Math.max(60, startW + (me.clientX - startX));
                                  const newH = Math.max(50, startH + (me.clientY - startY));
                                  setPamphletCardSizes(prev => ({ ...prev, [idx]: { w: newW, h: newH } }));
                                };
                                const onUp = () => {
                                  setPamphletResizingId(null);
                                  document.removeEventListener("pointermove", onMove);
                                  document.removeEventListener("pointerup", onUp);
                                };
                                document.addEventListener("pointermove", onMove);
                                document.addEventListener("pointerup", onUp);
                              }}
                              style={{
                                position: "absolute",
                                bottom: 3, right: 3,
                                width: 14, height: 14,
                                cursor: "se-resize",
                                zIndex: 30,
                                display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                                touchAction: "none",
                              }}
                            >
                              <svg viewBox="0 0 10 10" style={{ width: 10, height: 10 }}>
                                <path d="M3 9L9 9L9 3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                <path d="M6 9L9 9L9 6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                              </svg>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* ── DRAGGABLE QR CODE ── */}
                    <motion.div
                      drag={pamphletResizingId !== "qr"}
                      dragConstraints={pamphletCanvasRef}
                      dragElastic={0}
                      dragMomentum={false}
                      whileDrag={{ zIndex: 60, scale: 1.05 }}
                      style={{
                        position: "absolute",
                        left: qrInitLeft,
                        top: qrInitTop,
                        zIndex: 15,
                        touchAction: "none",
                        cursor: isCapturingPamphlet ? "default" : "grab",
                        userSelect: "none",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative" }}>
                        <div style={{ background: "white", borderRadius: 12, padding: 6, boxShadow: "0 4px 20px rgba(0,0,0,0.45)", position: "relative" }}>
                          <QRCodeSVG
                            value={profileQrValue}
                            size={pamphletQrSize}
                            level="H"
                            includeMargin={false}
                            fgColor="#be185d"
                            bgColor="transparent"
                          />
                          {/* Resize handle on QR */}
                          {!isCapturingPamphlet && (
                            <div
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setPamphletResizingId("qr");
                                const startX = e.clientX;
                                const startY = e.clientY;
                                const startSize = pamphletQrSize;
                                const onMove = (me: PointerEvent) => {
                                  const delta = ((me.clientX - startX) + (me.clientY - startY)) / 2;
                                  setPamphletQrSize(Math.max(48, Math.min(180, Math.round(startSize + delta))));
                                };
                                const onUp = () => { setPamphletResizingId(null); document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); };
                                document.addEventListener("pointermove", onMove);
                                document.addEventListener("pointerup", onUp);
                              }}
                              style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, cursor: "se-resize", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", touchAction: "none", background: "rgba(190,24,93,0.75)", borderTopLeftRadius: 6, borderBottomRightRadius: 10 }}
                            >
                              <svg viewBox="0 0 10 10" style={{ width: 10, height: 10 }}>
                                <path d="M3 9L9 9L9 3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                <path d="M6 9L9 9L9 6" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <span style={{ color: pamphletBgImage ? "rgba(255,255,255,0.75)" : (pamphletTheme.cardStyle === "dark" ? "rgba(255,255,255,0.6)" : "#999"), fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                          Scan to Connect
                        </span>
                      </div>
                    </motion.div>

                    {/* ── DRAGGABLE GALLERY IMAGES ── */}
                    {pamphletGalleryImages.map((img) => (
                      <motion.div
                        key={img.id}
                        drag={pamphletResizingId !== img.id}
                        dragConstraints={pamphletCanvasRef}
                        dragElastic={0}
                        dragMomentum={false}
                        whileDrag={{ scale: 1.03, zIndex: 60 }}
                        style={{
                          position: "absolute",
                          left: img.x,
                          top: img.y,
                          width: img.w,
                          height: img.h,
                          borderRadius: 10,
                          overflow: "hidden",
                          zIndex: 18,
                          touchAction: pamphletResizingId === img.id ? "none" : "none",
                          cursor: isCapturingPamphlet ? "default" : "grab",
                          userSelect: "none",
                          boxShadow: "0 4px 18px rgba(0,0,0,0.45)",
                          border: "1.5px solid rgba(255,255,255,0.18)",
                          background: "#111",
                        }}
                        onTouchStart={(e) => {
                          if (isCapturingPamphlet || e.touches.length !== 2) return;
                          e.stopPropagation();
                          const t0 = e.touches[0], t1 = e.touches[1];
                          const startDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
                          const startW = img.w;
                          const startH = img.h;
                          const onTouchMove = (me: TouchEvent) => {
                            if (me.touches.length !== 2) return;
                            me.preventDefault();
                            me.stopPropagation();
                            const a = me.touches[0], b = me.touches[1];
                            const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
                            const scale = dist / startDist;
                            setPamphletGalleryImages(prev => prev.map(i => i.id === img.id
                              ? { ...i, w: Math.max(60, Math.round(startW * scale)), h: Math.max(50, Math.round(startH * scale)) }
                              : i));
                          };
                          const onTouchEnd = () => {
                            document.removeEventListener("touchmove", onTouchMove);
                            document.removeEventListener("touchend", onTouchEnd);
                          };
                          document.addEventListener("touchmove", onTouchMove, { passive: false });
                          document.addEventListener("touchend", onTouchEnd);
                        }}
                      >
                        {/* pointerEvents none so Framer Motion drag works on the outer div */}
                        <img
                          src={img.src}
                          alt=""
                          draggable={false}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none", userSelect: "none" }}
                        />
                        {!isCapturingPamphlet && (
                          <>
                            {/* Delete button */}
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); setPamphletGalleryImages(prev => prev.filter(i => i.id !== img.id)); }}
                              style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "#ef4444", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 30, padding: 0 }}
                            >
                              <svg viewBox="0 0 10 10" style={{ width: 8, height: 8, fill: "white" }}><path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </button>
                            {/* Resize handle */}
                            <div
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setPamphletResizingId(img.id);
                                const startX = e.clientX;
                                const startY = e.clientY;
                                const startW = img.w;
                                const startH = img.h;
                                const onMove = (me: PointerEvent) => {
                                  const newW = Math.max(60, startW + (me.clientX - startX));
                                  const newH = Math.max(50, startH + (me.clientY - startY));
                                  setPamphletGalleryImages(prev => prev.map(i => i.id === img.id ? { ...i, w: newW, h: newH } : i));
                                };
                                const onUp = () => {
                                  setPamphletResizingId(null);
                                  document.removeEventListener("pointermove", onMove);
                                  document.removeEventListener("pointerup", onUp);
                                };
                                document.addEventListener("pointermove", onMove);
                                document.addEventListener("pointerup", onUp);
                              }}
                              style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, cursor: "se-resize", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", touchAction: "none", background: "rgba(0,0,0,0.45)", borderTopLeftRadius: 6 }}
                            >
                              <svg viewBox="0 0 10 10" style={{ width: 10, height: 10 }}>
                                <path d="M3 9L9 9L9 3" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                <path d="M6 9L9 9L9 6" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                              </svg>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}

                    {/* ── DRAGGABLE TEXT CARDS ── */}
                    {pamphletTextCards.map((tc) => (
                      <motion.div
                        key={tc.id}
                        drag={editingTextCardId !== tc.id && pamphletResizingId !== tc.id}
                        dragConstraints={pamphletCanvasRef}
                        dragElastic={0}
                        dragMomentum={false}
                        whileDrag={{ scale: 1.03, zIndex: 65 }}
                        style={{
                          position: "absolute",
                          left: tc.x,
                          top: tc.y,
                          width: tc.w,
                          zIndex: 22,
                          touchAction: editingTextCardId === tc.id ? "auto" : "none",
                          cursor: isCapturingPamphlet ? "default" : editingTextCardId === tc.id ? "text" : "grab",
                          userSelect: editingTextCardId === tc.id ? "text" : "none",
                        }}
                      >
                        {editingTextCardId === tc.id ? (
                          <textarea
                            autoFocus
                            value={tc.text}
                            onChange={(e) => setPamphletTextCards(prev => prev.map(c => c.id === tc.id ? { ...c, text: e.target.value } : c))}
                            onBlur={() => setEditingTextCardId(null)}
                            style={{
                              background: "rgba(0,0,0,0.7)",
                              border: "1.5px solid rgba(255,255,255,0.5)",
                              borderRadius: 8,
                              color: tc.color,
                              fontSize: tc.fontSize,
                              fontWeight: tc.bold ? 900 : 700,
                              padding: "6px 10px",
                              width: "100%",
                              minHeight: 40,
                              outline: "none",
                              resize: "none",
                              lineHeight: 1.3,
                              letterSpacing: "0.01em",
                              display: "block",
                              boxSizing: "border-box",
                            }}
                            rows={2}
                            onPointerDown={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div
                            onClick={() => !isCapturingPamphlet && setEditingTextCardId(tc.id)}
                            style={{
                              fontSize: tc.fontSize,
                              fontWeight: tc.bold ? 900 : 700,
                              color: tc.color,
                              padding: "5px 10px",
                              textShadow: "0 2px 10px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)",
                              letterSpacing: "0.01em",
                              lineHeight: 1.3,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              width: "100%",
                              boxSizing: "border-box",
                              borderRadius: 8,
                              border: isCapturingPamphlet ? "none" : "1px dashed rgba(255,255,255,0.2)",
                            }}
                          >
                            {tc.text || "Tap to edit…"}
                          </div>
                        )}
                        {!isCapturingPamphlet && editingTextCardId !== tc.id && (
                          <>
                            {/* Delete */}
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); setPamphletTextCards(prev => prev.filter(c => c.id !== tc.id)); }}
                              style={{ position: "absolute", top: -8, right: -8, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 30, padding: 0 }}
                            >
                              <svg viewBox="0 0 10 10" style={{ width: 8, height: 8 }}><path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </button>
                            {/* Corner resize handle — resizes width & font size together */}
                            <div
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setPamphletResizingId(tc.id);
                                const startX = e.clientX;
                                const startW = tc.w;
                                const startFs = tc.fontSize;
                                const onMove = (me: PointerEvent) => {
                                  const ratio = Math.max(0.4, (startW + (me.clientX - startX)) / startW);
                                  const newW = Math.max(60, Math.round(startW * ratio));
                                  const newFs = Math.max(8, Math.min(72, Math.round(startFs * ratio)));
                                  setPamphletTextCards(prev => prev.map(c => c.id === tc.id ? { ...c, w: newW, fontSize: newFs } : c));
                                };
                                const onUp = () => { setPamphletResizingId(null); document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); };
                                document.addEventListener("pointermove", onMove);
                                document.addEventListener("pointerup", onUp);
                              }}
                              style={{ position: "absolute", bottom: 0, right: -1, width: 22, height: 22, cursor: "se-resize", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", touchAction: "none", background: "rgba(0,0,0,0.4)", borderTopLeftRadius: 6, borderBottomRightRadius: 8 }}
                            >
                              <svg viewBox="0 0 10 10" style={{ width: 10, height: 10 }}>
                                <path d="M3 9L9 9L9 3" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                <path d="M6 9L9 9L9 6" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                              </svg>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}

                    {/* ── DRAGGABLE DATE BLOCKS (multiple) ── */}
                    {pamphletDateBlocks.map((db) => {
                      const d = db.date;
                      const blockMode = db.mode || "all";
                      const day = d.getDate().toString().padStart(2, "0");
                      const mon = d.toLocaleString("en", { month: "short" }).toUpperCase();
                      const monLong = d.toLocaleString("en", { month: "long" });
                      const yr = d.getFullYear();
                      const dow = d.toLocaleString("en", { weekday: "short" }).toUpperCase();
                      return (
                        <motion.div
                          key={db.id}
                          drag
                          dragConstraints={pamphletCanvasRef}
                          dragElastic={0}
                          dragMomentum={false}
                          whileDrag={{ scale: 1.06, zIndex: 70 }}
                          style={{ position: "absolute", left: db.x, top: db.y, zIndex: 20, touchAction: "none", cursor: isCapturingPamphlet ? "default" : "grab", userSelect: "none" }}
                        >
                          <div
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { if (!isCapturingPamphlet) { e.stopPropagation(); setDatePickerMonth(new Date(d)); setShowYearPicker(false); setShowAllYearPicker(false); const bMode = db.mode || "all"; setDatePickerMode(bMode); if (bMode === "count") setDatePickerCount(db.count ?? 100); setEditingDateBlockId(db.id); } }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0,
                              borderRadius: 10,
                              overflow: "hidden",
                              boxShadow: "0 4px 18px rgba(0,0,0,0.55)",
                              border: `1.5px solid ${pamphletTheme.accentColor}55`,
                              cursor: isCapturingPamphlet ? "default" : "pointer",
                            }}
                          >
                            {/* Accent left strip */}
                            <div style={{ background: pamphletTheme.headerBg, width: 6, alignSelf: "stretch", flexShrink: 0 }} />
                            {/* Content */}
                            <div style={{ background: "rgba(10,10,20,0.9)", padding: "5px 10px", display: "flex", alignItems: "baseline", gap: 4 }}>
                              {blockMode === "count" ? (
                                <>
                                  <span style={{ fontSize: 22, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.03em" }}>{db.count ?? 100}</span>
                                  <span style={{ fontSize: 8, fontWeight: 800, color: pamphletTheme.accentColor, letterSpacing: "0.12em", lineHeight: 1, alignSelf: "flex-end", paddingBottom: 1 }}>DAYS</span>
                                </>
                              ) : blockMode === "year" ? (
                                <span style={{ fontSize: 18, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>{yr}</span>
                              ) : blockMode === "month" ? (
                                <>
                                  <span style={{ fontSize: 15, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.01em" }}>{monLong}</span>
                                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em", lineHeight: 1 }}>{yr}</span>
                                </>
                              ) : (
                                <>
                                  <span style={{ fontSize: 18, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>{day}</span>
                                  <span style={{ fontSize: 9, fontWeight: 800, color: pamphletTheme.accentColor, letterSpacing: "0.1em", lineHeight: 1 }}>{mon}</span>
                                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em", lineHeight: 1 }}>{yr}</span>
                                  <span style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", lineHeight: 1 }}>({dow})</span>
                                </>
                              )}
                            </div>
                          </div>
                          {!isCapturingPamphlet && (
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); setPamphletDateBlocks(prev => prev.filter(b => b.id !== db.id)); }}
                              style={{ position: "absolute", top: -6, right: -6, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 30, padding: 0 }}
                            >
                              <svg viewBox="0 0 10 10" style={{ width: 8, height: 8 }}><path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </button>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* ── DRAGGABLE BEFORE/AFTER BLOCKS ── */}
                    {pamphletBABlocks.map((bab) => {
                      const isBefore = bab.label === "before";
                      const accentColor = isBefore ? "#f59e0b" : "#38bdf8";
                      const accentBg = isBefore ? "linear-gradient(135deg,#f59e0b,#b45309)" : "linear-gradient(135deg,#38bdf8,#0369a1)";
                      return (
                        <motion.div
                          key={bab.id}
                          drag
                          dragConstraints={pamphletCanvasRef}
                          dragElastic={0}
                          dragMomentum={false}
                          whileDrag={{ scale: 1.06, zIndex: 70 }}
                          style={{ position: "absolute", left: bab.x, top: bab.y, zIndex: 20, touchAction: "none", cursor: isCapturingPamphlet ? "default" : "grab", userSelect: "none" }}
                        >
                          <div
                            onPointerDown={(e) => e.stopPropagation()}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0,
                              borderRadius: 10,
                              overflow: "hidden",
                              boxShadow: "0 4px 18px rgba(0,0,0,0.55)",
                              border: `1.5px solid ${accentColor}55`,
                            }}
                          >
                            {/* Accent left strip */}
                            <div style={{ background: accentBg, width: 6, alignSelf: "stretch", flexShrink: 0 }} />
                            {/* Content */}
                            <div style={{ background: "rgba(10,10,20,0.92)", padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                              {isBefore ? (
                                <svg viewBox="0 0 12 12" style={{ width: 10, height: 10, fill: "none", stroke: accentColor, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 }}>
                                  <polyline points="7,2 2,6 7,10"/><line x1="2" y1="6" x2="10" y2="6"/>
                                </svg>
                              ) : (
                                <svg viewBox="0 0 12 12" style={{ width: 10, height: 10, fill: "none", stroke: accentColor, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 }}>
                                  <polyline points="5,2 10,6 5,10"/><line x1="10" y1="6" x2="2" y2="6"/>
                                </svg>
                              )}
                              <span style={{ fontSize: 13, fontWeight: 900, color: "white", letterSpacing: "0.08em", lineHeight: 1 }}>
                                {isBefore ? "BEFORE" : "AFTER"}
                              </span>
                            </div>
                          </div>
                          {!isCapturingPamphlet && (
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); setPamphletBABlocks(prev => prev.filter(b => b.id !== bab.id)); }}
                              style={{ position: "absolute", top: -6, right: -6, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 30, padding: 0 }}
                            >
                              <svg viewBox="0 0 10 10" style={{ width: 8, height: 8 }}><path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </button>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* ── DRAGGABLE STICKERS ── */}
                    {pamphletStickers.map((sticker, si) => (
                      <motion.div
                        key={sticker.id}
                        drag
                        dragConstraints={pamphletCanvasRef}
                        dragElastic={0}
                        dragMomentum={false}
                        whileDrag={{ scale: 1.15, zIndex: 70 }}
                        style={{
                          position: "absolute",
                          left: sticker.x,
                          top: sticker.y,
                          zIndex: 20,
                          touchAction: "none",
                          cursor: isCapturingPamphlet ? "default" : "grab",
                          userSelect: "none",
                        }}
                      >
                        <div
                          style={{
                            fontSize: sticker.size,
                            fontWeight: sticker.bold ? 900 : 700,
                            color: sticker.color || "white",
                            lineHeight: 1,
                            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                            WebkitTextStroke: sticker.color ? `1px ${sticker.color}` : undefined,
                            letterSpacing: sticker.bold ? "0.05em" : 0,
                          }}
                        >
                          {sticker.e}
                        </div>
                        {!isCapturingPamphlet && (
                          <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setPamphletStickers(prev => prev.filter((_, i) => i !== si)); }}
                            style={{ position: "absolute", top: -6, right: -6, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 30, padding: 0 }}
                          >
                            <svg viewBox="0 0 10 10" style={{ width: 8, height: 8, fill: "white" }}><path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* ── FLOATING ADD BUTTON + SUB-MENU ── */}
                  {!isCapturingPamphlet && (
                    <div style={{ position: "absolute", bottom: 24, right: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, zIndex: 50 }}>
                      {/* Sub-menu buttons (shown when + is active) */}
                      {showAddMenu && (
                        <>
                          {/* Upload Image button */}
                          <button
                            onClick={() => { setShowAddMenu(false); pamphletGalleryInputRef.current?.click(); }}
                            style={{
                              width: 44, height: 44, borderRadius: "50%",
                              background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                              border: "2px solid rgba(255,255,255,0.25)",
                              boxShadow: "0 4px 16px rgba(124,58,237,0.5)",
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", gap: 1,
                            }}
                          >
                            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: "none", stroke: "white", strokeWidth: 2, strokeLinecap: "round" }}>
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <span style={{ fontSize: 6, color: "white", fontWeight: 800, letterSpacing: "0.05em", lineHeight: 1 }}>IMAGE</span>
                          </button>
                          {/* Text button */}
                          <button
                            onClick={() => {
                              setShowAddMenu(false);
                              const newCard = {
                                id: `tc-${Date.now()}`,
                                text: "",
                                x: 60 + Math.floor(Math.random() * 120),
                                y: 120 + Math.floor(Math.random() * 200),
                                w: 160,
                                fontSize: 22,
                                color: "#ffffff",
                                bold: true,
                              };
                              setPamphletTextCards(prev => [...prev, newCard]);
                              setTimeout(() => setEditingTextCardId(newCard.id), 50);
                            }}
                            style={{
                              width: 44, height: 44, borderRadius: "50%",
                              background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
                              border: "2px solid rgba(255,255,255,0.25)",
                              boxShadow: "0 4px 16px rgba(14,165,233,0.5)",
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", gap: 1,
                            }}
                          >
                            <span style={{ fontSize: 18, color: "white", fontWeight: 900, lineHeight: 1, fontFamily: "serif" }}>T</span>
                            <span style={{ fontSize: 6, color: "white", fontWeight: 800, letterSpacing: "0.05em", lineHeight: 1 }}>TEXT</span>
                          </button>
                          {/* Calendar / Date button */}
                          <button
                            onClick={() => {
                              setShowAddMenu(false);
                              const today = new Date();
                              const newId = `db-${Date.now()}`;
                              setPamphletDateBlocks(prev => [...prev, { id: newId, x: 60 + Math.floor(Math.random() * 140), y: 80 + Math.floor(Math.random() * 180), date: today, mode: "all" }]);
                              setDatePickerMonth(today);
                              setDatePickerMode("all");
                            }}
                            style={{
                              width: 44, height: 44, borderRadius: "50%",
                              background: "linear-gradient(135deg, #10b981, #065f46)",
                              border: "2px solid rgba(255,255,255,0.25)",
                              boxShadow: "0 4px 16px rgba(16,185,129,0.5)",
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", gap: 1,
                            }}
                          >
                            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: "none", stroke: "white", strokeWidth: 2, strokeLinecap: "round" }}>
                              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span style={{ fontSize: 6, color: "white", fontWeight: 800, letterSpacing: "0.05em", lineHeight: 1 }}>DATE</span>
                          </button>
                          {/* Before / After button */}
                          <button
                            onClick={() => {
                              setShowAddMenu(false);
                              const now = Date.now();
                              setPamphletBABlocks(prev => [
                                ...prev,
                                { id: `bab-before-${now}`, label: "before" as const, x: 14, y: 180 },
                                { id: `bab-after-${now}`, label: "after" as const, x: 220, y: 180 },
                              ]);
                            }}
                            style={{
                              width: 44, height: 44, borderRadius: "50%",
                              background: "linear-gradient(135deg, #f59e0b, #b45309)",
                              border: "2px solid rgba(255,255,255,0.25)",
                              boxShadow: "0 4px 16px rgba(245,158,11,0.5)",
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", gap: 1,
                            }}
                          >
                            <svg viewBox="0 0 24 10" style={{ width: 20, height: 9, fill: "none", stroke: "white", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}>
                              <polyline points="7,1 2,5 7,9"/>
                              <line x1="2" y1="5" x2="11" y2="5"/>
                              <line x1="13" y1="5" x2="22" y2="5"/>
                              <polyline points="17,1 22,5 17,9"/>
                            </svg>
                            <span style={{ fontSize: 6, color: "white", fontWeight: 800, letterSpacing: "0.05em", lineHeight: 1 }}>B / A</span>
                          </button>
                        </>
                      )}
                      {/* Main + toggle button */}
                      <button
                        onClick={() => setShowAddMenu(v => !v)}
                        style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: showAddMenu
                            ? "rgba(255,255,255,0.15)"
                            : "linear-gradient(135deg, #ec4899, #be185d)",
                          border: "2.5px solid rgba(255,255,255,0.25)",
                          boxShadow: showAddMenu ? "none" : "0 4px 20px rgba(190,24,93,0.5)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "none", stroke: "white", strokeWidth: 2.5, strokeLinecap: "round", transform: showAddMenu ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>
                  )}

                </div>

                {/* ── BOTTOM TOOLBAR ── */}
                {!isCapturingPamphlet && (
                  <div className="flex-shrink-0 relative">
                  <motion.div
                    initial={false}
                    animate={bottomSheetCollapsed ? { height: 0, opacity: 0 } : { height: "auto", opacity: 1 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    style={{ overflow: "hidden" }}
                  >
                  <div className="px-4 pt-2 space-y-2">
                    {/* Theme Carousel */}
                    <div>
                      <p className="text-[8px] text-white/30 uppercase tracking-[0.18em] font-bold mb-2">Campaign Theme</p>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        {CAMPAIGN_THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => { setPamphletTheme(theme); setPamphletBgImage(null); }}
                            className="flex-shrink-0 snap-start flex flex-col items-center gap-1 group"
                          >
                            <div
                              className="relative overflow-hidden transition-all duration-200"
                              style={{
                                width: 48,
                                height: 68,
                                borderRadius: 8,
                                background: theme.preview,
                                border: pamphletTheme.id === theme.id
                                  ? `2px solid ${theme.accentColor}`
                                  : "2px solid rgba(255,255,255,0.08)",
                                boxShadow: pamphletTheme.id === theme.id
                                  ? `0 0 12px ${theme.accentColor}55`
                                  : "none",
                              }}
                            >
                              {/* Mini header strip */}
                              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: theme.headerBg, opacity: 0.9 }} />
                              {/* Mini card strips */}
                              <div style={{ position: "absolute", bottom: 8, left: 4, right: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                                {[0, 1].map((i) => (
                                  <div key={i} style={{ height: 10, borderRadius: 3, background: theme.cardStyle === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }} />
                                ))}
                              </div>
                              {/* Accent dot */}
                              <div style={{ position: "absolute", bottom: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: theme.accentColor }} />
                              {pamphletTheme.id === theme.id && (
                                <div style={{ position: "absolute", top: 3, right: 3, width: 10, height: 10, borderRadius: "50%", background: theme.accentColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <svg viewBox="0 0 12 12" style={{ width: 6, height: 6, fill: "white" }}><path d="M2 6l3 3 5-5"/></svg>
                                </div>
                              )}
                              {/* Badge ribbon */}
                              {(theme as any).badge && pamphletTheme.id !== theme.id && (
                                <div style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: `${theme.accentColor}cc`,
                                  backdropFilter: "blur(4px)",
                                  fontSize: 6,
                                  fontWeight: 800,
                                  color: "white",
                                  textAlign: "center",
                                  padding: "2px 0",
                                  letterSpacing: "0.02em",
                                  lineHeight: 1.2,
                                }}>
                                  {(theme as any).badge}
                                </div>
                              )}
                            </div>
                            <span style={{ fontSize: 7, color: pamphletTheme.id === theme.id ? theme.accentColor : "rgba(255,255,255,0.45)", fontWeight: 700, textAlign: "center", maxWidth: 52, lineHeight: 1.2, letterSpacing: "0.03em" }}>
                              {theme.label}
                            </span>
                            <span style={{ fontSize: 5.5, color: (theme as any).badge && pamphletTheme.id !== theme.id ? `${theme.accentColor}99` : "rgba(255,255,255,0.18)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              {theme.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sticker Tray */}
                    {showStickerTray && (
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: "8px 8px 6px" }}>
                        {/* Category tabs */}
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-2">
                          {STICKER_CATEGORIES.map((cat, ci) => (
                            <button
                              key={ci}
                              onClick={() => setStickerCategory(ci)}
                              className="flex-shrink-0 px-2 py-0.5 rounded-full text-[8px] font-bold transition-all"
                              style={{
                                background: stickerCategory === ci ? pamphletTheme.accentColor : "rgba(255,255,255,0.07)",
                                color: stickerCategory === ci ? "white" : "rgba(255,255,255,0.45)",
                              }}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                        {/* Sticker grid */}
                        <div className="flex flex-wrap gap-1.5">
                          {STICKER_CATEGORIES[stickerCategory].items.map((stk) => (
                            <button
                              key={stk.id}
                              onClick={() => {
                                const newSticker = {
                                  id: `${stk.id}-${Date.now()}`,
                                  e: stk.e,
                                  x: Math.floor(Math.random() * 220) + 60,
                                  y: Math.floor(Math.random() * 200) + 80,
                                  size: (stk as any).bold ? 20 : 28,
                                  color: (stk as any).color,
                                  bold: (stk as any).bold,
                                };
                                setPamphletStickers(prev => [...prev, newSticker]);
                              }}
                              className="flex flex-col items-center gap-0.5 active:scale-90 transition-all"
                              style={{ minWidth: 36 }}
                            >
                              <div style={{ fontSize: (stk as any).bold ? 16 : 22, lineHeight: 1, fontWeight: (stk as any).bold ? 900 : 400, color: (stk as any).color || "white" }}>
                                {stk.e}
                              </div>
                              <span style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{stk.label}</span>
                            </button>
                          ))}
                        </div>
                        {pamphletStickers.length > 0 && (
                          <button
                            onClick={() => setPamphletStickers([])}
                            className="mt-2 w-full text-center text-[8px] text-red-400/60 font-bold tracking-wider"
                          >
                            Clear All Stickers
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  </motion.div>

                  {/* ── ALWAYS-VISIBLE ACTION BAR ── */}
                  <div className="px-4 pb-5 pt-2" style={{ borderTop: bottomSheetCollapsed ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    {/* Toggle row */}
                    <div className="flex justify-center mb-2">
                      <button
                        onClick={() => setBottomSheetCollapsed(v => !v)}
                        className="flex items-center gap-1.5 px-4 py-1 rounded-full active:scale-95 transition-all"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        <svg
                          viewBox="0 0 20 10"
                          style={{
                            width: 16,
                            height: 8,
                            fill: "none",
                            stroke: "rgba(255,255,255,0.45)",
                            strokeWidth: 2,
                            strokeLinecap: "round",
                            transform: bottomSheetCollapsed ? "none" : "rotate(180deg)",
                            transition: "transform 0.3s",
                          }}
                        >
                          <polyline points="2,8 10,2 18,8" />
                        </svg>
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          {bottomSheetCollapsed ? "Expand" : "Collapse"}
                        </span>
                      </button>
                    </div>
                    {/* Action buttons — always visible */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowStickerTray(s => !s); setBottomSheetCollapsed(false); }}
                        className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-bold active:scale-95 transition-all border"
                        style={{
                          background: showStickerTray ? "rgba(190,24,93,0.25)" : "rgba(255,255,255,0.06)",
                          borderColor: showStickerTray ? "rgba(190,24,93,0.5)" : "rgba(255,255,255,0.1)",
                          color: showStickerTray ? "#ec4899" : "rgba(255,255,255,0.7)",
                          flex: 1,
                        }}
                      >
                        🎭 Stickers
                      </button>
                      <button
                        onClick={() => pamphletBgInputRef.current?.click()}
                        className="flex items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold text-white/70 active:scale-95 transition-all border border-white/10"
                        style={{ background: "rgba(255,255,255,0.06)", flex: 1 }}
                      >
                        <ImageIcon className="w-3 h-3" />
                        BG
                      </button>
                      {pamphletBgImage && (
                        <button
                          onClick={() => setPamphletBgImage(null)}
                          className="px-2.5 rounded-xl py-2.5 text-[11px] font-bold text-red-400/80 active:scale-95 border border-red-400/15"
                          style={{ background: "rgba(239,68,68,0.07)" }}
                        >
                          ✕
                        </button>
                      )}
                      <button
                        onClick={sharePamphlet}
                        className="flex items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold text-white active:scale-95 shadow-lg"
                        style={{ background: pamphletTheme.headerBg, flex: 1 }}
                      >
                        <Download className="w-3 h-3" />
                        Save
                      </button>
                    </div>
                  </div>
                  </div>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>

        <AnimatePresence>
          {showAvatarDialog && (
            <div className="fixed inset-0 z-[130] flex items-end justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAvatarDialog(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full max-w-sm bg-[#120008] border border-pink-500/20 rounded-t-[28px] p-6 pb-8 shadow-2xl"
              >
                <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mb-5" />

                {/* Current avatar preview */}
                <div className="flex flex-col items-center mb-5">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-pink-500 shadow-lg bg-pink-500 flex items-center justify-center">
                    {normalizeAvatarUrl(loggedInUser?.avatarUrl) ? (
                      <img
                        src={normalizeAvatarUrl(loggedInUser?.avatarUrl)!}
                        alt="Current"
                        className="w-full h-full object-cover"
                        loading="eager"
                        fetchPriority="high"
                        onError={(e) => {
                          const t = e.currentTarget;
                          t.style.display = "none";
                          const fallback = t.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-pink-500 items-center justify-center text-white text-xl font-bold"
                      style={{ display: normalizeAvatarUrl(loggedInUser?.avatarUrl) ? "none" : "flex" }}
                    >
                      {loggedInUser?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  </div>
                  <p className="text-[9px] text-pink-300/50 mt-1.5 uppercase tracking-widest font-bold">Current</p>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-pink-300/60 text-center mb-4">
                  Change Avatar
                </p>

                {/* Hidden file input */}
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />

                {/* Upload + Remove row */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-pink-500/40 bg-pink-500/10 text-pink-300 text-xs font-bold tracking-wide active:scale-95 transition-all hover:bg-pink-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload
                  </button>
                  {loggedInUser?.avatarUrl && (
                    <button
                      onClick={removeAvatar}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold tracking-wide active:scale-95 transition-all hover:bg-red-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-[9px] text-white/30 uppercase tracking-widest text-center mb-3">or choose preset</p>

                <div className="grid grid-cols-4 gap-3">
                  {professionalAvatars.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => selectPresetAvatar(src)}
                      className={`relative rounded-full overflow-hidden aspect-square transition-all active:scale-95 ${avatarUrl === src ? "ring-2 ring-pink-500 ring-offset-2 ring-offset-[#120008]" : "opacity-70 hover:opacity-100"}`}
                    >
                      <img src={src} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" loading="eager" />
                      {avatarUrl === src && (
                        <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── DATE PICKER DIALOG ── */}
        <AnimatePresence>
          {editingDateBlockId && (() => {
            const editingBlock = pamphletDateBlocks.find(b => b.id === editingDateBlockId);
            if (!editingBlock) return null;
            const selected = editingBlock.date;
            const year = datePickerMonth.getFullYear();
            const month = datePickerMonth.getMonth();
            const monthLabel = datePickerMonth.toLocaleString("en", { month: "long" });
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const cells: (number | null)[] = [];
            for (let i = 0; i < firstDay; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push(d);
            while (cells.length % 7 !== 0) cells.push(null);
            const weeks: (number | null)[][] = [];
            for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
            const isSelected = (d: number | null) => d !== null && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === d;
            const isToday = (d: number | null) => { const t = new Date(); return d !== null && t.getFullYear() === year && t.getMonth() === month && t.getDate() === d; };
            return (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingDateBlockId(null)}
                  className="absolute inset-0"
                  style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: 16 }}
                  transition={{ type: "spring", damping: 28, stiffness: 340 }}
                  style={{ position: "relative", background: "#111114", borderRadius: 20, padding: "20px 16px 16px", width: "100%", maxWidth: 300, boxShadow: "0 24px 60px rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  {/* Mode toggle: All / Month / Year / Count */}
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 3, marginBottom: 14, gap: 2 }}>
                    {(["all", "month", "year", "count"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => { setDatePickerMode(m); setShowYearPicker(false); setShowAllYearPicker(false); }}
                        style={{
                          flex: 1,
                          padding: "5px 0",
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 10,
                          fontWeight: datePickerMode === m ? 800 : 500,
                          background: datePickerMode === m ? (m === "count" ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.14)") : "transparent",
                          color: datePickerMode === m ? (m === "count" ? "#f59e0b" : "white") : "rgba(255,255,255,0.4)",
                          transition: "all 0.15s",
                          letterSpacing: "0.04em",
                          textTransform: "capitalize",
                        }}
                      >
                        {m === "all" ? "All" : m === "month" ? "Month" : m === "year" ? "Year" : "Count"}
                      </button>
                    ))}
                  </div>

                  {/* Year-only mode */}
                  {datePickerMode === "year" && (() => {
                    const START_YEAR = 1950;
                    const END_YEAR = 2100;
                    const thisYear = new Date().getFullYear();
                    const COL_COUNT = 4;
                    const ROW_H = 36;
                    const allYears = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);
                    const startVisibleRow = Math.max(0, Math.floor((thisYear - 12 - START_YEAR) / COL_COUNT));
                    return (
                      <div
                        ref={(el) => { if (el) el.scrollTop = startVisibleRow * ROW_H; }}
                        style={{ height: 180, overflowY: "auto", padding: "4px 0 8px", scrollbarWidth: "none" }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: `repeat(${COL_COUNT}, 1fr)`, gap: 6 }}>
                          {allYears.map((y) => (
                            <button
                              key={y}
                              onClick={() => {
                                const newDate = new Date(y, month, 1);
                                setPamphletDateBlocks(prev => prev.map(b => b.id === editingDateBlockId ? { ...b, date: newDate, mode: "year" } : b));
                                setEditingDateBlockId(null);
                              }}
                              style={{
                                padding: "8px 0",
                                borderRadius: 10,
                                border: "none",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: y === year ? 800 : y === thisYear ? 600 : 500,
                                background: y === year ? "rgba(245,158,11,0.22)" : y === thisYear && y !== year ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                                color: y === year ? "#f59e0b" : "rgba(255,255,255,0.75)",
                                outline: y === year ? "1.5px solid rgba(245,158,11,0.5)" : y === thisYear && y !== year ? "1px solid rgba(255,255,255,0.15)" : "none",
                                transition: "background 0.12s",
                              }}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Month-only mode */}
                  {datePickerMode === "month" && (
                    <>
                      {/* Year nav for month mode */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <button
                          onClick={() => setDatePickerMonth(new Date(year - 1, month, 1))}
                          style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <svg viewBox="0 0 16 16" style={{ width: 12, height: 12, fill: "none", stroke: "rgba(255,255,255,0.6)", strokeWidth: 2, strokeLinecap: "round" }}><polyline points="10,3 5,8 10,13"/></svg>
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{year}</span>
                        <button
                          onClick={() => setDatePickerMonth(new Date(year + 1, month, 1))}
                          style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <svg viewBox="0 0 16 16" style={{ width: 12, height: 12, fill: "none", stroke: "rgba(255,255,255,0.6)", strokeWidth: 2, strokeLinecap: "round" }}><polyline points="6,3 11,8 6,13"/></svg>
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, padding: "4px 0 8px" }}>
                        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((mn, mi) => {
                          const isSel = selected.getFullYear() === year && selected.getMonth() === mi;
                          return (
                            <button
                              key={mi}
                              onClick={() => {
                                const newDate = new Date(year, mi, 1);
                                setPamphletDateBlocks(prev => prev.map(b => b.id === editingDateBlockId ? { ...b, date: newDate, mode: "month" } : b));
                                setEditingDateBlockId(null);
                              }}
                              style={{
                                padding: "9px 0",
                                borderRadius: 10,
                                border: "none",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: isSel ? 800 : 500,
                                background: isSel ? "rgba(255,255,255,0.92)" : mi === month ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                                color: isSel ? "#111114" : "rgba(255,255,255,0.8)",
                                outline: mi === month && !isSel ? "1px solid rgba(255,255,255,0.15)" : "none",
                                transition: "background 0.12s",
                              }}
                            >
                              {mn}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* All (full date) mode */}
                  {datePickerMode === "all" && (
                    <>
                      {/* Month nav */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <button
                          onClick={() => { if (!showAllYearPicker) setDatePickerMonth(new Date(year, month - 1, 1)); }}
                          style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: showAllYearPicker ? 0.25 : 1 }}
                        >
                          <svg viewBox="0 0 16 16" style={{ width: 12, height: 12, fill: "none", stroke: "rgba(255,255,255,0.6)", strokeWidth: 2, strokeLinecap: "round" }}><polyline points="10,3 5,8 10,13"/></svg>
                        </button>
                        <button
                          onClick={() => setShowAllYearPicker(v => !v)}
                          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 8 }}
                        >
                          <span style={{ fontSize: 14, fontWeight: 700, color: "white", letterSpacing: "0.01em" }}>{monthLabel}</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: showAllYearPicker ? "#f59e0b" : "rgba(255,255,255,0.5)", letterSpacing: "0.01em", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}>{year}</span>
                          <svg viewBox="0 0 12 12" style={{ width: 10, height: 10, fill: "none", stroke: showAllYearPicker ? "#f59e0b" : "rgba(255,255,255,0.35)", strokeWidth: 2, strokeLinecap: "round", transform: showAllYearPicker ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="2,4 6,8 10,4"/></svg>
                        </button>
                        <button
                          onClick={() => { if (!showAllYearPicker) setDatePickerMonth(new Date(year, month + 1, 1)); }}
                          style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: showAllYearPicker ? 0.25 : 1 }}
                        >
                          <svg viewBox="0 0 16 16" style={{ width: 12, height: 12, fill: "none", stroke: "rgba(255,255,255,0.6)", strokeWidth: 2, strokeLinecap: "round" }}><polyline points="6,3 11,8 6,13"/></svg>
                        </button>
                      </div>

                      {/* Scrollable year picker (replaces calendar when open) */}
                      {showAllYearPicker ? (() => {
                        const START_YEAR = 1950;
                        const END_YEAR = 2100;
                        const thisYear = new Date().getFullYear();
                        const COL_COUNT = 4;
                        const ROW_H = 36;
                        const allYears = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);
                        const startVisibleRow = Math.max(0, Math.floor((thisYear - 12 - START_YEAR) / COL_COUNT));
                        return (
                          <div
                            ref={(el) => { if (el) el.scrollTop = startVisibleRow * ROW_H; }}
                            style={{ height: 180, overflowY: "auto", padding: "4px 0 8px", scrollbarWidth: "none" }}
                          >
                            <div style={{ display: "grid", gridTemplateColumns: `repeat(${COL_COUNT}, 1fr)`, gap: 6 }}>
                              {allYears.map((y) => (
                                <button
                                  key={y}
                                  onClick={() => { setDatePickerMonth(new Date(y, month, 1)); setShowAllYearPicker(false); }}
                                  style={{
                                    padding: "8px 0",
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: y === year ? 800 : y === thisYear ? 600 : 500,
                                    background: y === year ? "rgba(245,158,11,0.22)" : y === thisYear && y !== year ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                                    color: y === year ? "#f59e0b" : "rgba(255,255,255,0.75)",
                                    outline: y === year ? "1.5px solid rgba(245,158,11,0.5)" : y === thisYear && y !== year ? "1px solid rgba(255,255,255,0.15)" : "none",
                                    transition: "background 0.12s",
                                  }}
                                >
                                  {y}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })() : (
                        <>
                          {/* Day-of-week headers */}
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
                            {["S","M","T","W","T","F","S"].map((d, i) => (
                              <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", paddingBottom: 6 }}>{d}</div>
                            ))}
                          </div>
                          {/* Calendar grid */}
                          {weeks.map((week, wi) => (
                            <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 2 }}>
                              {week.map((day, di) => (
                                <button
                                  key={di}
                                  onClick={() => {
                                    if (!day) return;
                                    const newDate = new Date(year, month, day);
                                    setPamphletDateBlocks(prev => prev.map(b => b.id === editingDateBlockId ? { ...b, date: newDate, mode: "all" } : b));
                                    setEditingDateBlockId(null);
                                  }}
                                  disabled={!day}
                                  style={{
                                    width: "100%",
                                    aspectRatio: "1",
                                    borderRadius: 8,
                                    background: isSelected(day) ? "rgba(255,255,255,0.92)" : "transparent",
                                    border: "none",
                                    cursor: day ? "pointer" : "default",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 13,
                                    fontWeight: isSelected(day) ? 800 : isToday(day) ? 700 : 400,
                                    color: isSelected(day) ? "#111114" : day ? "rgba(255,255,255,0.88)" : "transparent",
                                    position: "relative",
                                  }}
                                >
                                  {day || ""}
                                  {isToday(day) && !isSelected(day) && (
                                    <span style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
                                  )}
                                </button>
                              ))}
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}

                  {/* Count mode */}
                  {datePickerMode === "count" && (
                    <div style={{ padding: "4px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                      {/* Big number display */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button
                          onClick={() => setDatePickerCount(v => Math.max(1, v - 1))}
                          style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >−</button>
                        <div style={{ textAlign: "center" }}>
                          <input
                            type="number"
                            min={1}
                            max={9999}
                            value={datePickerCount}
                            onChange={(e) => { const v = parseInt(e.target.value) || 1; setDatePickerCount(Math.min(9999, Math.max(1, v))); }}
                            style={{ width: 90, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "white", fontSize: 28, fontWeight: 900, textAlign: "center", padding: "6px 0", outline: "none", WebkitAppearance: "none", MozAppearance: "textfield" }}
                          />
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#f59e0b", letterSpacing: "0.15em", marginTop: 3 }}>DAYS</div>
                        </div>
                        <button
                          onClick={() => setDatePickerCount(v => Math.min(9999, v + 1))}
                          style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >+</button>
                      </div>
                      {/* Quick presets */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                        {[10, 50, 100, 150, 200, 365, 500, 1000].map(n => (
                          <button
                            key={n}
                            onClick={() => setDatePickerCount(n)}
                            style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: datePickerCount === n ? 800 : 600, background: datePickerCount === n ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.07)", color: datePickerCount === n ? "#f59e0b" : "rgba(255,255,255,0.65)", outline: datePickerCount === n ? "1px solid rgba(245,158,11,0.5)" : "none", transition: "all 0.12s" }}
                          >{n}</button>
                        ))}
                      </div>
                      {/* Set button */}
                      <button
                        onClick={() => {
                          setPamphletDateBlocks(prev => prev.map(b => b.id === editingDateBlockId ? { ...b, count: datePickerCount, mode: "count" } : b));
                          setEditingDateBlockId(null);
                        }}
                        style={{ width: "100%", padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, background: "rgba(245,158,11,0.9)", color: "#111114", letterSpacing: "0.04em" }}
                      >
                        Set {datePickerCount} Days
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

        <AnimatePresence>
          {showHomeDialog && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 backdrop-blur-md"
                style={{ background: "rgba(190,24,93,0.55)" }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="relative w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(160deg, #ec4899 0%, #be185d 60%, #9d174d 100%)" }}
              >
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-25 blur-2xl pointer-events-none" style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }} />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: "radial-gradient(circle, #fce7f3, transparent)" }} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-6 pb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white overflow-hidden shadow">
                      <img src="/brs-logo.png" alt="BRS" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-white font-black text-sm tracking-tight">BRS Connect</p>
                  </div>
                </div>

                <div className="px-5 pb-6 relative z-10 space-y-5">
                  {/* Name greeting */}
                  <div className="text-center space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                      {form.getValues("name") || "Welcome!"}
                    </h3>
                    <p className="text-white/70 text-xs">Your profile is live. Set a PIN to secure it.</p>
                  </div>

                  {/* Voice Code display / edit */}
                  <div className="rounded-2xl px-4 py-3 space-y-1" style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/70">Voice Code</p>
                      {!homeSlugEditing ? (
                        <button
                          type="button"
                          onClick={() => {
                            setHomeSlugValue(user?.uniqueSlug || "");
                            setHomeSlugStatus("idle");
                            setHomeSlugEditing(true);
                          }}
                          className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors active:scale-90"
                        >
                          <Pencil className="w-3 h-3 text-white" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setHomeSlugEditing(false); setHomeSlugStatus("idle"); }}
                          className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors active:scale-90"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                    {homeSlugEditing ? (
                      <div className="space-y-1.5">
                        <input
                          autoFocus
                          type="text"
                          value={homeSlugValue}
                          onChange={(e) => setHomeSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                          className="w-full rounded-xl px-3 py-2 text-center text-base font-mono font-black text-pink-700 placeholder:text-pink-300 focus:outline-none"
                          style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(255,255,255,0.5)" }}
                          placeholder="enter code..."
                          maxLength={20}
                        />
                        <div className="flex items-center justify-center gap-1.5 h-4">
                          {homeSlugStatus === "checking" && (
                            <><Loader2 className="w-3 h-3 text-white/70 animate-spin" /><span className="text-[9px] text-white/70 font-bold">Checking…</span></>
                          )}
                          {homeSlugStatus === "available" && (
                            <><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest">Available</span></>
                          )}
                          {homeSlugStatus === "taken" && (
                            <><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[9px] text-red-300 font-bold uppercase tracking-widest">Taken</span></>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xl font-black font-mono text-white tracking-[0.3em] uppercase text-center">
                        {user?.uniqueSlug || "—"}
                      </p>
                    )}
                  </div>

                  {/* PIN input */}
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/70 uppercase tracking-widest font-bold ml-1">
                      Set Login PIN (5 Digits)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="•••••"
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 5) setPin(val);
                      }}
                      className="w-full rounded-2xl px-4 py-3 text-center text-xl font-mono tracking-[1em] text-pink-700 font-black placeholder:text-pink-300 focus:outline-none transition-all shadow-inner"
                      style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(255,255,255,0.5)" }}
                    />
                  </div>

                  <button
                    disabled={updateProfileMutation.isPending || updateSlugMutation.isPending || homeSlugStatus === "taken" || homeSlugStatus === "checking"}
                    onClick={async () => {
                      if (pin.length !== 5) {
                        toast({ title: "Invalid PIN", description: "Please enter a 5-digit numeric PIN.", variant: "destructive" });
                        return;
                      }
                      try {
                        if (homeSlugEditing && homeSlugValue && homeSlugValue !== user?.uniqueSlug && homeSlugStatus === "available") {
                          await updateSlugMutation.mutateAsync(homeSlugValue);
                        }
                        await updateProfileMutation.mutateAsync({ pin });
                        setShowHomeDialog(false);
                        setHomeSlugEditing(false);
                        setShowQRDialog(true);
                        toast({ title: "Profile Secured", description: "Your PIN and Voice Code have been saved." });
                      } catch (e) {
                        toast({ title: "Error", description: "Failed to save. Please try again.", variant: "destructive" });
                      }
                    }}
                    className="w-full bg-white text-pink-600 rounded-2xl py-3.5 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg hover:bg-pink-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {(updateProfileMutation.isPending || updateSlugMutation.isPending) ? (
                      <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                    ) : (
                      <>Save & Continue <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showPersonaDialog && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPersonaDialog(false)}
                className="absolute inset-0 backdrop-blur-md"
                style={{ background: "rgba(190,24,93,0.55)" }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="relative w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(160deg, #ec4899 0%, #be185d 60%, #9d174d 100%)" }}
              >
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-25 blur-2xl pointer-events-none" style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }} />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: "radial-gradient(circle, #fce7f3, transparent)" }} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-6 pb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white overflow-hidden shadow">
                      <img src="/brs-logo.png" alt="BRS" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-white font-black text-sm tracking-tight">BRS Connect</p>
                  </div>
                  <button
                    onClick={() => setShowPersonaDialog(false)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:scale-90 transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="px-5 pb-6 relative z-10 space-y-5">
                  {/* Title */}
                  <div className="text-center space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Welcome Back
                    </h3>
                    <p className="text-white/70 text-xs">
                      Enter your Voice Code and PIN to continue.
                    </p>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-white/70 uppercase tracking-widest font-bold ml-1">
                        Voice Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. x1y2z"
                        value={personaCode}
                        onChange={(e) =>
                          setPersonaCode(e.target.value.toLowerCase())
                        }
                        className="w-full rounded-2xl px-4 py-3 text-pink-800 font-mono font-bold placeholder:text-pink-300 focus:outline-none transition-all shadow-inner"
                        style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(255,255,255,0.5)" }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-white/70 uppercase tracking-widest font-bold ml-1">
                        5-Digit PIN
                      </label>
                      <input
                        type="password"
                        maxLength={5}
                        placeholder="•••••"
                        value={verifyPin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 5) setVerifyPin(val);
                        }}
                        className="w-full rounded-2xl px-4 py-3 text-center text-xl font-mono tracking-[1em] text-pink-700 font-black placeholder:text-pink-300 focus:outline-none transition-all shadow-inner"
                        style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(255,255,255,0.5)" }}
                      />
                    </div>

                    <button
                      onClick={async () => {
                        if (personaCode && verifyPin.length === 5) {
                          try {
                            const res = await apiRequest(
                              "POST",
                              "/api/auth/verify-persona",
                              {
                                slug: personaCode,
                                pin: verifyPin,
                              },
                            );
                            const userData = await res.json();

                            // Set user and sync form
                            localStorage.setItem("persona_user_id", userData.id);
                            localStorage.setItem(
                              "persona_user",
                              JSON.stringify(userData),
                            );
                            await queryClient.invalidateQueries({
                              queryKey: ["/api/me"],
                            });
                            setLocalUser(userData);
                            setShowPersonaDialog(false);
                            form.reset({
                              name: userData.name || "",
                              role: userData.role || "people",
                              bio: userData.bio || "",
                              instagram: userData.instagram || "",
                              linkedin: userData.linkedin || "",
                              whatsapp: userData.whatsapp || "",
                              website: userData.website || "",
                              youtube: (userData as any).youtube || "",
                              cards: userData.cards || [],
                            });
                            setSelectedCards(userData.cards || []);

                            if (userData.uniqueSlug) {
                              setLocation(`/${userData.uniqueSlug}`);
                            }

                            setMode("login");
                            toast({
                              title: "Welcome back!",
                              description: `Successfully loaded profile: ${userData.name}`,
                            });
                          } catch (e: any) {
                            toast({
                              title: "Access Denied",
                              description: "Invalid Voice Code or PIN.",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                      className="w-full bg-white text-pink-600 rounded-2xl py-3.5 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg hover:bg-pink-50"
                    >
                      Sign In <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowPersonaDialog(false)}
                    className="w-full py-1 text-[10px] text-white/60 hover:text-white uppercase tracking-[0.3em] font-bold transition-colors text-center"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
