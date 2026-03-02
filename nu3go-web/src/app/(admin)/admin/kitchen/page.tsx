"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ChefHat, CheckCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KitchenCount {
    totalMeals: number;
    pickupCount: number;
    deliveryCount: number;
    byArea: { area: string; count: number }[];
    byLocation: { locationName: string; count: number }[];
    dietaryReq: { label: string; count: number }[];
}

export default function AdminKitchenPage() {
    const [data, setData] = useState<KitchenCount | null>(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    });
    const [exporting, setExporting] = useState(false);
    const [printed, setPrinted] = useState(false);

    useEffect(() => {
        setLoading(true);
        setPrinted(false);
        api.get(`/kitchen/count?date=${date}`).then((res: any) => {
            setData(res.data);
        }).finally(() => setLoading(false));
    }, [date]);

    async function exportPdf() {
        setExporting(true);
        try {
            const res = await fetch(`/v1/kitchen/export-pdf?date=${date}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("nu3go_access_token")}` },
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `kitchen-${date}.pdf`; a.click();
            URL.revokeObjectURL(url);
        } catch { toast.error("Export failed"); }
        finally { setExporting(false); }
    }

    async function markPrinted() {
        try {
            await api.post(`/kitchen/mark-printed?date=${date}`);
            setPrinted(true);
            toast.success("Marked as printed");
        } catch { toast.error("Failed"); }
    }

    return (
        <div className="page-enter space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Kitchen Dashboard</h1>
                    <p className="text-neutral-500 text-sm mt-1">Meal preparation count for the selected date</p>
                </div>
                <div className="flex items-center gap-3">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" />
                    <button onClick={exportPdf} disabled={exporting} className="btn-outline btn-md inline-flex">
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export PDF
                    </button>
                    <button onClick={markPrinted} disabled={printed} className={`btn-md inline-flex ${printed ? "btn-secondary opacity-60" : "btn-primary"}`}>
                        <CheckCircle className="w-4 h-4" />
                        {printed ? "Printed" : "Mark Printed"}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="card"><div className="skeleton h-10 w-20 rounded mb-2" /><div className="skeleton h-4 w-24 rounded" /></div>)}
                </div>
            ) : !data ? (
                <div className="card text-center py-12">
                    <ChefHat className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-400">No data for this date</p>
                </div>
            ) : (
                <>
                    {/* Summary KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: "Total Meals", value: data.totalMeals, color: "text-primary-600" },
                            { label: "Pickup", value: data.pickupCount, color: "text-blue-600" },
                            { label: "Delivery", value: data.deliveryCount, color: "text-purple-600" },
                        ].map(k => (
                            <div key={k.label} className="card text-center py-5">
                                <p className={`text-4xl font-extrabold ${k.color}`}>{k.value}</p>
                                <p className="text-sm text-neutral-500 mt-1 font-medium">{k.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* By Location */}
                        <div className="card">
                            <h3 className="text-sm font-semibold text-neutral-700 mb-4">By Pickup Location</h3>
                            {data.byLocation.length === 0 ? (
                                <p className="text-neutral-400 text-sm">No pickup locations</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.byLocation.map(l => (
                                        <div key={l.locationName} className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-700">{l.locationName}</span>
                                            <span className="font-bold text-neutral-900 text-lg">{l.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* By Area (delivery) */}
                        <div className="card">
                            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Delivery by Area</h3>
                            {data.byArea.length === 0 ? (
                                <p className="text-neutral-400 text-sm">No deliveries</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.byArea.map(a => (
                                        <div key={a.area} className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-700">{a.area}</span>
                                            <span className="font-bold text-neutral-900 text-lg">{a.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
