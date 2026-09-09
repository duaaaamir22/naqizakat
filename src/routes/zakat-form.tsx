import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Coins,
  Banknote,
  Landmark,
  Smartphone,
  Bitcoin,
  LineChart,
  PieChart,
  ScrollText,
  Receipt,
  Wallet,
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
import { saveRecord } from "../lib/zakat-history";

export const Route = createFileRoute("/zakat-form")({
  head: () => ({
    meta: [
      { title: "Zakat Inputs Form — Naqi" },
      {
        name: "description",
        content:
          "Enter your precious metals, cash and savings, investments, business assets and debts to get a Hanafi-calculated zakat amount using the silver nisab threshold.",
      },
      { property: "og:title", content: "Zakat Inputs Form — Naqi" },
      {
        property: "og:description",
        content:
          "A guided Hanafi form covering gold, silver, cash, bank accounts, digital wallets, crypto, stocks, funds, sukuk and bonds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ZakatFormPage,
});

const FALLBACK_PRICES: PriceMap = {
  goldUsdPerGram: 275.44,
  silverUsdPerGram: 3.31,
  btcUsd: 238712.5,
  ethUsd: 12486.5,
  usdtUsd: 3.67,
};

type ShareIntent = "trading" | "longTerm";

interface FormState {
  goldGrams: string;
  silverGrams: string;
  cash: string;
  bankAccounts: string;
  digitalWallets: string;
  crypto: string;
  stocks: string;
  funds: string;
  sukuk: string;
  bonds: string;
  otherInvestments: string;
  inventory: string;
  receivables: string;
  debts: string;
}

const EMPTY_FORM: FormState = {
  goldGrams: "",
  silverGrams: "",
  cash: "",
  bankAccounts: "",
  digitalWallets: "",
  crypto: "",
  stocks: "",
  funds: "",
  sukuk: "",
  bonds: "",
  otherInvestments: "",
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
  const [shareIntent, setShareIntent] = useState<ShareIntent>("trading");
  const [saved, setSaved] = useState(false);
  const getPrices = useServerFn(fetchMarketPrices);

  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ["market-prices"],
    queryFn: () => getPrices(),
    staleTime: 60_000,
  });

  const priceMap: PriceMap = prices ?? FALLBACK_PRICES;

  const n = (key: keyof FormState) => parseAmount(form[key]);

  const goldGrams = n("goldGrams");
  const silverGrams = n("silverGrams");
  const stocks = n("stocks");

  const assets: AssetInput[] = [
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
      id: "silver",
      type: "silver",
      label: `Silver (${silverGrams || 0} g)`,
      value: silverGrams * priceMap.silverUsdPerGram,
      quantity: silverGrams,
      unitPrice: priceMap.silverUsdPerGram,
      heldForOneYear: true,
    },
    { id: "cash", type: "cash", label: "Cash in hand", value: n("cash") },
    { id: "bank", type: "cash", label: "Bank accounts", value: n("bankAccounts") },
    { id: "wallets", type: "cash", label: "Digital wallets", value: n("digitalWallets") },
    { id: "crypto", type: "crypto", label: "Cryptocurrency", value: n("crypto") },
    {
      id: "stocks",
      type: "stocks",
      label: "Stocks / shares",
      value: stocks,
      zakatableRatio: shareIntent === "trading" ? 1 : 0.25,
      reasoningOverride:
        shareIntent === "trading"
          ? "Shares held for short-term trading or resale are treated as trade goods, so the full market value is zakatable."
          : "Shares held long-term for dividends are zakatable on the underlying liquid assets only (25% proxy).",
    },
    {
      id: "funds",
      type: "stocks",
      label: "ETFs / mutual funds",
      value: n("funds"),
      zakatableRatio: 0.25,
      reasoningOverride:
        "Funds are zakatable on the liquid, tradeable portion of their holdings (25% proxy).",
    },
    {
      id: "sukuk",
      type: "stocks",
      label: "Sukuk",
      value: n("sukuk"),
      zakatableRatio: 1,
      reasoningOverride:
        "Sukuk certificates are zakatable at market value, as they represent tradeable ownership shares.",
    },
    {
      id: "bonds",
      type: "stocks",
      label: "Bonds",
      value: n("bonds"),
      zakatableRatio: 1,
      reasoningOverride:
        "Bond principal is zakatable at recoverable value; interest income should be given away separately and is not zakat.",
    },
    {
      id: "otherInvestments",
      type: "stocks",
      label: "Other investments",
      value: n("otherInvestments"),
      zakatableRatio: 1,
      reasoningOverride:
        "Other liquid investments are zakatable at their current realisable value.",
    },
    {
      id: "inventory",
      type: "business",
      label: "Business inventory (resale value)",
      value: n("inventory"),
    },
    {
      id: "receivables",
      type: "receivables",
      label: "Receivables owed to you",
      value: n("receivables"),
    },
  ];

  const debts = n("debts");
  const result = computeZakat(assets, debts, priceMap);
  const hasInput = result.totalGross > 0;
  const shortfall = Math.max(0, result.nisabThreshold - result.totalZakatable);
  const visibleBreakdown = result.breakdown.filter((item) => item.grossValue > 0);

  const handleSave = () => {
    saveRecord({
      date: new Date().toISOString().slice(0, 10),
      totalGross: result.totalGross,
      deductions: result.deductions,
      totalZakatable: result.totalZakatable,
      nisabThreshold: result.nisabThreshold,
      zakatDue: result.zakatDue,
      isLiable: result.isLiable,
      breakdown: visibleBreakdown.map((item) => ({
        label: item.label,
        value: item.zakatableValue,
      })),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

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
            <Group
              title="Precious Metals"
              subtitle="Enter weight in grams — Naqi values it at the live market price."
            >
              <Field
                icon={Coins}
                label="Gold"
                hint={`Valued at ${formatCurrency(priceMap.goldUsdPerGram)}/g${pricesLoading ? " (updating…)" : ""}.`}
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
                icon={Coins}
                label="Silver"
                hint={`Valued at ${formatCurrency(priceMap.silverUsdPerGram)}/g${pricesLoading ? " (updating…)" : ""}.`}
                suffix="grams"
                value={form.silverGrams}
                onChange={set("silverGrams")}
                helperValue={
                  silverGrams > 0
                    ? `≈ ${formatCurrency(silverGrams * priceMap.silverUsdPerGram)}`
                    : undefined
                }
              />
            </Group>

            <Group title="Cash & Savings" subtitle="All amounts in AED.">
              <Field
                icon={Banknote}
                label="Cash"
                hint="Physical cash you hold at home or on you."
                suffix="AED"
                value={form.cash}
                onChange={set("cash")}
              />
              <Field
                icon={Landmark}
                label="Bank accounts"
                hint="Current, savings and fixed-deposit balances."
                suffix="AED"
                value={form.bankAccounts}
                onChange={set("bankAccounts")}
              />
              <Field
                icon={Smartphone}
                label="Digital wallets"
                hint="Mobile money, payment apps and prepaid balances."
                suffix="AED"
                value={form.digitalWallets}
                onChange={set("digitalWallets")}
              />
            </Group>

            <Group
              title="Investments"
              subtitle="Enter current market value in AED for each holding you own."
            >
              <Field
                icon={Bitcoin}
                label="Cryptocurrency"
                hint="Total market value of coins and tokens held."
                suffix="AED"
                value={form.crypto}
                onChange={set("crypto")}
              />
              <div>
                <Field
                  icon={LineChart}
                  label="Stocks"
                  hint="Market value of directly held listed shares."
                  suffix="AED"
                  value={form.stocks}
                  onChange={set("stocks")}
                />
                {stocks > 0 && (
                  <fieldset className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-4">
                    <legend className="px-1 text-sm font-medium text-foreground">
                      How are these shares primarily held?
                    </legend>
                    <div className="mt-2 space-y-2">
                      <RadioOption
                        name="share-intent"
                        checked={shareIntent === "trading"}
                        onChange={() => setShareIntent("trading")}
                        label="Short-term trading / resale"
                        hint="Treated as trade goods — full market value is zakatable."
                      />
                      <RadioOption
                        name="share-intent"
                        checked={shareIntent === "longTerm"}
                        onChange={() => setShareIntent("longTerm")}
                        label="Long-term investment / dividends"
                        hint="Zakat applies to the underlying liquid assets only (25% proxy)."
                      />
                    </div>
                  </fieldset>
                )}
              </div>
              <Field
                icon={PieChart}
                label="ETFs / mutual funds"
                hint="Value of pooled fund units you hold."
                suffix="AED"
                value={form.funds}
                onChange={set("funds")}
              />
              <Field
                icon={ScrollText}
                label="Sukuk"
                hint="Shariah-compliant investment certificates, at market value."
                suffix="AED"
                value={form.sukuk}
                onChange={set("sukuk")}
              />
              <Field
                icon={Receipt}
                label="Bonds"
                hint="Principal value recoverable; interest income is not zakat."
                suffix="AED"
                value={form.bonds}
                onChange={set("bonds")}
              />
              <Field
                icon={Wallet}
                label="Other investments"
                hint="Private equity, pensions accessible to you, or any other liquid holding."
                suffix="AED"
                value={form.otherInvestments}
                onChange={set("otherInvestments")}
              />
            </Group>

            <Group title="Business & Receivables" subtitle="Trade assets and money owed to you.">
              <Field
                icon={Package}
                label="Business inventory"
                hint="Trade goods and stock held for sale, at current resale value."
                suffix="AED"
                value={form.inventory}
                onChange={set("inventory")}
              />
              <Field
                icon={HandCoins}
                label="Receivables"
                hint="Money owed to you that you strongly expect to recover."
                suffix="AED"
                value={form.receivables}
                onChange={set("receivables")}
              />
            </Group>

            <Group title="Deductions">
              <Field
                icon={AlertCircle}
                label="Immediate debts & liabilities"
                hint="Bills, short-term loans and payables due now."
                suffix="AED"
                value={form.debts}
                onChange={set("debts")}
              />
              <button
                type="button"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setShareIntent("trading");
                }}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <RotateCcw className="h-4 w-4" />
                Reset form
              </button>
            </Group>

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
                <Row label="Silver nisab" value={formatCurrency(result.nisabThreshold)} />
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

            {visibleBreakdown.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display text-sm font-semibold text-foreground">
                  Asset breakdown
                </h3>
                <ul className="mt-3 space-y-3">
                  {visibleBreakdown.map((item) => (
                    <li
                      key={item.id}
                      className="border-b border-border pb-3 last:border-0 last:pb-0"
                    >
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
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasInput}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-gold-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved to dashboard
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4" />
                  Save to dashboard
                </>
              )}
            </button>

            {saved && (
              <Link
                to="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                View dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              to="/calculator"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Open the full calculator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Group({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function RadioOption({
  name,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-transparent px-1 py-1 hover:border-border">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-primary"
      />
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
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
  helperValue?: string | undefined;
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
