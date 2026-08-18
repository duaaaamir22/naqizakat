import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AssetType = "cash" | "gold" | "silver" | "stocks" | "crypto" | "business" | "receivables";

export interface AssetInput {
  id: string;
  type: AssetType;
  label: string;
  value: number;
  quantity?: number;
  unitPrice?: number;
  heldForOneYear?: boolean;
  isHaramExcluded?: boolean;
  /** Overrides the default zakatable proportion of the gross value (0–1). */
  zakatableRatio?: number;
  /** Overrides the default Shariah reasoning shown in the breakdown. */
  reasoningOverride?: string;
}

export interface PriceMap {
  goldUsdPerGram: number;
  silverUsdPerGram: number;
  btcUsd: number;
  ethUsd: number;
  usdtUsd: number;
}

export interface ZakatCalculation {
  totalZakatable: number;
  zakatDue: number;
  nisabThreshold: number;
  nisabUsed: "gold" | "silver";
  isLiable: boolean;
  breakdown: AssetBreakdown[];
  deductions: number;
  totalGross: number;
}

export interface AssetBreakdown {
  id: string;
  label: string;
  type: AssetType;
  grossValue: number;
  zakatableValue: number;
  reasoning: string;
}

const ZAKAT_RATE = 0.025;
const GOLD_NISAB_GRAMS = 87.48;
const SILVER_NISAB_GRAMS = 612.36;

const DEFAULT_PRICES: PriceMap = {
  goldUsdPerGram: 75,
  silverUsdPerGram: 0.9,
  btcUsd: 65000,
  ethUsd: 3400,
  usdtUsd: 1,
};

export function getNisabThreshold(prices: PriceMap): number {
  // Hanafi school uses the silver nisab threshold.
  return prices.silverUsdPerGram * SILVER_NISAB_GRAMS;
}

export function calculateAssetValue(asset: AssetInput, prices: PriceMap): number {
  if (asset.value && asset.value > 0) {
    return asset.value;
  }

  if (asset.quantity && asset.unitPrice) {
    return asset.quantity * asset.unitPrice;
  }

  // Try to infer from type if only quantity provided.
  if (asset.quantity) {
    switch (asset.type) {
      case "gold":
        return asset.quantity * prices.goldUsdPerGram;
      case "silver":
        return asset.quantity * prices.silverUsdPerGram;
    }
  }

  return 0;
}

export function computeZakat(
  assets: AssetInput[],
  debts: number,
  prices: PriceMap,
): ZakatCalculation {
  const nisabThreshold = getNisabThreshold(prices);
  let totalGross = 0;
  const breakdown: AssetBreakdown[] = [];

  for (const asset of assets) {
    const grossValue = calculateAssetValue(asset, prices);
    let zakatableValue = 0;
    let reasoning = "";

    switch (asset.type) {
      case "cash":
        zakatableValue = asset.heldForOneYear !== false ? grossValue : 0;
        reasoning =
          asset.heldForOneYear !== false
            ? "Cash and bank balances are fully zakatable if held for one lunar year."
            : "Cash held for less than one lunar year is not yet zakatable.";
        break;
      case "gold":
      case "silver":
        zakatableValue = asset.heldForOneYear !== false ? grossValue : 0;
        reasoning =
          asset.heldForOneYear !== false
            ? "Precious metals held as investment or savings are zakatable at market value."
            : "Precious metals held for less than one lunar year are not yet zakatable.";
        break;
      case "stocks":
        // Zakatable on liquid portion: conservative approach uses 25% of market value
        zakatableValue = asset.heldForOneYear !== false ? grossValue * 0.25 : 0;
        reasoning =
          asset.heldForOneYear !== false
            ? "Listed equities are zakatable on the liquid, tradeable portion (25% proxy)."
            : "Stocks held for less than one lunar year are not yet zakatable.";
        break;
      case "crypto":
        zakatableValue = asset.heldForOneYear !== false ? grossValue : 0;
        reasoning =
          asset.heldForOneYear !== false
            ? "Cryptoassets held as investment are zakatable at current market value."
            : "Crypto held for less than one lunar year is not yet zakatable.";
        break;
      case "business":
        zakatableValue = asset.heldForOneYear !== false ? grossValue : 0;
        reasoning =
          asset.heldForOneYear !== false
            ? "Trade inventory and business assets are zakatable at resale value."
            : "Business assets held for less than one lunar year are not yet zakatable.";
        break;
      case "receivables":
        zakatableValue = asset.heldForOneYear !== false ? grossValue : 0;
        reasoning =
          asset.heldForOneYear !== false
            ? "Strong receivables expected to be repaid are zakatable."
            : "Receivables not yet due for one lunar year are not zakatable.";
        break;
    }

    if (asset.zakatableRatio !== undefined && asset.heldForOneYear !== false) {
      zakatableValue = grossValue * Math.min(Math.max(asset.zakatableRatio, 0), 1);
    }

    if (asset.reasoningOverride) {
      reasoning = asset.reasoningOverride;
    }

    if (asset.isHaramExcluded) {
      zakatableValue = 0;
      reasoning += " Excluded from zakatable base due to non-Shariah-compliant income source.";
    }

    totalGross += grossValue;
    breakdown.push({
      id: asset.id,
      label: asset.label,
      type: asset.type,
      grossValue,
      zakatableValue,
      reasoning,
    });
  }

  const deductions = Math.max(0, debts);
  const totalZakatable = Math.max(0, totalGross - deductions);
  const isLiable = totalZakatable >= nisabThreshold;
  const zakatDue = isLiable ? totalZakatable * ZAKAT_RATE : 0;

  return {
    totalZakatable,
    zakatDue,
    nisabThreshold,
    nisabUsed: "silver",
    isLiable,
    breakdown,
    deductions,
    totalGross,
  };
}

export const fetchMarketPrices = createServerFn({ method: "GET" }).handler(async () => {
  try {
    // CoinGecko public API (no key needed for simple price endpoint).
    const cryptoRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd",
      { headers: { Accept: "application/json" } },
    );

    let btcUsd = DEFAULT_PRICES.btcUsd;
    let ethUsd = DEFAULT_PRICES.ethUsd;
    let usdtUsd = DEFAULT_PRICES.usdtUsd;

    if (cryptoRes.ok) {
      const cryptoData = (await cryptoRes.json()) as {
        bitcoin?: { usd?: number };
        ethereum?: { usd?: number };
        tether?: { usd?: number };
      };
      btcUsd = cryptoData.bitcoin?.usd ?? btcUsd;
      ethUsd = cryptoData.ethereum?.usd ?? ethUsd;
      usdtUsd = cryptoData.tether?.usd ?? usdtUsd;
    }

    // Gold and silver fallback prices; free commodity APIs often require keys.
    // We keep sensible defaults but attempt a public gold price source.
    let goldUsdPerGram = DEFAULT_PRICES.goldUsdPerGram;
    let silverUsdPerGram = DEFAULT_PRICES.silverUsdPerGram;

    try {
      const metalRes = await fetch("https://api.gold-api.com/price/XAU", {
        headers: { Accept: "application/json" },
      });
      if (metalRes.ok) {
        const metalData = (await metalRes.json()) as { price?: number; currency?: string };
        if (metalData.currency === "USD" && metalData.price) {
          // Convert troy ounce price to per gram (1 troy oz = 31.1035 g).
          goldUsdPerGram = metalData.price / 31.1035;
        }
      }
    } catch {
      // Keep default.
    }

    try {
      const silverRes = await fetch("https://api.gold-api.com/price/XAG", {
        headers: { Accept: "application/json" },
      });
      if (silverRes.ok) {
        const silverData = (await silverRes.json()) as { price?: number; currency?: string };
        if (silverData.currency === "USD" && silverData.price) {
          silverUsdPerGram = silverData.price / 31.1035;
        }
      }
    } catch {
      // Keep default.
    }

    return {
      goldUsdPerGram: Number(goldUsdPerGram.toFixed(2)),
      silverUsdPerGram: Number(silverUsdPerGram.toFixed(2)),
      btcUsd: Number(btcUsd.toFixed(2)),
      ethUsd: Number(ethUsd.toFixed(2)),
      usdtUsd: Number(usdtUsd.toFixed(2)),
    } satisfies PriceMap;
  } catch (error) {
    console.error("Price fetch failed, returning defaults.", error);
    return DEFAULT_PRICES;
  }
});

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function assetTypeLabel(type: AssetType): string {
  const labels: Record<AssetType, string> = {
    cash: "Cash & Bank",
    gold: "Gold",
    silver: "Silver",
    stocks: "Stocks & Equities",
    crypto: "Cryptocurrency",
    business: "Business Assets",
    receivables: "Receivables",
  };
  return labels[type];
}
