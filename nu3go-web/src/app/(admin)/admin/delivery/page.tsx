"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Truck, Download, RefreshCcw, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeliveryEntry {
    id: string;
    userId: string;
    userName: string;
    phone?: string;
    address: string;
    area: string;
    notes?: string;
    status: "pending" | "delivered" | "failed";
    mapsLink?: string;
}

export default function AdminDeliveryPage() {
    const [entries, setEntries] = useState<DeliveryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/delivery/schedule?date=${date}`).then((res: any) => {
            setEntries(res.data?.items ?? []);
        }).finally(() => setLoading(false));
    }, [date]);

    async function markDelivered(id: string) {
        try {
            await api.patch(`/delivery/${id}/status`, { status: "delivered" });
            setEntries(e => e.map(x => x.id === id ? { ...x, status: "delivered" } : x));
        } catch { toast.error("Failed to update"); }
    }

    async function exportExcel() {
        setExporting(true);
        try {
            const res = await fetch(`/v1/delivery/export?date=${date}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("nu3go_access_token")}` },
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `delivery-${date}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { toast.error("Export failed"); }
        finally { setExporting(false); }
    }

    const statusBadge: Record<string, string> = {
        pending: "badge-pending",
        delivered: "badge-active",
        failed: "badge-expired",
    };

    return (
        <div className="page-enter space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Delivery Schedule</h1>
                    <p className="text-neutral-500 text-sm mt-1">{entries.length} deliveries planned</p>
                </div>
                <div className="flex items-center gap-3">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" />
                    <button onClick={exportExcel} disabled={exporting} className="btn-outline btn-md inline-flex">
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total", value: entries.length, color: "primary" },
                    { label: "Delivered", value: entries.filter(e => e.status === "delivered").length, color: "green" },
                    { label: "Pending", value: entries.filter(e => e.status === "pending").length, color: "amber" },
                ].map(s => (
                    <div key={s.label} className="card text-center py-4">
                        <p className={`text-3xl font-bold text-${s.color === "green" ? "green" : s.color === "amber" ? "amber" : "primary"}-600`}>{s.value}</p>
                        <p className="text-sm text-neutral-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(5)].map((_, i) => <div key={i} className="flex gap-4"><div className="skeleton h-4 w-48 rounded" /><div className="skeleton h-4 w-64 rounded" /></div>)}
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-12">
                            <Truck className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                            <p className="text-neutral-400 text-sm">No deliveries for this date</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr><th>#</th><th>Customer</th><th>Address</th><th>Notes</th><th>Status</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {entries.map((e, i) => (
                                    <tr key={e.id}>
                                        <td className="text-neutral-400 text-sm">{i + 1}</td>
                                        <td>
                                            <p className="font-medium text-sm text-neutral-800">{e.userName}</p>
                                            {e.phone && <p className="text-xs text-neutral-500">{e.phone}</p>}
                                        </td>
                                        <td>
                                            <p className="text-sm text-neutral-700">{e.address}</p>
                                            <p className="text-xs text-neutral-500">{e.area}</p>
                                            {e.mapsLink && (
                                                <a href={e.mapsLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 inline-flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3" /> Maps
                                                </a>
                                            )}
                                        </td>
                                        <td className="text-xs text-neutral-500 max-w-32">{e.notes ?? "—"}</td>
                                        <td><span className={`badge text-xs ${statusBadge[e.status]}`}>{e.status}</span></td>
                                        <td>
                                            {e.status === "pending" && (
                                                <button onClick={() => markDelivered(e.id)} className="btn-primary btn-sm inline-flex gap-1">
                                                    <RefreshCcw className="w-3 h-3" /> Mark Delivered
                                                </button>
                                            )}
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
