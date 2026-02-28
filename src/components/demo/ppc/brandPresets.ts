import { ExtractedBranding } from "@/lib/api/firecrawl";

export const PRESET_STYLES: { id: string; name: string; desc: string; branding: ExtractedBranding }[] = [
  {
    id: "stripe",
    name: "Stripe",
    desc: "Clean, precise, indigo + cyan gradients",
    branding: {
      colorScheme: "light",
      colors: { primary: "#635BFF", secondary: "#0A2540", accent: "#00D4AA", background: "#FFFFFF", textPrimary: "#0A2540", textSecondary: "#425466" },
      typography: {
        fontFamilies: { primary: "'Inter', system-ui, sans-serif", heading: "'Inter', system-ui, sans-serif" },
        fontSizes: { h1: "64px", h2: "40px", h3: "24px", body: "17px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "12px" },
      components: {
        buttonPrimary: { background: "#635BFF", textColor: "#FFFFFF", borderRadius: "999px" },
        buttonSecondary: { background: "transparent", textColor: "#635BFF", borderRadius: "999px" },
      },
    },
  },
  {
    id: "linear",
    name: "Linear",
    desc: "Dark, sharp, purple-blue glow",
    branding: {
      colorScheme: "dark",
      colors: { primary: "#5E6AD2", secondary: "#171723", accent: "#8B5CF6", background: "#0F0F1A", textPrimary: "#F1F1F4", textSecondary: "#8A8F98" },
      typography: {
        fontFamilies: { primary: "'Inter', sans-serif", heading: "'Inter', sans-serif" },
        fontSizes: { h1: "56px", h2: "36px", h3: "22px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 600 },
      },
      spacing: { baseUnit: 8, borderRadius: "8px" },
      components: {
        buttonPrimary: { background: "#5E6AD2", textColor: "#FFFFFF", borderRadius: "8px" },
        buttonSecondary: { background: "rgba(255,255,255,0.06)", textColor: "#F1F1F4", borderRadius: "8px" },
      },
    },
  },
  {
    id: "vercel",
    name: "Vercel",
    desc: "Monochrome, stark black & white",
    branding: {
      colorScheme: "dark",
      colors: { primary: "#FFFFFF", secondary: "#000000", accent: "#0070F3", background: "#000000", textPrimary: "#EDEDED", textSecondary: "#888888" },
      typography: {
        fontFamilies: { primary: "'Inter', sans-serif", heading: "'Inter', sans-serif" },
        fontSizes: { h1: "72px", h2: "48px", h3: "24px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "8px" },
      components: {
        buttonPrimary: { background: "#FFFFFF", textColor: "#000000", borderRadius: "8px" },
        buttonSecondary: { background: "transparent", textColor: "#FFFFFF", borderRadius: "8px" },
      },
    },
  },
  {
    id: "apple",
    name: "Apple",
    desc: "Minimal, spacious, SF Pro",
    branding: {
      colorScheme: "light",
      colors: { primary: "#0066CC", secondary: "#1D1D1F", accent: "#2997FF", background: "#F5F5F7", textPrimary: "#1D1D1F", textSecondary: "#86868B" },
      typography: {
        fontFamilies: { primary: "'SF Pro Display', -apple-system, sans-serif", heading: "'SF Pro Display', -apple-system, sans-serif" },
        fontSizes: { h1: "80px", h2: "48px", h3: "28px", body: "17px" },
        fontWeights: { regular: 400, medium: 500, bold: 600 },
      },
      spacing: { baseUnit: 8, borderRadius: "14px" },
      components: {
        buttonPrimary: { background: "#0066CC", textColor: "#FFFFFF", borderRadius: "980px" },
        buttonSecondary: { background: "transparent", textColor: "#0066CC", borderRadius: "980px" },
      },
    },
  },
  {
    id: "notion",
    name: "Notion",
    desc: "Warm, readable, serif accents",
    branding: {
      colorScheme: "light",
      colors: { primary: "#000000", secondary: "#FFFFFF", accent: "#EB5757", background: "#FFFFFF", textPrimary: "#37352F", textSecondary: "#9B9A97" },
      typography: {
        fontFamilies: { primary: "'Inter', sans-serif", heading: "'Georgia', serif" },
        fontSizes: { h1: "48px", h2: "32px", h3: "24px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 4, borderRadius: "4px" },
      components: {
        buttonPrimary: { background: "#000000", textColor: "#FFFFFF", borderRadius: "4px" },
        buttonSecondary: { background: "transparent", textColor: "#000000", borderRadius: "4px" },
      },
    },
  },
  {
    id: "spotify",
    name: "Spotify",
    desc: "Bold black + electric green",
    branding: {
      colorScheme: "dark",
      colors: { primary: "#1DB954", secondary: "#191414", accent: "#1ED760", background: "#121212", textPrimary: "#FFFFFF", textSecondary: "#B3B3B3" },
      typography: {
        fontFamilies: { primary: "'Circular', 'Helvetica Neue', sans-serif", heading: "'Circular', 'Helvetica Neue', sans-serif" },
        fontSizes: { h1: "72px", h2: "48px", h3: "24px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "500px" },
      components: {
        buttonPrimary: { background: "#1DB954", textColor: "#000000", borderRadius: "500px" },
        buttonSecondary: { background: "transparent", textColor: "#FFFFFF", borderRadius: "500px" },
      },
    },
  },
  {
    id: "airbnb",
    name: "Airbnb",
    desc: "Warm coral pink, friendly rounded",
    branding: {
      colorScheme: "light",
      colors: { primary: "#FF385C", secondary: "#222222", accent: "#FF385C", background: "#FFFFFF", textPrimary: "#222222", textSecondary: "#717171" },
      typography: {
        fontFamilies: { primary: "'Cereal', 'Helvetica Neue', sans-serif", heading: "'Cereal', 'Helvetica Neue', sans-serif" },
        fontSizes: { h1: "56px", h2: "36px", h3: "22px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 800 },
      },
      spacing: { baseUnit: 8, borderRadius: "12px" },
      components: {
        buttonPrimary: { background: "linear-gradient(to right, #E61E4D, #D70466)", textColor: "#FFFFFF", borderRadius: "8px" },
        buttonSecondary: { background: "#FFFFFF", textColor: "#222222", borderRadius: "8px" },
      },
    },
  },
  {
    id: "craft",
    name: "Craft",
    desc: "Earthy terracotta, warm neutrals",
    branding: {
      colorScheme: "light",
      colors: { primary: "#C2491D", secondary: "#2C1810", accent: "#E8956A", background: "#FAF6F1", textPrimary: "#2C1810", textSecondary: "#8B7355" },
      typography: {
        fontFamilies: { primary: "'Instrument Serif', Georgia, serif", heading: "'Instrument Serif', Georgia, serif" },
        fontSizes: { h1: "64px", h2: "40px", h3: "24px", body: "17px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "4px" },
      components: {
        buttonPrimary: { background: "#C2491D", textColor: "#FFFFFF", borderRadius: "4px" },
        buttonSecondary: { background: "transparent", textColor: "#C2491D", borderRadius: "4px" },
      },
    },
  },
  {
    id: "mercury",
    name: "Mercury",
    desc: "Deep midnight, teal accents",
    branding: {
      colorScheme: "dark",
      colors: { primary: "#4ECDC4", secondary: "#0B1622", accent: "#45B7AA", background: "#0D1B2A", textPrimary: "#E0E8F0", textSecondary: "#7A8B9A" },
      typography: {
        fontFamilies: { primary: "'DM Sans', sans-serif", heading: "'DM Sans', sans-serif" },
        fontSizes: { h1: "60px", h2: "40px", h3: "24px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "10px" },
      components: {
        buttonPrimary: { background: "#4ECDC4", textColor: "#0D1B2A", borderRadius: "10px" },
        buttonSecondary: { background: "rgba(78,205,196,0.12)", textColor: "#4ECDC4", borderRadius: "10px" },
      },
    },
  },
  {
    id: "figma",
    name: "Figma",
    desc: "Vibrant multi-color, playful",
    branding: {
      colorScheme: "light",
      colors: { primary: "#F24E1E", secondary: "#0C0C0C", accent: "#A259FF", background: "#FFFFFF", textPrimary: "#0C0C0C", textSecondary: "#697485" },
      typography: {
        fontFamilies: { primary: "'Inter', system-ui, sans-serif", heading: "'SF Pro Display', -apple-system, sans-serif" },
        fontSizes: { h1: "72px", h2: "48px", h3: "28px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "8px" },
      components: {
        buttonPrimary: { background: "#0C0C0C", textColor: "#FFFFFF", borderRadius: "8px" },
        buttonSecondary: { background: "#FFFFFF", textColor: "#0C0C0C", borderRadius: "8px" },
      },
    },
  },
  {
    id: "gumroad",
    name: "Gumroad",
    desc: "Bubblegum pink, bold & fun",
    branding: {
      colorScheme: "light",
      colors: { primary: "#FF90E8", secondary: "#000000", accent: "#FFD700", background: "#FFFFFF", textPrimary: "#000000", textSecondary: "#666666" },
      typography: {
        fontFamilies: { primary: "'Mabry Pro', sans-serif", heading: "'Mabry Pro', sans-serif" },
        fontSizes: { h1: "64px", h2: "40px", h3: "24px", body: "18px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "6px" },
      components: {
        buttonPrimary: { background: "#FF90E8", textColor: "#000000", borderRadius: "6px" },
        buttonSecondary: { background: "#000000", textColor: "#FFFFFF", borderRadius: "6px" },
      },
    },
  },
  {
    id: "superhuman",
    name: "Superhuman",
    desc: "Rich purple-violet, dark luxury",
    branding: {
      colorScheme: "dark",
      colors: { primary: "#9966FF", secondary: "#1A1025", accent: "#CC99FF", background: "#110B1A", textPrimary: "#F5F0FF", textSecondary: "#9080A8" },
      typography: {
        fontFamilies: { primary: "'SF Pro Display', -apple-system, sans-serif", heading: "'SF Pro Display', -apple-system, sans-serif" },
        fontSizes: { h1: "64px", h2: "40px", h3: "24px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 600 },
      },
      spacing: { baseUnit: 8, borderRadius: "12px" },
      components: {
        buttonPrimary: { background: "linear-gradient(135deg, #9966FF, #CC66FF)", textColor: "#FFFFFF", borderRadius: "12px" },
        buttonSecondary: { background: "rgba(153,102,255,0.1)", textColor: "#CC99FF", borderRadius: "12px" },
      },
    },
  },
  {
    id: "tesla",
    name: "Tesla",
    desc: "Sleek dark, red accents",
    branding: {
      colorScheme: "dark",
      colors: { primary: "#E82127", secondary: "#171A20", accent: "#F23B3B", background: "#0B0C10", textPrimary: "#F4F4F4", textSecondary: "#8E8E8E" },
      typography: {
        fontFamilies: { primary: "'Gotham', 'Helvetica Neue', sans-serif", heading: "'Gotham', 'Helvetica Neue', sans-serif" },
        fontSizes: { h1: "56px", h2: "40px", h3: "24px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 600 },
      },
      spacing: { baseUnit: 8, borderRadius: "4px" },
      components: {
        buttonPrimary: { background: "#E82127", textColor: "#FFFFFF", borderRadius: "4px" },
        buttonSecondary: { background: "transparent", textColor: "#F4F4F4", borderRadius: "4px" },
      },
    },
  },
  {
    id: "nike",
    name: "Nike",
    desc: "High-contrast black & white, bold type",
    branding: {
      colorScheme: "light",
      colors: { primary: "#111111", secondary: "#FFFFFF", accent: "#FA5400", background: "#FFFFFF", textPrimary: "#111111", textSecondary: "#707072" },
      typography: {
        fontFamilies: { primary: "'Helvetica Neue', Arial, sans-serif", heading: "'Helvetica Neue', Arial, sans-serif" },
        fontSizes: { h1: "80px", h2: "48px", h3: "28px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 800 },
      },
      spacing: { baseUnit: 8, borderRadius: "0px" },
      components: {
        buttonPrimary: { background: "#111111", textColor: "#FFFFFF", borderRadius: "30px" },
        buttonSecondary: { background: "transparent", textColor: "#111111", borderRadius: "30px" },
      },
    },
  },
  {
    id: "amazon",
    name: "Amazon",
    desc: "White, dark navy + orange CTA",
    branding: {
      colorScheme: "light",
      colors: { primary: "#FF9900", secondary: "#131921", accent: "#FEBD69", background: "#FFFFFF", textPrimary: "#0F1111", textSecondary: "#565959" },
      typography: {
        fontFamilies: { primary: "'Amazon Ember', Arial, sans-serif", heading: "'Amazon Ember', Arial, sans-serif" },
        fontSizes: { h1: "56px", h2: "36px", h3: "22px", body: "15px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "8px" },
      components: {
        buttonPrimary: { background: "#FFD814", textColor: "#0F1111", borderRadius: "20px" },
        buttonSecondary: { background: "#FFFFFF", textColor: "#0F1111", borderRadius: "20px" },
      },
    },
  },
  {
    id: "netflix",
    name: "Netflix",
    desc: "Cinematic dark, bold red",
    branding: {
      colorScheme: "dark",
      colors: { primary: "#E50914", secondary: "#141414", accent: "#B81D24", background: "#141414", textPrimary: "#FFFFFF", textSecondary: "#808080" },
      typography: {
        fontFamilies: { primary: "'Netflix Sans', 'Helvetica Neue', sans-serif", heading: "'Netflix Sans', 'Helvetica Neue', sans-serif" },
        fontSizes: { h1: "72px", h2: "48px", h3: "28px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "4px" },
      components: {
        buttonPrimary: { background: "#E50914", textColor: "#FFFFFF", borderRadius: "4px" },
        buttonSecondary: { background: "rgba(109,109,110,0.7)", textColor: "#FFFFFF", borderRadius: "4px" },
      },
    },
  },
];
