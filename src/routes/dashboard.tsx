import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "../lib/zakat";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Naqi" },
      {
        name: "description",
        content: "Track your zakat portfolio, historical calculations, and donation activity.",
      },
      { property: "og:title", content: "Dashboard — Naqi" },
      {
        property: "og:description",
        content: "Track your zakat portfolio, historical calculations, and donation activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const stats = [
  { label: "Total wealth tracked", value: 124500, change: 8.2, icon: Wallet },
  { label: "Zakat paid this year", value: 3112.5, change: 12.5, icon: TrendingUp },
  { label: "Next due date", value: "Ramadan 1447", change: null, icon: Calendar },
];

const history = [
  { date: "2026-03-15", zakatDue: 2840, assets: 113600 },
  { date: "2025-04-02", zakatDue: 2650, assets: 106000 },
  { date: "2024-03-22", zakatDue: 2100, assets: 84000 },
];

function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Overview of your zakat portfolio, obligations, and giving history.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{stat.label}</span>
                </div>
                <div className="mt-3 font-display text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                {stat.change !== null && (
                  <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.change}% from last year
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Asset allocation</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Cash", value: 42000, color: "bg-emerald" },
              { label: "Gold", value: 35000, color: "bg-gold" },
              { label: "Stocks", value: 28000, color: "bg-primary" },
              { label: "Crypto", value: 19500, color: "bg-muted-foreground" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-background p-4">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <div className="mt-1 font-medium text-foreground">{formatCurrency(item.value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Zakat history</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium text-right">Total assets</th>
                  <th className="py-2 font-medium text-right">Zakat due</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.date} className="border-b border-border last:border-0">
                    <td className="py-3 text-foreground">{row.date}</td>
                    <td className="py-3 text-right text-foreground">
                      {formatCurrency(row.assets)}
                    </td>
                    <td className="py-3 text-right font-medium text-gold">
                      {formatCurrency(row.zakatDue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
