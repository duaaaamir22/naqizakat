import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Calculator,
  Plus,
  Trash2,
  Info,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  AssetInput,
  AssetType,
  assetTypeLabel,
  computeZakat,
  fetchMarketPrices,
  formatCurrency,
  PriceMap,
} from "../lib/zakat";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Smart Zakat Calculator — ZakatChain" },
      {
        name: "description",
        content:
          "Calculate your zakat obligation across cash, gold, crypto, stocks, and business assets with real-time market prices and Hanafi guidance.",
      },
      { property: "og:title", content: "Smart Zakat Calculator — ZakatChain" },
      {
        property: "og:description",
        content:
          "Multi-asset zakat calculation with real-time prices and Hanafi guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalculatorPage,
});

const DEFAULT_ASSETS: AssetInput[] = [
  { id: "cash", type: "cash", label: "Cash & bank balances", value: 0, heldForOneYear: true },
  { id: "gold", type: "gold", label: "Gold (grams)", value: 0, quantity: 0, heldForOneYear: true },
  { id: "crypto", type: "crypto", label: "Bitcoin / ETH", value: 0, heldForOneYear: true },
];

function CalculatorPage() {
  const [assets, setAssets] = useState<AssetInput[]>(DEFAULT_ASSETS);
  const [debts, setDebts] = useState(0);
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const getPrices = useServerFn(fetchMarketPrices);

  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ["market-prices"],
    queryFn: () => getPrices(),
    staleTime: 60_000,
  });

  const priceMap: PriceMap = prices ?? {
    goldUsdPerGram: 75,
    silverUsdPerGram: 0.9,
    btcUsd: 65000,
    ethUsd: 3400,
    usdtUsd: 1,
  };

  const result = computeZakat(assets, debts, priceMap);

  const addAsset = (type: AssetType) => {
    const newAsset: AssetInput = {
      id: crypto.randomUUID(),
      type,
      label: assetTypeLabel(type),
      value: 0,
      heldForOneYear: true,
    };
    setAssets((prev) => [...prev, newAsset]);
  };

  const updateAsset = (id: string, patch: Partial<AssetInput>) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-medium text-gold-foreground">
            <Sparkles className="h-4 w-4" />
            AI-assisted multi-asset calculation
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Smart Zakat Calculator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your assets and get a real-time zakat estimate based on Hanafi guidance.
          </p>
        </div>

        {/* Market prices ticker */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-foreground">Live market prices</h2>
            {pricesLoading && (
              <span className="text-xs text-muted-foreground">Updating prices…</span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
            <PriceBadge label="Gold/g" value={priceMap.goldUsdPerGram} />
            <PriceBadge label="Silver/g" value={priceMap.silverUsdPerGram} />
            <PriceBadge label="BTC" value={priceMap.btcUsd} />
            <PriceBadge label="ETH" value={priceMap.ethUsd} />
            <PriceBadge label="USDT" value={priceMap.usdtUsd} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: inputs */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-foreground">Your assets</h2>
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-foreground">
                  <Info className="h-3.5 w-3.5" />
                  Hanafi guidance
                </div>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                This calculator follows the Hanafi school of thought within Sunni Islam, using the
                silver nisab threshold to determine zakat liability.
              </p>

              <div className="space-y-4">
                {assets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    prices={priceMap}
                    onUpdate={(patch) => updateAsset(asset.id, patch)}
                    onRemove={() => removeAsset(asset.id)}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {(
                  [
                    "cash",
                    "gold",
                    "silver",
                    "stocks",
                    "crypto",
                    "business",
                    "receivables",
                  ] as AssetType[]
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addAsset(type)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:border-gold/50 hover:bg-accent/20"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {assetTypeLabel(type)}
                  </button>
                ))}
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-foreground">
                    Deductible debts & liabilities
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={debts || ""}
                    onChange={(e) => setDebts(Number(e.target.value))}
                    className="w-40 rounded-md border border-border bg-background px-3 py-2 text-right text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="0"
                  />
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Short-term debts payable within the next lunar year are deducted from zakatable
                  wealth.
                </p>
              </div>
            </div>

            {/* Quick estimate tabs */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-gold" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Calculation notes
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-gold">•</span>
                  Nisab threshold is based on {result.nisabUsed} value ({" "}
                  {result.nisabUsed === "gold" ? "87.48g gold" : "612.36g silver"}).
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">•</span>
                  Zakat rate is 2.5% of zakatable wealth held for one lunar year.
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">•</span>
                  Crypto is treated as investment property at current market value; non-compliant
                  income may be excluded.
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">•</span>
                  Stock zakat uses a 25% liquid-value proxy; consult a scholar for your specific
                  holdings.
                </li>
              </ul>
            </div>
          </div>

          {/* Right column: results */}
          <div className="space-y-6">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-foreground">Zakat summary</h2>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total gross assets</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(result.totalGross)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Less debts</span>
                  <span className="font-medium text-foreground">
                    -{formatCurrency(result.deductions)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Zakatable base</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(result.totalZakatable)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nisab threshold</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(result.nisabThreshold)}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Zakat due</span>
                  {result.isLiable ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-medium text-emerald">
                      <CheckCircle2 className="h-3 w-3" />
                      Nisab met
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      Below nisab
                    </span>
                  )}
                </div>
                <div className="font-display text-4xl font-bold text-gold">
                  {formatCurrency(result.zakatDue)}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {result.isLiable
                    ? "You have reached the nisab threshold and zakat is due."
                    : "Your zakatable wealth is below the nisab threshold; no zakat is due this year."}
                </p>
              </div>

              <button
                type="button"
                disabled={!result.isLiable || result.zakatDue <= 0}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                Distribute this zakat
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Asset breakdown</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="w-1/4 py-2 font-medium">Asset</th>
                  <th className="w-1/6 py-2 pr-4 text-right font-medium">Gross value</th>
                  <th className="w-1/6 py-2 pr-4 text-right font-medium">Zakatable</th>
                  <th className="py-2 font-medium">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">
                      {item.label}
                      <span className="ml-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {assetTypeLabel(item.type)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-foreground">
                      {formatCurrency(item.grossValue)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums font-medium text-gold">
                      {formatCurrency(item.zakatableValue)}
                    </td>
                    <td className="py-3 text-muted-foreground">{item.reasoning}</td>
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

function PriceBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-background p-2 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground">
        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)}
      </div>
    </div>
  );
}

function AssetRow({
  asset,
  prices,
  onUpdate,
  onRemove,
}: {
  asset: AssetInput;
  prices: PriceMap;
  onUpdate: (patch: Partial<AssetInput>) => void;
  onRemove: () => void;
}) {
  const isMetal = asset.type === "gold" || asset.type === "silver";

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={asset.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="w-full rounded-md border-0 bg-transparent px-0 py-0 text-sm font-medium text-foreground focus:outline-none"
            />
            {asset.type === "crypto" && (
              <span className="text-xs text-muted-foreground">BTC≈{formatCurrency(prices.btcUsd)}</span>
            )}
            {asset.type === "gold" && (
              <span className="text-xs text-muted-foreground">/g≈{formatCurrency(prices.goldUsdPerGram)}</span>
            )}
            {asset.type === "silver" && (
              <span className="text-xs text-muted-foreground">/g≈{formatCurrency(prices.silverUsdPerGram)}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isMetal ? (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <input
                    type="number"
                    min={0}
                    value={asset.quantity || ""}
                    onChange={(e) => {
                      const quantity = Number(e.target.value);
                      const unitPrice = asset.type === "gold" ? prices.goldUsdPerGram : prices.silverUsdPerGram;
                      onUpdate({ quantity, unitPrice, value: quantity * unitPrice });
                    }}
                    className="w-28 rounded-md border border-border bg-background px-2 py-1 text-right text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="0"
                  />
                  <span className="text-muted-foreground">g</span>
                </label>
                <span className="text-sm text-foreground">
                  = {formatCurrency(asset.value || 0)}
                </span>
              </>
            ) : (
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Value</span>
                <input
                  type="number"
                  min={0}
                  value={asset.value || ""}
                  onChange={(e) => onUpdate({ value: Number(e.target.value) })}
                  className="w-40 rounded-md border border-border bg-background px-2 py-1 text-right text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="0"
                />
                <span className="text-muted-foreground">USD</span>
              </label>
            )}

            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={asset.heldForOneYear ?? true}
                onChange={(e) => onUpdate({ heldForOneYear: e.target.checked })}
                className="h-4 w-4 rounded border-border bg-background text-gold focus:ring-gold"
              />
              Held 1 lunar year
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={asset.isHaramExcluded ?? false}
                onChange={(e) => onUpdate({ isHaramExcluded: e.target.checked })}
                className="h-4 w-4 rounded border-border bg-background text-gold focus:ring-gold"
              />
              Exclude non-compliant
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="self-start rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Remove asset"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
