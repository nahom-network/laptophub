import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sun,
  Moon,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Star,
  HardDrive,
  Cpu,
  Monitor,
  Battery,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  ZoomIn,
  Send,
  LogIn,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  api,
  type LaptopPost,
  type Review,
  type LaptopImage,
  type SimilarItem,
} from "../lib/api";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/auth";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    // Respect the class already set by the inline script in root.tsx
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

function Stars({ rating, large }: { rating: number; large?: boolean }) {
  const r = Math.round(
    Math.min(5, Math.max(0, parseFloat(String(rating)) || 0)),
  );
  const raw = parseFloat(String(rating)) || 0;
  const sz = large ? "text-sm" : "text-[11px]";
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex gap-px">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`${sz} leading-none ${i <= r ? "text-primary" : "text-foreground/15"}`}
          ></span>
        ))}
      </span>
      <span
        className={`font-mono text-muted-foreground ${large ? "text-xs" : "text-[10px]"}`}
      >
        {raw.toFixed(1)}
      </span>
    </span>
  );
}

function formatPrice(price?: string | null) {
  if (!price) return null;
  const n = parseFloat(price);
  if (isNaN(n)) return price;
  return new Intl.NumberFormat("en-ET").format(n) + " ETB";
}

function extractChannelId(channelUrl?: string | null): string | null {
  if (!channelUrl) return null;
  return channelUrl.match(/\/chats\/(\d+)\//)?.[1] ?? null;
}

/*  Image Gallery  */
function Gallery({ images }: { images: LaptopImage[] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center">
        <Laptop size={56} strokeWidth={1} className="text-foreground/15" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={images[current].image}
              alt={`Photo ${current + 1}`}
              className="w-full h-full object-contain cursor-zoom-in"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightbox(true)}
            />
          </AnimatePresence>

          {/* Zoom hint */}
          <button
            onClick={() => setLightbox(true)}
            aria-label="View full size"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ZoomIn size={14} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrent((c) => (c - 1 + images.length) % images.length)
                }
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setCurrent((c) => (c + 1) % images.length)}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={15} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Image ${i + 1}`}
                    className={`rounded-full transition-all duration-200 ${i === current ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-foreground/30"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Thumbnail ${i + 1}`}
                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${i === current ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img
                  src={img.image}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/95 backdrop-blur flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              aria-label="Close"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft size={18} className="rotate-135" />
            </button>
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              src={images[current].image}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/*  Review card  */
function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs font-display">
                {(review.user?.[0] ?? "?").toUpperCase()}
              </div>
              <span className="text-sm font-semibold">
                {review.user ?? "Anonymous"}
              </span>
            </div>
            <Stars rating={review.rating} />
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          )}
          {review.created_at && (
            <p className="text-[10px] text-muted-foreground/50 font-mono mt-2">
              {new Date(review.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/*  Spec row  */
function SpecRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 gap-4">
      <span className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
        <span className="text-muted-foreground/60">{icon}</span>
        {label}
      </span>
      <span className="text-[13px] font-mono text-right">{value}</span>
    </div>
  );
}

/*  Similar item card  */
function SimilarCard({ item, index }: { item: SimilarItem; index: number }) {
  const l = item.similar_laptop;
  const img = l.images?.[0]?.image;
  const price = formatPrice(l.price);
  const isNew = l.status?.toLowerCase().includes("new");
  const isSold = l.status?.toLowerCase().includes("sold");
  const matchPct = Math.round(item.score * 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="group"
    >
      <Link
        to={`/laptops/${l.uuid}`}
        prefetch="intent"
        className="flex gap-3 items-start p-3 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-muted/50 transition-all duration-200"
      >
        {/* Thumbnail */}
        <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
          {img ? (
            <img
              src={img}
              alt={l.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Laptop
                size={18}
                strokeWidth={1}
                className="text-foreground/20"
              />
            </div>
          )}
          {l.status && (
            <div
              className={`absolute top-1 left-1 px-1.5 py-0 rounded text-[9px] font-semibold leading-4 uppercase ${
                isNew
                  ? "bg-accent text-accent-foreground"
                  : isSold
                    ? "bg-foreground/70 text-background"
                    : "bg-background/80 text-foreground"
              }`}
            >
              {l.status}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-semibold leading-snug line-clamp-2 mb-1">
            {l.title}
          </h4>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {l.ram && (
              <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground leading-none">
                {l.ram}
              </span>
            )}
            {l.storage && (
              <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground leading-none">
                {l.storage}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            {price ? (
              <span className="text-xs font-bold font-mono text-primary">
                {price}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground italic">
                No price
              </span>
            )}
            <span className="text-[10px] font-mono text-muted-foreground/60">
              {matchPct}% match
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

/*  Review Form  */
function ReviewForm({
  uuid,
  token,
  onSuccess,
}: {
  uuid: string;
  token: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.reviews.create(uuid, token, {
        rating,
        comment: comment.trim() || undefined,
      });
      setDone(true);
      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to submit. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-accent font-semibold py-2">
        <CheckCircle2 size={14} />
        Your review was submitted — thank you!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star selector */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className={`text-2xl leading-none transition-colors ${
              n <= (hovered || rating) ? "text-primary" : "text-foreground/15"
            }`}
            aria-label={`${n} star`}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-xs font-mono text-muted-foreground">
            {["Poor", "Fair", "Good", "Great", "Excellent"][rating - 1]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts (optional)"
        rows={3}
        className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none text-foreground placeholder:text-muted-foreground font-sans"
      />

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="sm"
        disabled={submitting || !rating}
        className="gap-1.5"
      >
        <Send size={12} />
        {submitting ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}

/*  Main  */
export function meta({ data }: { data?: { laptop?: LaptopPost } }) {
  if (!data?.laptop) return [{ title: "LaptopHub" }];
  return [{ title: `${data.laptop.title}  LaptopHub` }];
}

export default function LaptopDetail() {
  const { uuid } = useParams();
  const { dark, toggle: toggleDark } = useDarkMode();
  const { user, accessToken, isAuthenticated, logout } = useAuth();
  const [laptop, setLaptop] = useState<LaptopPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const refetchLaptop = useCallback(() => {
    if (!uuid) return;
    api.laptops
      .retrieve(uuid)
      .then(setLaptop)
      .catch(() => {});
  }, [uuid]);

  useEffect(() => {
    if (!uuid) return;
    setLoading(true);
    setError(null);
    api.laptops
      .retrieve(uuid)
      .then(setLaptop)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [uuid]);

  const channelId = laptop ? extractChannelId(laptop.channel) : null;
  const price = formatPrice(laptop?.price);
  const avgRating = parseFloat(laptop?.average_rating ?? "0") || 0;
  const specs = laptop
    ? ([
        laptop.processor && {
          icon: <Cpu size={12} />,
          label: "Processor",
          value: laptop.processor,
        },
        laptop.ram && {
          icon: <Monitor size={12} />,
          label: "RAM",
          value: laptop.ram,
        },
        laptop.storage && {
          icon: <HardDrive size={12} />,
          label: "Storage",
          value: laptop.storage,
        },
        laptop.display && {
          icon: <Monitor size={12} />,
          label: "Display",
          value: laptop.display,
        },
        laptop.battrey && {
          icon: <Battery size={12} />,
          label: "Battery",
          value: laptop.battrey,
        },
        laptop.graphics && {
          icon: <Cpu size={12} />,
          label: "Graphics",
          value: laptop.graphics,
        },
        laptop.color && {
          icon: <Monitor size={12} />,
          label: "Color",
          value: laptop.color,
        },
      ].filter(Boolean) as {
        icon: React.ReactNode;
        label: string;
        value: string;
      }[])
    : [];

  const Header = () => (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Button
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent transition-colors text-sm cursor-pointer"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={15} />
          Back
        </Button>

        <Separator orientation="vertical" className="h-4 mx-1" />
        <Link
          to="/"
          className="flex items-center gap-2 font-display font-bold text-sm"
        >
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Laptop
              size={12}
              strokeWidth={2.5}
              className="text-primary-foreground"
            />
          </div>
          LaptopHub
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:block text-[11px] font-mono text-muted-foreground max-w-35 truncate">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                onClick={logout}
              >
                <LogOut size={12} />
                <span className="hidden sm:block">Logout</span>
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors h-8 px-2"
            >
              <LogIn size={12} />
              <span className="hidden sm:block">Login</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={toggleDark}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dark ? "sun" : "moon"}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </header>
  );

  if (loading)
    return (
      <div className="min-h-dvh flex flex-col bg-background font-sans">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            <Skeleton className="aspect-video rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-7 w-4/5" />{" "}
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />{" "}
              <Skeleton className="h-4 w-3/4" />{" "}
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </main>
      </div>
    );

  if (error || !laptop)
    return (
      <div className="min-h-dvh flex flex-col bg-background font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle
              size={40}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-muted-foreground/40"
            />
            <p className="text-sm text-muted-foreground mb-4">
              {error ?? "Laptop not found"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </main>
      </div>
    );

  const isNew = laptop.status?.toLowerCase().includes("new");
  const isSold = laptop.status?.toLowerCase().includes("sold");

  return (
    <div className="min-h-dvh flex flex-col bg-background font-sans">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full"
      >
        <div className="grid lg:grid-cols-[1fr_340px] gap-10 xl:gap-14">
          {/*  Left  */}
          <div className="space-y-10">
            <Gallery images={laptop.images ?? []} />

            {laptop.description && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  About
                </h2>
                <p className="text-sm text-foreground/80 leading-[1.75]">
                  {laptop.description}
                </p>
              </motion.section>
            )}

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Existing reviews */}
              {(laptop.reviews ?? []).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      Reviews
                    </h2>
                    <Stars rating={avgRating} large />
                  </div>
                  <div className="space-y-3">
                    {laptop.reviews.map((rev, i) => (
                      <ReviewCard key={rev.id ?? i} review={rev} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Write a review */}
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  Write a Review
                </h2>
                {isAuthenticated ? (
                  <ReviewForm
                    uuid={uuid!}
                    token={accessToken!}
                    onSuccess={refetchLaptop}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <Link
                      to="/login"
                      className="text-primary hover:underline underline-offset-2 font-medium"
                    >
                      Log in
                    </Link>{" "}
                    to leave a review.
                  </p>
                )}
              </div>
            </motion.section>

            {laptop.simmilar_items && laptop.simmilar_items.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  Similar Laptops
                </h2>
                <div className="space-y-2">
                  {laptop.simmilar_items.map((item, i) => (
                    <SimilarCard
                      key={item.similar_laptop.uuid}
                      item={item}
                      index={i}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/*  Right (sticky info panel)  */}
          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="space-y-6 lg:sticky lg:top-20 lg:self-start"
          >
            {/* Title + status */}
            <div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {laptop.status && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide font-display uppercase ${
                      isNew
                        ? "bg-accent/15 text-accent"
                        : isSold
                          ? "bg-foreground/10 text-muted-foreground"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    {laptop.status}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold font-display leading-snug mb-4">
                {laptop.title}
              </h1>
              {price ? (
                <div className="text-3xl font-bold font-mono text-primary">
                  {price}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Price on request
                </div>
              )}
              {avgRating > 0 && (
                <div className="mt-2">
                  <Stars rating={avgRating} large />
                </div>
              )}
            </div>

            <Separator className="bg-border/60" />

            {/* Channel info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <MessageCircle size={14} className="text-accent" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground mb-0.5">
                  Listed on
                </div>
                {channelId ? (
                  <Link
                    to={`/channels/${channelId}`}
                    className="text-sm font-semibold hover:text-accent transition-colors truncate block"
                  >
                    {laptop.channel_name ?? "Unknown Channel"}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold">
                    {laptop.channel_name ?? "Unknown Channel"}
                  </span>
                )}
              </div>
              {channelId && (
                <a
                  href={`https://t.me/${laptop.channel_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open on Telegram"
                  className="ml-auto text-muted-foreground/50 hover:text-accent transition-colors"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            {/* Specs */}
            {specs.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="px-4 py-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                    Specifications
                  </div>
                  {specs.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.04 }}
                    >
                      <SpecRow icon={s.icon} label={s.label} value={s.value} />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Posted date */}
            <p className="text-[11px] text-muted-foreground/50 font-mono">
              Posted{" "}
              {new Date(laptop.posted_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </motion.aside>
        </div>
      </motion.main>
    </div>
  );
}
