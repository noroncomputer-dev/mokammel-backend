"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import {
  Zap,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { resetPassword, isLoading } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) || /[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    return s;
  };
  const strength = passwordStrength();
  const strengthMeta = [
    null,
    { label: "ضعیف", color: "#ef4444" },
    { label: "متوسط", color: "#f97316" },
    { label: "خوب", color: "#eab308" },
    { label: "قوی", color: "#D4A017" },
  ][strength];

  const match = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }
    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }
    setLoading(true);
    const success = await resetPassword(token, password);
    setLoading(false);
    if (success) {
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } else {
      setError("لینک نامعتبر یا منقضی شده است. دوباره درخواست دهید.");
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
        .glow-center { width:700px;height:700px;background:rgba(163,230,53,.05);top:50%;left:50%;transform:translate(-50%,-50%); }
        .glow-tr { width:350px;height:350px;background:rgba(59,130,246,.06);top:-100px;left:-50px; }

        .card { position:relative;z-index:2;width:100%;max-width:460px;background:rgba(15,23,35,.95);border:1px solid rgba(255,255,255,.08);border-radius:28px;padding:3rem 2.5rem;backdrop-filter:blur(20px);box-shadow:0 30px 70px rgba(0,0,0,.6); }

        .logo { display:flex;align-items:center;gap:8px;margin-bottom:2rem; }
        .logo-icon { width:36px;height:36px;background:#D4A017;border-radius:9px;display:flex;align-items:center;justify-content:center; }
        .logo-text { font-size:1.1rem;font-weight:900;color:#fff; }

        .back-link { display:inline-flex;align-items:center;gap:6px;color:#475569;font-size:.82rem;text-decoration:none;margin-bottom:2rem;transition:color .2s; }
        .back-link:hover { color:#D4A017; }

        .icon-wrap { width:64px;height:64px;background:rgba(163,230,53,.1);border:1px solid rgba(163,230,53,.2);border-radius:18px;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem; }
        .card-title { font-size:1.75rem;font-weight:900;color:#fff;margin-bottom:.5rem; }
        .card-sub { color:#475569;font-size:.9rem;line-height:1.7;margin-bottom:2rem; }

        .form-group { margin-bottom:1.25rem; }
        .form-label { display:block;font-size:.78rem;font-weight:600;color:#94a3b8;margin-bottom:.45rem;letter-spacing:.3px; }
        .input-wrap { position:relative; }
        .form-input { width:100%;padding:.875rem 1rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#f0f4f8;font-family:'Vazirmatn',sans-serif;font-size:.95rem;outline:none;transition:all .2s;direction:ltr;text-align:right; }
        .form-input::placeholder { color:#334155; }
        .form-input:focus { border-color:#D4A017;background:rgba(163,230,53,.04);box-shadow:0 0 0 3px rgba(163,230,53,.08); }
        .form-input.has-eye { padding-left:2.5rem; }
        .form-input.input-match { border-color:rgba(163,230,53,.4); }
        .input-eye { position:absolute;left:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#475569;display:flex;align-items:center;padding:4px;transition:color .2s; }
        .input-eye:hover { color:#D4A017; }
        .input-check { position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none; }

        .strength-bar { display:flex;gap:4px;margin-top:8px; }
        .strength-seg { height:3px;flex:1;border-radius:9px;background:rgba(255,255,255,.08);transition:background .3s; }
        .strength-row { display:flex;justify-content:space-between;align-items:center;margin-top:5px; }
        .strength-hint { font-size:.7rem;color:#334155; }

        .error-box { background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:.7rem 1rem;color:#fca5a5;font-size:.82rem;text-align:center;margin-bottom:1.25rem; }

        .btn-primary { width:100%;padding:.9rem;background:#D4A017;color:#080c10;border:none;border-radius:12px;font-family:'Vazirmatn',sans-serif;font-size:1rem;font-weight:800;cursor:pointer;transition:all .2s;position:relative;overflow:hidden; }
        .btn-primary:hover:not(:disabled) { background:#bef264;transform:translateY(-1px);box-shadow:0 8px 25px rgba(163,230,53,.3); }
        .btn-primary:disabled { opacity:.5;cursor:not-allowed; }
        .btn-shimmer { position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);animation:shimmer 2s infinite; }
        @keyframes shimmer{to{left:200%;}}

        /* Success */
        .success-wrap { text-align:center; }
        .success-icon { width:80px;height:80px;background:rgba(163,230,53,.12);border:1px solid rgba(163,230,53,.25);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;animation:popIn .5s cubic-bezier(.175,.885,.32,1.275); }
        @keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
        .success-title { font-size:1.65rem;font-weight:900;color:#fff;margin-bottom:.75rem; }
        .success-desc { color:#64748b;font-size:.9rem;line-height:1.8;margin-bottom:.5rem; }
        .redirect-note { font-size:.78rem;color:#334155;margin-bottom:1.75rem; }
        .progress-bar { height:3px;background:rgba(255,255,255,.07);border-radius:9px;overflow:hidden;margin-bottom:1.75rem; }
        .progress-fill { height:100%;background:#D4A017;width:0;animation:fillBar 3s linear forwards; }
        @keyframes fillBar{to{width:100%;}}
        .btn-outline { width:100%;padding:.875rem;background:transparent;color:#D4A017;border:1px solid rgba(163,230,53,.3);border-radius:12px;font-family:'Vazirmatn',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;text-decoration:none;display:block;text-align:center; }
        .btn-outline:hover { background:rgba(163,230,53,.08);border-color:#D4A017; }
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow glow-center" />
      <div className="bg-glow glow-tr" />

      <div className="card">
        {!done ? (
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
              <ShieldCheck size={28} color="#D4A017" />
            </div>

            <h1 className="card-title">رمز عبور جدید</h1>
            <p className="card-sub">
              رمز عبور قوی و جدیدی برای حساب خود انتخاب کن.
            </p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">رمز عبور جدید</label>
                <div className="input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input has-eye"
                    placeholder="حداقل ۶ کاراکتر"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {password && (
                  <>
                    <div className="strength-bar">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="strength-seg"
                          style={{
                            background:
                              i <= strength && strengthMeta
                                ? strengthMeta.color
                                : undefined,
                          }}
                        />
                      ))}
                    </div>
                    <div className="strength-row">
                      <span className="strength-hint">قدرت رمز عبور</span>
                      {strengthMeta && (
                        <span
                          style={{
                            fontSize: ".7rem",
                            color: strengthMeta.color,
                          }}
                        >
                          {strengthMeta.label}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">تکرار رمز عبور جدید</label>
                <div className="input-wrap">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={`form-input has-eye${match ? " input-match" : ""}`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {match ? (
                    <span className="input-check">
                      <CheckCircle size={16} color="#D4A017" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="input-eye"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {!loading && <span className="btn-shimmer" />}
                {loading ? "در حال تغییر..." : "ثبت رمز عبور جدید"}
              </button>
            </form>
          </>
        ) : (
          <div className="success-wrap">
            <div className="success-icon">
              <CheckCircle size={36} color="#D4A017" />
            </div>
            <h2 className="success-title">رمز عبور تغییر کرد!</h2>
            <p className="success-desc">رمز عبور جدید با موفقیت ذخیره شد.</p>
            <p className="redirect-note">
              به‌زودی به صفحه ورود منتقل می‌شوی...
            </p>
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
            <Link href="/login" className="btn-outline">
              ورود به حساب
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
