 import { useState } from "react";
 import { Download, Copy, Check, ExternalLink, Image as ImageIcon } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { toast } from "sonner";
 import { cn } from "@/lib/utils";
 
 interface GeneratedAdPreviewProps {
   image?: string;
   headline?: string;
   description?: string;
   cta?: string;
   onLaunch?: (platform: "google" | "meta" | "tiktok") => void;
   className?: string;
 }
 
 const PLATFORMS = [
   { id: "google", name: "Google Ads", color: "bg-blue-500" },
   { id: "meta", name: "Meta", color: "bg-indigo-500" },
   { id: "tiktok", name: "TikTok", color: "bg-pink-500" },
 ] as const;
 
 export function GeneratedAdPreview({
   image,
   headline = "TruMove - AI-Powered Moving",
   description = "Get accurate quotes in 60 seconds. Compare verified movers.",
   cta = "Get Free Quote",
   onLaunch,
   className,
 }: GeneratedAdPreviewProps) {
   const [copied, setCopied] = useState<string | null>(null);
 
   const handleCopy = async (text: string, label: string) => {
     await navigator.clipboard.writeText(text);
     setCopied(label);
     toast.success(`${label} copied!`);
     setTimeout(() => setCopied(null), 2000);
   };
 
   const handleDownload = () => {
     if (!image) return;
     const link = document.createElement("a");
     link.href = image;
     link.download = `trumove-ad-${Date.now()}.png`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     toast.success("Image downloaded!");
   };
 
   return (
     <Card className={cn("overflow-hidden", className)}>
       <CardContent className="p-0">
         {/* Image Preview */}
         <div className="relative aspect-[16/9] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
           {image ? (
             <>
               <img 
                 src={image} 
                 alt="Generated ad" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute top-2 right-2 flex gap-1">
                 <Button
                   size="sm"
                   variant="secondary"
                   className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                   onClick={handleDownload}
                 >
                   <Download className="w-3.5 h-3.5" />
                 </Button>
               </div>
             </>
           ) : (
             <div className="w-full h-full flex items-center justify-center">
               <div className="text-center">
                 <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/40 mb-2" />
                 <span className="text-sm text-muted-foreground">No image generated yet</span>
               </div>
             </div>
           )}
           <Badge className="absolute bottom-2 left-2 bg-black/60 text-white border-0">
             AI Generated
           </Badge>
         </div>
 
         {/* Ad Copy */}
         <div className="p-4 space-y-3">
           {/* Headline */}
           <div className="flex items-start justify-between gap-2">
             <div>
               <span className="text-[10px] text-muted-foreground uppercase font-medium block mb-0.5">Headline</span>
               <p className="font-semibold text-foreground">{headline}</p>
             </div>
             <button
               onClick={() => handleCopy(headline, "Headline")}
               className="text-muted-foreground hover:text-foreground transition-colors p-1"
             >
               {copied === "Headline" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
             </button>
           </div>
 
           {/* Description */}
           <div className="flex items-start justify-between gap-2">
             <div>
               <span className="text-[10px] text-muted-foreground uppercase font-medium block mb-0.5">Description</span>
               <p className="text-sm text-muted-foreground">{description}</p>
             </div>
             <button
               onClick={() => handleCopy(description, "Description")}
               className="text-muted-foreground hover:text-foreground transition-colors p-1"
             >
               {copied === "Description" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
             </button>
           </div>
 
           {/* CTA */}
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <span className="text-[10px] text-muted-foreground uppercase font-medium">CTA:</span>
               <Badge variant="secondary">{cta}</Badge>
             </div>
             <button
               onClick={() => handleCopy(cta, "CTA")}
               className="text-muted-foreground hover:text-foreground transition-colors p-1"
             >
               {copied === "CTA" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
             </button>
           </div>
 
           {/* Platform Launch Buttons */}
           {onLaunch && (
             <div className="pt-3 border-t border-border">
               <span className="text-[10px] text-muted-foreground uppercase font-medium block mb-2">Launch on</span>
               <div className="flex gap-2">
                 {PLATFORMS.map((platform) => (
                   <Button
                     key={platform.id}
                     size="sm"
                     variant="outline"
                     className="flex-1 h-8 text-xs gap-1.5"
                     onClick={() => onLaunch(platform.id)}
                   >
                     <div className={cn("w-2 h-2 rounded-full", platform.color)} />
                     {platform.name}
                     <ExternalLink className="w-3 h-3 ml-auto" />
                   </Button>
                 ))}
               </div>
             </div>
           )}
         </div>
       </CardContent>
     </Card>
   );
 }