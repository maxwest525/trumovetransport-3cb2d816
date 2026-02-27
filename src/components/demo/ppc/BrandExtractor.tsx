import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Loader2, Plus, X, Palette, Type, Square, Zap, ExternalLink, Check, Sparkles
} from "lucide-react";
import { firecrawlApi, ExtractedBranding } from "@/lib/api/firecrawl";

// Pre-analyzed premium styles
const PRESET_STYLES: { id: string; name: string; desc: string; branding: ExtractedBranding }[] = [
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
      colors: { primary: "#0071E3", secondary: "#1D1D1F", accent: "#0077ED", background: "#FBFBFD", textPrimary: "#1D1D1F", textSecondary: "#6E6E73" },
      typography: {
        fontFamilies: { primary: "'SF Pro Display', -apple-system, sans-serif", heading: "'SF Pro Display', -apple-system, sans-serif" },
        fontSizes: { h1: "80px", h2: "48px", h3: "28px", body: "17px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "16px" },
      components: {
        buttonPrimary: { background: "#0071E3", textColor: "#FFFFFF", borderRadius: "999px" },
        buttonSecondary: { background: "transparent", textColor: "#0071E3", borderRadius: "999px" },
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
  // ── Extracted from user reference sites ──
  {
    id: "designers-system",
    name: "Designers System",
    desc: "Blue CTA, pill buttons, Roboto + Inter",
    branding: {
      colorScheme: "light",
      colors: { primary: "#408CF7", secondary: "#252C32", accent: "#408CF7", background: "#FFFFFF", textPrimary: "#252C32", textSecondary: "#666666" },
      typography: {
        fontFamilies: { primary: "'Roboto', sans-serif", heading: "'Inter', sans-serif" },
        fontSizes: { h1: "56px", h2: "36px", h3: "24px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "50px" },
      components: {
        buttonPrimary: { background: "#408CF7", textColor: "#FFFFFF", borderRadius: "50px" },
        buttonSecondary: { background: "#FFFFFF", textColor: "#252C32", borderRadius: "50px" },
      },
    },
  },
  {
    id: "holo",
    name: "Holo AI",
    desc: "Minimal, Satoshi font, soft blue",
    branding: {
      colorScheme: "light",
      colors: { primary: "#2266FF", secondary: "#1D1D1F", accent: "#2266FF", background: "#FBFBFB", textPrimary: "#1D1D1F", textSecondary: "#888888" },
      typography: {
        fontFamilies: { primary: "'Satoshi', sans-serif", heading: "'Satoshi', sans-serif" },
        fontSizes: { h1: "68px", h2: "40px", h3: "24px", body: "18px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 10, borderRadius: "30px" },
      components: {
        buttonPrimary: { background: "#2266FF", textColor: "#FFFFFF", borderRadius: "30px" },
        buttonSecondary: { background: "transparent", textColor: "#1D1D1F", borderRadius: "30px" },
      },
    },
  },
  {
    id: "relume",
    name: "Relume",
    desc: "Warm beige, vivid purple CTA",
    branding: {
      colorScheme: "light",
      colors: { primary: "#6248FF", secondary: "#161616", accent: "#6248FF", background: "#F1F0EE", textPrimary: "#161616", textSecondary: "#666666" },
      typography: {
        fontFamilies: { primary: "'Relative', sans-serif", heading: "'Relative', sans-serif" },
        fontSizes: { h1: "64px", h2: "40px", h3: "24px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "10px" },
      components: {
        buttonPrimary: { background: "#6248FF", textColor: "#FFFFFF", borderRadius: "10px" },
        buttonSecondary: { background: "#FFFFFF", textColor: "#161616", borderRadius: "6px" },
      },
    },
  },
  {
    id: "blocks",
    name: "Blocks",
    desc: "Fresh lime-blue, sharp SaaS look",
    branding: {
      colorScheme: "light",
      colors: { primary: "#3863FF", secondary: "#1D2839", accent: "#CDF075", background: "#FFFFFF", textPrimary: "#1D2839", textSecondary: "#64748B" },
      typography: {
        fontFamilies: { primary: "'Inter', sans-serif", heading: "'Inter', sans-serif" },
        fontSizes: { h1: "56px", h2: "36px", h3: "24px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "4px" },
      components: {
        buttonPrimary: { background: "#3863FF", textColor: "#FFFFFF", borderRadius: "4px" },
        buttonSecondary: { background: "transparent", textColor: "#1D2839", borderRadius: "8px" },
      },
    },
  },
  {
    id: "dashclicks",
    name: "DashClicks",
    desc: "Neon purple glow, bold SaaS",
    branding: {
      colorScheme: "light",
      colors: { primary: "#930AFF", secondary: "#272C5E", accent: "#930AFF", background: "#FFFFFF", textPrimary: "#272C5E", textSecondary: "#808080" },
      typography: {
        fontFamilies: { primary: "'GT Walsheim Pro', sans-serif", heading: "'Montserrat', sans-serif" },
        fontSizes: { h1: "56px", h2: "36px", h3: "24px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "14px" },
      components: {
        buttonPrimary: { background: "#930AFF", textColor: "#FFFFFF", borderRadius: "14px" },
        buttonSecondary: { background: "#FFFFFF", textColor: "#272C5E", borderRadius: "14px" },
      },
    },
  },
  {
    id: "figma",
    name: "Figma",
    desc: "Indigo CTA, custom Figma Sans",
    branding: {
      colorScheme: "light",
      colors: { primary: "#4D49FC", secondary: "#000000", accent: "#4D49FC", background: "#FFFFFF", textPrimary: "#000000", textSecondary: "#697485" },
      typography: {
        fontFamilies: { primary: "'Figma Sans', system-ui, sans-serif", heading: "'SF Pro Display', -apple-system, sans-serif" },
        fontSizes: { h1: "72px", h2: "48px", h3: "28px", body: "16px" },
        fontWeights: { regular: 400, medium: 500, bold: 700 },
      },
      spacing: { baseUnit: 8, borderRadius: "8px" },
      components: {
        buttonPrimary: { background: "#4D49FC", textColor: "#FFFFFF", borderRadius: "8px" },
        buttonSecondary: { background: "#FFFFFF", textColor: "#000000", borderRadius: "8px" },
      },
    },
  },
  {
    id: "landingpagelabs",
    name: "Landing Page Labs",
    desc: "Dark navy CTA, TWK Lausanne font",
    branding: {
      colorScheme: "light",
      colors: { primary: "#242538", secondary: "#F7F7F8", accent: "#242538", background: "#F7F7F8", textPrimary: "#242538", textSecondary: "#666666" },
      typography: {
        fontFamilies: { primary: "'TWK Lausanne', sans-serif", heading: "'TWK Lausanne', sans-serif" },
        fontSizes: { h1: "56px", h2: "36px", h3: "24px", body: "16px" },
        fontWeights: { regular: 300, medium: 400, bold: 600 },
      },
      spacing: { baseUnit: 8, borderRadius: "12px" },
      components: {
        buttonPrimary: { background: "#242538", textColor: "#FFFFFF", borderRadius: "12px" },
        buttonSecondary: { background: "transparent", textColor: "#242538", borderRadius: "20px" },
      },
    },
  },
];

interface ExtractedSite {
  url: string;
  branding: ExtractedBranding;
  screenshot?: string;
  title?: string;
  loading?: boolean;
}

interface BrandExtractorProps {
  onApplyTheme: (branding: ExtractedBranding) => void;
  currentThemeId?: string;
}

export function BrandExtractor({ onApplyTheme, currentThemeId }: BrandExtractorProps) {
  const [urls, setUrls] = useState<string[]>([""]);
  const [extractedSites, setExtractedSites] = useState<ExtractedSite[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleAddUrl = () => {
    if (urls.length < 3) setUrls([...urls, ""]);
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleExtract = async () => {
    const validUrls = urls.filter(u => u.trim().length > 0);
    if (validUrls.length === 0) {
      toast.error("Enter at least one URL");
      return;
    }

    setIsExtracting(true);
    setExtractedSites([]);

    try {
      const results = await Promise.allSettled(
        validUrls.map(async (url) => {
          const response = await firecrawlApi.scrape(url, {
            formats: ['branding', 'screenshot'],
            onlyMainContent: false,
          });

          if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to scrape');
          }

          return {
            url,
            branding: response.data.branding || {},
            screenshot: response.data.screenshot,
            title: response.data.metadata?.title || url,
          };
        })
      );

      const successful: ExtractedSite[] = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          successful.push(r.value);
        } else {
          toast.error(`Failed to extract from ${validUrls[i]}: ${r.reason?.message || 'Unknown error'}`);
        }
      });

      setExtractedSites(successful);
      if (successful.length > 0) {
        toast.success(`Extracted branding from ${successful.length} site(s)`);
      }
    } catch (error) {
      toast.error("Extraction failed");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_STYLES[0]) => {
    setActivePreset(preset.id);
    onApplyTheme(preset.branding);
    toast.success(`Applied ${preset.name} style`);
  };

  const handleApplyExtracted = (site: ExtractedSite) => {
    setActivePreset(null);
    onApplyTheme(site.branding);
    toast.success(`Applied style from ${site.title || site.url}`);
  };

  return (
    <div className="space-y-6">
      {/* Quick-Pick Presets */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-semibold">Steal This Style</span>
        </div>
        <div className="grid grid-cols-4 gap-2 max-h-[320px] overflow-y-auto pr-1">
          {PRESET_STYLES.map(p => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className={`relative p-3 rounded-lg border text-left transition-all hover:border-primary/50 ${
                activePreset === p.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border'
              }`}
            >
              {activePreset === p.id && (
                <Check size={12} className="absolute top-2 right-2 text-primary" />
              )}
              <div className="flex gap-1 mb-2">
                {[p.branding.colors?.primary, p.branding.colors?.secondary, p.branding.colors?.accent].filter(Boolean).map((c, i) => (
                  <div key={i} style={{ background: c }} className="w-4 h-4 rounded-full border border-border" />
                ))}
              </div>
              <div className="text-xs font-semibold">{p.name}</div>
              <div className="text-[10px] text-muted-foreground">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* URL Extraction */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} className="text-primary" />
          <span className="text-sm font-semibold">Extract from URL</span>
        </div>
        <div className="space-y-2">
          {urls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={url}
                onChange={e => {
                  const newUrls = [...urls];
                  newUrls[i] = e.target.value;
                  setUrls(newUrls);
                }}
                placeholder="https://example.com"
                className="text-sm"
              />
              {urls.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => handleRemoveUrl(i)}>
                  <X size={14} />
                </Button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            {urls.length < 3 && (
              <Button variant="outline" size="sm" onClick={handleAddUrl}>
                <Plus size={14} className="mr-1" /> Add URL
              </Button>
            )}
            <Button size="sm" onClick={handleExtract} disabled={isExtracting}>
              {isExtracting ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Zap size={14} className="mr-1" />}
              {isExtracting ? "Extracting..." : "Extract Branding"}
            </Button>
          </div>
        </div>
      </div>

      {/* Extracted Results */}
      {extractedSites.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-semibold">Extracted Styles</span>
          {extractedSites.map((site, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink size={12} className="text-muted-foreground" />
                  <span className="text-xs font-medium truncate max-w-[200px]">{site.title || site.url}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleApplyExtracted(site)}>
                  Apply Style
                </Button>
              </div>

              {/* Color preview */}
              {site.branding.colors && (
                <div className="flex items-center gap-2">
                  <Palette size={12} className="text-muted-foreground" />
                  <div className="flex gap-1">
                    {Object.entries(site.branding.colors).map(([key, val]) => (
                      <div
                        key={key}
                        style={{ background: val }}
                        className="w-6 h-6 rounded border border-border"
                        title={`${key}: ${val}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Typography preview */}
              {site.branding.typography?.fontFamilies?.primary && (
                <div className="flex items-center gap-2">
                  <Type size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {site.branding.typography.fontFamilies.primary}
                  </span>
                </div>
              )}

              {/* Border radius */}
              {site.branding.spacing?.borderRadius && (
                <div className="flex items-center gap-2">
                  <Square size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Border radius: {site.branding.spacing.borderRadius}
                  </span>
                </div>
              )}

              {/* Screenshot preview */}
              {site.screenshot && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={`data:image/png;base64,${site.screenshot}`}
                    alt={`Screenshot of ${site.url}`}
                    className="w-full h-32 object-cover object-top"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
