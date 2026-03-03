import { ProductCategory, TViewState } from "./types";
import type {
  MasterAccount,
  OnboardingStep,
  Platform,
  PlatformCategory,
  Step,
} from "./types";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "What do you want to share?",
    subtitle: "Pick the category you're most interested in.",
    field: "useCase",
    options: [
      { icon: <i className="fa-solid fa-film" />, label: "Movies & Shows" },
      { icon: <i className="fa-solid fa-music" />, label: "Music Streaming" },
      {
        icon: <i className="fa-solid fa-laptop-code" />,
        label: "Software & Dev Tools",
      },
      {
        icon: <i className="fa-solid fa-graduation-cap" />,
        label: "Online Courses",
      },
      { icon: <i className="fa-solid fa-gamepad" />, label: "Gaming" },
      {
        icon: <i className="fa-solid fa-briefcase" />,
        label: "Business & Productivity",
      },
    ],
  },
  {
    title: "How will you use the platform?",
    subtitle: "This helps us tailor your dashboard experience.",
    field: "role",
    options: [
      {
        icon: <i className="fa-solid fa-crown" />,
        label: "I want to host a slot",
      },
      {
        icon: <i className="fa-solid fa-ticket" />,
        label: "I want to join a slot",
      },
      {
        icon: <i className="fa-solid fa-shuffle" />,
        label: "Both — host & join",
      },
      {
        icon: <i className="fa-solid fa-eye" />,
        label: "Just browsing for now",
      },
    ],
  },
  {
    title: "How did you find us?",
    subtitle: "We'd love to know where you came from.",
    field: "referralSource",
    options: [
      { icon: <i className="fa-brands fa-instagram" />, label: "Instagram" },
      { icon: <i className="fa-brands fa-tiktok" />, label: "TikTok" },
      { icon: <i className="fa-brands fa-x-twitter" />, label: "Twitter / X" },
      { icon: <i className="fa-solid fa-users" />, label: "Friend or Family" },
      { icon: <i className="fa-brands fa-google" />, label: "Google Search" },
      { icon: <i className="fa-solid fa-microphone" />, label: "Podcast" },
    ],
  },
];

export const pageViews: TViewState[] = [
  "home",
  "dashboard",
  "admin",
  "about",
  "contact",
  "transactions",
  "marketplace",
  "settings",
];

export const PLATFORMS: Platform[] = [
  // ── Streaming ──
  {
    name: "Netflix",
    domain: "netflix.com",
    category: "Streaming",
    hint: "TV, movies, 4K",
  },
  {
    name: "YouTube Premium",
    domain: "youtube.com",
    category: "Streaming",
    hint: "Ad-free + Music",
  },
  {
    name: "Disney+",
    domain: "disneyplus.com",
    category: "Streaming",
    hint: "Marvel, Star Wars, Pixar",
  },
  {
    name: "Amazon Prime Video",
    domain: "primevideo.com",
    category: "Streaming",
    hint: "Movies & originals",
  },
  {
    name: "Apple TV+",
    domain: "apple.com",
    category: "Streaming",
    hint: "Apple originals",
  },
  {
    name: "Hulu",
    domain: "hulu.com",
    category: "Streaming",
    hint: "Live TV + VOD",
  },
  {
    name: "HBO Max",
    domain: "max.com",
    category: "Streaming",
    hint: "HBO originals",
  },
  {
    name: "Crunchyroll",
    domain: "crunchyroll.com",
    category: "Streaming",
    hint: "Anime & manga",
  },
  {
    name: "DAZN",
    domain: "dazn.com",
    category: "Streaming",
    hint: "Sports streaming",
  },

  // ── Music ──
  {
    name: "Spotify",
    domain: "spotify.com",
    category: "Music",
    hint: "Music & podcasts",
  },
  {
    name: "Apple Music",
    domain: "music.apple.com",
    category: "Music",
    hint: "Hi-fi streaming",
  },
  {
    name: "Tidal",
    domain: "tidal.com",
    category: "Music",
    hint: "Lossless audio",
  },
  {
    name: "Deezer",
    domain: "deezer.com",
    category: "Music",
    hint: "Music discovery",
  },
  {
    name: "SoundCloud",
    domain: "soundcloud.com",
    category: "Music",
    hint: "Independent artists",
  },

  // ── Privacy & Security ──
  {
    name: "NordVPN",
    domain: "nordvpn.com",
    category: "Privacy & Security",
    hint: "Fast & feature-rich VPN",
  },
  {
    name: "Surfshark",
    domain: "surfshark.com",
    category: "Privacy & Security",
    hint: "Unlimited devices, great value",
  },
  {
    name: "Proton VPN",
    domain: "protonvpn.com",
    category: "Privacy & Security",
    hint: "Strong privacy, Swiss-based",
  },
  {
    name: "ExpressVPN",
    domain: "expressvpn.com",
    category: "Privacy & Security",
    hint: "User-friendly, reliable streaming",
  },
  {
    name: "Private Internet Access",
    domain: "privateinternetaccess.com",
    category: "Privacy & Security",
    hint: "Customizable & affordable",
  },
  {
    name: "Mullvad VPN",
    domain: "mullvad.net",
    category: "Privacy & Security",
    hint: "Anonymous payments, no-logs focus",
  },
  {
    name: "1Password",
    domain: "1password.com",
    category: "Privacy & Security",
    hint: "Premium password manager",
  },
  {
    name: "Bitwarden",
    domain: "bitwarden.com",
    category: "Privacy & Security",
    hint: "Open-source password manager",
  },
  {
    name: "Proton Pass",
    domain: "proton.me/pass",
    category: "Privacy & Security",
    hint: "Privacy-focused passwords + aliases",
  },

  // ── AI & Writing ──
  {
    name: "ChatGPT Plus",
    domain: "openai.com",
    category: "AI & Writing",
    hint: "GPT-4 access",
  },
  {
    name: "Claude Pro",
    domain: "anthropic.com",
    category: "AI & Writing",
    hint: "Anthropic AI",
  },
  {
    name: "Grok",
    domain: "x.ai",
    category: "AI & Writing",
    hint: "xAI assistant",
  },
  {
    name: "Grammarly Premium",
    domain: "grammarly.com",
    category: "AI & Writing",
    hint: "Writing assistant",
  },
  {
    name: "QuillBot",
    domain: "quillbot.com",
    category: "AI & Writing",
    hint: "Paraphrase & rewrite",
  },
  {
    name: "Jasper",
    domain: "jasper.ai",
    category: "AI & Writing",
    hint: "AI marketing copy",
  },
  {
    name: "Perplexity Pro",
    domain: "perplexity.ai",
    category: "AI & Writing",
    hint: "AI-powered search",
  },
  {
    name: "Midjourney",
    domain: "midjourney.com",
    category: "AI & Writing",
    hint: "AI image generation",
  },
  {
    name: "Runway",
    domain: "runwayml.com",
    category: "AI & Writing",
    hint: "AI video generation",
  },

  // ── Social ──
  {
    name: "Facebook",
    domain: "facebook.com",
    category: "Social",
    hint: "Meta social network",
  },
  {
    name: "Instagram",
    domain: "instagram.com",
    category: "Social",
    hint: "Photo & video sharing (Meta)",
  },
  {
    name: "X",
    domain: "x.com",
    category: "Social",
    hint: "Real-time microblogging",
  },
  {
    name: "TikTok",
    domain: "tiktok.com",
    category: "Social",
    hint: "Short-form video platform",
  },
  {
    name: "YouTube",
    domain: "youtube.com",
    category: "Social",
    hint: "Video sharing & streaming",
  },
  {
    name: "LinkedIn",
    domain: "linkedin.com",
    category: "Social",
    hint: "Professional networking",
  },
  {
    name: "Reddit",
    domain: "reddit.com",
    category: "Social",
    hint: "Community discussions & forums",
  },
  {
    name: "Snapchat",
    domain: "snapchat.com",
    category: "Social",
    hint: "Ephemeral messaging & stories",
  },
  {
    name: "Discord",
    domain: "discord.com",
    category: "Social",
    hint: "Voice, video & communities",
  },
  {
    name: "WhatsApp",
    domain: "whatsapp.com",
    category: "Social",
    hint: "Encrypted messaging (Meta)",
  },

  // ── Design ──
  {
    name: "Canva Pro",
    domain: "canva.com",
    category: "Design",
    hint: "Design templates",
  },
  {
    name: "Adobe Creative Cloud",
    domain: "adobe.com",
    category: "Design",
    hint: "Photoshop, Illustrator",
  },
  {
    name: "Figma",
    domain: "figma.com",
    category: "Design",
    hint: "UI/UX design",
  },
  {
    name: "Envato Elements",
    domain: "envato.com",
    category: "Design",
    hint: "Assets & templates",
  },
  {
    name: "Framer",
    domain: "framer.com",
    category: "Design",
    hint: "No-code web design",
  },

  // ── Courses ──
  {
    name: "Skillshare",
    domain: "skillshare.com",
    category: "Education",
    hint: "Creative courses",
  },
  {
    name: "Udemy",
    domain: "udemy.com",
    category: "Education",
    hint: "Tech & business",
  },
  {
    name: "Coursera",
    domain: "coursera.org",
    category: "Education",
    hint: "University-level",
  },
  {
    name: "MasterClass",
    domain: "masterclass.com",
    category: "Education",
    hint: "Celebrity instructors",
  },
  {
    name: "LinkedIn Learning",
    domain: "linkedin.com",
    category: "Education",
    hint: "Professional skills",
  },

  // ── SEO & Marketing ──
  {
    name: "SEMrush",
    domain: "semrush.com",
    category: "SEO & Marketing",
    hint: "SEO & keyword research",
  },
  {
    name: "Ahrefs",
    domain: "ahrefs.com",
    category: "SEO & Marketing",
    hint: "Backlinks & keywords",
  },
  {
    name: "Moz Pro",
    domain: "moz.com",
    category: "SEO & Marketing",
    hint: "SEO analytics",
  },
  {
    name: "Ubersuggest",
    domain: "ubersuggest.com",
    category: "SEO & Marketing",
    hint: "Keyword suggestions",
  },
  {
    name: "SurferSEO",
    domain: "surferseo.com",
    category: "SEO & Marketing",
    hint: "Content optimisation",
  },

  // ── Productivity ──
  {
    name: "Notion",
    domain: "notion.so",
    category: "Productivity",
    hint: "Docs & wikis",
  },
  {
    name: "Slack",
    domain: "slack.com",
    category: "Productivity",
    hint: "Team messaging",
  },
  {
    name: "Zoom",
    domain: "zoom.us",
    category: "Productivity",
    hint: "Video meetings",
  },
  {
    name: "Microsoft 365",
    domain: "microsoft.com",
    category: "Productivity",
    hint: "Office suite",
  },
  {
    name: "Google Workspace",
    domain: "workspace.google.com",
    category: "Productivity",
    hint: "Docs, Drive, Gmail",
  },
  {
    name: "Monday.com",
    domain: "monday.com",
    category: "Productivity",
    hint: "Project management",
  },
  {
    name: "Loom",
    domain: "loom.com",
    category: "Productivity",
    hint: "Screen recording",
  },

  // ── Gaming ──
  {
    name: "Xbox Game Pass",
    domain: "xbox.com",
    category: "Gaming",
    hint: "100+ games monthly",
  },
  {
    name: "PlayStation Plus",
    domain: "playstation.com",
    category: "Gaming",
    hint: "PS4 & PS5 games",
  },
  {
    name: "Nintendo Switch Online",
    domain: "nintendo.com",
    category: "Gaming",
    hint: "Online + classics",
  },
  {
    name: "EA Play",
    domain: "ea.com",
    category: "Gaming",
    hint: "EA game library",
  },
];

export const CATEGORIES: PlatformCategory[] = [
  "Streaming",
  "Music",
  "AI & Writing",
  "Design",
  "Education",
  "SEO & Marketing",
  "Productivity",
  "Gaming",
];

export const CATEGORY_META: Record<
  PlatformCategory,
  { color: string; icon: string }
> = {
  Streaming: { color: "#E50914", icon: "fa-film" },
  Music: { color: "#1DB954", icon: "fa-music" },
  "AI & Writing": { color: "#7B61FF", icon: "fa-wand-magic-sparkles" },
  Design: { color: "#F24E1E", icon: "fa-pen-nib" },
  Education: { color: "#F59E0B", icon: "fa-graduation-cap" },
  "SEO & Marketing": { color: "#0891B2", icon: "fa-magnifying-glass-chart" },
  Productivity: { color: "#475569", icon: "fa-briefcase" },
  Gaming: { color: "#10B981", icon: "fa-gamepad" },
  Social: { color: "#3B82F6", icon: "fa-users" },
  "Privacy & Security": { color: "#6B7280", icon: "fa-shield-halved" },
};

export const CATEGORY_MAP: Record<string, ProductCategory> = {
  Streaming: ProductCategory.STREAMING,
  Music: ProductCategory.MUSIC,
  "AI & Writing": ProductCategory.AI,
  Design: ProductCategory.DESIGN,
  Education: ProductCategory.EDUCATION,
  "SEO & Marketing": ProductCategory.MARKETING,
  Productivity: ProductCategory.PRODUCTIVITY,
  Gaming: ProductCategory.GAMING,
};

export const INITIAL_FORM: Partial<MasterAccount> = {
  service_name: "",
  master_email: "",
  master_password: "",
  total_slots: 5,
  available_slots: 5,
  price: 0,
  original_price: 0,
  description: "",
  icon_url: "",
  category: "",
  fulfillment_type: "Password",
  features: [],
};

export const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "fa-house-chimney" },
  { id: "stacks", label: "My Stacks", icon: "fa-layer-group" },
  { id: "explore", label: "Explore", icon: "fa-compass" },
  { id: "wallet", label: "Wallet", icon: "fa-wallet" },
  { id: "history", label: "History", icon: "fa-receipt" },
  { id: "settings", label: "Settings", icon: "fa-gear" },
] as const;

export const SERVICES = [
  {
    name: "Netflix",
    domain: "netflix.com",
    accent: "#e50914",
    light: "#fff1f2",
  },
  {
    name: "Spotify",
    domain: "spotify.com",
    accent: "#1db954",
    light: "#f0fdf4",
  },
  { name: "Canva", domain: "canva.com", accent: "#7c5cfc", light: "#f5f3ff" },
  {
    name: "YouTube",
    domain: "youtube.com",
    accent: "#ff0000",
    light: "#fff1f2",
  },
  {
    name: "Apple Music",
    domain: "apple.com",
    accent: "#1a1230",
    light: "#f5f3ff",
  },
  {
    name: "ChatGPT Plus",
    domain: "chatgpt.com",
    accent: "#10a37f",
    light: "#f0fdf4",
  },
  {
    name: "Amazon Prime",
    domain: "amazon.com",
    accent: "#f90",
    light: "#fffbeb",
  },
  {
    name: "Duolingo",
    domain: "duolingo.com",
    accent: "#58cc02",
    light: "#f0fdf4",
  },
];

export const FEATURES = [
  {
    title: "Encrypted Security",
    desc: "Military-grade encryption protects your credentials and profile access at every step.",
    icon: "fa-shield-halved",
    accent: "#7c5cfc",
    light: "#f5f3ff",
    stat: "256-bit SSL",
  },
  {
    title: "Automated Access",
    desc: "Credentials are delivered the moment your payment clears. No waiting, no manual steps.",
    icon: "fa-bolt",
    accent: "#f59e0b",
    light: "#fffbeb",
    stat: "< 10 sec",
  },
  {
    title: "Verified Owners",
    desc: "Every seller is vetted before listing. We guarantee uptime and reliability on all plans.",
    icon: "fa-user-check",
    accent: "#10b981",
    light: "#f0fdf4",
    stat: "100% Vetted",
  },
  {
    title: "24/7 Support",
    desc: "Our team is always on standby for access issues, payment problems, or anything else.",
    icon: "fa-headset",
    accent: "#ef4444",
    light: "#fef2f2",
    stat: "Always On",
  },
];

export const FAQS = [
  {
    question: "Is sharing subscriptions legal?",
    answer:
      "DiscountZAR operates within the family sharing terms provided by most major services. We facilitate secure cost-sharing between individuals, ensuring compliance with platform-specific guidelines where applicable.",
    icon: "fa-scale-balanced",
    tag: "Legal",
  },
  {
    question: "What happens if a subscription stops working?",
    answer:
      "We run automated health checks on all active slots. If yours goes down, we investigate immediately. You're protected by our refund policy and sellers are penalised for any unresolved downtime.",
    icon: "fa-rotate",
    tag: "Reliability",
  },
  {
    question: "How do I get my access credentials?",
    answer:
      "The moment your payment confirms, navigate to the 'My Stacks' tab in your dashboard. Your private profile credentials and login instructions are delivered there instantly — no waiting.",
    icon: "fa-key",
    tag: "Access",
  },
  {
    question: "Can I cancel my slot at any time?",
    answer:
      "Yes. All subscriptions are billed monthly. You can choose not to renew at any time from your dashboard — no lock-ins, no penalties, no awkward emails.",
    icon: "fa-rotate-left",
    tag: "Billing",
  },
  {
    question: "How are sellers verified?",
    answer:
      "Every seller goes through an identity and account verification process before their first listing goes live. We also track uptime ratings and remove sellers who fall below our quality threshold.",
    icon: "fa-user-check",
    tag: "Trust",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "All payments are processed by Flutterwave, a PCI-DSS compliant payment provider. We never store your card details — every transaction is encrypted end-to-end.",
    icon: "fa-lock",
    tag: "Security",
  },
];

export const STEPS: Step[] = [
  {
    number: "01",
    accent: "#7c5cfc",
    light: "#f5f3ff",
    icon: "fa-layer-group",
    title: "Create your listing",
    description:
      "Describe what it offers, set the number of slots, and price it monthly in Naira. Takes under 2 minutes.",
    detail: "Under 2 minutes",
    detailIcon: "fa-clock",
  },
  {
    number: "02",
    accent: "#10b981",
    light: "#f0fdf4",
    icon: "fa-compass",
    title: "Buyers find you",
    description:
      "Your listing goes live on our marketplace instantly. Thousands of verified members browse daily for slots.",
    detail: "Reach thousands",
    detailIcon: "fa-users",
  },
  {
    number: "03",
    accent: "#f59e0b",
    light: "#fffbeb",
    icon: "fa-wallet",
    title: "Get paid automatically",
    description:
      "Money hits your wallet the moment a slot is purchased. We handle collection — you never chase payments.",
    detail: "Instant settlement",
    detailIcon: "fa-naira-sign",
  },
];

export const STATS = [
  { value: "12k+", label: "Active Savers", icon: "fa-users" },
  { value: "₦240m", label: "Saved Monthly", icon: "fa-piggy-bank" },
  { value: "45+", label: "Premium Services", icon: "fa-layer-group" },
  { value: "99.9%", label: "Uptime Guarantee", icon: "fa-circle-check" },
];

export const OUR_FEATURES = [
  {
    title: "Secure Credential Vault",
    desc: "We never expose master passwords. Access is granted through private profiles only.",
    icon: "fa-shield-halved",
    accent: "#7c5cfc",
    light: "#f5f3ff",
  },
  {
    title: "Automated Payouts",
    desc: "Subscription owners get paid instantly the moment a slot is purchased. No chasing.",
    icon: "fa-bolt",
    accent: "#f59e0b",
    light: "#fffbeb",
  },
  {
    title: "Verified Members",
    desc: "Every user is verified before joining. We maintain a premium, trusted community.",
    icon: "fa-user-check",
    accent: "#10b981",
    light: "#f0fdf4",
  },
];

export const VALUES = [
  {
    icon: "fa-handshake",
    title: "Transparency",
    desc: "No hidden fees. No surprises. What you see is exactly what you pay.",
  },
  {
    icon: "fa-bolt",
    title: "Speed",
    desc: "From purchase to access in under 10 seconds — automated end to end.",
  },
  {
    icon: "fa-lock",
    title: "Security",
    desc: "256-bit SSL, encrypted credential storage, and verified seller network.",
  },
  {
    icon: "fa-heart",
    title: "Community",
    desc: "Built for Nigerians, by Nigerians. Local support, Naira pricing, no friction.",
  },
];

const WA_NUMBER = "2347053428345";

export const WA_LINKS = {
  serviceRequest: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "Hi DiscountZAR 👋\n\nI'd like to request a new service to be added to the marketplace.\n\nService name: \nWhy I need it: \n\nLooking forward to hearing from you!",
  )}`,

  contactSupport: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "Hi DiscountZAR Support 👋\n\nI need help with an issue on my account.\n\nIssue: \nMy username: \n\nPlease assist at your earliest convenience. Thank you!",
  )}`,

  chatWithUs: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "Hey DiscountZAR 👋\n\nI have a quick question about your platform. Can someone assist me?",
  )}`,
};

export const SOCIALS = [
  { icon: "fa-brands fa-x-twitter", href: "#", label: "X" },
  { icon: "fa-brands fa-instagram", href: "#", label: "Instagram" },
  {
    icon: "fa-brands fa-whatsapp",
    href: WA_LINKS.chatWithUs,
    label: "WhatsApp",
  },
];
