import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout, Target, Sparkles, ArrowRight } from "lucide-react";
import { BuildSelections } from "./AnalyticsBuilderPanel";

interface GeneratorPickerCardProps {
  selections: BuildSelections;
  onOpenWebsiteBuilder: () => void;
  onOpenAdBuilder: () => void;
  onCancel: () => void;
}

export function GeneratorPickerCard({ selections, onOpenWebsiteBuilder, onOpenAdBuilder, onCancel }: GeneratorPickerCardProps) {
  const isWebsite = selections.outputType === 'website';
  const isAd = selections.outputType === 'ad';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Choose a Generator</span>
        </div>
        <p className="text-xs text-muted-foreground">Preview-only generators, no live publishing yet.</p>
      </div>

      <div className="grid gap-4">
        {(isWebsite || (!isWebsite && !isAd)) && (
          <Card className="border-border hover:border-foreground/30 transition-colors cursor-pointer group" onClick={onOpenWebsiteBuilder}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                <Layout className="w-6 h-6 text-teal-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">Website + Landing Preview Builder</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose from 5 template styles · Light/Dark toggle · Home, Services, Reviews & Quote Form pages
                </p>
              </div>
              <Button size="sm" className="gap-1.5 shrink-0 group-hover:gap-2.5 transition-all">
                Open Preview Builder <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {(isAd || (!isWebsite && !isAd)) && (
          <Card className="border-border hover:border-foreground/30 transition-colors cursor-pointer group" onClick={onOpenAdBuilder}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">Ad Campaign Builder</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate copy for Meta, Google, TikTok, LinkedIn & more · Match landing page style
                </p>
              </div>
              <Button size="sm" className="gap-1.5 shrink-0 group-hover:gap-2.5 transition-all">
                Open Ad Builder <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs text-muted-foreground">
          ← Back to Build Manual
        </Button>
      </div>
    </div>
  );
}
