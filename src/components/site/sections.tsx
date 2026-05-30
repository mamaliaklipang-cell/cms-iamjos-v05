import { Link } from "@tanstack/react-router";

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
    <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
      <h1 className="whitespace-pre-line text-5xl font-bold tracking-tight md:text-7xl">{p.title ?? "Welcome"}</h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{p.subtitle}</p>
      <div className="mt-8 flex justify-center gap-3">
        {p.cta_primary?.label && (
          <a href={p.cta_primary.href} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            {p.cta_primary.label}
          </a>
        )}
        {p.cta_secondary?.label && (
          <a href={p.cta_secondary.href} className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-accent">
            {p.cta_secondary.label}
          </a>
        )}
      </div>
      {p.image && <img src={p.image} alt="" className="mx-auto mt-12 max-h-[420px] rounded-2xl border border-border" />}
    </section>
  );
}

function Features(p: any) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{p.title}</h2>
        {p.subtitle && <p className="mt-3 text-muted-foreground">{p.subtitle}</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {(p.items ?? []).map((it: any, i: number) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">{it.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA(p: any) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/80 p-12 text-center text-primary-foreground">
        <h2 className="text-3xl font-bold">{p.title}</h2>
        <p className="mt-3 opacity-90">{p.subtitle}</p>
        {p.cta?.label && (
          <a href={p.cta.href} className="mt-6 inline-block rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground hover:opacity-90">
            {p.cta.label}
          </a>
        )}
      </div>
    </section>
  );
}

function BlogList(p: any) {
  const items = (p.posts ?? []).slice(0, p.limit ?? 3);
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{p.title ?? "Latest"}</h2>
        {p.subtitle && <p className="mt-3 text-muted-foreground">{p.subtitle}</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.length === 0 && <p className="text-center text-muted-foreground md:col-span-3">No posts yet.</p>}
        {items.map((post: any) => (
          <Link key={post.id} to="/blog/$slug" params={{ slug: post.slug }} className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-accent">
            {post.cover_image && <img src={post.cover_image} alt="" className="mb-4 aspect-video w-full rounded-lg object-cover" />}
            <h3 className="text-lg font-semibold group-hover:text-primary">{post.title}</h3>
            {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}

function RichText(p: any) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: p.html ?? "" }} />
    </section>
  );
}
