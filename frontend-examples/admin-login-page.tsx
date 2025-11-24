"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

/**
 * Admin Login Page - ปรับให้เข้ากับ Backend API
 * 
 * หน้านี้ใช้สำหรับ Admin เข้าสู่ระบบ
 * จะตรวจสอบว่า role เป็น ADMIN หรือไม่
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // เรียก Backend API
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            // ตรวจสอบว่า login สำเร็จหรือไม่
            if (result.success && result.data) {
                // ตรวจสอบว่าเป็น ADMIN หรือไม่
                if (result.data.user.role !== "ADMIN") {
                    setError("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Admin Only)");
                    setIsLoading(false);
                    return;
                }

                // บันทึก tokens ลง localStorage
                localStorage.setItem("accessToken", result.data.tokens.accessToken);
                localStorage.setItem("refreshToken", result.data.tokens.refreshToken);

                // บันทึกข้อมูลผู้ใช้
                localStorage.setItem("userRole", result.data.user.role);
                localStorage.setItem("userEmail", result.data.user.email);
                localStorage.setItem("userId", result.data.user.id);
                localStorage.setItem(
                    "userName",
                    `${result.data.user.firstName} ${result.data.user.lastName}`
                );

                // แสดงข้อความสำเร็จ
                console.log("✅ Admin login successful");

                // Redirect ไป Admin Dashboard
                router.push("/admin/dashboard");
            } else {
                // แสดง error message จาก backend
                setError(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
            }
        } catch (error) {
            console.error("Admin login error:", error);
            setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <h1 className={styles.title}>ADMIN LOGIN</h1>
                <p className={styles.subtitle}>ระบบจัดการหอพัก</p>

                {/* แสดง Error Message */}
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <input
                            type="email"
                            placeholder="ADMIN EMAIL"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.loginButton}
                        disabled={isLoading}
                    >
                        {isLoading ? "กำลังเข้าสู่ระบบ..." : "Admin Login"}
                    </button>

                    {/* Info */}
                    <div
                        style={{
                            marginTop: "20px",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.5)",
                            textAlign: "center",
                        }}
                    >
                        <p>🔒 สำหรับผู้ดูแลระบบเท่านั้น</p>
                        <p>ต้องมี role เป็น ADMIN</p>
                    </div>
                </form>
            </div>
        </div>
    );
}
