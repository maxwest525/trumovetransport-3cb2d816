import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";

interface AgentLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function AgentLoginModal({ open, onClose, onLogin }: AgentLoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Welcome back, Agent!");
      onLogin();
    }, 800);
  };

  const handleDemo = () => {
    setUsername("demo.agent");
    setPassword("••••••••");
    setTimeout(() => {
      toast.success("Demo login — Welcome, Agent!");
      onLogin();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-0 gap-0 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-foreground px-6 py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-background tracking-tight">Agent Portal</h2>
          <p className="text-sm text-background/50 mt-1">Sign in to access your tools</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 bg-background">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 h-11 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="pl-10 h-11 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold gap-2 shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            onClick={handleDemo}
            variant="outline"
            className="w-full h-10 rounded-xl gap-2 text-sm border-dashed border-border hover:border-primary/40 hover:bg-primary/5"
          >
            <Zap className="w-3.5 h-3.5" />
            Quick Demo Access
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
