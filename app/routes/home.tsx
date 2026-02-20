import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Laptop,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sun,
  Moon,
  Users,
  CheckCircle2,
  X,
  TrendingUp,
  Zap,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  api,
  type LaptopPost,
  type PaginatedLaptopPostList,
  type Chat,
  type PaginatedChatList,
} from "../lib/api";

export function meta() {
  return [
    { title: "LaptopHub - Find Your Next Machine in Ethiopia" },
    {
      name: "description",
      content:
        "Browse laptops from Telegram channels in Ethiopia and compare the best options in one place.",
    },
  ];
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

/*  Helpers  */
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
        ></span>
      ))}
    </span>
  );
}

function extractChannelId(channelUrl?: string | null): string | null {
  if (!channelUrl) return null;
  return channelUrl.match(/\/chats\/(\d+)\//)?.[1] ?? null;
}

function formatPrice(price?: string | null) {
  if (!price) return null;
  const n = parseFloat(price);
  if (isNaN(n)) return price;
  return new Intl.NumberFormat("en-ET").format(n) + " ETB";
}

/*  Laptop Card  */
function LaptopCard({ laptop, index }: { laptop: LaptopPost; index: number }) {
  const img = laptop.images?.[0]?.image;
  const price = formatPrice(laptop.price);
  const channelId = extractChannelId(laptop.channel);
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
        to={`/laptops/${laptop.uuid}`}
        prefetch="intent"
        className="block h-full"
      >
        <Card className="overflow-hidden h-full border-border/50 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_30px_-8px_oklch(var(--primary)/0.25)] hover:-translate-y-0.5">
          {/* Image */}
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
            {/* Status pill */}
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
            {/* Price overlay */}
            {price && (
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm">
                <span className="text-xs font-bold font-mono text-primary">
                  {price}
                </span>
              </div>
            )}
          </div>

          <CardContent className="p-3.5">
            <h3 className="text-[13px] font-semibold leading-snug line-clamp-2 mb-2.5 text-foreground">
              {laptop.title}
            </h3>

            {/* Spec chips */}
            <div className="flex flex-wrap gap-1 mb-3">
              {laptop.processor && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground leading-none">
                  {laptop.processor.length > 18
                    ? laptop.processor.slice(0, 18) + ""
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

            <div className="flex items-center justify-between">
              <Stars rating={parseFloat(laptop.average_rating) || 0} />
              {channelId ? (
                <Link
                  to={`/channels/${channelId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] text-muted-foreground hover:text-accent transition-colors truncate max-w-30"
                >
                  {laptop.channel_name}
                </Link>
              ) : (
                <span className="text-[10px] text-muted-foreground truncate max-w-30">
                  {laptop.channel_name}
                </span>
              )}
            </div>
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

/*  Channel Card  */
function ChannelCard({ chat, index }: { chat: Chat; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link to={`/channels/${chat.channel_id}`}>
        <Card className="overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-accent/40 hover:shadow-[0_8px_30px_-8px_oklch(var(--accent)/0.2)] hover:-translate-y-0.5 group">
          <CardContent className="p-4 flex gap-3.5 items-center">
            <div className="relative shrink-0">
              {chat.profile_photo ? (
                <img
                  src={chat.profile_photo}
                  alt={chat.title}
                  className="w-14 h-14 rounded-xl object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                  <MessageCircle
                    size={22}
                    className="text-muted-foreground/40"
                  />
                </div>
              )}
              {chat.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <CheckCircle2 size={11} className="text-accent-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="text-sm font-semibold font-display truncate group-hover:text-accent transition-colors">
                  {chat.title}
                </h3>
              </div>
              {chat.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                  {chat.description}
                </p>
              )}
              <div className="flex items-center gap-3">
                {chat.member_count != null && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                    <Users size={10} />
                    {chat.member_count.toLocaleString()}
                  </span>
                )}
                {chat.category && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 font-normal"
                  >
                    {chat.category}
                  </Badge>
                )}
                {chat.is_active && (
                  <span className="flex items-center gap-1 text-[10px] text-accent font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Active
                  </span>
                )}
              </div>
            </div>

            <ChevronRight
              size={14}
              className="text-muted-foreground/40 shrink-0 group-hover:text-accent transition-colors"
            />
          </CardContent>
        </Card>
      </Link>
    </motion.article>
  );
}

/*  Main  */
export default function Home() {
  const { dark, toggle: toggleDark } = useDarkMode();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = (searchParams.get("tab") as "laptops" | "channels") ?? "laptops";
  const laptopPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const chatPage = Math.max(1, parseInt(searchParams.get("cpage") ?? "1", 10));
  const query = searchParams.get("q") ?? "";

  const [laptopData, setLaptopData] = useState<PaginatedLaptopPostList | null>(
    null,
  );
  const [laptopLoading, setLaptopLoading] = useState(true);
  const [laptopError, setLaptopError] = useState<string | null>(null);

  const [chatData, setChatData] = useState<PaginatedChatList | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(query);
  const searchRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (searchInput.trim()) {
            next.set("q", searchInput.trim());
          } else {
            next.delete("q");
          }
          next.delete("page");
          return next;
        },
        { replace: true },
      );
    }, 450);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab !== "laptops") return;
    setLaptopLoading(true);
    setLaptopError(null);
    api.laptops
      .list(laptopPage, query)
      .then(setLaptopData)
      .catch((e: Error) => setLaptopError(e.message))
      .finally(() => setLaptopLoading(false));
  }, [laptopPage, query, tab]);

  useEffect(() => {
    if (tab !== "channels") return;
    setChatLoading(true);
    setChatError(null);
    api.chats
      .list(chatPage)
      .then(setChatData)
      .catch((e: Error) => setChatError(e.message))
      .finally(() => setChatLoading(false));
  }, [chatPage, tab]);

  const ltPages = laptopData ? Math.ceil(laptopData.count / 12) : 1;
  const chPages = chatData ? Math.ceil(chatData.count / 12) : 1;

  return (
    <div className="min-h-dvh flex flex-col bg-background font-sans">
      {/*  HEADER  */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/"
              className="flex items-center gap-2 font-display font-bold text-sm tracking-tight hover:opacity-80 transition-opacity"
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
          </motion.div>

          {/* Search (laptops tab only) */}
          <AnimatePresence>
            {tab === "laptops" && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 max-w-sm"
              >
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <Input
                    ref={searchRef}
                    type="search"
                    placeholder="Search laptops"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-8 pr-8 h-8 text-sm bg-muted/60 border-transparent focus:border-primary/50 rounded-full"
                  />
                  {searchInput && (
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSearchParams(
                          (prev) => {
                            const next = new URLSearchParams(prev);
                            next.delete("q");
                            next.delete("page");
                            return next;
                          },
                          { replace: true },
                        );
                      }}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ml-auto flex items-center gap-2">
            {laptopData && tab === "laptops" && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden sm:block text-[11px] font-mono text-muted-foreground"
              >
                {laptopData.count.toLocaleString()} listings
              </motion.span>
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

      <main className="flex-1">
        {/*  HERO  */}
        <section className="relative overflow-hidden border-b border-border/60">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-48 rounded-full bg-accent/6 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Zap size={13} className="text-primary" />
                <span className="text-xs font-mono tracking-widest uppercase text-primary">
                  Telegram Aggregator Ethiopia
                </span>
              </div>

              <h1 className="font-display text-[clamp(2.4rem,6vw,4.2rem)] font-bold leading-[1.05] tracking-tight mb-5">
                Find your next
                <br />
                <span className="text-primary">laptop</span>
                <span className="text-foreground/30">.</span>
              </h1>

              <p className="text-muted-foreground max-w-lg leading-relaxed text-sm sm:text-base mb-8">
                Real-time listings from verified Telegram seller channels new &
                used machines, all spec'd and priced.
              </p>

              {/* Quick stats */}
              {laptopData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-6"
                >
                  {[
                    {
                      icon: <TrendingUp size={13} />,
                      label: "Listings",
                      value: laptopData.count.toLocaleString(),
                    },
                    {
                      icon: <MessageCircle size={13} />,
                      label: "Channels",
                      value: chatData?.count
                        ? chatData.count.toLocaleString()
                        : "",
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <span className="text-primary">{stat.icon}</span>
                      <div>
                        <div className="text-lg font-bold font-display leading-none">
                          {stat.value}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wide">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/*  TABS + CONTENT  */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Tab bar */}
          <div className="flex items-center gap-1 mb-8 w-fit">
            {(["laptops", "channels"] as const).map((t) => (
              <button
                key={t}
                onClick={() =>
                  setSearchParams(
                    (prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("tab", t);
                      return next;
                    },
                    { replace: true },
                  )
                }
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold font-display transition-all duration-200 ${
                  tab === t
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-lg bg-muted"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {t === "laptops" ? (
                    <Laptop size={14} />
                  ) : (
                    <MessageCircle size={14} />
                  )}
                  {t === "laptops" ? "Laptops" : "Channels"}
                </span>
              </button>
            ))}
          </div>

          {/*  Laptops  */}
          <AnimatePresence mode="wait">
            {tab === "laptops" && (
              <motion.div
                key="laptops"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {laptopError && (
                  <div className="flex items-center justify-between gap-4 mb-6 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
                    <span className="flex items-center gap-2">
                      <AlertCircle size={14} />
                      {laptopError}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setLaptopError(null);
                        setSearchParams(
                          (prev) => {
                            const next = new URLSearchParams(prev);
                            next.delete("page");
                            return next;
                          },
                          { replace: true },
                        );
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {query && !laptopLoading && (
                  <div className="flex items-center gap-2 mb-5 text-sm">
                    <SlidersHorizontal
                      size={13}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-semibold">
                        {laptopData?.count ?? 0}
                      </span>{" "}
                      results for &ldquo;
                      <span className="text-primary">{query}</span>&rdquo;
                    </span>
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSearchParams(
                          (prev) => {
                            const next = new URLSearchParams(prev);
                            next.delete("q");
                            next.delete("page");
                            return next;
                          },
                          { replace: true },
                        );
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                    >
                      clear
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-10">
                  {laptopLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))
                    : (laptopData?.results ?? []).length > 0
                      ? (laptopData?.results ?? []).map((l, i) => (
                          <LaptopCard key={l.uuid} laptop={l} index={i} />
                        ))
                      : !laptopError && (
                          <div className="col-span-full py-24 text-center">
                            <Laptop
                              size={40}
                              strokeWidth={1}
                              className="mx-auto mb-4 text-foreground/20"
                            />
                            <p className="text-sm text-muted-foreground">
                              No laptops found{query ? ` for "${query}"` : ""}.
                            </p>
                          </div>
                        )}
                </div>

                {!laptopLoading && ltPages > 1 && (
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={laptopPage <= 1}
                      onClick={() =>
                        setSearchParams(
                          (prev) => {
                            const next = new URLSearchParams(prev);
                            next.set("page", String(laptopPage - 1));
                            return next;
                          },
                          { replace: true, preventScrollReset: true },
                        )
                      }
                      className="gap-1.5"
                    >
                      <ChevronLeft size={14} />
                      Prev
                    </Button>
                    <span className="text-xs font-mono text-muted-foreground px-2">
                      {laptopPage} / {ltPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={laptopPage >= ltPages}
                      onClick={() =>
                        setSearchParams(
                          (prev) => {
                            const next = new URLSearchParams(prev);
                            next.set("page", String(laptopPage + 1));
                            return next;
                          },
                          { replace: true, preventScrollReset: true },
                        )
                      }
                      className="gap-1.5"
                    >
                      Next
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/*  Channels  */}
            {tab === "channels" && (
              <motion.div
                key="channels"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {chatError && (
                  <div className="flex items-center justify-between gap-4 mb-6 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
                    <span className="flex items-center gap-2">
                      <AlertCircle size={14} />
                      {chatError}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setChatError(null);
                        setSearchParams(
                          (prev) => {
                            const next = new URLSearchParams(prev);
                            next.delete("cpage");
                            return next;
                          },
                          { replace: true },
                        );
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-10">
                  {chatLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="border-border/50">
                          <CardContent className="p-4 flex gap-3.5">
                            <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                              <Skeleton className="h-3.5 w-3/4" />
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-2/5" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    : (chatData?.results ?? []).length > 0
                      ? (chatData?.results ?? []).map((c, i) => (
                          <ChannelCard key={c.channel_id} chat={c} index={i} />
                        ))
                      : !chatError && (
                          <div className="col-span-full py-24 text-center">
                            <MessageCircle
                              size={40}
                              strokeWidth={1}
                              className="mx-auto mb-4 text-foreground/20"
                            />
                            <p className="text-sm text-muted-foreground">
                              No channels found.
                            </p>
                          </div>
                        )}
                </div>

                {!chatLoading && chPages > 1 && (
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={chatPage <= 1}
                      onClick={() =>
                        setSearchParams(
                          (prev) => {
                            const next = new URLSearchParams(prev);
                            next.set("cpage", String(chatPage - 1));
                            return next;
                          },
                          { replace: true, preventScrollReset: true },
                        )
                      }
                      className="gap-1.5"
                    >
                      <ChevronLeft size={14} />
                      Prev
                    </Button>
                    <span className="text-xs font-mono text-muted-foreground px-2">
                      {chatPage} / {chPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={chatPage >= chPages}
                      onClick={() =>
                        setSearchParams(
                          (prev) => {
                            const next = new URLSearchParams(prev);
                            next.set("cpage", String(chatPage + 1));
                            return next;
                          },
                          { replace: true, preventScrollReset: true },
                        )
                      }
                      className="gap-1.5"
                    >
                      Next
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
