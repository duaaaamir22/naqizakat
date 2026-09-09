import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  ChevronRight,
  Wallet,
} from "lucide-react";
import {
  BlockchainRecord,
  fetchRecentRecords,
  generateFundFlow,
  MOCK_CHARITIES,
  recordDonation,
  shortenWallet,
} from "../lib/blockchain";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Blockchain Verification — Naqi" },
      {
        name: "description",
        content: "Verify every donation on the simulated blockchain with traceable transaction hashes.",
      },
      { property: "og:title", content: "Blockchain Verification — Naqi" },
      {
        property: "og:description",
        content: "Verify every donation on the simulated blockchain with traceable transaction hashes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const getRecords = useServerFn(fetchRecentRecords);
  const donate = useServerFn(recordDonation);
  const [amount, setAmount] = useState(100);
  const [charityIndex, setCharityIndex] = useState(0);
  const [newRecord, setNewRecord] = useState<BlockchainRecord | null>(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["blockchain-records"],
    queryFn: () => getRecords(),
  });

  const handleDonate = async () => {
    const record = await donate({ data: { amount, currency: "AED", charityIndex, impact: "" } });
    setNewRecord(record);
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-medium text-gold-foreground">
            <ShieldCheck className="h-4 w-4" />
            Simulated Polygon testnet
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Blockchain verification
          </h1>
          <p className="mt-2 text-muted-foreground">
            Every donation is recorded as a verifiable transaction with a unique hash and fund-flow
            trace.
          </p>
        </div>

        {/* Simulate donation */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Simulate a donation</h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="text-sm text-muted-foreground">Amount (AED)</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </label>
            <label className="flex-[2]">
              <span className="text-sm text-muted-foreground">Charity</span>
              <select
                value={charityIndex}
                onChange={(e) => setCharityIndex(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {MOCK_CHARITIES.map((c, i) => (
                  <option key={c.wallet} value={i}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleDonate}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Wallet className="h-4 w-4" />
              Record donation
            </button>
          </div>

          {newRecord && (
            <div className="mt-6 rounded-lg border border-gold/30 bg-gold/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald">
                <CheckCircle2 className="h-4 w-4" />
                Transaction recorded on simulated blockchain
              </div>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-foreground">{shortenWallet(newRecord.hash)}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(newRecord.hash)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Copy hash"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Block</span>
                  <span className="text-foreground">{newRecord.blockNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Confirmations</span>
                  <span className="text-foreground">{newRecord.confirmations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="text-foreground">{newRecord.charityName}</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-foreground">Fund flow</h3>
                <div className="mt-2 space-y-2">
                  {generateFundFlow(newRecord.amount).map((stage, index) => (
                    <div
                      key={stage.stage}
                      className="flex items-center justify-between rounded-lg bg-background p-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            stage.status === "completed"
                              ? "bg-emerald"
                              : stage.status === "current"
                              ? "bg-gold"
                              : "bg-muted-foreground/40"
                          }`}
                        />
                        <span className="text-foreground">{stage.stage}</span>
                      </div>
                      <span className="text-muted-foreground">AED {stage.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent records */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent transactions</h2>
          {isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading blockchain records…</p>
          ) : (
            <div className="mt-4 space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-gold/30"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {record.charityName}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {shortenWallet(record.hash)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          {record.amount.toLocaleString()} {record.currency}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(record.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <a
                        href={`https://mumbai.polygonscan.com/tx/${record.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md p-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border pt-3 text-sm">
                    <span className="text-muted-foreground">Impact:</span>{" "}
                    <span className="text-foreground">{record.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
