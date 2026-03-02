import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your nu3go account.",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-3">
                        <svg
                            className="w-7 h-7 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
                            <circle cx="12" cy="9" r="2.5" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900">nu3go</h1>
                    <p className="text-neutral-500 text-sm mt-1">Healthy breakfasts, delivered</p>
                </div>

                {/* Auth card */}
                <div className="bg-white rounded-xl shadow-lg border border-border overflow-hidden">
                    {children}
                </div>

                <p className="text-center text-xs text-neutral-400 mt-6">
                    © {new Date().getFullYear()} nu3go. All rights reserved.
                </p>
            </div>
        </div>
    );
}
