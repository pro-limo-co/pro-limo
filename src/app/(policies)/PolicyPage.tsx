import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { PageHeader } from "@/components/PageHeader";
import { getPolicy, policies, policyUpdatedAt, type PolicySlug } from "@/data/policies";
import { siteConfig } from "@/lib/seo";

export function policyMetadata(slug: PolicySlug): Metadata {
  const policy = getPolicy(slug);

  return {
    title: `${policy.title} - Professional Limousine Driver`,
    description: policy.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${policy.title} - Professional Limousine Driver`,
      description: policy.description,
      url: `${siteConfig.url}/${slug}`,
    },
  };
}

export function PolicyPage({ slug }: { slug: PolicySlug }) {
  const policy = policies[slug];

  return (
    <>
      <Nav />
      <main>
        <PageHeader
          eyebrow="Policies"
          title={policy.title}
          subtitle={policy.description}
        />

        <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-10">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-[color:var(--color-pewter)]">
            Last updated {policyUpdatedAt}
          </p>

          <div className="mt-10 divide-y divide-[color:var(--color-divider-soft)] border-y border-[color:var(--color-divider-soft)]">
            {policy.sections.map((section) => (
              <section key={section.heading} className="py-8">
                <h2 className="font-display text-[2rem] leading-tight text-[color:var(--color-bone)]">
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-4 text-[1rem] leading-[1.75] text-[color:var(--color-bone-dim)]">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
