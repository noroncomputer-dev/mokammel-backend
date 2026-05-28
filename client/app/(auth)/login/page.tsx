"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { Eye, EyeOff, Zap } from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      router.replace("/");
    } else {
      setError(result.message || "خطا در ورود");
    }
    setLoading(false);
  };

  return (
    <div className="auth-root" dir="rtl">
      {/* بقیه کدها مثل قبل */}
      <div className="auth-form-wrap">
        <div className="form-bg-dot" />
        <div className="auth-card">
          <div className="mobile-logo">
            <div className="logo-icon">
              <Zap size={18} />
            </div>
            <div className="logo-text" style={{ color: "#fff" }}>
              مکمل‌شاپ
            </div>
          </div>
          <div className="card-header">
            <h1 className="card-title">خوش اومدی</h1>
            <p className="card-sub">وارد حساب کاربری خود شو</p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">ایمیل</label>
              <input
                type="email"
                className="form-input"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">رمز عبور</label>
              <div className="input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="form-meta">
                <Link href="/forget-password" className="form-link">
                  رمز عبور را فراموش کرده‌ای؟
                </Link>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>در حال ورود...</span>
                </div>
              ) : (
                <>
                  <span className="btn-shimmer" />
                  ورود به حساب
                </>
              )}
            </button>
          </form>

          <p className="form-footer">
            حساب نداری؟ <Link href="/register">ثبت‌نام کن</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
