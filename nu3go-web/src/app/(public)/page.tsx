import Link from "next/link";
import type { Metadata } from "next";
import {
    Leaf,
    MapPin,
    Smartphone,
    ChevronRight,
    CheckCircle,
    Utensils,
    CreditCard,
    Truck,
} from "lucide-react";

export const metadata: Metadata = {
    title: "nu3go — Healthy Breakfast Subscriptions Sri Lanka",
    description:
        "Sri Lanka's premium healthy breakfast subscription. Fresh, nutritious meals delivered or available for pickup in Colombo and beyond.",
};

const features = [
    {
        icon: Utensils,
        title: "Flexible Plans",
        desc: "Choose from daily pickup, home delivery, or our popular 12-meal hybrid plan.",
    },
    {
        icon: CreditCard,
        title: "Pause Anytime",
        desc: "Life happens. Pause your subscription and earn credits for unused days.",
    },
    {
        icon: Truck,
        title: "City-Wide Delivery",
        desc: "We deliver across Colombo and surrounding areas, Monday to Friday.",
    },
    {
        icon: Smartphone,
        title: "NFC & QR Pickup",
        desc: "Tap your card or scan a QR code for instant, contactless pickup.",
    },
];

const plans = [
    {
        name: "Daily Pickup",
        price: "LKR 6,500",
        period: "/ month",
        type: "pickup",
        features: ["Weekday pickup", "Any location", "Fresh daily menu", "Pause & earn credits"],
        popular: false,
    },
    {
        name: "Hybrid 12",
        price: "LKR 7,800",
        period: "/ cycle",
        type: "hybrid",
        features: [
            "12 meals per cycle",
            "Pickup or delivery",
            "Use on any weekday",
            "Rollover credits if paused",
        ],
        popular: true,
    },
    {
        name: "Daily Delivery",
        price: "LKR 8,900",
        period: "/ month",
        type: "delivery",
        features: ["Weekday delivery", "Colombo & suburbs", "Real-time tracking", "Delivery notes"],
        popular: false,
    },
];

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Nav */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-neutral-900">
                        <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        nu3go
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600">
                        <Link href="/menu" className="hover:text-neutral-900 transition-colors">Menu</Link>
                        <Link href="/plans" className="hover:text-neutral-900 transition-colors">Plans</Link>
                        <Link href="/locations" className="hover:text-neutral-900 transition-colors">Locations</Link>
                        <Link href="/about" className="hover:text-neutral-900 transition-colors">About</Link>
                        <Link href="/faq" className="hover:text-neutral-900 transition-colors">FAQ</Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="btn-ghost btn-sm">Sign in</Link>
                        <Link href="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary-50 via-white to-neutral-50">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold mb-6">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                            Now delivering across Colombo
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-neutral-900 leading-tight text-balance">
                            Start your day{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                                the healthy way
                            </span>
                        </h1>
                        <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                            Fresh, nutritious breakfast subscriptions — pickup or delivered to your doorstep.
                            Flexible plans, pause anytime, and earn credits.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                            <Link href="/register" className="btn-primary btn-lg inline-flex">
                                Start Your Subscription
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                            <Link href="/menu" className="btn-outline btn-lg inline-flex">
                                View Today&apos;s Menu
                            </Link>
                        </div>
                        <p className="text-neutral-400 text-xs mt-4">
                            No lock-in contracts. Cancel anytime.
                        </p>
                    </div>
                </section>

                {/* Features */}
                <section className="py-20 px-4 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-neutral-900">Why nu3go?</h2>
                            <p className="text-neutral-500 mt-2">Built for busy professionals in Sri Lanka.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((f) => {
                                const Icon = f.icon;
                                return (
                                    <div key={f.title} className="card text-center group">
                                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                                            <Icon className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <h3 className="font-semibold text-neutral-900 mb-2">{f.title}</h3>
                                        <p className="text-neutral-500 text-sm">{f.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section className="py-20 px-4 bg-neutral-50" id="plans">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-neutral-900">Simple, transparent pricing</h2>
                            <p className="text-neutral-500 mt-2">Choose the plan that fits your lifestyle.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`relative bg-white rounded-xl border-2 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${plan.popular
                                            ? "border-primary-500 shadow-md"
                                            : "border-border"
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                                        <div className="mt-2">
                                            <span className="text-3xl font-extrabold text-neutral-900">
                                                {plan.price}
                                            </span>
                                            <span className="text-neutral-500 text-sm">{plan.period}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-2.5 mb-6">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2 text-sm text-neutral-600">
                                                <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href="/register"
                                        className={`w-full justify-center ${plan.popular ? "btn-primary" : "btn-outline"
                                            } btn-md inline-flex`}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-neutral-500 text-sm mt-8">
                            Corporate plans available for teams.{" "}
                            <Link href="/corporate" className="text-primary-600 font-medium hover:underline">
                                Learn more →
                            </Link>
                        </p>
                    </div>
                </section>

                {/* Pickup Locations CTA */}
                <section className="py-16 px-4 bg-white">
                    <div className="max-w-3xl mx-auto text-center">
                        <MapPin className="w-10 h-10 text-primary-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                            Multiple pickup locations
                        </h2>
                        <p className="text-neutral-500 mb-6">
                            Find a nu3go collection point near your home, office, or gym.
                        </p>
                        <Link href="/locations" className="btn-outline btn-md inline-flex">
                            View All Locations
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="py-16 px-4 gradient-brand">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h2 className="text-3xl font-bold mb-3">Ready to eat better?</h2>
                        <p className="text-white/80 mb-6">
                            Join hundreds of Colombo professionals who start their day with nu3go.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                            Subscribe Now <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-neutral-900 text-neutral-400 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 gradient-brand rounded-lg flex items-center justify-center">
                                    <Leaf className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white font-bold text-lg">nu3go</span>
                            </div>
                            <p className="text-sm max-w-xs">
                                Healthy breakfast subscriptions for Sri Lanka.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                            <div>
                                <h4 className="text-white font-semibold mb-3">Product</h4>
                                <ul className="space-y-2">
                                    <li><Link href="/plans" className="hover:text-white transition-colors">Plans</Link></li>
                                    <li><Link href="/menu" className="hover:text-white transition-colors">Menu</Link></li>
                                    <li><Link href="/locations" className="hover:text-white transition-colors">Locations</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-semibold mb-3">Company</h4>
                                <ul className="space-y-2">
                                    <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                                    <li><Link href="/corporate" className="hover:text-white transition-colors">Corporate</Link></li>
                                    <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-semibold mb-3">Account</h4>
                                <ul className="space-y-2">
                                    <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                                    <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-neutral-800 pt-6 text-xs flex flex-col md:flex-row justify-between gap-2">
                        <p>© {new Date().getFullYear()} nu3go. All rights reserved.</p>
                        <p>Colombo, Sri Lanka 🇱🇰</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
