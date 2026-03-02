"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import {
    LayoutDashboard,
    CreditCard,
    Utensils,
    Wallet,
    ReceiptText,
    Settings,
    Users,
    Truck,
    ChefHat,
    BarChart3,
    BookOpen,
    Package,
    Building2,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Leaf,
    MapPin,
    Layers,
} from "lucide-react";

const customerNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Subscription", href: "/dashboard/subscription", icon: Package },
    { label: "Meals", href: "/dashboard/meals", icon: Utensils },
    { label: "Credits", href: "/dashboard/credits", icon: Wallet },
    { label: "Payments", href: "/dashboard/payments", icon: ReceiptText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNav = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { label: "Plans", href: "/admin/plans", icon: Layers },
    { label: "Delivery", href: "/admin/delivery", icon: Truck },
    { label: "Kitchen", href: "/admin/kitchen", icon: ChefHat },
    { label: "Pickup Logs", href: "/admin/pickup-logs", icon: ClipboardList },
    { label: "Menus", href: "/admin/menus", icon: BookOpen },
    { label: "Credits", href: "/admin/credits", icon: Wallet },
    { label: "Locations", href: "/admin/locations", icon: MapPin },
    { label: "Corporate", href: "/admin/corporate", icon: Building2 },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "NFC / Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const isAdmin = user?.role && ["super_admin", "admin", "kitchen_staff", "delivery_manager"].includes(user.role);
    const navItems = isAdmin ? adminNav : customerNav;

    return (
        <aside
            className={cn(
                "sidebar",
                collapsed && "collapsed"
            )}
            aria-label="Main navigation"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
                <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold text-neutral-900">nu3go</span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
                <ul className="space-y-1" role="list">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            item.href === (isAdmin ? "/admin" : "/dashboard")
                                ? pathname === item.href
                                : pathname.startsWith(item.href);

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn("sidebar-item", isActive && "active")}
                                    title={collapsed ? item.label : undefined}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                    {!collapsed && (
                                        <span className="truncate">{item.label}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User + Actions */}
            <div className="border-t border-border p-3 space-y-2">
                {user && (
                    <div className={cn("flex items-center gap-3 px-2 py-1.5 rounded-lg", collapsed && "justify-center")}>
                        <Avatar name={user.fullName} size="sm" />
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-800 truncate">{user.fullName}</p>
                                <p className="text-xs text-neutral-500 truncate capitalize">{user.role.replace("_", " ")}</p>
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={logout}
                    className={cn(
                        "sidebar-item w-full text-red-600 hover:bg-red-50 hover:text-red-700",
                        collapsed && "justify-center"
                    )}
                    title={collapsed ? "Log out" : undefined}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Log out</span>}
                </button>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="sidebar-item w-full"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
