import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Sun, Moon, Laptop, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAuth } from "../lib/auth";

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
  return [{ title: "Create Account — LaptopHub" }];
}

export default function RegisterPage() {
  const { dark, toggle: toggleDark } = useDarkMode();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number || undefined,
        password: form.password,
      });
      navigate("/login?registered=1", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background font-sans">
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
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold mb-1">
                Create account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join LaptopHub to rate and review listings
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="first_name"
                    className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
                  >
                    First name
                  </label>
                  <Input
                    id="first_name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={form.first_name}
                    onChange={set("first_name")}
                    placeholder="Abebe"
                    className="h-10 bg-muted/40 border-border/60 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="last_name"
                    className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
                  >
                    Last name
                  </label>
                  <Input
                    id="last_name"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={form.last_name}
                    onChange={set("last_name")}
                    placeholder="Bekele"
                    className="h-10 bg-muted/40 border-border/60 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="reg-email"
                  className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  className="h-10 bg-muted/40 border-border/60 focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
                >
                  Phone{" "}
                  <span className="text-muted-foreground/50 normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone_number}
                  onChange={set("phone_number")}
                  placeholder="+251 9xx xxx xxx"
                  className="h-10 bg-muted/40 border-border/60 focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="reg-password"
                  className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={set("password")}
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
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
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
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline underline-offset-2 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
