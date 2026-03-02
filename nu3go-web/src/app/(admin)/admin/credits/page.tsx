"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Wallet, Search, Plus } from "lucide-react";
import { toast } from "sonner";

interface CreditEntry {
    id: string;
    userId: string;
    userName?: string;
    type: string;
    amountLkr: number;
    balanceAfter: number;
    reason?: string;
    createdAt: string;
}

export default function AdminCreditsPage() {
    const [entries, setEntries] = useState<CreditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [showAdjust, setShowAdjust] = useState(false);
    const [form, setForm] = useState({ userId: "", amountLkr: "", reason: "" });
    const limit = 20;

    useEffect(() => {
        setLoading(true);
        const q = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) q.set("search", search);
        api.get(`/admin/credits?${q.toString()}`).then((res: any) => {
            setEntries(res.data?.items ?? []);
            setTotal(res.meta?.total ?? 0);
        }).finally(() => setLoading(false));
    }, [search, page]);

    async function submitAdjustment() {
        try {
            await api.post("/admin/credits/adjust", {
                userId: form.userId,
                amountLkr: Number(form.amountLkr),
                reason: form.reason,
            });
            toast.success("Credit adjustment applied");
            setShowAdjust(false);
            setForm({ userId: "", amountLkr: "", reason: "" });
            setPage(1);
        } catch (e: any) {
            toast.error(e?.error?.message ?? "Failed to apply adjustment");
        }
    }

    const typeColors: Record<string, string> = {
        earn: "badge-active", redeem: "badge-expired", holiday: "badge-active",
        expire: "badge-cancelled", admin_adjustment: "badge-pending",
    };

    return (
        <div className="page-enter space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Credit Management</h1>
                    <p className="text-neutral-500 text-sm mt-1">{total} transactions</p>
                </div>
                <button onClick={() => setShowAdjust(true)} className="btn-primary btn-md inline-flex">
                    <Plus className="w-4 h-4" /> Manual Adjustment
                </button>
            </div>

            {/* Adjustment Modal */}
            {showAdjust && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
                        <h3 className="text-base font-semibold text-neutral-900">Manual Credit Adjustment</h3>
                        <div>
                            <label className="form-label">User ID</label>
                            <input className="form-input" value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} placeholder="UUID" />
                        </div>
                        <div>
                            <label className="form-label">Amount (LKR) — negative to deduct</label>
                            <input type="number" className="form-input" value={form.amountLkr} onChange={e => setForm({ ...form, amountLkr: e.target.value })} placeholder="e.g. 500 or -200" />
                        </div>
                        <div>
                            <label className="form-label">Reason</label>
                            <input className="form-input" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Holiday compensation" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={submitAdjustment} className="btn-primary btn-md flex-1 justify-center">Apply</button>
                            <button onClick={() => setShowAdjust(false)} className="btn-ghost btn-md flex-1 justify-center">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input className="form-input pl-9" placeholder="Search user…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(6)].map((_, i) => <div key={i} className="flex gap-4"><div className="skeleton h-4 w-48 rounded" /><div className="skeleton h-4 w-24 rounded" /></div>)}
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr><th>Date</th><th>User</th><th>Type</th><th>Amount</th><th>Balance After</th><th>Reason</th></tr>
                            </thead>
                            <tbody>
                                {entries.map(e => {
                                    const isPos = ["earn", "holiday", "admin_adjustment"].includes(e.type) && e.amountLkr >= 0;
                                    return (
                                        <tr key={e.id}>
                                            <td className="text-sm text-neutral-500">{formatDate(e.createdAt)}</td>
                                            <td className="text-sm">{e.userName ?? e.userId.slice(0, 12)}</td>
                                            <td><span className={`badge text-xs ${typeColors[e.type] ?? "badge-pending"}`}>{e.type.replace("_", " ")}</span></td>
                                            <td className={`font-semibold text-sm ${isPos ? "text-green-600" : "text-red-500"}`}>
                                                {isPos ? "+" : ""}{formatCurrency(e.amountLkr)}
                                            </td>
                                            <td className="text-sm text-neutral-600">{formatCurrency(e.balanceAfter)}</td>
                                            <td className="text-xs text-neutral-500">{e.reason ?? "—"}</td>
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
