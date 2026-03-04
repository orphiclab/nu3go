"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, ChevronDown, ChevronRight } from "lucide-react";

const faqs = [
    {
        q: "What is nu3go?",
        a: "nu3go is a healthy breakfast subscription service based in Colombo, Sri Lanka. We deliver fresh, nutritious meals to your door or have them ready for pickup at our collection points every weekday morning.",
    },
    {
        q: "How do I pick up my meal?",
        a: "Simply visit any nu3go pickup location during morning hours. Use your NFC card or scan your QR code from the app for instant, contactless collection.",
    },
    {
        q: "Can I pause my subscription?",
        a: "Yes! You can pause your subscription anytime from your dashboard. Any unused days are automatically converted to credits that can be applied to your next billing cycle.",
    },
    {
        q: "What areas do you deliver to?",
        a: "We currently deliver across Colombo and surrounding suburbs. Check our locations page for specific coverage areas. We're expanding regularly!",
    },
    {
        q: "Can I switch between plans?",
        a: "Absolutely. You can upgrade, downgrade, or switch between pickup, delivery, and hybrid plans at any time from your account settings.",
    },
    {
        q: "How does the Hybrid 12 plan work?",
        a: "The Hybrid 12 plan gives you 12 flexible meals per billing cycle. You can use them for either pickup or delivery on any weekday. Unused meals can be paused for credits.",
    },
    {
        q: "Do you offer corporate plans?",
        a: "Yes! We offer custom corporate plans for teams and offices. Contact us for tailored pricing, bulk subscriptions, and dedicated pickup arrangements.",
    },
    {
        q: "What if I have dietary restrictions?",
        a: "Our menu rotates daily and we label all items with dietary tags (vegan, gluten-free options, high-protein, etc.). We're working on fully customisable meal preferences.",
    },
    {
        q: "Is there a lock-in contract?",
        a: "No. All nu3go plans are month-to-month with no lock-in. You can cancel anytime from your dashboard.",
    },
    {
        q: "How do credits work?",
        a: "When you pause your subscription, you earn credits for each unused day. Credits are stored in your wallet and automatically applied to your next subscription renewal.",
    },
];

export default function FAQPage() {
    const [open, setOpen] = useState<number | null>(null);

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
                    Help Centre
                </span>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-4">
                    Frequently Asked <span className="text-gradient">Questions</span>
                </h1>
                <p className="text-neutral-500 text-lg max-w-xl mx-auto">
                    Everything you need to know about nu3go subscriptions, pickup, delivery, and more.
                </p>
            </section>

            {/* FAQ List */}
            <section className="max-w-3xl mx-auto px-4 pb-20">
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
                            >
                                <span className="font-semibold text-neutral-900 text-sm pr-4">{faq.q}</span>
                                <ChevronDown
                                    className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                                />
                            </button>
                            {open === i && (
                                <div className="px-5 pb-4 text-sm text-neutral-500 leading-relaxed">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <div className="card max-w-lg mx-auto">
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">Still have questions?</h3>
                        <p className="text-sm text-neutral-500 mb-4">
                            Reach us at <a href="mailto:hello@nu3go.lk" className="text-primary-600 font-medium hover:underline">hello@nu3go.lk</a> and we&apos;ll get back to you within 24 hours.
                        </p>
                        <Link href="/register" className="btn-primary btn-md inline-flex gap-2">
                            Get Started <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
