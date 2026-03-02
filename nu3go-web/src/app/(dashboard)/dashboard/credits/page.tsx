"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CreditWallet, CreditTransaction } from "@/types";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default function CreditsPage() {
    const [wallet, setWallet] = useState<CreditWallet | null>(null);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [walletRes, txRes] = await Promise.allSettled([
                    api.get("/credits/my/balance"),
                    api.get("/credits/my/history?limit=20"),
                ]);
                if (walletRes.status === "fulfilled") setWallet((walletRes.value as any).data);
                if (txRes.status === "fulfilled") setTransactions((txRes.value as any).data?.items ?? []);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const typeConfig: Record<string, { label: string; badge: string; icon: typeof TrendingUp }> = {
        earn: { label: "Credit Earned", badge: "badge-active", icon: TrendingUp },
        redeem: { label: "Credit Used", badge: "badge-expired", icon: TrendingDown },
        holiday: { label: "Holiday Credit", badge: "badge-active", icon: TrendingUp },
        expire: { label: "Expired", badge: "badge-cancelled", icon: TrendingDown },
        admin_adjustment: { label: "Adjustment", badge: "badge-pending", icon: TrendingUp },
    };

    return (
        <div className="page-enter space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Credit Wallet</h1>
                <p className="text-neutral-500 text-sm mt-1">Credits are earned from pauses and holidays, and applied at renewal.</p>
            </div>

            <KpiCard
                label="Current Balance"
                value={wallet ? formatCurrency(wallet.balanceLkr) : "LKR 0"}
                icon={Wallet}
                iconColor="primary"
                loading={loading}
            />

            {/* How credits work */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-800">
                <strong>How credits work:</strong> Pause your subscription with ≥ 48 hours notice to earn credits equivalent to unused days. Credits auto-apply at your next renewal. Holiday credits are issued the day before public holidays.
            </div>

            {/* Transaction History */}
            <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-base font-semibold text-neutral-800">Transaction History</h2>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="skeleton h-4 w-24 rounded" />
                                    <div className="skeleton h-4 w-32 rounded" />
                                    <div className="skeleton h-4 w-20 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 text-neutral-400">
                            <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No credit transactions yet</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Balance After</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => {
                                    const cfg = typeConfig[tx.type] ?? { label: tx.type, badge: "badge-pending", icon: TrendingUp };
                                    const Icon = cfg.icon;
                                    const isCredit = ["earn", "holiday", "admin_adjustment"].includes(tx.type);
                                    return (
                                        <tr key={tx.id}>
                                            <td className="text-sm">{formatDate(tx.createdAt)}</td>
                                            <td>
                                                <span className={`badge ${cfg.badge} gap-1`}>
                                                    <Icon className="w-3 h-3" />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className={`font-semibold ${isCredit ? "text-green-600" : "text-red-500"}`}>
                                                {isCredit ? "+" : "-"}{formatCurrency(tx.amountLkr)}
                                            </td>
                                            <td className="text-neutral-600">{formatCurrency(tx.balanceAfter)}</td>
                                            <td className="text-neutral-500 text-xs">{tx.reason ?? "—"}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
