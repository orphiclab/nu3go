"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Leaf, MapPin, Clock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Location {
    id: string;
    name: string;
    address: string;
    city: string;
    area: string;
    isActive: boolean;
    openTime: string;
    closeTime: string;
    lat?: number;
    lng?: number;
}

export default function LocationsPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/locations")
            .then((res: any) => {
                setLocations(res.data ?? res ?? []);
            })
            .finally(() => setLoading(false));
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
                    Pickup Points Across Colombo
                </span>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-4">
                    Our <span className="text-gradient">Locations</span>
                </h1>
                <p className="text-neutral-500 text-lg max-w-xl mx-auto">
                    Find a nu3go collection point near your home, office, or gym.
                    Fresh breakfast ready for you every weekday morning.
                </p>
            </section>

            {/* Locations Grid */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="card">
                                <div className="skeleton h-5 w-3/4 rounded mb-2" />
                                <div className="skeleton h-4 w-full rounded mb-1" />
                                <div className="skeleton h-4 w-1/2 rounded mb-4" />
                                <div className="skeleton h-6 w-24 rounded" />
                            </div>
                        ))}
                    </div>
                ) : locations.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-border shadow-sm">
                        <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500 mb-1">No locations available right now.</p>
                        <p className="text-sm text-neutral-400">We&apos;re expanding soon — check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {locations.filter(l => l.isActive).map(loc => (
                            <div key={loc.id} className="card flex flex-col hover:shadow-glow transition-shadow">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-neutral-900">{loc.name}</h2>
                                        <p className="text-sm text-neutral-500">{loc.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                                    <Clock className="w-4 h-4 text-neutral-400" />
                                    <span>{loc.openTime} – {loc.closeTime} (Weekdays)</span>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded w-fit">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    Open for pickups
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-16 text-center">
                    <div className="card max-w-lg mx-auto">
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">Ready to get started?</h3>
                        <p className="text-sm text-neutral-500 mb-4">
                            Subscribe to a plan and pick up your breakfast at any of our locations.
                        </p>
                        <Link href="/register" className="btn-primary btn-md inline-flex gap-2">
                            Subscribe Now <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
