"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { MealProgressCard } from "@/components/dashboard/MealProgressCard";
import { CreditWalletCard } from "@/components/dashboard/CreditWalletCard";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";
import type { Subscription, CreditWallet } from "@/types";
import { Utensils, CreditCard, Calendar } from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [wallet, setWallet] = useState<CreditWallet | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [subRes, walletRes] = await Promise.allSettled([
                    api.get("/subscriptions/my"),
                    api.get("/credits/my/balance"),
                ]);

                if (subRes.status === "fulfilled") {
                    setSubscription((subRes.value as unknown as { data: Subscription }).data);
                }
                if (walletRes.status === "fulfilled") {
                    setWallet((walletRes.value as unknown as { data: CreditWallet }).data);
                }
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const nextMeal = subscription?.status === "active"
        ? new Date().toLocaleDateString("en-LK", { weekday: "long", month: "short", day: "numeric" })
        : null;

    return (
        <div className="page-enter space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                    Good morning, {user?.fullName?.split(" ")[0]} 👋
                </h1>
                <p className="text-neutral-500 text-sm mt-1">
                    Here&apos;s what&apos;s happening with your subscription today.
                </p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCard
                    label="Subscription Status"
                    value={subscription?.status === "active" ? "Active" : subscription?.status ?? "—"}
                    icon={CreditCard}
                    iconColor="primary"
                    loading={loading}
                />
                <KpiCard
                    label="Meals Remaining"
                    value={
                        subscription?.mealsRemaining != null
                            ? `${subscription.mealsRemaining} meals`
                            : "Unlimited"
                    }
                    icon={Utensils}
                    iconColor="blue"
                    loading={loading}
                />
                <KpiCard
                    label="Next Meal"
                    value={nextMeal ?? "—"}
                    icon={Calendar}
                    iconColor="amber"
                    loading={loading}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subscription card — 2/3 width */}
                <div className="lg:col-span-2 space-y-4">
                    <SubscriptionCard subscription={subscription} loading={loading} />
                    {subscription?.type === "hybrid" && (
                        <MealProgressCard subscription={subscription} loading={loading} />
                    )}
                </div>

                {/* Credit Wallet — 1/3 width */}
                <div>
                    <CreditWalletCard wallet={wallet} loading={loading} />
                </div>
            </div>
        </div>
    );
}
