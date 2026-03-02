import axios from "axios";
import { getMockResponse } from "./mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

// Demo mode: active when backend is unreachable
let DEMO_MODE = false;

export const api = axios.create({
    baseURL: API_URL,
    timeout: 5000, // Short timeout so demo mode kicks in fast
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Request Interceptor — attach access token + demo shortcut ──────────
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("nu3go_access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // If we already know backend is offline, skip the real request
            if (DEMO_MODE && typeof config.url === "string") {
                const mock = getMockResponse(config.url);
                config.adapter = () => Promise.resolve({
                    data: mock !== null ? mock : { data: null, message: "Demo mode generic fallback" },
                    status: 200,
                    statusText: "OK (demo)",
                    headers: {},
                    config,
                });
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401 refresh + demo fallback ─────────
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const original = error.config;

        // ── Network error → activate demo mode ──
        if (!error.response && original && typeof original.url === "string") {
            DEMO_MODE = true;

            const mock = getMockResponse(original.url);
            if (mock !== null) {
                console.info(`[nu3go demo] Serving mock for: ${original.url}`);
                return mock;
            }

            // Return empty data shape for unknown endpoints
            return { data: null, message: "Demo mode" };
        }

        // ── 401 → try refresh token ──
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            try {
                const refreshToken = localStorage.getItem("nu3go_refresh_token");
                if (!refreshToken) throw new Error("No refresh token");

                const { data } = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken,
                });

                localStorage.setItem("nu3go_access_token", data.data.accessToken);
                localStorage.setItem("nu3go_refresh_token", data.data.refreshToken);

                original.headers.Authorization = `Bearer ${data.data.accessToken}`;
                return api(original);
            } catch {
                localStorage.removeItem("nu3go_access_token");
                localStorage.removeItem("nu3go_refresh_token");
                if (typeof window !== "undefined") window.location.href = "/login";
                return Promise.reject(error);
            }
        }

        return Promise.reject(error.response?.data ?? error);
    }
);

/** Simulate a demo login without hitting the backend */
export function demoLogin(role: "admin" | "customer" = "admin") {
    DEMO_MODE = true;
    if (typeof window !== "undefined") {
        localStorage.setItem("nu3go_access_token", `demo-token-${role}`);
        localStorage.setItem("nu3go_refresh_token", `demo-refresh-${role}`);
        localStorage.setItem("nu3go_demo_role", role);
    }
}

export function isDemoMode() {
    return DEMO_MODE;
}

export default api;
