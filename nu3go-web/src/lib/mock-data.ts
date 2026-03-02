/**
 * Mock data for demo mode (when backend is unreachable).
 * Used by api.ts interceptor when network errors occur.
 */

export const mockUser = {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@nu3go.lk",
    fullName: "nu3go Admin",
    phone: "+94771234567",
    role: "super_admin",
    isVerified: true,
    isActive: true,
};

export const mockCustomerUser = {
    id: "00000000-0000-0000-0000-000000000002",
    email: "customer@nu3go.lk",
    fullName: "Kasun Perera",
    phone: "+94771234568",
    role: "customer",
    isVerified: true,
    isActive: true,
    deliveryAddress: "42 Gregory's Road, Colombo 07",
    deliveryArea: "Colombo 07",
};

export const mockPlans = [
    {
        id: "plan-001",
        name: "Daily Pickup",
        slug: "daily-pickup",
        type: "pickup",
        priceLkr: 3500,
        mealCount: null,
        billingDays: 30,
        description: "Unlimited daily pickups from any nu3go location.",
        features: ["Unlimited pickups", "Any pickup location", "QR + NFC access", "Early morning availability"],
        isActive: true,
        isCorporate: false,
    },
    {
        id: "plan-002",
        name: "Hybrid 12 Meals",
        slug: "hybrid-12",
        type: "hybrid",
        priceLkr: 4200,
        mealCount: 12,
        billingDays: 30,
        description: "12 flexible meals per month — pickup or delivery.",
        features: ["12 flexible meals", "Pickup or delivery", "QR + NFC access", "Credits for unused meals", "Priority scheduling"],
        isActive: true,
        isCorporate: false,
    },
    {
        id: "plan-003",
        name: "Daily Delivery",
        slug: "daily-delivery",
        type: "delivery",
        priceLkr: 5500,
        mealCount: null,
        billingDays: 30,
        description: "Fresh breakfast delivered to your door every morning.",
        features: ["Daily delivery", "Free delivery", "Scheduled before 8AM", "Delivery tracking", "Skip a day anytime"],
        isActive: true,
        isCorporate: false,
    },
];

export const mockSubscription = {
    id: "sub-001",
    status: "active",
    type: "hybrid",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    mealsRemaining: 8,
    mealsUsed: 4,
    autoRenew: true,
    plan: mockPlans[1],
    location: { id: "loc-001", name: "Colombo 07", area: "Colombo 07" },
};

export const mockMealLogs = [
    { id: "ml-001", mealDate: "2026-03-02", method: "qr", type: "pickup", confirmedAt: "2026-03-02T07:45:00Z", isVoided: false, location: { name: "Colombo 07" } },
    { id: "ml-002", mealDate: "2026-03-01", method: "nfc", type: "pickup", confirmedAt: "2026-03-01T07:52:00Z", isVoided: false, location: { name: "Colombo 07" } },
    { id: "ml-003", mealDate: "2026-02-28", method: "qr", type: "pickup", confirmedAt: "2026-02-28T08:01:00Z", isVoided: false, location: { name: "Colombo 03" } },
    { id: "ml-004", mealDate: "2026-02-27", method: "manual", type: "pickup", confirmedAt: "2026-02-27T07:55:00Z", isVoided: true, location: { name: "Colombo 07" } },
];

export const mockCreditWallet = {
    balanceLkr: 1250.0,
    transactions: [
        { id: "ct-001", type: "earn", amountLkr: 350, balanceAfter: 1250, reason: "Credit for paused day (2026-02-25)", createdAt: "2026-02-26T02:00:00Z" },
        { id: "ct-002", type: "earn", amountLkr: 700, balanceAfter: 900, reason: "Credit for 2 paused days", createdAt: "2026-02-20T02:00:00Z" },
        { id: "ct-003", type: "redeem", amountLkr: -200, balanceAfter: 200, reason: "Applied to renewal", createdAt: "2026-02-01T10:00:00Z" },
    ],
};

export const mockPayments = [
    { id: "pay-001", amountLkr: 4200, status: "completed", gateway: "manual", paymentType: "subscription", createdAt: "2026-03-01T08:00:00Z" },
    { id: "pay-002", amountLkr: 4200, status: "completed", gateway: "manual", paymentType: "subscription", createdAt: "2026-02-01T08:10:00Z" },
    { id: "pay-003", amountLkr: 4200, status: "completed", gateway: "manual", paymentType: "subscription", createdAt: "2026-01-01T08:05:00Z" },
];

export const mockAdminUsers = [
    { id: "usr-001", email: "admin@nu3go.lk", fullName: "nu3go Admin", role: "super_admin", isActive: true, isVerified: true, createdAt: "2026-01-01T00:00:00Z" },
    { id: "usr-002", email: "kasun@gmail.com", fullName: "Kasun Perera", role: "customer", isActive: true, isVerified: true, createdAt: "2026-01-15T10:30:00Z" },
    { id: "usr-003", email: "nimal@gmail.com", fullName: "Nimal Silva", role: "customer", isActive: true, isVerified: true, createdAt: "2026-01-20T09:00:00Z" },
    { id: "usr-004", email: "amali@gmail.com", fullName: "Amali Fernando", role: "customer", isActive: false, isVerified: true, createdAt: "2026-02-01T11:00:00Z" },
    { id: "usr-005", email: "ravi@gmail.com", fullName: "Ravi Jayawardena", role: "customer", isActive: true, isVerified: true, createdAt: "2026-02-10T14:20:00Z" },
];

export const mockAdminSubscriptions = [
    { id: "sub-001", status: "active", type: "hybrid", startDate: "2026-03-01", endDate: "2026-03-31", userName: "Kasun Perera", userEmail: "kasun@gmail.com", planName: "Hybrid 12 Meals" },
    { id: "sub-002", status: "active", type: "pickup", startDate: "2026-03-01", endDate: "2026-03-31", userName: "Nimal Silva", userEmail: "nimal@gmail.com", planName: "Daily Pickup" },
    { id: "sub-003", status: "paused", type: "delivery", startDate: "2026-02-01", endDate: "2026-02-28", userName: "Ravi Jayawardena", userEmail: "ravi@gmail.com", planName: "Daily Delivery" },
    { id: "sub-004", status: "expired", type: "hybrid", startDate: "2026-01-01", endDate: "2026-01-31", userName: "Amali Fernando", userEmail: "amali@gmail.com", planName: "Hybrid 12 Meals" },
];

export const mockDeliverySchedule = [
    { id: "dl-001", userName: "Ravi Jayawardena", phone: "+94771234569", deliveryAddress: "15 Wijerama Rd, Colombo 07", deliveryArea: "Colombo 07", status: "pending", mealDate: new Date().toISOString().split("T")[0] },
    { id: "dl-002", userName: "Sunil Bandara", phone: "+94771234570", deliveryAddress: "8 Marine Dr, Colombo 03", deliveryArea: "Colombo 03", status: "delivered", mealDate: new Date().toISOString().split("T")[0] },
    { id: "dl-003", userName: "Tharushi Weerasinghe", phone: "+94771234571", deliveryAddress: "22 Galle Rd, Colombo 06", deliveryArea: "Colombo 06", status: "pending", mealDate: new Date().toISOString().split("T")[0] },
];

export const mockKitchenSummary = {
    total: 47,
    pickup: 35,
    delivery: 12,
    byLocation: [
        { locationName: "Colombo 07", area: "Colombo 07", pickup: 22, delivery: 0, total: 22 },
        { locationName: "Colombo 03", area: "Colombo 03", pickup: 13, delivery: 0, total: 13 },
        { locationName: "Delivered", area: "All Areas", pickup: 0, delivery: 12, total: 12 },
    ],
    isPrinted: false,
};

export const mockPickupLogs = [
    { id: "ml-001", mealDate: new Date().toISOString().split("T")[0], method: "qr", type: "pickup", confirmedAt: new Date().toISOString(), isVoided: false, userName: "Kasun Perera", userEmail: "kasun@gmail.com", locationName: "Colombo 07" },
    { id: "ml-002", mealDate: new Date().toISOString().split("T")[0], method: "nfc", type: "pickup", confirmedAt: new Date().toISOString(), isVoided: false, userName: "Nimal Silva", userEmail: "nimal@gmail.com", locationName: "Colombo 07" },
    { id: "ml-003", mealDate: new Date().toISOString().split("T")[0], method: "manual", type: "pickup", confirmedAt: new Date().toISOString(), isVoided: true, voidReason: "Duplicate scan", userName: "Amali Fernando", userEmail: "amali@gmail.com", locationName: "Colombo 03" },
];

export const mockLocations = [
    { id: "loc-001", name: "Colombo 07", address: "42 Gregory's Road, Colombo 07", city: "Colombo", area: "Colombo 07", isActive: true, openTime: "07:30", closeTime: "09:30", lat: 6.9027, lng: 79.8609 },
    { id: "loc-002", name: "Colombo 03", address: "10 Galle Road, Colombo 03", city: "Colombo", area: "Colombo 03", isActive: true, openTime: "07:30", closeTime: "09:30", lat: 6.9019, lng: 79.8477 },
];

export const mockReportsDashboard = {
    activeSubscribers: 42,
    totalRevenueLkr: 176400,
    pickupToday: 35,
    deliveryToday: 12,
    pausedToday: 3,
    renewalRatePercent: 91.2,
    creditLiabilityLkr: 18750,
    newSubscribersThisMonth: 8,
};

export const mockRevenueTrend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
        date: d.toISOString().split("T")[0],
        revenue: 4000 + Math.floor(Math.random() * 12000),
        new: Math.floor(Math.random() * 4),
        paused: Math.floor(Math.random() * 2),
    };
});

export const mockPlanDistribution = [
    { type: "pickup", count: 18 },
    { type: "hybrid", count: 15 },
    { type: "delivery", count: 9 },
];

export const mockAdminCredits = {
    items: [
        { id: "ct-001", userId: "usr-002", userName: "Kasun Perera", type: "earn", amountLkr: 350, balanceAfter: 1250, reason: "Paused day credit", createdAt: "2026-02-26T02:00:00Z" },
        { id: "ct-002", userId: "usr-003", userName: "Nimal Silva", type: "redeem", amountLkr: -200, balanceAfter: 800, reason: "Applied to renewal", createdAt: "2026-02-20T10:00:00Z" },
        { id: "ct-003", userId: "usr-002", userName: "Kasun Perera", type: "admin_adjustment", amountLkr: 500, balanceAfter: 900, reason: "Manual refund", createdAt: "2026-02-15T14:00:00Z" },
    ],
    total: 3,
};

export const mockMenuItems = [
    { id: "menu-001", name: "Avocado Toast & Egg", description: "Sourdough with smashed avocado, poached egg, cherry tomatoes", calories: 420, tags: ["vegan-option", "high-protein"], isActive: true, validFrom: "2026-03-01", validTo: "2026-03-31" },
    { id: "menu-002", name: "Overnight Oats Bowl", description: "Rolled oats with chia, blueberries, banana, almond milk", calories: 380, tags: ["vegan", "gluten-free-option"], isActive: true, validFrom: "2026-03-01", validTo: "2026-03-31" },
    { id: "menu-003", name: "Protein Wrap", description: "Whole wheat wrap with grilled chicken, greens, hummus", calories: 490, tags: ["high-protein"], isActive: true, validFrom: "2026-03-01", validTo: "2026-03-31" },
];

export const mockCorporateAccounts = [
    { id: "corp-001", companyName: "Dialog Axiata PLC", contactPerson: "Chathura Perera", contactEmail: "chathura@dialog.lk", city: "Colombo", isActive: true, totalPaidLkr: 126000, createdAt: "2026-01-10T00:00:00Z" },
    { id: "corp-002", companyName: "Softlogic Holdings", contactPerson: "Malini Fernando", contactEmail: "malini@softlogic.lk", city: "Colombo", isActive: true, totalPaidLkr: 84000, createdAt: "2026-02-01T00:00:00Z" },
];

// Map of URL patterns to mock responses
export const MOCK_RESPONSES: Record<string, unknown> = {
    "/auth/me": { data: mockAdminUser() },
    "/subscriptions/my": { data: mockSubscription },
    "/meals/my/history": { data: { items: mockMealLogs } },
    "/meals/my/remaining": { data: { count: 8 } },
    "/credits/my/balance": { data: mockCreditWallet },
    "/credits/my/history": { data: { items: mockCreditWallet.transactions } },
    "/payments/my/history": { data: { items: mockPayments } },
    "/plans": { data: mockPlans },
    "/pickup/qr/my-code": { data: { token: "demo-qr-token-12345", expiresAt: new Date(Date.now() + 5 * 60000).toISOString() } },
    "/locations": { data: mockLocations },
    "/menus": { data: { items: mockMenuItems } },
    // Admin
    "/admin/users": { data: { items: mockAdminUsers }, meta: { total: mockAdminUsers.length } },
    "/admin/subscriptions": { data: { items: mockAdminSubscriptions }, meta: { total: mockAdminSubscriptions.length } },
    "/admin/meal-logs": { data: { items: mockPickupLogs }, meta: { total: mockPickupLogs.length } },
    "/admin/credits": { data: mockAdminCredits },
    "/admin/overview": { data: mockReportsDashboard },
    "/delivery/schedule": { data: { items: mockDeliverySchedule }, meta: { total: mockDeliverySchedule.length } },
    "/kitchen": { data: mockKitchenSummary },
    "/reports/analytics/dashboard": { data: mockReportsDashboard },
    "/reports/analytics/revenue": { data: mockRevenueTrend },
    "/reports/analytics/plan-distribution": { data: mockPlanDistribution },
    "/corporate/accounts": { data: { items: mockCorporateAccounts }, meta: { total: mockCorporateAccounts.length } },
    "/nfc/cards": { data: [] },
};

function mockAdminUser() {
    // Return admin user if admin token is stored
    if (typeof window !== "undefined") {
        const t = localStorage.getItem("nu3go_demo_role");
        if (t === "customer") return mockCustomerUser;
    }
    return mockUser;
}

export function getMockResponse(url: string): unknown | null {
    // Exact match first
    if (MOCK_RESPONSES[url]) return MOCK_RESPONSES[url];

    // Prefix match
    for (const [pattern, data] of Object.entries(MOCK_RESPONSES)) {
        if (url.startsWith(pattern) || url.includes(pattern.replace(/^\//, ""))) {
            return data;
        }
    }

    return null;
}
