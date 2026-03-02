"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentTransaction } from "@/types";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CreditCard, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPaid, setTotalPaid] = useState(0);

    useEffect(() => {
        api.get("/payments/my/history?limit=20").then((res: any) => {
            const items = res.data?.items ?? [];
            setPayments(items);
            setTotalPaid(items.filter((p: PaymentTransaction) => p.status === "completed").reduce((sum: number, p: PaymentTransaction) => sum + p.amountLkr, 0));
        }).finally(() => setLoading(false));
    }, []);

    const statusIcon = (s: string) => {
        if (s === "completed") return <CheckCircle className="w-4 h-4 text-green-500" />;
        if (s === "failed") return <XCircle className="w-4 h-4 text-red-500" />;
        return <Clock className="w-4 h-4 text-amber-500" />;
    };

    const statusBadge: Record<string, string> = {
        completed: "badge-active",
        failed: "badge-expired",
        pending: "badge-pending",
        refunded: "badge-paused",
        chargeback: "badge-cancelled",
    };

    const gatewayLabel: Record<string, string> = {
        payhere: "PayHere",
        lankaqr: "LankaQR",
        credit_wallet: "Credits",
        manual: "Manual",
    };

    return (
        <div className="page-enter space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Payment History</h1>
                <p className="text-neutral-500 text-sm mt-1">All transactions for your subscription.</p>
            </div>

            <KpiCard
                label="Total Paid (All Time)"
                value={formatCurrency(totalPaid)}
                icon={CreditCard}
                iconColor="blue"
                loading={loading}
            />

            <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-base font-semibold text-neutral-800">Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="flex gap-4"><div className="skeleton h-4 w-48 rounded" /><div className="skeleton h-4 w-24 rounded" /></div>)}
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12 text-neutral-400">
                            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No payments yet</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Gateway</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p.id}>
                                        <td className="text-sm">{formatDate(p.createdAt)}</td>
                                        <td className="capitalize text-sm">{p.paymentType.replace("_", " ")}</td>
                                        <td className="text-sm text-neutral-600">{gatewayLabel[p.gateway] ?? p.gateway}</td>
                                        <td className="font-semibold">{formatCurrency(p.amountLkr)}</td>
                                        <td>
                                            <span className={`badge ${statusBadge[p.status] ?? "badge-pending"} gap-1`}>
                                                {statusIcon(p.status)}
                                                <span className="capitalize">{p.status}</span>
                                            </span>
                                        </td>
                                        <td>
                                            {p.invoiceUrl ? (
                                                <a href={p.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 text-sm">
                                                    View <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
