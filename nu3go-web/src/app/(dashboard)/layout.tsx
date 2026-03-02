"use client";

import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            {/* Main content offset by sidebar width */}
            <main
                className="transition-all duration-300"
                style={{ marginLeft: "240px" }}
                id="main-content"
            >
                <div className="max-w-7xl mx-auto p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
