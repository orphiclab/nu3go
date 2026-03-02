"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Leaf, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface MenuItem {
    id: string;
    name: string;
    description: string;
    calories: number;
    tags: string[];
}

export default function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/menus").then((res: any) => {
            setItems(res.data?.items ?? []);
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold rounded-full mb-5">
                    Freshly Prepared Daily
                </span>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-4">
                    Our <span className="text-gradient">Menu</span>
                </h1>
                <p className="text-neutral-500 text-lg max-w-xl mx-auto">
                    Wholesome, chef-curated breakfast bowls and wraps. Packed with nutrients to jumpstart your morning.
                </p>
            </section>

            {/* Menu Grid */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="card">
                                <div className="skeleton h-5 w-3/4 rounded mb-2" />
                                <div className="skeleton h-4 w-full rounded mb-1" />
                                <div className="skeleton h-4 w-1/2 rounded mb-4" />
                                <div className="skeleton h-6 w-24 rounded" />
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-border shadow-sm">
                        <p className="text-neutral-500">No menu items available right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="card flex flex-col hover:shadow-glow transition-shadow">
                                <div className="flex-1 mb-4">
                                    <h2 className="text-lg font-bold text-neutral-900 mb-2">{item.name}</h2>
                                    <p className="text-sm text-neutral-500 mb-4">{item.description}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-medium rounded capitalize">
                                                {tag.replace("-", " ")}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 inline-flex rounded">
                                        {item.calories} kcal
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-border mt-auto">
                                    <Link href="/plans" className="text-sm font-medium text-neutral-900 hover:text-primary-600 transition-colors inline-flex justify-between items-center w-full">
                                        Subscribe to enjoy <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
