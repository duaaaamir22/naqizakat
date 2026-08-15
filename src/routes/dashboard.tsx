import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  ClipboardList,
  Trash2,
  ArrowRight,
  PieChart,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../lib/zakat";
import {
  clearHistory,
  deleteRecord,
  loadHistory,
  summarise,
  type ZakatRecord,
} from "../lib/zakat-history";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Zakat Dashboard — Naqi" },
      {
        name: "description",
        content:
          "See your net zakatable wealth and total zakat due over time, with year-by-year trends from your saved Hanafi assessments.",
      },
      { property: "og:title", content: "Zakat Dashboard — Naqi" },
      {
        property: "og:description",
        content:
          "Track net zakatable wealth and zakat due over time from your saved assessments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "2-digit", month: "short" });
}

function compact(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function DashboardPage() {
  const [records, setRecords] = useState<ZakatRecord[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => setRecords(loadHistory()), []);

  useEffect(() => {
    refresh();
    setReady(true);
    const onChange = () => refresh();
    window.addEventListener("naqi:history-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("naqi:history-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  const summary = summarise(records);
  const chartData = records.map((r) => ({
    label: shortDate(r.date),
    zakatable: Math.round(r.totalZakatable),
    zakatDue: Math.round(r.zakatDue * 100) / 100,
    nisab: Math.round(r.nisabThreshold),
  }));

  const liableCount = records.filter((r) => r.isLiable).length;

  return (
    <div className="container mx-auto px-4 py-8 pb-24 lg:px-8 md:pb-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Zakat dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Your net zakatable wealth and total zakat due, tracked across every saved
              assessment.
            </p>
          </div>
          <Link
            to="/zakat-form"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ClipboardList className="h-4 w-4" />
            New assessment
          </Link>
        </div>

        {ready && records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <PieChart className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-3 font-display text-lg font-semibold text-foreground">
              No assessments saved yet
            </h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Fill in your assets on the zakat inputs form and press{" "}
              <span className="font-medium text-foreground">Save to dashboard</span>. Each
              saved year builds up your net zakatable and zakat due history here.
            </p>
            <Link
              to="/zakat-form"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Enter my assets
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Wallet}
                label="Latest net zakatable"
                value={formatCurrency(summary.latestZakatable)}
                foot={
                  summary.zakatableChangePct === null
                    ? summary.latestDate
                      ? `As of ${formatDate(summary.latestDate)}`
                      : undefined
                    : `${summary.zakatableChangePct >= 0 ? "+" : ""}${summary.zakatableChangePct.toFixed(1)}% vs previous`
                }
                trend={summary.zakatableChangePct}
              />
              <StatCard
                icon={Coins}
                label="Latest zakat due"
                value={formatCurrency(summary.latestZakatDue)}
                foot="At 2.5% on net zakatable"
                accent
              />
              <StatCard
                icon={TrendingUp}
                label="Total zakat due to date"
                value={formatCurrency(summary.totalZakatDue)}
                foot={`Across ${summary.count} assessment${summary.count === 1 ? "" : "s"}`}
              />
              <StatCard
                icon={PieChart}
                label="Average net zakatable"
                value={formatCurrency(summary.averageZakatable)}
                foot={`${liableCount} of ${summary.count} above nisab`}
              />
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Net zakatable wealth over time
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Compared with the Hanafi silver nisab at each assessment.
              </p>
              <div className="mt-5 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="zakatableFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="label"
                      stroke="var(--color-muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(v: number) => compact(v)}
                      width={48}
                    />
                    <Tooltip
                      formatter={(value: number, name) => [
                        formatCurrency(value),
                        name === "zakatable" ? "Net zakatable" : "Silver nisab",
                      ]}
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="zakatable"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      fill="url(#zakatableFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="nisab"
                      stroke="var(--color-gold)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Zakat due per assessment
              </h2>
              <div className="mt-5 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="label"
                      stroke="var(--color-muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(v: number) => compact(v)}
                      width={48}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Zakat due"]}
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="zakatDue" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Assessment history
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    clearHistory();
                    refresh();
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear all
                </button>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium text-right">Gross assets</th>
                      <th className="py-2 pr-4 font-medium text-right">Net zakatable</th>
                      <th className="py-2 pr-4 font-medium text-right">Nisab</th>
                      <th className="py-2 pr-4 font-medium text-right">Zakat due</th>
                      <th className="py-2 font-medium text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...records].reverse().map((row) => (
                      <tr key={row.id} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 text-foreground">{formatDate(row.date)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums text-foreground">
                          {formatCurrency(row.totalGross)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-foreground">
                          {formatCurrency(row.totalZakatable)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                          {formatCurrency(row.nisabThreshold)}
                        </td>
                        <td className="py-3 pr-4 text-right font-medium tabular-nums text-gold">
                          {formatCurrency(row.zakatDue)}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            aria-label={`Remove assessment from ${formatDate(row.date)}`}
                            onClick={() => {
                              deleteRecord(row.id);
                              refresh();
                            }}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Saved on this device only. Assessments follow the Hanafi silver nisab at 2.5%.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  foot,
  trend,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  foot?: string | undefined;
  trend?: number | null;
  accent?: boolean;
}) {
  const TrendIcon = trend !== null && trend !== undefined && trend < 0 ? TrendingDown : TrendingUp;
  return (
    <div
      className={`rounded-xl border p-5 ${
        accent ? "border-gold/30 bg-gold/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold tabular-nums text-foreground">
        {value}
      </div>
      {foot && (
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
          {trend !== null && trend !== undefined && <TrendIcon className="h-3 w-3" />}
          {foot}
        </div>
      )}
    </div>
  );
}
