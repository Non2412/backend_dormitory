"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";

/**
 * Signup Page - ปรับให้เข้ากับ Backend API
 * 
 * Backend Response Format:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { id, email, firstName, lastName, role },
 *     "tokens": { accessToken, refreshToken, tokenType, expiresIn }
 *   },
 *   "message": "ลงทะเบียนสำเร็จ"
 * }
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน");
            setIsLoading(false);
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
            setIsLoading(false);
            return;
        }

        try {
            // เรียก Backend API
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone || undefined, // ส่งเป็น undefined ถ้าไม่กรอก
                }),
            });

            const result = await response.json();

            // ตรวจสอบว่าสมัครสมาชิกสำเร็จหรือไม่
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
                console.log("✅", result.message || "ลงทะเบียนสำเร็จ");

                // Redirect ไปหน้ารายการห้องพัก (ผู้ใช้ทั่วไปจะเป็น STUDENT)
                router.push("/book");
            } else {
                // แสดง error message จาก backend
                setError(result.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.signupBox}>
                <h1 className={styles.title}>SIGN UP</h1>
                <p className={styles.subtitle}>สมัครสมาชิก</p>

                {/* แสดง Error Message */}
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="ชื่อ (First Name)"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="นามสกุล (Last Name)"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="email"
                            name="email"
                            placeholder="อีเมล (Email)"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="เบอร์โทรศัพท์ (Phone) - ไม่บังคับ"
                            value={formData.phone}
                            onChange={handleChange}
                            className={styles.input}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            name="password"
                            placeholder="รหัสผ่าน (Password)"
                            value={formData.password}
                            onChange={handleChange}
                            className={styles.input}
                            required
                            minLength={6}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="ยืนยันรหัสผ่าน (Confirm Password)"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={styles.input}
                            required
                            minLength={6}
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.signupButton}
                        disabled={isLoading}
                    >
                        {isLoading ? "กำลังสมัครสมาชิก..." : "Sign Up"}
                    </button>

                    <div className={styles.loginText}>
                        มีบัญชีอยู่แล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
