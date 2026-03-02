"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Subscription } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { SubscriptionStatus } from "@/lib/utils";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search, Filter } from "lucide-react";

export default function AdminSubscriptionsPage() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    useEffect(() => {
        setLoading(true);
        const q = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) q.set("search", search);
        if (status !== "all") q.set("status", status);

        api.get(`/admin/subscriptions?${q.toString()}`).then((res: any) => {
            setSubs(res.data?.items ?? []);
            setTotal(res.meta?.total ?? 0);
        }).finally(() => setLoading(false));
    }, [search, status, page]);

    return (
        <div className="page-enter space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Subscriptions</h1>
                    <p className="text-neutral-500 text-sm mt-1">{total.toLocaleString()} total</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input className="form-input pl-9" placeholder="Search users…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <select className="form-input pl-9 pr-8 appearance-none cursor-pointer" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(6)].map((_, i) => <div key={i} className="flex gap-4"><div className="skeleton h-4 w-48 rounded" /><div className="skeleton h-4 w-24 rounded" /></div>)}
                        </div>
                    ) : subs.length === 0 ? (
                        <div className="text-center py-12 text-neutral-400 text-sm">No subscriptions found</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Plan</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Start</th>
                                    <th>Expires</th>
                                    <th>Meals Left</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subs.map(sub => (
                                    <tr key={sub.id}>
                                        <td className="text-sm font-medium text-neutral-800">{sub.userId}</td>
                                        <td className="text-sm">{sub.plan?.name ?? "—"}</td>
                                        <td>
                                            <span className="badge badge-pending capitalize text-xs">{sub.type}</span>
                                        </td>
                                        <td><StatusBadge status={sub.status as SubscriptionStatus} /></td>
                                        <td className="text-sm text-neutral-500">{formatDate(sub.startDate)}</td>
                                        <td className="text-sm text-neutral-500">{formatDate(sub.endDate)}</td>
                                        <td className="text-sm">{sub.mealsRemaining != null ? sub.mealsRemaining : "∞"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {total > limit && (
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                        <p className="text-sm text-neutral-500">Page {page} of {Math.ceil(total / limit)}</p>
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost btn-sm disabled:opacity-40">Previous</button>
                            <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)} className="btn-ghost btn-sm disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
