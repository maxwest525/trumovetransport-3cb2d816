import { useState } from "react";
import { Phone, MessageSquare, User, Mail, PenLine } from "lucide-react";

export default function ContactHumanTabs() {
  const [tab, setTab] = useState<"call" | "form">("call");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("call")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            tab === "call"
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          <Phone className="w-3 h-3" /> Call
        </button>
        <button
          onClick={() => setTab("form")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            tab === "form"
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          <MessageSquare className="w-3 h-3" /> Form
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 text-center">
        {tab === "call" ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Speak with our team directly</p>
            <p className="text-xs text-muted-foreground">Mon-Sat, 8 AM - 8 PM EST</p>
            <a
              href="tel:+16097277647"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Phone className="w-4 h-4" />
              (609) 727-7647
            </a>
            <p className="text-xs text-muted-foreground">
              or email{" "}
              <a href="mailto:support@trumove.com" className="text-primary underline underline-offset-2">
                support@trumove.com
              </a>
            </p>
          </div>
        ) : (
          <form
            className="space-y-3 text-left max-w-sm mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                required
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Your name"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@email.com"
              />
            </div>
            <div className="relative">
              <PenLine className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                required
                rows={3}
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-foreground text-background py-2 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
