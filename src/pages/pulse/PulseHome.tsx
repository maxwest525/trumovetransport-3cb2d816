import { ArrowLeft, Activity, BarChart3, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

const SECTIONS = [
  { icon: Activity, title: "Agent Monitor", desc: "Live call transcription & keyword alerts", path: "/pulse/agent" },
  { icon: BarChart3, title: "Dashboard", desc: "Compliance metrics & analytics", path: "/pulse/dashboard" },
  { icon: Settings2, title: "Logic Manager", desc: "Rules, scripts & alert configuration", path: "/pulse/manager" },
];

export default function PulseHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 mb-12"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Hub
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          PulseAI Compliance
          <Badge variant="destructive" className="text-[10px] px-2 py-0.5">BETA</Badge>
        </h1>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          Real-time call monitoring, keyword detection & compliance automation — coming soon.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl">
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
          >
            <Card
              className="relative overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
              onClick={() => navigate(s.path)}
            >
              <CardHeader className="pt-8">
                <s.icon className="w-8 h-8 text-primary/70 mb-2" />
                <CardTitle className="text-sm">{s.title}</CardTitle>
                <CardDescription className="text-xs">{s.desc}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
