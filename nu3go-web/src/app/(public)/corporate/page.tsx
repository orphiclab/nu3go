import Link from "next/link";
import type { Metadata } from "next";
import { Leaf, Building2, Users, CreditCard, CheckCircle, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Corporate Plans — nu3go",
    description: "Healthy breakfast subscriptions for teams and offices in Sri Lanka.",
};

const benefits = [
    "Custom pricing for teams of any size",
    "Dedicated pickup locations at your office",
    "Bulk billing with monthly invoicing",
    "Employee self-serve dashboard",
    "Flexible meal plans per employee",
    "Priority customer support",
];

const tiers = [
    {
        name: "Small Team",
        range: "5–15 employees",
        desc: "Perfect for startups and small offices.",
    },
    {
        name: "Mid-Size",
        range: "15–50 employees",
        desc: "Ideal for growing companies with dedicated HR.",
    },
    {
        name: "Enterprise",
        range: "50+ employees",
        desc: "Full customisation, dedicated account manager.",
    },
];

export default function CorporatePage() {
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-5">
                    For Teams &amp; Offices
                </span>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-4">
                    <span className="text-gradient">Corporate</span> Breakfast Plans
                </h1>
                <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
                    Fuel your team with healthy breakfasts. Custom plans, bulk pricing, and seamless management for companies across Sri Lanka.
                </p>
            </section>

            {/* Benefits */}
            <section className="max-w-4xl mx-auto px-4 pb-16">
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">Why Corporate Plans?</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {benefits.map(b => (
                            <div key={b} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-neutral-700">{b}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tiers */}
            <section className="max-w-5xl mx-auto px-4 pb-20">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-neutral-900">Plans for Every Team Size</h2>
                    <p className="text-neutral-500 text-sm mt-2">Contact us for a tailored quote.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tiers.map(tier => (
                        <div key={tier.name} className="card text-center hover:shadow-glow transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-1">{tier.name}</h3>
                            <p className="text-primary-600 font-semibold text-sm mb-2">{tier.range}</p>
                            <p className="text-sm text-neutral-500">{tier.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 gradient-brand">
                <div className="max-w-3xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-3">Get a custom quote for your team</h2>
                    <p className="text-white/80 mb-6">
                        Email us at{" "}
                        <a href="mailto:corporate@nu3go.lk" className="underline text-white">corporate@nu3go.lk</a>{" "}
                        and we&apos;ll set up your corporate plan within 48 hours.
                    </p>
                    <Link
                        href="mailto:corporate@nu3go.lk"
                        className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                        Contact Sales <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
