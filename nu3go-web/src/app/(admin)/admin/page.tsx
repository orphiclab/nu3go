"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import api from "@/lib/api";
import type { DashboardKpi } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
    Users,
    CreditCard,
    Utensils,
    Wallet,
    TrendingUp,
    Truck,
    BarChart3,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
    const [kpi, setKpi] = useState<DashboardKpi | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await api.get<DashboardKpi>("/reports/analytics/dashboard");
                setKpi((res as unknown as { data: DashboardKpi }).data);
            } finally {
                setLoading(false);
            }
        }
        fetch();
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
