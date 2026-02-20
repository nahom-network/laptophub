import { useState, useCallback } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Laptop,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "../lib/api";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }, [dark]);
  return { dark, toggle };
}

export function meta() {
  return [{ title: "Reset Password — LaptopHub" }];
}

export default function ForgotPasswordPage() {
  const { dark, toggle: toggleDark } = useDarkMode();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.auth.requestPasswordReset(email);
      setSent(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background font-sans overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-display font-bold text-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Laptop
                size={14}
                strokeWidth={2.5}
                className="text-primary-foreground"
              />
            </div>
            <span>LaptopHub</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={toggleDark}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </Button>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={22} className="text-accent" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold mb-1">
                    Check your email
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    If an account exists for{" "}
                    <span className="font-medium text-foreground">{email}</span>
                    , we've sent a password reset link.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-2 font-medium"
                >
                  <ArrowLeft size={13} />
                  Back to login
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="font-display text-2xl font-bold mb-1">
                    Reset password
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-10 bg-muted/40 border-border/60 focus:border-primary/50"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-xs text-destructive bg-destructive/8 px-3 py-2.5 rounded-lg border border-destructive/20"
                    >
                      <AlertCircle size={13} className="shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Sending…" : "Send reset link"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline underline-offset-2 font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
