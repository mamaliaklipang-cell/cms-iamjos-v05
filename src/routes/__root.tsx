import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getSiteSettings } from "@/lib/cms/public.functions";
import { fontHrefFor } from "@/lib/cms/types";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-3 text-muted-foreground">Page not found</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    const settings = await getSiteSettings().catch(() => null);
    return { settings };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.settings;
    const font = s?.font_family ?? "Plus Jakarta Sans";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: s?.site_name ?? "Lumen CMS" },
        { name: "description", content: s?.tagline ?? "Modern Content Management System" },
        { title: "CMS IAMJOS" },
        { property: "og:title", content: "CMS IAMJOS" },
        { name: "twitter:title", content: "CMS IAMJOS" },
        { name: "description", content: "cms iamjos" },
        { property: "og:description", content: "cms iamjos" },
        { name: "twitter:description", content: "cms iamjos" },
        { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/aa25e1f4-0a8b-4c89-8a21-075f57ef8c5d/id-preview-ac7edcf0--e5234ccc-4a2a-4d61-9a1c-bfafbe7b2c9f.lovable.app-1780110889437.png" },
        { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/aa25e1f4-0a8b-4c89-8a21-075f57ef8c5d/id-preview-ac7edcf0--e5234ccc-4a2a-4d61-9a1c-bfafbe7b2c9f.lovable.app-1780110889437.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:type", content: "website" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "stylesheet", href: fontHrefFor(font as any) },
        ...(s?.favicon_url ? [{ rel: "icon", href: s.favicon_url }] : []),
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const { settings } = (Route.useLoaderData() as any) ?? {};
  const font = settings?.font_family ?? "Plus Jakarta Sans";
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body style={{ ["--font-sans-active" as any]: `"${font}", ui-sans-serif, system-ui, sans-serif` }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
