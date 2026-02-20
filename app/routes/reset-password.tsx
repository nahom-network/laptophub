import { useState, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Laptop,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
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
  return [{ title: "Set New Password — LaptopHub" }];
}

export default function ResetPasswordPage() {
  const { dark, toggle: toggleDark } = useDarkMode();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") ?? "";
  const uid = searchParams.get("uid") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const missingParams = !token || !uid;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.auth.confirmPasswordReset({
        token,
        uid,
        new_password: password,
      });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Reset failed. The link may have expired.",
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
            {missingParams ? (
              <div className="text-center space-y-4">
                <AlertCircle
                  size={36}
                  className="mx-auto text-destructive/60"
                  strokeWidth={1.5}
                />
                <div>
                  <h1 className="font-display text-xl font-bold mb-1">
                    Invalid link
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    This password reset link is missing required parameters.
                    Please request a new one.
                  </p>
                </div>
                <Link
                  to="/forgot-password"
                  className="inline-block text-sm text-primary hover:underline underline-offset-2 font-medium"
                >
                  Request new link
                </Link>
              </div>
            ) : done ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={22} className="text-accent" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold mb-1">
                    Password updated!
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Redirecting you to login…
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-block text-sm text-primary hover:underline underline-offset-2 font-medium"
                >
                  Go to login
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="font-display text-2xl font-bold mb-1">
                    Set new password
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Choose a strong password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="new-password"
                      className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="h-10 pr-10 bg-muted/40 border-border/60 focus:border-primary/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirm-password"
                      className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      Confirm password
                    </label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat password"
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
                    {loading ? "Saving…" : "Set new password"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
