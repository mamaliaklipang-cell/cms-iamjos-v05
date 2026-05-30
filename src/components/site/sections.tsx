import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export function SectionRenderer({ sections, heroDefault, posts }: { sections: any[]; heroDefault: any; posts: any[] }) {
  return (
    <>
      {sections.map((s) => {
        const props = { ...(s.type === "hero" ? heroDefault : {}), ...(s.props ?? {}) };
        switch (s.type) {
          case "hero": return <Hero key={s.id} {...props} />;
          case "features": return <Features key={s.id} {...props} />;
          case "cta": return <CTA key={s.id} {...props} />;
          case "blog_list": return <BlogList key={s.id} {...props} posts={posts} />;
          case "rich_text": return <RichText key={s.id} {...props} />;
          default: return null;
        }
      })}
    </>
  );
}

function Hero(p: any) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-80" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-24 text-center">
        {p.eyebrow !== false && (
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {p.eyebrow ?? "Modern Content Platform"}
          </div>
        )}
        <h1 className="whitespace-pre-line text-5xl font-bold tracking-tight md:text-7xl">
          <span className="text-gradient">{p.title ?? "Welcome"}</span>
        </h1>
        {p.subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">{p.subtitle}</p>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {p.cta_primary?.label && (
            <a href={p.cta_primary.href} className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-all hover:shadow-glow hover:-translate-y-0.5">
              {p.cta_primary.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          )}
          {p.cta_secondary?.label && (
            <a href={p.cta_secondary.href} className="inline-flex items-center rounded-full border border-border bg-card/80 px-7 py-3.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-accent">
              {p.cta_secondary.label}
            </a>
          )}
        </div>
        {p.image && (
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-primary opacity-20 blur-3xl" aria-hidden />
            <img src={p.image} alt="" className="relative w-full rounded-2xl border border-border shadow-elegant" />
          </div>
        )}
      </div>
    </section>
  );
}

function Features(p: any) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{p.title}</h2>
        {p.subtitle && <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{p.subtitle}</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {(p.items ?? []).map((it: any, i: number) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity group-hover:opacity-20" aria-hidden />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{it.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{it.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA(p: any) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-primary p-14 text-center text-primary-foreground shadow-elegant">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 40%)" }} aria-hidden />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{p.title}</h2>
          {p.subtitle && <p className="mx-auto mt-4 max-w-xl text-base opacity-90 md:text-lg">{p.subtitle}</p>}
          {p.cta?.label && (
            <a href={p.cta.href} className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-7 py-3.5 text-sm font-semibold text-foreground shadow-soft transition-transform hover:-translate-y-0.5">
              {p.cta.label}
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function BlogList(p: any) {
  const items = (p.posts ?? []).slice(0, p.limit ?? 3);
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14 flex flex-col items-center text-center">
        <div className="mb-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">Latest</div>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{p.title ?? "From the blog"}</h2>
        {p.subtitle && <p className="mt-4 max-w-xl text-lg text-muted-foreground">{p.subtitle}</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.length === 0 && <p className="text-center text-muted-foreground md:col-span-3">No posts yet.</p>}
        {items.map((post: any) => (
          <Link key={post.id} to="/blog/$slug" params={{ slug: post.slug }} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
            {post.cover_image && (
              <div className="overflow-hidden">
                <img src={post.cover_image} alt="" className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">{post.title}</h3>
              {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RichText(p: any) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: p.html ?? "" }} />
    </section>
  );
}
