"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TrendingUp, Users, Utensils, Download, Loader2 } from "lucide-react";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminReportsPage() {
    const [rev, setRev] = useState<any[]>([]);
    const [planDist, setPlanDist] = useState<any[]>([]);
    const [topKpi, setTopKpi] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("30");
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.get(`/reports/analytics/revenue?days=${range}`),
            api.get("/reports/analytics/plan-distribution"),
            api.get("/reports/analytics/dashboard"),
        ]).then(([revRes, pdRes, kpiRes]) => {
            if (revRes.status === "fulfilled") setRev((revRes.value as any).data ?? []);
            if (pdRes.status === "fulfilled") setPlanDist((pdRes.value as any).data ?? []);
            if (kpiRes.status === "fulfilled") setTopKpi((kpiRes.value as any).data);
        }).finally(() => setLoading(false));
    }, [range]);

    async function exportReport() {
        setExporting(true);
        try {
            const res = await fetch(`/v1/reports/export?days=${range}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("nu3go_access_token")}` },
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `nu3go-report.xlsx`; a.click();
            URL.revokeObjectURL(url);
        } finally { setExporting(false); }
    }

    return (
        <div className="page-enter space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Reports & Analytics</h1>
                    <p className="text-neutral-500 text-sm mt-1">Business performance overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={range} onChange={e => setRange(e.target.value)} className="form-input">
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                    </select>
                    <button onClick={exportReport} disabled={exporting} className="btn-outline btn-md inline-flex">
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Active Subscribers" value={topKpi?.activeSubscribers ?? "—"} icon={Users} iconColor="primary" loading={loading} trend="up" delta="+8%" />
                <KpiCard label="Monthly Revenue" value={topKpi ? formatCurrency(topKpi.totalRevenueLkr) : "—"} icon={TrendingUp} iconColor="blue" loading={loading} trend="up" delta="+12%" />
                <KpiCard label="Renewal Rate" value={topKpi ? `${topKpi.renewalRatePercent}%` : "—"} icon={TrendingUp} iconColor="primary" loading={loading} />
                <KpiCard label="Meals This Month" value={topKpi?.pickupToday ?? "—"} icon={Utensils} iconColor="amber" loading={loading} />
            </div>

            {/* Revenue Trend */}
            <div className="card">
                <h2 className="text-base font-semibold text-neutral-800 mb-5">Revenue Trend (LKR)</h2>
                {loading ? (
                    <div className="skeleton h-64 w-full rounded-lg" />
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={rev}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                            <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription by Type */}
                <div className="card">
                    <h2 className="text-base font-semibold text-neutral-800 mb-5">Subscriptions by Plan Type</h2>
                    {loading ? (
                        <div className="skeleton h-48 w-full rounded-lg" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={planDist} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}>
                                    {planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Active vs Paused by day */}
                <div className="card">
                    <h2 className="text-base font-semibold text-neutral-800 mb-5">New Subscribers vs Paused</h2>
                    {loading ? (
                        <div className="skeleton h-48 w-full rounded-lg" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={rev}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="new" name="New" fill="#22c55e" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="paused" name="Paused" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
