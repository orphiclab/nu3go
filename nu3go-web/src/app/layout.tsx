import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: {
        default: "nu3go — Healthy Breakfast Subscriptions",
        template: "%s | nu3go",
    },
    description:
        "Sri Lanka's premium healthy breakfast subscription service. Pickup or delivery meal plans in Colombo and beyond.",
    keywords: ["healthy breakfast", "meal subscription", "Sri Lanka", "Colombo", "nu3go"],
    authors: [{ name: "nu3go" }],
    creator: "nu3go",
    openGraph: {
        type: "website",
        locale: "en_LK",
        url: "https://nu3go.lk",
        siteName: "nu3go",
        title: "nu3go — Healthy Breakfast Subscriptions",
        description: "Sri Lanka's premium healthy breakfast subscription service.",
    },
    twitter: {
        card: "summary_large_image",
        title: "nu3go",
        description: "Sri Lanka's premium healthy breakfast subscription service.",
    },
    manifest: "/manifest.json",
    icons: {
        icon: "/icons/icon-192.png",
        apple: "/icons/icon-192.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#22c55e",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                {children}
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    toastOptions={{
                        duration: 5000,
                        className: "font-sans text-sm",
                    }}
                />
            </body>
        </html>
    );
}
