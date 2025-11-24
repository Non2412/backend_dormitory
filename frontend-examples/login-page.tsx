"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

/**
 * Login Page - ปรับให้เข้ากับ Backend API
 * 
 * Backend Response Format:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { id, email, firstName, lastName, role },
 *     "tokens": { accessToken, refreshToken, tokenType, expiresIn }
 *   },
 *   "message": "เข้าสู่ระบบสำเร็จ"
 * }
 */

// กำหนด Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function Login() {
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
                console.log("✅", result.message || "เข้าสู่ระบบสำเร็จ");

                // Redirect ตาม role ของผู้ใช้
                switch (result.data.user.role) {
                    case "ADMIN":
                        router.push("/admin/dashboard");
                        break;
                    case "DORM_OWNER":
                        router.push("/owner/dashboard");
                        break;
                    case "STUDENT":
                    default:
                        router.push("/book");
                        break;
                }
            } else {
                // แสดง error message จาก backend
                setError(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <h1 className={styles.title}>LOGIN</h1>

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
                            placeholder="EMAIL"
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
                        {isLoading ? "กำลังเข้าสู่ระบบ..." : "Log In"}
                    </button>

                    <div className={styles.signupText}>
                        ยังไม่มีบัญชี? <Link href="/signup">สมัครสมาชิก</Link>
                    </div>

                    {/* Demo Credentials */}
                    <div
                        style={{
                            marginTop: "20px",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.5)",
                            textAlign: "center",
                        }}
                    >
                        <p>💡 ทดสอบระบบ:</p>
                        <p>ใช้ email และ password ที่สมัครไว้</p>
                        <p>หรือสร้างบัญชีใหม่ที่หน้า <Link href="/signup">สมัครสมาชิก</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
}
