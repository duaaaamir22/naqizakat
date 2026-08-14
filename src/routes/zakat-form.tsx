import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Coins,
  Banknote,
  Package,
  HandCoins,
  Info,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  AssetInput,
  computeZakat,
  fetchMarketPrices,
  formatCurrency,
  PriceMap,
} from "../lib/zakat";

export const Route = createFileRoute("/zakat-form")({
  head: () => ({
    meta: [
      { title: "Zakat Inputs Form — Naqi" },
      {
        name: "description",
        content:
          "Enter your cash, gold, business inventory, receivables and debts to get a Hanafi-calculated zakat amount using the silver nisab threshold.",
      },
      { property: "og:title", content: "Zakat Inputs Form — Naqi" },
      {
        property: "og:description",
        content:
          "A simple guided form for cash, gold, inventory and receivables with an instant Hanafi zakat result.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ZakatFormPage,
});

const FALLBACK_PRICES: PriceMap = {
  goldUsdPerGram: 75,
  silverUsdPerGram: 0.9,
  btcUsd: 65000,
  ethUsd: 3400,
  usdtUsd: 1,
};

interface FormState {
  cash: string;
  goldGrams: string;
  inventory: string;
  receivables: string;
  debts: string;
}

const EMPTY_FORM: FormState = {
  cash: "",
  goldGrams: "",
  inventory: "",
  receivables: "",
  debts: "",
};

/** Parses a form field into a safe, non-negative, finite number. */
function parseAmount(raw: string): number {
  const value = Number.parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, 1_000_000_000_000);
}

function ZakatFormPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const getPrices = useServerFn(fetchMarketPrices);

  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ["market-prices"],
    queryFn: () => getPrices(),
    staleTime: 60_000,
  });

  const priceMap: PriceMap = prices ?? FALLBACK_PRICES;

  const cash = parseAmount(form.cash);
  const goldGrams = parseAmount(form.goldGrams);
  const inventory = parseAmount(form.inventory);
  const receivables = parseAmount(form.receivables);
  const debts = parseAmount(form.debts);

  const assets: AssetInput[] = [
    {
      id: "cash",
      type: "cash",
      label: "Cash, bank & savings",
      value: cash,
      heldForOneYear: true,
    },
    {
      id: "gold",
      type: "gold",
      label: `Gold (${goldGrams || 0} g)`,
      value: goldGrams * priceMap.goldUsdPerGram,
      quantity: goldGrams,
      unitPrice: priceMap.goldUsdPerGram,
      heldForOneYear: true,
    },
    {
      id: "inventory",
      type: "business",
      label: "Business inventory (resale value)",
      value: inventory,
      heldForOneYear: true,
    },
    {
      id: "receivables",
      type: "receivables",
      label: "Receivables owed to you",
      value: receivables,
      heldForOneYear: true,
    },
  ];

  const result = computeZakat(assets, debts, priceMap);
  const hasInput = cash + goldGrams + inventory + receivables > 0;
  const shortfall = Math.max(0, result.nisabThreshold - result.totalZakatable);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="container mx-auto px-4 py-8 pb-24 lg:px-8 md:pb-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-medium text-gold-foreground">
            <ClipboardList className="h-4 w-4" />
            Hanafi zakat inputs
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Zakat Inputs Form
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Enter what you owned at the end of your zakat year. Naqi applies the Hanafi
            silver nisab and the 2.5% rate instantly.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Inputs */}
          <section className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-base font-semibold text-foreground">
                Zakatable assets
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                All amounts in USD unless the field states otherwise.
              </p>

              <div className="mt-5 space-y-5">
                <Field
                  icon={Banknote}
                  label="Cash, bank & savings"
                  hint="Wallet cash, current and savings accounts, digital wallets."
                  suffix="USD"
                  value={form.cash}
                  onChange={set("cash")}
                />
                <Field
                  icon={Coins}
                  label="Gold"
                  hint={`Weight in grams. Valued at ${formatCurrency(priceMap.goldUsdPerGram)}/g${pricesLoading ? " (updating…)" : ""}.`}
                  suffix="grams"
                  value={form.goldGrams}
                  onChange={set("goldGrams")}
                  helperValue={
                    goldGrams > 0
                      ? `≈ ${formatCurrency(goldGrams * priceMap.goldUsdPerGram)}`
                      : undefined
                  }
                />
                <Field
                  icon={Package}
                  label="Business inventory"
                  hint="Trade goods and stock held for sale, at current resale value."
                  suffix="USD"
                  value={form.inventory}
                  onChange={set("inventory")}
                />
                <Field
                  icon={HandCoins}
                  label="Receivables"
                  hint="Money owed to you that you strongly expect to recover."
                  suffix="USD"
                  value={form.receivables}
                  onChange={set("receivables")}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-base font-semibold text-foreground">
                Deductions
              </h2>
              <div className="mt-5">
                <Field
                  icon={AlertCircle}
                  label="Immediate debts & liabilities"
                  hint="Bills, short-term loans and payables due now."
                  suffix="USD"
                  value={form.debts}
                  onChange={set("debts")}
                />
              </div>
              <button
                type="button"
                onClick={() => setForm(EMPTY_FORM)}
                className="mt-5 inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <RotateCcw className="h-4 w-4" />
                Reset form
              </button>
            </div>

            <div className="flex gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-foreground" />
              <p>
                <span className="font-medium text-foreground">Hanafi note:</span> Naqi follows
                the Hanafi school within Sunni Islam, which uses the silver nisab
                (612.36 g of silver) so that more givers reach the threshold and more
                recipients benefit.
              </p>
            </div>
          </section>

          {/* Result */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-primary p-5 text-primary-foreground">
              <p className="text-xs uppercase tracking-wide opacity-80">Zakat due (2.5%)</p>
              <p className="mt-2 font-display text-3xl font-bold">
                {formatCurrency(result.zakatDue)}
              </p>
              <dl className="mt-5 space-y-2 text-sm">
                <Row label="Gross assets" value={formatCurrency(result.totalGross)} />
                <Row label="Less debts" value={`− ${formatCurrency(result.deductions)}`} />
                <Row label="Net zakatable" value={formatCurrency(result.totalZakatable)} />
                <Row
                  label="Silver nisab"
                  value={formatCurrency(result.nisabThreshold)}
                />
              </dl>
            </div>

            {hasInput && (
              <div
                className={`flex gap-3 rounded-xl border p-4 text-sm ${
                  result.isLiable
                    ? "border-primary/30 bg-primary/5 text-foreground"
                    : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                {result.isLiable ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <p>
                  {result.isLiable
                    ? "Your net zakatable wealth is at or above the silver nisab, so zakat is due at 2.5%."
                    : `Your wealth is ${formatCurrency(shortfall)} below the silver nisab, so no zakat is due this year.`}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display text-sm font-semibold text-foreground">
                Asset breakdown
              </h3>
              <ul className="mt-3 space-y-3">
                {result.breakdown.map((item) => (
                  <li key={item.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <span className="text-sm font-medium tabular-nums text-foreground">
                        {formatCurrency(item.zakatableValue)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.reasoning}</p>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/calculator"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Need crypto, stocks or silver?
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="opacity-80">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

interface FieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
  helperValue?: string;
}

function Field({
  icon: Icon,
  label,
  hint,
  suffix,
  value,
  onChange,
  helperValue,
}: FieldProps) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");

  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium text-foreground"
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </label>
      <div className="mt-2 flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 20))}
          className="w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none tabular-nums"
        />
        <span className="px-3 text-xs text-muted-foreground">{suffix}</span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {hint}
        {helperValue ? <span className="ml-1 text-foreground">{helperValue}</span> : null}
      </p>
    </div>
  );
}
