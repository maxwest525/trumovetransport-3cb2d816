import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Loader2 } from "lucide-react";

interface PortalAuthFormProps {
  onAuthenticated: () => void;
}

export default function PortalAuthForm({ onAuthenticated }: PortalAuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      onAuthenticated();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
        emailRedirectTo: window.location.origin + "/",
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent a confirmation link. Please verify your email to sign in." });
      setMode("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email sent", description: "Check your inbox for a password reset link." });
      setMode("login");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center mx-auto mb-4">
          <span className="text-background text-sm font-bold">G</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">
          {mode === "login" ? "Sign in to TruMove" : mode === "signup" ? "Create your account" : "Reset password"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "login"
            ? "Enter your credentials to access the portal"
            : mode === "signup"
            ? "Fill in your details to get started"
            : "We'll send you a reset link"}
        </p>
      </div>

      <form
        onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgotPassword}
        className="space-y-4"
      >
        {mode === "signup" && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {mode !== "forgot" && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        {mode === "login" && (
          <>
            <button onClick={() => setMode("forgot")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Forgot password?
            </button>
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-foreground font-medium hover:underline">
                Sign up
              </button>
            </p>
          </>
        )}
        {(mode === "signup" || mode === "forgot") && (
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => setMode("login")} className="text-foreground font-medium hover:underline">
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
