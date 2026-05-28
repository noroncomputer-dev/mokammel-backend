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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      // ✅ استفاده از replace به جای push
      router.replace("/");
      // یا
      // window.location.href = "/";
    } else {
      setError(result.message || "خطا در ورود");
    }
    setLoading(false);
  };
  return (
    <div className="auth-root" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          font-family: 'Vazirmatn', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #080c10;
          color: #f0f4f8;
        }

        /* ─── LEFT PANEL ─── */
        .auth-panel {
          display: none;
          position: relative;
          width: 45%;
          overflow: hidden;
          background: linear-gradient(145deg, #0d1117 0%, #0a1628 100%);
        }
        @media (min-width: 1024px) { .auth-panel { display: flex; flex-direction: column; justify-content: space-between; padding: 3rem; } }

        .panel-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(212,160,23,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,160,23,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .panel-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .glow-1 { width: 400px; height: 400px; background: rgba(212,160,23,0.12); top: -100px; right: -100px; }
        .glow-2 { width: 300px; height: 300px; background: rgba(59,130,246,0.08); bottom: 100px; left: -50px; }

        .panel-logo {
          position: relative; z-index: 2;
          display: flex; align-items: center; gap: 10px;
        }
        .logo-icon {
          width: 40px; height: 40px; background: #D4A017;
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
        }
        .logo-icon svg { color: #080c10; }
        .logo-text { font-size: 1.25rem; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
        .logo-sub { font-size: 0.7rem; color: #D4A017; letter-spacing: 2px; text-transform: uppercase; }

        .panel-hero { position: relative; z-index: 2; }
        .panel-tagline {
          font-size: 2.8rem; font-weight: 900; line-height: 1.15;
          color: #fff; margin-bottom: 1.5rem;
        }
        .panel-tagline span { color: #D4A017; }
        .panel-desc { color: #64748b; font-size: 0.95rem; line-height: 1.8; }

        .panel-stats {
          position: relative; z-index: 2;
          display: flex; gap: 2rem;
        }
        .stat-num { font-size: 1.75rem; font-weight: 900; color: #D4A017; }
        .stat-label { font-size: 0.75rem; color: #475569; margin-top: 2px; }

        /* ─── RIGHT FORM ─── */
        .auth-form-wrap {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .form-bg-dot {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(212,160,23,0.04) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .auth-card {
          position: relative; z-index: 2;
          width: 100%; max-width: 420px;
          background: rgba(15,23,35,0.9);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,160,23,0.05) inset;
        }

        .card-header { text-align: center; margin-bottom: 2rem; }
        .mobile-logo {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 1024px) { .mobile-logo { display: none; } }
        .card-title { font-size: 1.75rem; font-weight: 900; color: #fff; margin-bottom: 0.4rem; }
        .card-sub { color: #475569; font-size: 0.88rem; }

        .form-group { margin-bottom: 1.25rem; }
        .form-label { display: block; font-size: 0.8rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.5rem; letter-spacing: 0.3px; }

        .input-wrap { position: relative; }
        .form-input {
          width: 100%; padding: 0.85rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #f0f4f8; font-family: 'Vazirmatn', sans-serif; font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          direction: ltr; text-align: right;
        }
        .form-input::placeholder { color: #334155; }
        .form-input:focus {
          border-color: #D4A017;
          background: rgba(212,160,23,0.04);
          box-shadow: 0 0 0 3px rgba(212,160,23,0.08);
        }
        .input-eye {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #475569;
          display: flex; align-items: center; padding: 4px;
          transition: color 0.2s;
        }
        .input-eye:hover { color: #D4A017; }

        .form-meta {
          display: flex; justify-content: flex-end;
          margin-top: 0.5rem;
        }
        .form-link { font-size: 0.8rem; color: #D4A017; text-decoration: none; transition: opacity 0.2s; }
        .form-link:hover { opacity: 0.75; }

        .error-box {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; padding: 0.7rem 1rem;
          color: #fca5a5; font-size: 0.82rem; text-align: center;
          margin-bottom: 1.25rem;
        }

        .btn-primary {
          width: 100%; padding: 0.9rem;
          background: #D4A017; color: #080c10;
          border: none; border-radius: 12px;
          font-family: 'Vazirmatn', sans-serif; font-size: 1rem; font-weight: 800;
          cursor: pointer; transition: all 0.2s;
          position: relative; overflow: hidden;
          margin-top: 0.5rem;
        }
        .btn-primary:hover:not(:disabled) {
          background: #bef264;
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(212,160,23,0.30);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-shimmer {
          position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer { to { left: 200%; } }

        .form-footer { text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: #475569; }
        .form-footer a { color: #D4A017; font-weight: 700; text-decoration: none; }
        .form-footer a:hover { opacity: 0.8; }

        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 1.5rem 0; color: #1e293b; font-size: 0.75rem;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07);
        }
      `}</style>

      {/* Left Panel */}
      <div className="auth-panel">
        <div className="panel-grid" />
        <div className="panel-glow glow-1" />
        <div className="panel-glow glow-2" />

        <div className="panel-logo">
          <div className="logo-icon">
            <Zap size={20} />
          </div>
          <div>
            <div className="logo-text">مکمل‌شاپ</div>
            <div className="logo-sub">SPORT NUTRITION</div>
          </div>
        </div>

        <div className="panel-hero">
          <div className="panel-tagline">
            به <span>قدرت</span>
            <br />
            واقعی
            <br />
            برس
          </div>
          <p className="panel-desc">
            مکمل‌های اورجینال با ضمانت اصالت کالا
            <br />
            ارسال فوری به سراسر کشور
          </p>
        </div>

        <div className="panel-stats">
          <div className="stat-item">
            <div className="stat-num">۱۲K+</div>
            <div className="stat-label">مشتری فعال</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">۵۰۰+</div>
            <div className="stat-label">محصول اورجینال</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">۹۸٪</div>
            <div className="stat-label">رضایت مشتری</div>
          </div>
        </div>
      </div>

      {/* Form */}
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
