import type { AssetType } from "./zakat";

export type Unit = "currency" | "gold-grams" | "silver-grams";

export type CategoryId =
  | "metals"
  | "cash"
  | "equity"
  | "fixed-income"
  | "alternatives"
  | "business";

export interface IntentOption {
  id: string;
  label: string;
  hint: string;
  ratio: number;
  reasoning: string;
}

export interface Instrument {
  id: string;
  label: string;
  category: CategoryId;
  /** Underlying asset class used by the zakat engine. */
  type: AssetType;
  unit: Unit;
  /** Short helper shown under the input. */
  hint: string;
  /** Default zakatable proportion of market value (0–1). */
  ratio: number;
  /** Default Shariah reasoning shown in the breakdown. */
  reasoning: string;
  /** Optional follow-up question that changes the treatment. */
  intent?: {
    question: string;
    options: IntentOption[];
  };
  /** Longer explanation used on the investment guide page. */
  guidance: string;
  /** Practical note for investors across different markets. */
  marketNote?: string;
}

export interface Category {
  id: CategoryId;
  title: string;
  subtitle: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "metals",
    title: "Precious Metals",
    subtitle: "Entered in grams and valued at the live market price.",
  },
  {
    id: "cash",
    title: "Cash & Savings",
    subtitle: "Anything you can spend today, in any currency or wallet.",
  },
  {
    id: "equity",
    title: "Equity Investments",
    subtitle:
      "Shares, funds and property vehicles. Treatment depends on why you hold them.",
  },
  {
    id: "fixed-income",
    title: "Fixed Income & Certificates",
    subtitle: "Sukuk, bonds and deposit-style instruments.",
  },
  {
    id: "alternatives",
    title: "Alternatives & Digital Assets",
    subtitle: "Crypto, commodities, private deals, pensions and collectibles.",
  },
  {
    id: "business",
    title: "Business & Receivables",
    subtitle: "Trade assets and money owed to you.",
  },
];

const TRADING_REASON =
  "Held for resale, so the holding is treated as trade goods (‘urud al-tijarah) and the full market value is zakatable.";

export const INSTRUMENTS: Instrument[] = [
  // ---------------- Precious metals ----------------
  {
    id: "gold",
    label: "Gold",
    category: "metals",
    type: "gold",
    unit: "gold-grams",
    hint: "Jewellery, coins and bullion — total weight in grams.",
    ratio: 1,
    reasoning: "Gold is zakatable at full market value regardless of purpose of holding.",
    guidance:
      "In the Hanafi school gold and silver are zakatable in every form — jewellery in daily use included — because they are the two monetary metals. Value the actual gold content at the spot price on your zakat date.",
    marketNote:
      "Local jewellery prices include making charges; use the metal spot value, not the retail receipt.",
  },
  {
    id: "silver",
    label: "Silver",
    category: "metals",
    type: "silver",
    unit: "silver-grams",
    hint: "Coins, bars, cutlery and jewellery — total weight in grams.",
    ratio: 1,
    reasoning: "Silver is zakatable at full market value in every form of holding.",
    guidance:
      "Silver is treated identically to gold. It also sets the Hanafi nisab (612.36 g), which is why the threshold in this app moves with the silver price.",
  },
  {
    id: "metal-etf",
    label: "Gold / silver-backed ETFs",
    category: "metals",
    type: "gold",
    unit: "currency",
    hint: "Value of physically-backed metal ETFs or vaulted metal accounts.",
    ratio: 1,
    reasoning:
      "Metal-backed funds represent an entitlement to allocated bullion, so the full value is zakatable like the metal itself.",
    guidance:
      "Physically-backed metal ETFs and vaulted metal accounts are a claim on real bullion, so they are zakatable in full. Synthetic or futures-based metal products are a contract rather than metal — treat them as a tradeable investment at market value.",
  },

  // ---------------- Cash & savings ----------------
  {
    id: "cash",
    label: "Cash in hand",
    category: "cash",
    type: "cash",
    unit: "currency",
    hint: "Notes and coins at home, in a safe or on you.",
    ratio: 1,
    reasoning: "Cash is fully zakatable at its face value.",
    guidance: "All cash you own on your zakat date is zakatable in full.",
  },
  {
    id: "bank",
    label: "Bank accounts",
    category: "cash",
    type: "cash",
    unit: "currency",
    hint: "Current, savings and instantly accessible balances.",
    ratio: 1,
    reasoning: "Bank balances are a debt owed to you on demand and are fully zakatable.",
    guidance:
      "Include the balance, not the average. Interest credited to the account is zakatable as wealth you hold, but it must be purified — given away without seeking reward.",
  },
  {
    id: "foreign-currency",
    label: "Foreign-currency balances",
    category: "cash",
    type: "cash",
    unit: "currency",
    hint: "Multi-currency accounts and FX holdings, converted to your reporting currency.",
    ratio: 1,
    reasoning:
      "Foreign currency is zakatable at the exchange rate applicable on your zakat date.",
    guidance:
      "Convert every foreign balance at the spot rate on your zakat date, not the rate you bought at. Unrealised FX gains are already captured by using today's rate.",
    marketNote:
      "Investors with brokerage cash in several currencies should convert each sleeve separately, then total.",
  },
  {
    id: "wallets",
    label: "Digital wallets",
    category: "cash",
    type: "cash",
    unit: "currency",
    hint: "Mobile money, payment apps, broker cash and prepaid balances.",
    ratio: 1,
    reasoning: "Wallet and uninvested broker cash is spendable wealth and fully zakatable.",
    guidance:
      "Uninvested cash sitting in a brokerage or exchange account is still your cash — a very common omission for active investors.",
  },

  // ---------------- Equity ----------------
  {
    id: "stocks",
    label: "Stocks / listed shares",
    category: "equity",
    type: "stocks",
    unit: "currency",
    hint: "Market value of directly held shares across all brokers.",
    ratio: 1,
    reasoning: TRADING_REASON,
    intent: {
      question: "How are these shares primarily held?",
      options: [
        {
          id: "trading",
          label: "Short-term trading / resale",
          hint: "Full market value is zakatable.",
          ratio: 1,
          reasoning: TRADING_REASON,
        },
        {
          id: "longTerm",
          label: "Long-term investment / dividends",
          hint: "Zakat applies to the company's zakatable assets — 25% proxy.",
          ratio: 0.25,
          reasoning:
            "Shares held for dividends are zakatable on the company's underlying liquid assets. Where the balance sheet is unavailable, a 25% proxy of market value is used.",
        },
        {
          id: "lookThrough",
          label: "I know the company's zakatable-asset share",
          hint: "Uses a 40% look-through estimate for asset-heavy financial or trading firms.",
          ratio: 0.4,
          reasoning:
            "A look-through estimate is applied: cash, receivables and inventory are typically a higher share of market value for financial and trading companies (40% used here).",
        },
      ],
    },
    guidance:
      "Intention decides the treatment. Shares bought to flip are trade goods — zakat on 100% of market value. Shares bought to hold for income are zakatable only on your share of the company's cash, receivables and inventory; fixed assets like factories and machinery are exempt. If you can read the balance sheet, use the real ratio; otherwise use a documented proxy consistently year to year.",
    marketNote:
      "Screening differs by market: US and UK listings often need debt/interest-income screens, while GCC exchanges publish per-share zakat and purification figures you can use directly.",
  },
  {
    id: "etf",
    label: "ETFs / index funds",
    category: "equity",
    type: "stocks",
    unit: "currency",
    hint: "Value of equity ETF and index-tracker units.",
    ratio: 0.25,
    reasoning:
      "Equity ETF units are zakatable on the underlying liquid holdings — a 25% proxy of unit value.",
    intent: {
      question: "How do you use these ETFs?",
      options: [
        {
          id: "longTerm",
          label: "Buy and hold",
          hint: "25% proxy of unit value.",
          ratio: 0.25,
          reasoning:
            "Buy-and-hold ETF units are zakatable on the underlying zakatable assets — 25% proxy.",
        },
        {
          id: "trading",
          label: "Actively traded",
          hint: "Full unit value is zakatable.",
          ratio: 1,
          reasoning:
            "Actively traded fund units are trade goods, so the full unit value is zakatable.",
        },
      ],
    },
    guidance:
      "A passive equity ETF is a basket of long-term shareholdings, so the look-through logic applies to the basket. If you rotate in and out of ETFs within the year, you are trading them, and the full value counts.",
  },
  {
    id: "mutual-funds",
    label: "Mutual funds",
    category: "equity",
    type: "stocks",
    unit: "currency",
    hint: "Islamic and conventional equity or balanced fund units.",
    ratio: 0.25,
    reasoning:
      "Equity and balanced fund units are zakatable on the fund's liquid assets — 25% proxy.",
    guidance:
      "Many Islamic funds publish an annual zakat-per-unit figure. If yours does, use it in preference to any proxy. Money-market and income funds are effectively cash equivalents and should be entered at 100%.",
  },
  {
    id: "reits",
    label: "REITs / property funds",
    category: "equity",
    type: "stocks",
    unit: "currency",
    hint: "Listed real-estate investment trusts and property fund units.",
    ratio: 0.3,
    reasoning:
      "REIT units held for rental income are zakatable on the trust's cash and receivables — a 30% proxy.",
    intent: {
      question: "Why do you hold these units?",
      options: [
        {
          id: "income",
          label: "Rental income",
          hint: "30% proxy — buildings themselves are exempt.",
          ratio: 0.3,
          reasoning:
            "Income-holding REIT units are zakatable on the trust's liquid assets and undistributed rent; the underlying buildings are exempt fixed assets.",
        },
        {
          id: "trading",
          label: "Capital gains / trading",
          hint: "Full unit value is zakatable.",
          ratio: 1,
          reasoning: TRADING_REASON,
        },
      ],
    },
    guidance:
      "Income-producing property is not itself zakatable; the rent it generates is. A REIT held for yield therefore attracts zakat mainly on the cash and receivables inside the trust plus the distributions you still hold.",
  },
  {
    id: "private-equity",
    label: "Private equity / startup equity",
    category: "equity",
    type: "stocks",
    unit: "currency",
    hint: "Latest valuation of unlisted holdings and angel investments.",
    ratio: 0.25,
    reasoning:
      "Unlisted long-term equity is zakatable on the company's liquid assets — 25% proxy of the latest valuation.",
    guidance:
      "Use the most recent defensible valuation (last funding round or a share-of-book-value estimate) and apply the same look-through logic as listed shares. Illiquidity does not remove liability, but a genuinely unrealisable holding can be deferred until the year you can access it — document the reasoning either way.",
  },
  {
    id: "rsu",
    label: "Vested RSUs / share options",
    category: "equity",
    type: "stocks",
    unit: "currency",
    hint: "Value of vested, exercisable equity compensation only.",
    ratio: 1,
    reasoning:
      "Vested equity compensation is owned wealth and zakatable at market value.",
    guidance:
      "Only vested awards count — unvested grants are not yet owned. For options, count the in-the-money value you could realise today, net of the exercise price.",
  },

  // ---------------- Fixed income ----------------
  {
    id: "sukuk",
    label: "Sukuk",
    category: "fixed-income",
    type: "stocks",
    unit: "currency",
    hint: "Market value of sukuk certificates held.",
    ratio: 1,
    reasoning:
      "Sukuk represent tradeable ownership of income-generating assets and are zakatable at market value.",
    guidance:
      "Asset-backed sukuk are commonly treated at full market value because they are readily tradeable claims. Where the sukuk is genuinely asset-based with heavy fixed assets, a look-through to the liquid share is also defensible — be consistent.",
    marketNote:
      "Sovereign sukuk in the GCC and Malaysia are liquid and priced daily, so market value is straightforward.",
  },
  {
    id: "bonds",
    label: "Bonds / debt securities",
    category: "fixed-income",
    type: "stocks",
    unit: "currency",
    hint: "Recoverable principal only — enter without accrued interest.",
    ratio: 1,
    reasoning:
      "Bond principal is a recoverable debt and is zakatable in full; interest is not zakat and must be purified.",
    guidance:
      "Zakat is due on the principal you expect to recover. The interest element is impermissible income: it is not part of your zakat and should be given away separately without expecting reward.",
  },
  {
    id: "term-deposits",
    label: "Term deposits / savings certificates",
    category: "fixed-income",
    type: "cash",
    unit: "currency",
    hint: "Fixed deposits, savings certificates and money-market funds.",
    ratio: 1,
    reasoning:
      "Deposits and cash-equivalent funds are zakatable in full even when locked for a term.",
    guidance:
      "A lock-in period does not suspend zakat — ownership is what matters. Money-market and income funds behave as cash equivalents and are entered at full value.",
  },

  // ---------------- Alternatives ----------------
  {
    id: "crypto",
    label: "Cryptocurrency (spot)",
    category: "alternatives",
    type: "crypto",
    unit: "currency",
    hint: "Total market value of coins and tokens held.",
    ratio: 1,
    reasoning:
      "Cryptoassets are tradeable wealth and zakatable at market value on your zakat date.",
    guidance:
      "Value the whole portfolio at the spot price on your zakat date, including stablecoins, which behave as cash. Coins held on an exchange are still yours.",
    marketNote:
      "Snapshot prices at a single moment on your zakat date so the total is reproducible in your records.",
  },
  {
    id: "crypto-staked",
    label: "Staked / locked crypto & rewards",
    category: "alternatives",
    type: "crypto",
    unit: "currency",
    hint: "Staked balances, liquidity positions and accrued rewards.",
    ratio: 1,
    reasoning:
      "Staked balances and accrued rewards remain your property and are zakatable at market value.",
    guidance:
      "Lock-ups and unbonding periods do not remove liability. Include earned rewards; where a yield source is interest-like, purify that portion separately from your zakat.",
  },
  {
    id: "commodities",
    label: "Commodities & trading accounts",
    category: "alternatives",
    type: "stocks",
    unit: "currency",
    hint: "Account equity in commodity, FX or managed-futures accounts.",
    ratio: 1,
    reasoning:
      "Trading-account equity is realisable trade wealth and zakatable in full.",
    guidance:
      "Use net account equity — realisable value after open positions are marked to market — rather than notional exposure.",
  },
  {
    id: "p2p",
    label: "P2P lending & crowdfunding",
    category: "alternatives",
    type: "receivables",
    unit: "currency",
    hint: "Outstanding principal you expect to recover.",
    ratio: 1,
    reasoning:
      "Amounts lent out that you strongly expect to recover are zakatable at recoverable value.",
    guidance:
      "Strong debts owed to you are zakatable now. Genuinely doubtful or defaulted amounts can be excluded until recovered, and zakat becomes due for that year on receipt.",
  },
  {
    id: "pension",
    label: "Pension / retirement accounts",
    category: "alternatives",
    type: "stocks",
    unit: "currency",
    hint: "Enter the balance you could access today.",
    ratio: 0.25,
    reasoning:
      "Accessible retirement balances are zakatable on their underlying liquid holdings — 25% proxy for equity-based plans.",
    intent: {
      question: "Can you access this balance today?",
      options: [
        {
          id: "accessible",
          label: "Accessible (self-managed / withdrawable)",
          hint: "25% proxy for equity holdings within the plan.",
          ratio: 0.25,
          reasoning:
            "An accessible plan is owned wealth; its equity holdings are zakatable on the underlying liquid assets (25% proxy).",
        },
        {
          id: "cash-heavy",
          label: "Accessible and mostly cash / bonds",
          hint: "Full value is zakatable.",
          ratio: 1,
          reasoning:
            "Cash and fixed-income holdings inside an accessible plan are zakatable in full.",
        },
        {
          id: "locked",
          label: "Locked until retirement",
          hint: "Deferred — no zakat this year on the locked portion.",
          ratio: 0,
          reasoning:
            "A balance you cannot access or control is treated as deferred; zakat is calculated for those years when the funds become available.",
        },
      ],
    },
    guidance:
      "The question is control. A self-invested plan you could liquidate is zakatable now; a state or employer scheme you cannot touch is commonly deferred until access, with zakat then payable on the received amount. Employer contributions you have no rights over yet are excluded.",
    marketNote:
      "UK SIPPs and US IRAs/401(k)s are usually accessible with a penalty, so most scholars treat them as zakatable; defined-benefit schemes are not.",
  },
  {
    id: "takaful",
    label: "Takaful / insurance cash value",
    category: "alternatives",
    type: "cash",
    unit: "currency",
    hint: "Surrender or investment value you could withdraw.",
    ratio: 1,
    reasoning:
      "The withdrawable investment value of a policy is zakatable in full; pure protection cover is not.",
    guidance:
      "Only the savings component counts — the amount you would receive on surrender. Premiums paid purely for cover are an expense, not an asset.",
  },
  {
    id: "resale-property",
    label: "Property held for resale",
    category: "alternatives",
    type: "business",
    unit: "currency",
    hint: "Market value of land or property bought to sell on.",
    ratio: 1,
    reasoning: TRADING_REASON,
    guidance:
      "Property bought with the intention to sell is trade stock and zakatable at full market value. A home you live in, or a property let out for rent, is not zakatable — only the rent you still hold is.",
  },
  {
    id: "collectibles",
    label: "Collectibles held for resale",
    category: "alternatives",
    type: "business",
    unit: "currency",
    hint: "Watches, art, cars or other items bought to sell on.",
    ratio: 1,
    reasoning: TRADING_REASON,
    guidance:
      "Personal-use items are exempt however valuable. Once acquired with resale intent, they become trade goods at market value.",
  },

  // ---------------- Business ----------------
  {
    id: "inventory",
    label: "Business inventory",
    category: "business",
    type: "business",
    unit: "currency",
    hint: "Trade goods and stock held for sale, at resale value.",
    ratio: 1,
    reasoning: "Trade inventory is zakatable at current resale value.",
    guidance:
      "Value stock at what you could sell it for, not what you paid. Raw materials and work-in-progress count; premises, tools and vehicles used in the business do not.",
  },
  {
    id: "business-cash",
    label: "Business cash & bank",
    category: "business",
    type: "cash",
    unit: "currency",
    hint: "Your share of company cash balances.",
    ratio: 1,
    reasoning: "Your share of business cash is zakatable in full.",
    guidance:
      "For a partnership or company you control, include your proportionate share of cash, receivables and inventory.",
  },
  {
    id: "receivables",
    label: "Receivables owed to you",
    category: "business",
    type: "receivables",
    unit: "currency",
    hint: "Invoices and loans you strongly expect to recover.",
    ratio: 1,
    reasoning: "Strong receivables expected to be repaid are zakatable at full value.",
    guidance:
      "Trade debtors and personal loans you expect back are zakatable. Write off only what is genuinely unrecoverable.",
  },
];

export function instrumentsByCategory(category: CategoryId): Instrument[] {
  return INSTRUMENTS.filter((instrument) => instrument.category === category);
}

export function defaultIntent(instrument: Instrument): string | undefined {
  return instrument.intent?.options[0]?.id;
}

export function resolveTreatment(
  instrument: Instrument,
  intentId: string | undefined,
): { ratio: number; reasoning: string } {
  const option = instrument.intent?.options.find((item) => item.id === intentId);
  if (option) return { ratio: option.ratio, reasoning: option.reasoning };
  return { ratio: instrument.ratio, reasoning: instrument.reasoning };
}
