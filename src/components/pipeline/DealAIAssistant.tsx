import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Deal, Activity } from "./types";
import { toast } from "@/hooks/use-toast";

interface DealAIAssistantProps {
  deal: Deal;
  activities: Activity[];
}

export function DealAIAssistant({ deal, activities }: DealAIAssistantProps) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setResponse("");

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deal-ai-assistant`;

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          deal,
          lead: deal.leads || null,
          activities,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI service error" }));
        toast({ title: "AI Error", description: err.error, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (!resp.body) {
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResponse(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to get AI suggestions", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Assistant
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={analyze} disabled={loading} className="h-7 text-xs gap-1">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          {response ? "Refresh" : "Analyze"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && !response && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <Loader2 className="h-3 w-3 animate-spin" /> Analyzing deal...
          </div>
        )}
        {response ? (
          <div className="prose prose-sm max-w-none text-sm [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:text-xs [&_li]:text-xs [&_ul]:my-1 [&_ol]:my-1">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        ) : !loading ? (
          <p className="text-xs text-muted-foreground">Click "Analyze" for AI-powered deal insights and next steps.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
