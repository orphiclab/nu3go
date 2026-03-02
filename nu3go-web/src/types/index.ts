// ─── User & Auth Types ──────────────────────────────────
export type UserRole =
    | "super_admin"
    | "admin"
    | "kitchen_staff"
    | "delivery_manager"
    | "customer"
    | "corporate_admin";

export interface User {
    id: string;
    email: string;
    phone?: string;
    fullName: string;
    role: UserRole;
    isVerified: boolean;
    isActive: boolean;
    deliveryAddress?: string;
    deliveryArea?: string;
    createdAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// ─── Plan & Subscription Types ──────────────────────────
export type PlanType = "pickup" | "delivery" | "hybrid";
export type SubStatus = "active" | "paused" | "expired" | "cancelled" | "pending";
export type StartDay = "monday" | "thursday";

export interface Plan {
    id: string;
    name: string;
    slug: string;
    type: PlanType;
    priceLkr: number;
    mealCount: number | null;
    billingDays: number;
    description: string;
    features: string[];
    isActive: boolean;
    isCorporate: boolean;
}

export interface Subscription {
    id: string;
    userId: string;
    plan: Plan;
    locationId?: string;
    status: SubStatus;
    type: PlanType;
    startDate: string;
    endDate: string;
    nextBillingDate?: string;
    startDay?: StartDay;
    mealsRemaining?: number;
    mealsUsed: number;
    autoRenew: boolean;
    pausedAt?: string;
    createdAt: string;
}

// ─── Meal Log Types ─────────────────────────────────────
export type PickupMethod = "nfc" | "qr" | "manual" | "delivery";

export interface MealLog {
    id: string;
    subscriptionId: string;
    userId: string;
    locationId?: string;
    type: "pickup" | "delivery";
    method: PickupMethod;
    mealDate: string;
    confirmedAt: string;
    isVoided: boolean;
}

// ─── Credit & Wallet Types ──────────────────────────────
export type CreditType = "earn" | "redeem" | "expire" | "admin_adjustment" | "holiday";

export interface CreditTransaction {
    id: string;
    userId: string;
    type: CreditType;
    amountLkr: number;
    balanceAfter: number;
    reason?: string;
    createdAt: string;
}

export interface CreditWallet {
    userId: string;
    balanceLkr: number;
    updatedAt: string;
}

// ─── Payment Types ──────────────────────────────────────
export type PaymentGateway = "payhere" | "lankaqr" | "credit_wallet" | "manual";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "chargeback";

export interface PaymentTransaction {
    id: string;
    subscriptionId?: string;
    userId: string;
    gateway: PaymentGateway;
    amountLkr: number;
    status: PaymentStatus;
    paymentType: "new" | "renewal" | "upgrade" | "credit_topup";
    invoiceNumber?: string;
    invoiceUrl?: string;
    paidAt?: string;
    createdAt: string;
}

// ─── Location Types ─────────────────────────────────────
export interface City {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
}

export interface Location {
    id: string;
    cityId: string;
    city?: City;
    name: string;
    address: string;
    lat?: number;
    lng?: number;
    type: "pickup" | "kitchen" | "both";
    isActive: boolean;
}

// ─── API Response Envelope ──────────────────────────────
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    meta?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        statusCode: number;
    };
}

// ─── Dashboard KPI Types ────────────────────────────────
export interface DashboardKpi {
    activeSubscribers: number;
    totalRevenueLkr: number;
    pickupToday: number;
    deliveryToday: number;
    pausedToday: number;
    creditLiabilityLkr: number;
    renewalRatePercent: number;
    newSubscribersThisMonth: number;
}
