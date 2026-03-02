"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ClipboardList, Search } from "lucide-react";

interface PickupLog {
    id: string;
    userId: string;
    userName?: string;
    subscriptionId: string;
    type: string;
    method: string;
    mealDate: string;
    confirmedAt: string;
    isVoided: boolean;
    locationName?: string;
}

export default function AdminPickupLogsPage() {
    const [logs, setLogs] = useState<PickupLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [search, setSearch] = useState("");
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 25;

    useEffect(() => {
        setLoading(true);
        const q = new URLSearchParams({ date, page: String(page), limit: String(limit) });
        if (search) q.set("search", search);
        api.get(`/admin/meal-logs?${q.toString()}`).then((res: any) => {
            setLogs(res.data?.items ?? []);
            setTotal(res.meta?.total ?? 0);
        }).finally(() => setLoading(false));
    }, [date, page, search]);

    const methodColors: Record<string, string> = {
        nfc: "badge-active",
        qr: "badge-pending",
        manual: "badge-paused",
        delivery: "badge-active",
    };

    return (
        <div className="page-enter space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Pickup Logs</h1>
                    <p className="text-neutral-500 text-sm mt-1">{total} records</p>
                </div>
                <input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1); }} className="form-input" />
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input className="form-input pl-9" placeholder="Search by customer…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(8)].map((_, i) => <div key={i} className="flex gap-4"><div className="skeleton h-4 w-32 rounded" /><div className="skeleton h-4 w-48 rounded" /></div>)}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <ClipboardList className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                            <p className="text-neutral-400 text-sm">No pickup logs for this date</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr><th>Time</th><th>Customer</th><th>Type</th><th>Method</th><th>Location</th><th>Voided</th></tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} className={log.isVoided ? "opacity-50" : ""}>
                                        <td className="text-sm text-neutral-500">{new Date(log.confirmedAt).toLocaleTimeString("en-LK")}</td>
                                        <td className="text-sm font-medium text-neutral-800">{log.userName ?? log.userId.slice(0, 8)}</td>
                                        <td><span className="badge badge-pending capitalize text-xs">{log.type}</span></td>
                                        <td><span className={`badge ${methodColors[log.method] ?? "badge-pending"} text-xs`}>{log.method.toUpperCase()}</span></td>
                                        <td className="text-xs text-neutral-500">{log.locationName ?? "—"}</td>
                                        <td>
                                            {log.isVoided
                                                ? <span className="text-red-500 text-xs font-medium">Voided</span>
                                                : <span className="text-green-500 text-xs">✓</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {total > limit && (
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                        <p className="text-sm text-neutral-500">Page {page} of {Math.ceil(total / limit)} ({total} total)</p>
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
