import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, ShieldCheck, Leaf, TrendingUp, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Naqi — Transparent Islamic Charitable Finance" },
      {
        name: "description",
        content:
          "A blockchain-enabled zakat platform for automated multi-asset calculation, Shariah compliance, and transparent impact tracking.",
      },
      { property: "og:title", content: "Naqi — Transparent Islamic Charitable Finance" },
      {
        property: "og:description",
        content:
          "A blockchain-enabled zakat platform for automated multi-asset calculation, Shariah compliance, and transparent impact tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: Calculator,
    title: "Smart Zakat Calculator",
    description:
      "Calculate zakat across cash, gold, silver, stocks, crypto, and business assets with real-time prices and Hanafi guidance.",
  },
  {
    icon: ShieldCheck,
    title: "Blockchain Transparency",
    description:
      "Every donation is recorded as a verifiable transaction, letting donors trace funds from wallet to beneficiary.",
  },
  {
    icon: Leaf,
    title: "Impact Tracking",
    description:
      "See how your zakat creates real-world outcomes through verified beneficiary updates and measurable impact metrics.",
  },
  {
    icon: TrendingUp,
    title: "Portfolio Intelligence",
    description:
      "Track asset values, nisab thresholds, and historical zakat obligations across volatile digital and traditional assets.",
  },
];

function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border py-20 md:py-28">
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <div className="container relative mx-auto px-4 text-center lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold-foreground">
              <span className="h-2 w-2 rounded-full bg-gold" />
              MSc FinTech Research Prototype
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
              Give zakat with <span className="text-gold">clarity</span>, trust, and traceable
              impact.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Naqi combines AI-powered multi-asset calculation with blockchain transparency
              to restore confidence in Islamic charitable giving.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Try the Calculator
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
              >
                Explore Blockchain
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Built for modern Islamic finance
            </h2>
            <p className="mt-4 text-muted-foreground">
              A design-science prototype addressing transparency, trust, and compliance in zakat
              distribution.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-gold/40 hover:bg-accent/20"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Research CTA */}
      <section className="border-t border-border bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center lg:px-8">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Research question, reimagined as a product.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            How can blockchain technology be integrated with AI-powered zakat calculation to enhance
            transparency, trust, and impact tracking in Islamic charitable giving within the UAE
            context?
          </p>
          <Link
            to="/calculator"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-base font-medium text-gold-foreground transition-colors hover:bg-gold/90"
          >
            Start the Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
