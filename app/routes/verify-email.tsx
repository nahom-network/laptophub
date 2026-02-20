import { useState, useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Laptop,
  AlertCircle,
  CheckCircle2,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "../lib/api";
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
  return [{ title: "Verify Email — LaptopHub" }];
}

export default function VerifyEmailPage() {
  const { dark, toggle: toggleDark } = useDarkMode();
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuth();

  // ?token=... triggers auto-verification
  // ?email=... comes from register flow to show the landing state
  const tokenParam = searchParams.get("token");
  const emailParam = searchParams.get("email") ?? "";

  const [manualToken, setManualToken] = useState(tokenParam ?? "");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Auto-verify if token is in the URL
  useEffect(() => {
    if (!tokenParam) return;
    setVerifying(true);
    api.auth
      .verifyEmail(tokenParam)
      .then(() => setVerified(true))
      .catch((err: unknown) =>
        setVerifyError(
          err instanceof Error
            ? err.message
            : "Verification failed. The link may have expired.",
        ),
      )
      .finally(() => setVerifying(false));
  }, [tokenParam]);

  async function handleManualVerify(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(null);
    try {
      await api.auth.verifyEmail(manualToken.trim());
      setVerified(true);
    } catch (err: unknown) {
      setVerifyError(
        err instanceof Error
          ? err.message
          : "Verification failed. The token may be invalid or expired.",
      );
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (!accessToken) return;
    setResending(true);
    setResendError(null);
    setResent(false);
    try {
      await api.auth.resendVerification(accessToken);
      setResent(true);
    } catch (err: unknown) {
      setResendError(
        err instanceof Error ? err.message : "Failed to resend. Try again.",
      );
    } finally {
      setResending(false);
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

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
            {/* Auto-verifying state */}
            {tokenParam && verifying && (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto animate-pulse">
                  <Mail size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Verifying your email…
                </p>
              </div>
            )}

            {/* Verified successfully */}
            {verified && (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={22} className="text-accent" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold mb-1">
                    Email verified!
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Your account is now active.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-block text-sm text-primary hover:underline underline-offset-2 font-medium"
                >
                  Sign in to your account →
                </Link>
              </div>
            )}

            {/* Error from auto-verify */}
            {tokenParam && !verifying && !verified && verifyError && (
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <AlertCircle
                    size={36}
                    className="mx-auto text-destructive/60"
                    strokeWidth={1.5}
                  />
                  <div>
                    <h1 className="font-display text-xl font-bold mb-1">
                      Verification failed
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {verifyError}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Enter your token manually below, or request a new link.
                </p>
                <ManualTokenForm
                  token={manualToken}
                  setToken={setManualToken}
                  onSubmit={handleManualVerify}
                  verifying={verifying}
                  error={null}
                />
              </div>
            )}

            {/* Landing page after register (no token param) */}
            {!tokenParam && !verified && (
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Mail size={20} className="text-primary" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold mb-1">
                      Check your inbox
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      We sent a verification link to{" "}
                      {emailParam ? (
                        <span className="font-medium text-foreground">
                          {emailParam}
                        </span>
                      ) : (
                        "your email"
                      )}
                      . Click it to activate your account.
                    </p>
                  </div>
                </div>

                {/* Manual token entry */}
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                    Or enter your token
                  </p>
                  <ManualTokenForm
                    token={manualToken}
                    setToken={setManualToken}
                    onSubmit={handleManualVerify}
                    verifying={verifying}
                    error={verifyError}
                  />
                </div>

                {/* Resend section */}
                {accessToken && (
                  <div className="border-t border-border/50 pt-4 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Didn't receive the email?
                    </p>
                    {resent ? (
                      <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
                        <CheckCircle2 size={12} />
                        Verification email resent!
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={handleResend}
                        disabled={resending}
                      >
                        <RefreshCw
                          size={11}
                          className={resending ? "animate-spin" : ""}
                        />
                        {resending ? "Sending…" : "Resend verification email"}
                      </Button>
                    )}
                    {resendError && (
                      <p className="text-xs text-destructive flex items-center gap-1.5">
                        <AlertCircle size={11} />
                        {resendError}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-center text-sm text-muted-foreground pt-2 border-t border-border/50">
                  Already verified?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline underline-offset-2 font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function ManualTokenForm({
  token,
  setToken,
  onSubmit,
  verifying,
  error,
}: {
  token: string;
  setToken: (v: string) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  verifying: boolean;
  error: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste verification token"
        className="h-10 bg-muted/40 border-border/60 focus:border-primary/50 font-mono text-sm"
        required
      />
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
        size="sm"
        className="w-full h-9 font-semibold"
        disabled={verifying || !token.trim()}
      >
        {verifying ? "Verifying…" : "Verify email"}
      </Button>
    </form>
  );
}
