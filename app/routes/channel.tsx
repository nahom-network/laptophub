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
  Users,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Globe,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  api,
  type Chat,
  type LaptopPost,
  type PaginatedLaptopPostList,
} from "../lib/api";

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

function Stars({ rating }: { rating: number }) {
  const r = Math.round(
    Math.min(5, Math.max(0, parseFloat(String(rating)) || 0)),
  );
  return (
    <span className="inline-flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-[10px] leading-none ${i <= r ? "text-primary" : "text-foreground/15"}`}
        >
          Ã¢Ëœâ€¦
        </span>
      ))}
    </span>
  );
}

function formatPrice(price?: string | null) {
  if (!price) return null;
  const n = parseFloat(price);
  if (isNaN(n)) return price;
  return new Intl.NumberFormat("en-ET").format(n) + " ETB";
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Laptop card (compact) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
function PostCard({ laptop, index }: { laptop: LaptopPost; index: number }) {
  const img = laptop.images?.[0]?.image;
  const price = formatPrice(laptop.price);
  const isNew = laptop.status?.toLowerCase().includes("new");
  const isSold = laptop.status?.toLowerCase().includes("sold");

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group"
    >
      <Link
        to={`/laptops/${laptop.id}`}
        prefetch="intent"
        className="block h-full"
      >
        <Card className="overflow-hidden h-full border-border/50 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_30px_-8px_oklch(var(--primary)/0.25)] hover:-translate-y-0.5">
          <div className="relative aspect-4/3 bg-muted overflow-hidden">
            {img ? (
              <img
                src={img}
                alt={laptop.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Laptop
                  size={36}
                  strokeWidth={1}
                  className="text-foreground/15"
                />
              </div>
            )}
            {laptop.status && (
              <div
                className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide font-display uppercase ${
                  isNew
                    ? "bg-accent text-accent-foreground"
                    : isSold
                      ? "bg-foreground/70 text-background"
                      : "bg-background/80 backdrop-blur text-foreground"
                }`}
              >
                {laptop.status}
              </div>
            )}
            {price && (
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm">
                <span className="text-xs font-bold font-mono text-primary">
                  {price}
                </span>
              </div>
            )}
          </div>

          <CardContent className="p-3.5">
            <h3 className="text-[13px] font-semibold leading-snug line-clamp-2 mb-2.5">
              {laptop.title}
            </h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {laptop.processor && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground leading-none">
                  {laptop.processor.length > 18
                    ? laptop.processor.slice(0, 18) + "Ã¢â‚¬Â¦"
                    : laptop.processor}
                </span>
              )}
              {laptop.ram && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground leading-none">
                  {laptop.ram}
                </span>
              )}
              {laptop.storage && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground leading-none">
                  {laptop.storage}
                </span>
              )}
            </div>
            <Stars rating={parseFloat(laptop.average_rating) || 0} />
          </CardContent>
        </Card>
      </Link>
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-border/50">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <CardContent className="p-3.5 space-y-2.5">
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function meta({ data }: { data?: { channel?: Chat } }) {
  if (!data?.channel) return [{ title: "Channel Ã¢â‚¬â€ LaptopHub" }];
  return [{ title: `${data.channel.title} Ã¢â‚¬â€ LaptopHub` }];
}

export default function ChannelDetail() {
  const { id } = useParams();
  const { dark, toggle: toggleDark } = useDarkMode();

  const [channel, setChannel] = useState<Chat | null>(null);
  const [channelLoading, setChannelLoading] = useState(true);
  const [channelError, setChannelError] = useState<string | null>(null);

  const [posts, setPosts] = useState<PaginatedLaptopPostList | null>(null);
  const [postsPage, setPostsPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Fetch channel info
  useEffect(() => {
    if (!id) return;
    setChannelLoading(true);
    setChannelError(null);
    api.chats
      .retrieve(Number(id))
      .then(setChannel)
      .catch((e: Error) => setChannelError(e.message))
      .finally(() => setChannelLoading(false));
  }, [id]);

  // Fetch channel posts
  useEffect(() => {
    if (!id) return;
    setPostsLoading(true);
    setPostsError(null);
    api.chat
      .posts(Number(id), postsPage)
      .then(setPosts)
      .catch((e: Error) => setPostsError(e.message))
      .finally(() => setPostsLoading(false));
  }, [id, postsPage]);

  const totalPages = posts ? Math.ceil(posts.count / 12) : 1;

  const Header = () => (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft size={15} />
          Channels
        </Link>
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
        <div className="ml-auto">
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

  return (
    <div className="min-h-dvh flex flex-col bg-background font-sans">
      <Header />

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â CHANNEL BANNER Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <section className="relative overflow-hidden border-b border-border/60">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-accent/5 via-transparent to-primary/5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {channelLoading ? (
            <div className="flex gap-5 items-start">
              <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
              <div className="space-y-3 flex-1 pt-1">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-full max-w-md" />
                <div className="flex gap-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ) : channelError ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <AlertCircle size={14} />
              Failed to load channel info
            </div>
          ) : channel ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-5 items-start"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {channel.profile_photo ? (
                  <img
                    src={channel.profile_photo}
                    alt={channel.title}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                    <MessageCircle
                      size={28}
                      className="text-muted-foreground/40"
                    />
                  </div>
                )}
                {channel.is_verified && (
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-accent border-2 border-background flex items-center justify-center">
                    <CheckCircle2
                      size={12}
                      className="text-accent-foreground"
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold font-display">
                    {channel.title}
                  </h1>
                  {channel.is_verified && (
                    <Badge className="bg-accent/15 text-accent hover:bg-accent/20 border-0 text-[10px]">
                      Verified
                    </Badge>
                  )}
                  {channel.is_active && (
                    <Badge variant="secondary" className="text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block mr-1 animate-pulse" />
                      Active
                    </Badge>
                  )}
                </div>

                {channel.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-4">
                    {channel.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {channel.member_count != null && (
                    <span className="flex items-center gap-1.5 text-muted-foreground font-mono text-[12px]">
                      <Users size={13} />
                      {channel.member_count.toLocaleString()} members
                    </span>
                  )}
                  {posts && (
                    <span className="flex items-center gap-1.5 text-muted-foreground font-mono text-[12px]">
                      <Laptop size={13} />
                      {posts.count} listings
                    </span>
                  )}
                  {channel.category && (
                    <Badge
                      variant="outline"
                      className="text-[11px] font-normal"
                    >
                      {channel.category}
                    </Badge>
                  )}
                  {channel.language && (
                    <span className="flex items-center gap-1.5 text-muted-foreground text-[12px]">
                      <Globe size={12} />
                      {channel.language.toUpperCase()}
                    </span>
                  )}
                  {channel.username && (
                    <a
                      href={`https://t.me/${channel.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline underline-offset-2 text-[12px] font-mono transition-colors"
                    >
                      @{channel.username}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â POSTS GRID Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Channel Listings
          </h2>
          {posts && !postsLoading && (
            <span className="text-xs font-mono text-muted-foreground">
              {posts.count} total
            </span>
          )}
        </div>

        {postsError && (
          <div className="flex items-center justify-between gap-4 mb-6 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
            <span className="flex items-center gap-2">
              <AlertCircle size={14} />
              {postsError}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => {
                setPostsError(null);
                setPostsPage(1);
              }}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {postsLoading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            : (posts?.results ?? []).length > 0
              ? (posts?.results ?? []).map((l, i) => (
                  <PostCard key={l.id} laptop={l} index={i} />
                ))
              : !postsError && (
                  <div className="col-span-full py-24 text-center">
                    <Laptop
                      size={40}
                      strokeWidth={1}
                      className="mx-auto mb-4 text-foreground/20"
                    />
                    <p className="text-sm text-muted-foreground">
                      No listings in this channel yet.
                    </p>
                  </div>
                )}
        </div>

        {!postsLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={postsPage <= 1}
              onClick={() => setPostsPage((p) => p - 1)}
              className="gap-1.5"
            >
              <ChevronLeft size={14} />
              Prev
            </Button>
            <span className="text-xs font-mono text-muted-foreground px-2">
              {postsPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={postsPage >= totalPages}
              onClick={() => setPostsPage((p) => p + 1)}
              className="gap-1.5"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
