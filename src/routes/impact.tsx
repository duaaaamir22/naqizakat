import { createFileRoute } from "@tanstack/react-router";
import { Heart, Users, GraduationCap, Stethoscope, Utensils, Sprout } from "lucide-react";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact Tracking — ZakatChain" },
      {
        name: "description",
        content: "See how your zakat donations create real-world outcomes for beneficiaries.",
      },
      { property: "og:title", content: "Impact Tracking — ZakatChain" },
      {
        property: "og:description",
        content: "See how your zakat donations create real-world outcomes for beneficiaries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImpactPage,
});

const impacts = [
  {
    id: "1",
    charity: "Emirates Red Crescent",
    amount: 1250,
    date: "2026-02-10",
    category: "Food security",
    icon: Utensils,
    metric: "50 families",
    description: "Emergency food baskets distributed to low-income families in Ajman.",
    proof: "Distribution photos verified by 3 field coordinators.",
  },
  {
    id: "2",
    charity: "Dubai Cares",
    amount: 340,
    date: "2026-01-15",
    category: "Education",
    icon: GraduationCap,
    metric: "20 children",
    description: "School supplies and uniforms for orphaned students.",
    proof: "Receipts and attendance records uploaded.",
  },
  {
    id: "3",
    charity: "Beit Al Khair Society",
    amount: 780,
    date: "2025-12-22",
    category: "Healthcare",
    icon: Stethoscope,
    metric: "3 families",
    description: "Medical treatment coverage for refugee families.",
    proof: "Hospital invoices and discharge summaries.",
  },
  {
    id: "4",
    charity: "Emirates Red Crescent",
    amount: 500,
    date: "2025-11-05",
    category: "Sustainable livelihoods",
    icon: Sprout,
    metric: "5 women",
    description: "Seed capital for home-based food businesses.",
    proof: "Business registration and follow-up interviews.",
  },
];

const summary = {
  totalDonated: 2870,
  beneficiaries: 78,
  families: 56,
  children: 22,
  verificationRate: 100,
};

function ImpactPage() {
  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-medium text-gold-foreground">
            <Heart className="h-4 w-4 fill-gold" />
            Impact-verified giving
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Your zakat impact
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track how every donation translates into measurable outcomes on the ground.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ImpactStat label="Total donated" value={`$${summary.totalDonated.toLocaleString()}`} />
          <ImpactStat label="Beneficiaries" value={summary.beneficiaries.toString()} />
          <ImpactStat label="Families" value={summary.families.toString()} />
          <ImpactStat label="Children" value={summary.children.toString()} />
          <ImpactStat label="Verified" value={`${summary.verificationRate}%`} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {impacts.map((impact) => {
            const Icon = impact.icon;
            return (
              <div
                key={impact.id}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-gold/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{impact.date}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {impact.category}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{impact.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="rounded-full bg-emerald/10 px-2 py-0.5 font-medium text-emerald">
                    {impact.metric}
                  </span>
                  <span className="text-muted-foreground">helped</span>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{impact.charity}</span>
                    <span className="font-medium text-gold">${impact.amount.toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{impact.proof}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Beneficiary voices
            </h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <blockquote className="rounded-lg bg-background p-4 text-sm text-foreground">
              “The food basket arrived exactly when we needed it. Knowing donors can see the
              delivery made us feel respected, not just helped.”
              <footer className="mt-2 text-xs text-muted-foreground">— Fatima, Ajman</footer>
            </blockquote>
            <blockquote className="rounded-lg bg-background p-4 text-sm text-foreground">
              “My daughter has new school books for the first time in two years. The transparent
              tracking gave me confidence in the system.”
              <footer className="mt-2 text-xs text-muted-foreground">— Aisha, Dubai</footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <div className="font-display text-2xl font-bold text-gold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
