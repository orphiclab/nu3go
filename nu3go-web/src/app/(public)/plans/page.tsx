"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, ArrowRight, Loader2, Leaf } from "lucide-react";
import Link from "next/link";

interface Plan {
    id: string;
    name: string;
    slug: string;
    type: "pickup" | "delivery" | "hybrid";
    priceLkr: number;
    mealCount?: number;
    billingDays: number;
    description?: string;
    features: string[];
}

const typeLabels: Record<string, { label: string; color: string }> = {
    pickup: { label: "Pickup", color: "badge-active" },
    delivery: { label: "Delivery", color: "badge-pending" },
    hybrid: { label: "Pickup + Delivery", color: "badge-paused" },
};

const popularSlug = "hybrid-12";

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        api.get("/plans").then((res: any) => {
            setPlans(res.data ?? res ?? []);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <main className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-neutral-900 text-lg">nu3go</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="btn-ghost btn-md">Sign in</Link>
                        <Link href="/register" className="btn-primary btn-md">Get Started</Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-4 py-16 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-5">
                    Simple, Transparent Pricing
                </span>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-4">
                    Choose your <span className="text-gradient">breakfast plan</span>
                </h1>
                <p className="text-neutral-500 text-lg max-w-xl mx-auto">
                    Flexible subscription plans designed for Sri Lanka&apos;s busy professionals.
                    Start, pause, or switch plans anytime.
                </p>
            </section>

            {/* Plans Grid */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="card">
                                <div className="skeleton h-5 w-24 rounded mb-4" />
                                <div className="skeleton h-10 w-32 rounded mb-2" />
                                <div className="skeleton h-4 w-48 rounded mb-6" />
                                {[...Array(4)].map((_, j) => <div key={j} className="skeleton h-3 w-full rounded mb-2" />)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {plans.map(plan => {
                            const isPopular = plan.slug === popularSlug;
                            const { label: typeLabel, color: typeColor } = typeLabels[plan.type] ?? { label: plan.type, color: "badge-pending" };

                            return (
                                <div
                                    key={plan.id}
                                    className={`card relative ${isPopular ? "ring-2 ring-primary-500 shadow-glow" : ""}`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full shadow">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <span className={`badge text-xs ${typeColor}`}>{typeLabel}</span>
                                    </div>

                                    <h2 className="text-xl font-bold text-neutral-900 mb-1">{plan.name}</h2>

                                    <div className="mb-1">
                                        <span className="text-4xl font-extrabold text-neutral-900">{formatCurrency(plan.priceLkr)}</span>
                                        <span className="text-neutral-400 text-sm"> / {plan.billingDays} days</span>
                                    </div>

                                    <p className="text-xs text-neutral-400 mb-4">
                                        {plan.mealCount ? `${plan.mealCount} meals per cycle` : "Unlimited meals"}
                                    </p>

                                    {plan.description && (
                                        <p className="text-sm text-neutral-500 mb-4">{plan.description}</p>
                                    )}

                                    <ul className="space-y-2 mb-6">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => router.push(`/register?plan=${plan.id}`)}
                                        className={`w-full justify-center btn-md inline-flex gap-2 ${isPopular ? "btn-primary" : "btn-outline"}`}
                                    >
                                        Get Started <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* FAQ strip */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {[
                        { q: "Can I pause my subscription?", a: "Yes. Pause anytime from your dashboard. Credits are returned for unused days." },
                        { q: "How does pickup work?", a: "Show your QR code or tap your NFC card at any nu3go location to redeem your meal." },
                        { q: "Can I switch plans?", a: "Yes. You can upgrade or switch plans at any time from your subscription page." },
                    ].map(({ q, a }) => (
                        <div key={q} className="card text-left">
                            <h3 className="text-sm font-semibold text-neutral-900 mb-1">{q}</h3>
                            <p className="text-xs text-neutral-500">{a}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
