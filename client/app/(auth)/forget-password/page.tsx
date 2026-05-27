"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { Zap, ArrowRight, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const success = await forgotPassword(email);
    setLoading(false);
    if (success) {
      setSent(true);
    } else {
      setError("کاربری با این ایمیل یافت نشد");
    }
  };

  return (
    <div className="auth-root" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;900&display=swap');
        * { box-sizing:border-box;margin:0;padding:0; }
        .auth-root { font-family:'Vazirmatn',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#080c10;padding:2rem 1.5rem;position:relative;overflow:hidden; }
        .bg-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(163,230,53,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(163,230,53,.04) 1px,transparent 1px);background-size:50px 50px; }
        .bg-glow { position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none; }
        .glow-top { width:600px;height:600px;background:rgba(163,230,53,.07);top:-200px;left:50%;transform:translateX(-50%); }
        .glow-bottom { width:400px;height:400px;background:rgba(59,130,246,.05);bottom:-150px;right:-100px; }

        .card { position:relative;z-index:2;width:100%;max-width:460px;background:rgba(15,23,35,.95);border:1px solid rgba(255,255,255,.08);border-radius:28px;padding:3rem 2.5rem;backdrop-filter:blur(20px);box-shadow:0 30px 70px rgba(0,0,0,.6); }

        .back-link { display:inline-flex;align-items:center;gap:6px;color:#475569;font-size:.82rem;text-decoration:none;margin-bottom:2rem;transition:color .2s; }
        .back-link:hover { color:#D4A017; }

        .icon-wrap { width:64px;height:64px;background:rgba(163,230,53,.1);border:1px solid rgba(163,230,53,.2);border-radius:18px;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem; }
        .card-title { font-size:1.75rem;font-weight:900;color:#fff;margin-bottom:.5rem; }
        .card-sub { color:#475569;font-size:.9rem;line-height:1.7;margin-bottom:2rem; }

        .form-label { display:block;font-size:.8rem;font-weight:600;color:#94a3b8;margin-bottom:.5rem;letter-spacing:.3px; }
        .form-input { width:100%;padding:.875rem 1.25rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#f0f4f8;font-family:'Vazirmatn',sans-serif;font-size:.95rem;outline:none;transition:all .2s;direction:ltr;text-align:right;margin-bottom:1.5rem; }
        .form-input::placeholder { color:#334155; }
        .form-input:focus { border-color:#D4A017;background:rgba(163,230,53,.04);box-shadow:0 0 0 3px rgba(163,230,53,.08); }

        .error-box { background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:.7rem 1rem;color:#fca5a5;font-size:.82rem;text-align:center;margin-bottom:1.25rem; }

        .btn-primary { width:100%;padding:.9rem;background:#D4A017;color:#080c10;border:none;border-radius:12px;font-family:'Vazirmatn',sans-serif;font-size:1rem;font-weight:800;cursor:pointer;transition:all .2s;position:relative;overflow:hidden; }
        .btn-primary:hover:not(:disabled) { background:#bef264;transform:translateY(-1px);box-shadow:0 8px 25px rgba(163,230,53,.3); }
        .btn-primary:disabled { opacity:.5;cursor:not-allowed; }
        .btn-shimmer { position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);animation:shimmer 2s infinite; }
        @keyframes shimmer { to{left:200%;} }

        /* Success state */
        .success-wrap { text-align:center; }
        .success-icon { width:72px;height:72px;background:rgba(163,230,53,.12);border:1px solid rgba(163,230,53,.25);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;animation:popIn .4s ease; }
        @keyframes popIn { from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1} }
        .success-title { font-size:1.6rem;font-weight:900;color:#fff;margin-bottom:.75rem; }
        .success-desc { color:#64748b;font-size:.9rem;line-height:1.8;margin-bottom:2rem; }
        .email-chip { display:inline-block;padding:.3rem .85rem;background:rgba(163,230,53,.08);border:1px solid rgba(163,230,53,.15);border-radius:50px;color:#D4A017;font-size:.85rem;margin:.25rem 0; }
        .btn-outline { width:100%;padding:.85rem;background:transparent;color:#D4A017;border:1px solid rgba(163,230,53,.3);border-radius:12px;font-family:'Vazirmatn',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;text-decoration:none;display:block;text-align:center;margin-top:.75rem; }
        .btn-outline:hover { background:rgba(163,230,53,.08);border-color:#D4A017; }

        .logo { display:flex;align-items:center;gap:8px;margin-bottom:2.5rem; }
        .logo-icon { width:36px;height:36px;background:#D4A017;border-radius:9px;display:flex;align-items:center;justify-content:center; }
        .logo-text { font-size:1.1rem;font-weight:900;color:#fff; }
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow glow-top" />
      <div className="bg-glow glow-bottom" />

      <div className="card">
        {!sent ? (
          <>
            <div className="logo">
              <div className="logo-icon">
                <Zap size={18} color="#080c10" />
              </div>
              <span className="logo-text">مکمل‌شاپ</span>
            </div>

            <Link href="/login" className="back-link">
              <ArrowRight size={14} />
              بازگشت به ورود
            </Link>

            <div className="icon-wrap">
              <Mail size={28} color="#D4A017" />
            </div>

            <h1 className="card-title">فراموشی رمز عبور</h1>
            <p className="card-sub">
              ایمیل حساب خود را وارد کن. لینک بازیابی رمز عبور برات ارسال می‌شه.
            </p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label className="form-label">آدرس ایمیل</label>
              <input
                type="email"
                className="form-input"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {!loading && <span className="btn-shimmer" />}
                {loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
              </button>
            </form>
          </>
        ) : (
          <div className="success-wrap">
            <div className="success-icon">
              <CheckCircle size={32} color="#D4A017" />
            </div>
            <h2 className="success-title">ایمیل ارسال شد!</h2>
            <p className="success-desc">
              لینک بازیابی رمز عبور به
              <br />
              <span className="email-chip">{email}</span>
              <br />
              ارسال شد. ایمیل خود را چک کن.
            </p>
            <Link href="/login" className="btn-outline">
              بازگشت به صفحه ورود
            </Link>
            <button
              className="btn-outline"
              style={{
                marginTop: ".5rem",
                color: "#475569",
                borderColor: "rgba(255,255,255,.08)",
              }}
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              ارسال مجدد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
