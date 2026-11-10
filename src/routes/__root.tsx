import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header, Footer } from "../components/site";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Stronghold Vault Trust Institution" },
      { name: "description", content: "Your Trust. Your Future. Your Financial Security." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.png", type: "image/png", sizes: "64x64" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function LiveChatWidget() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Do NOT load or display live chat on Solo Admin portals (/admin or /admin-login)
  const isAdminPortal = currentPath.startsWith("/admin");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isAdminPortal) {
      // If Tawk API was already loaded, hide widget on admin
      if ((window as unknown as { Tawk_API?: { hideWidget?: () => void } }).Tawk_API?.hideWidget) {
        try {
          (window as unknown as { Tawk_API: { hideWidget: () => void } }).Tawk_API.hideWidget();
        } catch {
          // ignore
        }
      }
      return;
    }

    // Load or show Tawk.to widget on customer and public pages
    const existing = document.getElementById("tawk-script");
    if (!existing) {
      (window as unknown as { Tawk_API?: unknown; Tawk_LoadStart?: Date }).Tawk_API =
        (window as unknown as { Tawk_API?: unknown }).Tawk_API || {};
      (window as unknown as { Tawk_LoadStart?: Date }).Tawk_LoadStart = new Date();

      const s1 = document.createElement("script");
      s1.id = "tawk-script";
      s1.async = true;
      s1.src = "https://embed.tawk.to/6af20b4d957b213c44efab78/1k70noajj";
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      document.body.appendChild(s1);
    } else if ((window as unknown as { Tawk_API?: { showWidget?: () => void } }).Tawk_API?.showWidget) {
      try {
        (window as unknown as { Tawk_API: { showWidget: () => void } }).Tawk_API.showWidget();
      } catch {
        // ignore
      }
    }
  }, [isAdminPortal, currentPath]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Dedicated customer and admin workspace portals should NOT show public site header/footer
  const isDedicatedPortal =
    currentPath.startsWith("/dashboard") ||
    currentPath.startsWith("/account-profile") ||
    currentPath.startsWith("/transfer") ||
    currentPath.startsWith("/cards") ||
    currentPath.startsWith("/digital-assets") ||
    currentPath.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <LiveChatWidget />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      {!isDedicatedPortal && <Header />}
      <main><Outlet /></main>
      {!isDedicatedPortal && <Footer />}
    </QueryClientProvider>
  );
}
