import Link from "next/link";
import type { Metadata } from "next";
import { Leaf, Heart, Users, Truck, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
    title: "About — nu3go",
    description: "Learn about nu3go, Sri Lanka's premium healthy breakfast subscription service.",
};

const values = [
    {
        icon: Heart,
        title: "Health First",
        desc: "Every meal is designed by nutritionists to deliver balanced macros and wholesome ingredients.",
    },
    {
        icon: Users,
        title: "Community Driven",
        desc: "We source locally wherever possible, supporting Sri Lankan farmers and suppliers.",
    },
    {
        icon: Truck,
        title: "Convenience",
        desc: "Pickup or delivery — we fit into your routine, not the other way around.",
    },
];

export default function AboutPage() {
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
                    Our Story
                </span>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-4">
                    About <span className="text-gradient">nu3go</span>
                </h1>
                <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
                    We believe breakfast shouldn&apos;t be an afterthought. nu3go was founded to help
                    busy Sri Lankans start every day with a nutritious, delicious meal — without the hassle.
                </p>
            </section>

            {/* Mission */}
            <section className="max-w-6xl mx-auto px-4 pb-16">
                <div className="card max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-3">Our Mission</h2>
                    <p className="text-neutral-500 leading-relaxed">
                        To make healthy, freshly prepared breakfasts accessible to every professional in
                        Sri Lanka through flexible subscriptions, convenient pickup locations, and reliable
                        city-wide delivery. We&apos;re building a healthier morning routine for the nation.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-neutral-900">What We Stand For</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {values.map((v) => {
                        const Icon = v.icon;
                        return (
                            <div key={v.title} className="card text-center group">
                                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                                    <Icon className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="font-semibold text-neutral-900 mb-2">{v.title}</h3>
                                <p className="text-neutral-500 text-sm">{v.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 gradient-brand">
                <div className="max-w-3xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-3">Join the nu3go community</h2>
                    <p className="text-white/80 mb-6">
                        Start your healthy breakfast journey today.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                        Get Started <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
