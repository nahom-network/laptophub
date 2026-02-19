import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import Footer from "./components/footer";

const SITE_NAME = "LaptopHub";
const SITE_URL = "https://laptophub.pro.et";
const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || "G-6XKH0BLYNV";
const DEFAULT_TITLE = "LaptopHub - Find Your Next Machine";
const DEFAULT_DESCRIPTION =
  "Browse laptops from trusted Telegram channels in Ethiopia, compare options, and find your next machine faster.";

export const meta: Route.MetaFunction = () => [
  { title: DEFAULT_TITLE },
  { name: "description", content: DEFAULT_DESCRIPTION },
  {
    name: "keywords",
    content:
      "laptops Ethiopia, buy laptop, used laptops, Telegram laptop channels, LaptopHub",
  },
  { name: "robots", content: "index, follow, max-image-preview:large" },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: SITE_NAME },
  { property: "og:title", content: DEFAULT_TITLE },
  { property: "og:description", content: DEFAULT_DESCRIPTION },
  { property: "og:url", content: SITE_URL },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: DEFAULT_TITLE },
  { name: "twitter:description", content: DEFAULT_DESCRIPTION },
];

export const links: Route.LinksFunction = () => [
  { rel: "canonical", href: SITE_URL },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Syne:wght@400..800&family=JetBrains+Mono:wght@400;500&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Persist dark mode without flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('theme');if(m==='dark'||(!m&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}');`,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Footer />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
