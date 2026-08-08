import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface BlockchainRecord {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: "confirmed" | "pending";
  blockNumber: number;
  confirmations: number;
  charityName: string;
  impact: string;
}

export interface FundFlow {
  stage: string;
  amount: number;
  date: string;
  status: "completed" | "current" | "pending";
}

const MOCK_CHARITIES = [
  { name: "Emirates Red Crescent", wallet: "0x7a9...b3f2" },
  { name: "Dubai Cares", wallet: "0x4c2...a1e8" },
  { name: "Beit Al Khair Society", wallet: "0x9f1...d4c7" },
];

function generateHash(): string {
  const hex = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += hex[Math.floor(Math.random() * 16)];
  }
  return hash;
}

function shortenWallet(wallet: string): string {
  return wallet.slice(0, 5) + "..." + wallet.slice(-4);
}

export const recordDonation = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (typeof data !== "object" || data === null) {
      throw new Error("Invalid donation data");
    }
    const { amount, currency, charityIndex, impact } = data as {
      amount?: number;
      currency?: string;
      charityIndex?: number;
      impact?: string;
    };
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }
    if (typeof currency !== "string" || currency.length === 0) {
      throw new Error("Currency is required");
    }
    if (typeof charityIndex !== "number" || charityIndex < 0 || charityIndex >= MOCK_CHARITIES.length) {
      throw new Error("Invalid charity selection");
    }
    return { amount, currency, charityIndex, impact: impact ?? "" };
  })
  .handler(async ({ data }) => {
    const charity = MOCK_CHARITIES[data.charityIndex];
    if (!charity) {
      throw new Error("Invalid charity selection");
    }
    const donorWallet = "0x1a2...d8e9";
    const record: BlockchainRecord = {
      id: crypto.randomUUID(),
      hash: generateHash(),
      from: donorWallet,
      to: charity.wallet,
      amount: data.amount,
      currency: data.currency,
      timestamp: new Date().toISOString(),
      status: "confirmed",
      blockNumber: 48291500 + Math.floor(Math.random() * 1000),
      confirmations: 12 + Math.floor(Math.random() * 30),
      charityName: charity.name,
      impact: data.impact,
    };

    return record;
  });

export const fetchRecentRecords = createServerFn({ method: "GET" }).handler(async () => {
  // Simulate a small set of recent transparent transactions.
  const records: BlockchainRecord[] = [
    {
      id: "1",
      hash: "0x8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
      from: "0x1a2...d8e9",
      to: "0x7a9...b3f2",
      amount: 1250,
      currency: "USDT",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: "confirmed",
      blockNumber: 48291542,
      confirmations: 32,
      charityName: "Emirates Red Crescent",
      impact: "Provided food baskets for 50 families.",
    },
    {
      id: "2",
      hash: "0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8",
      from: "0x1a2...d8e9",
      to: "0x4c2...a1e8",
      amount: 340,
      currency: "USDT",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      status: "confirmed",
      blockNumber: 48291200,
      confirmations: 28,
      charityName: "Dubai Cares",
      impact: "School supplies for 20 children.",
    },
    {
      id: "3",
      hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
      from: "0x1a2...d8e9",
      to: "0x9f1...d4c7",
      amount: 780,
      currency: "USDT",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      status: "confirmed",
      blockNumber: 48290811,
      confirmations: 45,
      charityName: "Beit Al Khair Society",
      impact: "Medical aid for 3 refugee families.",
    },
  ];

  return records;
});

export function generateFundFlow(amount: number): FundFlow[] {
  const now = new Date();
  return [
    {
      stage: "Donor Wallet",
      amount,
      date: now.toISOString(),
      status: "completed",
    },
    {
      stage: "Smart Contract",
      amount,
      date: new Date(now.getTime() + 1000 * 60 * 5).toISOString(),
      status: "current",
    },
    {
      stage: "Charity Treasury",
      amount: amount * 0.95,
      date: new Date(now.getTime() + 1000 * 60 * 60 * 2).toISOString(),
      status: "pending",
    },
    {
      stage: "Beneficiary Disbursement",
      amount: amount * 0.9,
      date: new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(),
      status: "pending",
    },
  ];
}

export { MOCK_CHARITIES, shortenWallet };
