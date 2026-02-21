import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Laptop,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Camera,
  Trash2,
  LogOut,
  RefreshCw,
  Save,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export function meta() {
  return [{ title: "Profile — LaptopHub" }];
}

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

const RESEND_COOLDOWN = 120;

export default function ProfilePage() {
  const { dark, toggle: toggleDark } = useDarkMode();
  const { accessToken, profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!accessToken) {
      navigate("/login", { replace: true });
    }
  }, [accessToken, navigate]);

  // ── Profile form ──────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [phone, setPhone] = useState(profile?.phone_number ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setPhone(profile.phone_number);
      setBio(profile.bio);
    }
  }, [profile]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const fd = new FormData();
      fd.append("first_name", firstName);
      fd.append("last_name", lastName);
      fd.append("phone_number", phone);
      fd.append("bio", bio);
      if (avatarFile) fd.append("profile_picture", avatarFile);
      await api.profile.update(accessToken, fd);
      await refreshProfile();
      setSaveSuccess(true);
      setAvatarFile(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ── Change password ───────────────────────────────────────────────────────
  const [showPwSection, setShowPwSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setChangingPw(true);
    setPwError(null);
    setPwSuccess(false);
    try {
      await api.auth.changePassword(accessToken, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPwSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 3500);
    } catch (err: unknown) {
      setPwError(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    } finally {
      setChangingPw(false);
    }
  }

  // ── Verify email ──────────────────────────────────────────────────────────
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown() {
    setResendCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => clearInterval(cooldownRef.current!), []);

  async function handleResendVerification() {
    if (!accessToken) return;
    setResending(true);
    setResendError(null);
    setResent(false);
    try {
      await api.auth.resendVerification(accessToken);
      setResent(true);
      startCooldown();
    } catch (err: unknown) {
      setResendError(err instanceof Error ? err.message : "Failed to resend.");
    } finally {
      setResending(false);
    }
  }

  // ── Delete account ────────────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    if (!accessToken) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.profile.deleteAccount(accessToken);
      logout();
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account.",
      );
      setDeleting(false);
    }
  }

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.email ||
    "Your Account";

  const avatarUrl = avatarPreview ?? profile?.profile_picture ?? null;

  if (!accessToken) return null;

  return (
    <div className="min-h-dvh flex flex-col bg-background font-sans overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/75 backdrop-blur-xl sticky top-0 z-30">
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
            >
              <LogOut size={13} />
              Sign out
            </Button>
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
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 space-y-6 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-6"
        >
          {/* ── Verification banner ──────────────────────────────────── */}
          {profile && !profile.is_verified && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex items-start gap-3 flex-1">
                <Mail size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Email not verified
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Verify <span className="font-medium">{profile.email}</span>{" "}
                    to unlock all features.
                  </p>
                  {resent && (
                    <p className="text-xs text-accent font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Verification email sent!
                    </p>
                  )}
                  {resendError && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {resendError}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                  onClick={handleResendVerification}
                  disabled={resending || resendCooldown > 0}
                >
                  <RefreshCw
                    size={11}
                    className={resending ? "animate-spin" : ""}
                  />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : resending
                      ? "Sending…"
                      : "Resend email"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                  onClick={() => navigate("/verify-email")}
                >
                  Verify now
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Profile card ─────────────────────────────────────────── */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            {/* Avatar & name header */}
            <div className="px-4 sm:px-6 pt-6 pb-5 border-b border-border/50 flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-muted border border-border/60 overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={28} className="text-muted-foreground/50" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
                  aria-label="Change avatar"
                >
                  <Camera size={11} className="text-primary-foreground" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="Upload profile picture"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg font-bold leading-snug truncate">
                  {displayName}
                </h1>
                <div className="flex items-center gap-2 mt-0.5 min-w-0">
                  <p className="text-xs text-muted-foreground truncate min-w-0">
                    {profile?.email}
                  </p>
                  {profile?.is_verified ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                      <CheckCircle2 size={10} />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                      <AlertCircle size={10} />
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile form */}
            <form
              onSubmit={handleSaveProfile}
              className="px-4 sm:px-6 py-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    First name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="h-10 bg-muted/40 border-border/60 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    Last name
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="h-10 bg-muted/40 border-border/60 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  Phone number
                </label>
                <div className="relative">
                  <Phone
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"
                  />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 9XX XXX XXX"
                    className="h-10 pl-8 bg-muted/40 border-border/60 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about yourself…"
                  rows={3}
                  className="w-full rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <AnimatePresence>
                {saveError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs text-destructive bg-destructive/8 px-3 py-2.5 rounded-lg border border-destructive/20"
                  >
                    <AlertCircle size={13} className="shrink-0" />
                    {saveError}
                  </motion.div>
                )}
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs text-accent bg-accent/8 px-3 py-2.5 rounded-lg border border-accent/20"
                  >
                    <CheckCircle2 size={13} className="shrink-0" />
                    Profile saved successfully.
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full h-10 font-semibold gap-2"
                disabled={saving}
              >
                <Save size={14} />
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </div>

          {/* ── Change password ───────────────────────────────────────── */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <button
              type="button"
              className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left"
              onClick={() => setShowPwSection((v) => !v)}
            >
              <div className="flex items-center gap-2.5">
                <Shield size={15} className="text-muted-foreground" />
                <span className="font-medium text-sm">Change password</span>
              </div>
              {showPwSection ? (
                <ChevronUp size={15} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={15} className="text-muted-foreground" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {showPwSection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <Separator className="mx-4 sm:mx-6 w-auto" />
                  <form
                    onSubmit={handleChangePassword}
                    className="px-4 sm:px-6 py-5 space-y-4"
                  >
                    <PasswordField
                      id="old-password"
                      label="Current password"
                      value={oldPassword}
                      onChange={setOldPassword}
                      show={showOld}
                      setShow={setShowOld}
                    />
                    <PasswordField
                      id="new-password"
                      label="New password"
                      value={newPassword}
                      onChange={setNewPassword}
                      show={showNew}
                      setShow={setShowNew}
                    />
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                        Confirm new password
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="h-10 bg-muted/40 border-border/60 focus:border-primary/50"
                      />
                    </div>

                    <AnimatePresence>
                      {pwError && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-xs text-destructive bg-destructive/8 px-3 py-2.5 rounded-lg border border-destructive/20"
                        >
                          <AlertCircle size={13} className="shrink-0" />
                          {pwError}
                        </motion.div>
                      )}
                      {pwSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-xs text-accent bg-accent/8 px-3 py-2.5 rounded-lg border border-accent/20"
                        >
                          <CheckCircle2 size={13} className="shrink-0" />
                          Password changed successfully.
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="h-9 text-sm font-medium gap-2"
                      disabled={
                        changingPw ||
                        !oldPassword ||
                        !newPassword ||
                        !confirmPassword
                      }
                    >
                      {changingPw ? "Updating…" : "Update password"}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Danger zone ───────────────────────────────────────────── */}
          <div className="rounded-2xl border border-destructive/25 bg-card shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm text-foreground">
                  Delete account
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently remove your account and all associated data.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/8 gap-1.5 shrink-0"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={12} />
                Delete account
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDeleteConfirm(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-xl w-full max-w-sm"
            >
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Trash2 size={18} className="text-destructive" />
              </div>
              <h2 className="font-display text-lg font-bold mb-1">
                Delete your account?
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                This action is permanent and cannot be undone. All your data
                will be removed immediately.
              </p>
              {deleteError && (
                <p className="text-xs text-destructive flex items-center gap-1.5 mb-3">
                  <AlertCircle size={12} />
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-9 text-sm font-semibold"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  setShow,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="h-10 pr-10 bg-muted/40 border-border/60 focus:border-primary/50"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}
