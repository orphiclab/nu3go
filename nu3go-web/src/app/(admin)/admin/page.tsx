"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import api from "@/lib/api";
import type { DashboardKpi } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, BarChart3, CreditCard, TrendingUp, Truck, Users, Utensils, Wallet } from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function AdminDashboardPage() {
    const [kpi, setKpi] = useState<DashboardKpi | null>(null);
    const [rev, setRev] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAll() {
            try {
                const [kpiRes, revRes] = await Promise.all([
                    api.get("/reports/analytics/dashboard"),
                    api.get("/reports/analytics/revenue?days=14")
                ]);
                setKpi((kpiRes as any).data);
                setRev((revRes as any).data ?? []);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    return (
        <div className="page-enter space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Admin Overview</h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Real-time snapshot of your platform.
                    </p>
                </div>
                <Link
                    href="/admin/reports"
                    className="btn-outline btn-md inline-flex gap-2"
                >
                    <BarChart3 className="w-4 h-4" />
                    Full Reports
                </Link>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Active Subscribers"
                    value={kpi?.activeSubscribers.toLocaleString() ?? "—"}
                    icon={Users}
                    iconColor="primary"
                    trend="up"
                    delta="+8%"
                    loading={loading}
                />
                <KpiCard
                    label="Monthly Revenue"
                    value={kpi ? formatCurrency(kpi.totalRevenueLkr) : "—"}
                    icon={CreditCard}
                    iconColor="blue"
                    trend="up"
                    delta="+12%"
                    loading={loading}
                />
                <KpiCard
                    label="Pickup Today"
                    value={kpi?.pickupToday ?? "—"}
                    icon={Utensils}
                    iconColor="amber"
                    loading={loading}
                />
                <KpiCard
                    label="Deliveries Today"
                    value={kpi?.deliveryToday ?? "—"}
                    icon={Truck}
                    iconColor="purple"
                    loading={loading}
                />
                <KpiCard
                    label="Paused Today"
                    value={kpi?.pausedToday ?? "—"}
                    icon={Users}
                    iconColor="red"
                    loading={loading}
                />
                <KpiCard
                    label="Credit Liability"
                    value={kpi ? formatCurrency(kpi.creditLiabilityLkr) : "—"}
                    icon={Wallet}
                    iconColor="amber"
                    loading={loading}
                />
                <KpiCard
                    label="Renewal Rate"
                    value={kpi ? `${kpi.renewalRatePercent}%` : "—"}
                    icon={TrendingUp}
                    iconColor="primary"
                    trend="up"
                    delta="+2%"
                    loading={loading}
                />
                <KpiCard
                    label="New This Month"
                    value={kpi?.newSubscribersThisMonth ?? "—"}
                    icon={Users}
                    iconColor="blue"
                    loading={loading}
                />
            </div>

            {/* Revenue Trend Chart */}
            <div className="card">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-neutral-800">Revenue Trend (Last 14 Days)</h2>
                </div>
                {loading ? (
                    <div className="skeleton h-64 w-full rounded-lg" />
                ) : rev.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-xl">
                        <p className="text-sm text-neutral-400">No revenue data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={rev}>
                            <defs>
                                <linearGradient id="revGradMain" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                            <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revGradMain)" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    {
                        title: "Delivery Schedule",
                        desc: "View and export today's deliveries",
                        href: "/admin/delivery",
                        icon: Truck,
                        color: "text-purple-600 bg-purple-50",
                    },
                    {
                        title: "Kitchen Count",
                        desc: "Tomorrow's meal preparation count",
                        href: "/admin/kitchen",
                        icon: Utensils,
                        color: "text-amber-600 bg-amber-50",
                    },
                    {
                        title: "Reports",
                        desc: "Revenue, subscriptions & analytics",
                        href: "/admin/reports",
                        icon: BarChart3,
                        color: "text-blue-600 bg-blue-50",
                    },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="card group flex items-center gap-4 no-underline"
                        >
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} flex-shrink-0`}
                            >
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-neutral-800">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
