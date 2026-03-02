"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Subscription, Plan } from "@/types";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { MealProgressCard } from "@/components/dashboard/MealProgressCard";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [switching, setSwitching] = useState<string | null>(null);

    useEffect(() => {
        Promise.allSettled([
            api.get("/subscriptions/my"),
            api.get("/plans"),
        ]).then(([subRes, plansRes]) => {
            if (subRes.status === "fulfilled") setSubscription((subRes.value as any).data);
            if (plansRes.status === "fulfilled") setPlans((plansRes.value as any).data?.items ?? []);
        }).finally(() => setLoading(false));
    }, []);

    async function switchPlan(planId: string) {
        setSwitching(planId);
        try {
            const res = await api.patch("/subscriptions/my/plan", { planId });
            setSubscription((res as any).data);
            toast.success("Plan updated successfully!");
        } catch (e: any) {
            toast.error(e?.error?.message ?? "Failed to change plan");
        } finally {
            setSwitching(null);
        }
    }

    async function pauseSubscription() {
        try {
            const res = await api.post("/subscriptions/my/pause");
            setSubscription((res as any).data);
            toast.success("Subscription paused. Credits will be issued within 48 hours.");
        } catch (e: any) {
            toast.error(e?.error?.message ?? "Failed to pause");
        }
    }

    async function resumeSubscription() {
        try {
            const res = await api.post("/subscriptions/my/resume");
            setSubscription((res as any).data);
            toast.success("Subscription resumed!");
        } catch (e: any) {
            toast.error(e?.error?.message ?? "Failed to resume");
        }
    }

    const publicPlans = plans.filter(p => !p.isCorporate && p.isActive);

    return (
        <div className="page-enter space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">My Subscription</h1>
                <p className="text-neutral-500 text-sm mt-1">View, pause, resume, or change your plan.</p>
            </div>

            {/* Current Subscription */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubscriptionCard subscription={subscription} loading={loading} />
                {subscription?.type === "hybrid" && (
                    <MealProgressCard subscription={subscription} loading={loading} />
                )}
            </div>

            {/* Action Buttons */}
            {subscription && (
                <div className="flex flex-wrap gap-3">
                    {subscription.status === "active" && (
                        <button onClick={pauseSubscription} className="btn-secondary btn-md inline-flex">
                            Pause Subscription
                        </button>
                    )}
                    {subscription.status === "paused" && (
                        <button onClick={resumeSubscription} className="btn-primary btn-md inline-flex">
                            Resume Subscription
                        </button>
                    )}
                </div>
            )}

            {/* Available Plans */}
            {publicPlans.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                        {subscription ? "Switch Plan" : "Choose a Plan"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {publicPlans.map((plan) => {
                            const isCurrent = subscription?.plan?.id === plan.id;
                            return (
                                <div
                                    key={plan.id}
                                    className={`card border-2 transition-all ${isCurrent ? "border-primary-400 bg-primary-50/30" : "border-border hover:border-primary-200"}`}
                                >
                                    {isCurrent && (
                                        <div className="mb-2">
                                            <span className="badge badge-active gap-1">
                                                <CheckCircle className="w-3 h-3" /> Current Plan
                                            </span>
                                        </div>
                                    )}
                                    <h3 className="text-base font-bold text-neutral-900">{plan.name}</h3>
                                    <p className="text-2xl font-extrabold text-neutral-900 mt-1">
                                        {formatCurrency(plan.priceLkr)}
                                        <span className="text-sm text-neutral-500 font-normal"> / {plan.billingDays}d</span>
                                    </p>
                                    {plan.mealCount && (
                                        <p className="text-sm text-neutral-500 mt-1">{plan.mealCount} meals per cycle</p>
                                    )}
                                    <ul className="space-y-1.5 my-4">
                                        {plan.features?.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                                                <CheckCircle className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    {!isCurrent && (
                                        <button
                                            onClick={() => switchPlan(plan.id)}
                                            disabled={!!switching}
                                            className="btn-outline btn-sm w-full justify-center"
                                        >
                                            {switching === plan.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>Switch to this plan <ArrowRight className="w-3.5 h-3.5" /></>
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
