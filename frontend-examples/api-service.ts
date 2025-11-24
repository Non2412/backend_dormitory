/**
 * API Service Helper
 * 
 * Utility functions สำหรับเรียก Backend API
 * รองรับ auto token refresh และ error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * เรียก API พร้อม auto authentication
 */
export async function apiRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getAccessToken();

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // เพิ่ม Authorization header ถ้ามี token
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const result = await response.json();

        // ถ้า token หมดอายุ (401) ให้ลอง refresh
        if (!result.success && response.status === 401 && token) {
            const refreshed = await refreshAccessToken();

            if (refreshed) {
                // ลองเรียก API อีกครั้งด้วย token ใหม่
                return apiRequest<T>(endpoint, options);
            } else {
                // ถ้า refresh ไม่สำเร็จ ให้ logout
                logout();
            }
        }

        return result;
    } catch (error) {
        console.error("API request error:", error);
        return {
            success: false,
            error: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        };
    }
}

/**
 * Login
 */
export async function login(email: string, password: string) {
    const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data) {
        // บันทึก tokens และข้อมูลผู้ใช้
        setAccessToken(result.data.tokens.accessToken);
        setRefreshToken(result.data.tokens.refreshToken);
        setUserData(result.data.user);
    }

    return result;
}

/**
 * Register
 */
export async function register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}) {
    const result = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
    });

    if (result.success && result.data) {
        // บันทึก tokens และข้อมูลผู้ใช้
        setAccessToken(result.data.tokens.accessToken);
        setRefreshToken(result.data.tokens.refreshToken);
        setUserData(result.data.user);
    }

    return result;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
    return apiRequest("/auth/me");
}

/**
 * Logout
 */
export function logout() {
    // ลบข้อมูลทั้งหมดจาก localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    // Redirect ไปหน้า login
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        const result = await response.json();

        if (result.success && result.data) {
            // บันทึก tokens ใหม่
            setAccessToken(result.data.tokens.accessToken);
            setRefreshToken(result.data.tokens.refreshToken);
            return true;
        }
    } catch (error) {
        console.error("Token refresh failed:", error);
    }

    return false;
}

// ==================== Local Storage Helpers ====================

function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
}

function setAccessToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("accessToken", token);
}

function getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
}

function setRefreshToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("refreshToken", token);
}

function setUserData(user: any) {
    if (typeof window === "undefined") return;

    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userId", user.id);
    localStorage.setItem("userName", `${user.firstName} ${user.lastName}`);
}

export function getUserRole(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userRole");
}

export function getUserEmail(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userEmail");
}

export function getUserName(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userName");
}

export function isAuthenticated(): boolean {
    return !!getAccessToken();
}

export function isAdmin(): boolean {
    return getUserRole() === "ADMIN";
}

export function isDormOwner(): boolean {
    return getUserRole() === "DORM_OWNER";
}

export function isStudent(): boolean {
    return getUserRole() === "STUDENT";
}

// ==================== API Endpoints ====================

/**
 * Dormitories API
 */
export const dormitoriesAPI = {
    getAll: (params?: { page?: number; limit?: number }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest(`/dormitories?${query}`);
    },

    getById: (id: string) => {
        return apiRequest(`/dormitories/${id}`);
    },

    create: (data: any) => {
        return apiRequest("/dormitories", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: any) => {
        return apiRequest(`/dormitories/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    delete: (id: string) => {
        return apiRequest(`/dormitories/${id}`, {
            method: "DELETE",
        });
    },
};

/**
 * Rooms API
 */
export const roomsAPI = {
    getAll: (params?: { dormitoryId?: string; status?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest(`/rooms?${query}`);
    },

    getById: (id: string) => {
        return apiRequest(`/rooms/${id}`);
    },

    create: (data: any) => {
        return apiRequest("/rooms", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: any) => {
        return apiRequest(`/rooms/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
};

/**
 * Bookings API
 */
export const bookingsAPI = {
    getAll: (params?: { userId?: string; status?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest(`/bookings?${query}`);
    },

    getById: (id: string) => {
        return apiRequest(`/bookings/${id}`);
    },

    create: (data: any) => {
        return apiRequest("/bookings", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: any) => {
        return apiRequest(`/bookings/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
};

/**
 * Payments API
 */
export const paymentsAPI = {
    getAll: (params?: { bookingId?: string; status?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest(`/payments?${query}`);
    },

    getById: (id: string) => {
        return apiRequest(`/payments/${id}`);
    },

    create: (data: any) => {
        return apiRequest("/payments", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    verify: (id: string, data: any) => {
        return apiRequest(`/payments/${id}/verify`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
};

/**
 * Dashboard API
 */
export const dashboardAPI = {
    getStats: () => {
        return apiRequest("/dashboard/stats");
    },

    getActivities: () => {
        return apiRequest("/dashboard/activities");
    },
};
