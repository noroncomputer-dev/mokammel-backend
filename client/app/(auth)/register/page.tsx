"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { Eye, EyeOff, Zap, Check } from "lucide-react";

export default function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) || /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    return s;
  };
  const strength = passwordStrength();
  const strengthLabel = ["", "ضعیف", "متوسط", "خوب", "قوی"][strength];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#D4A017"][
    strength
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }
    if (formData.password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }
    setLoading(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.phone || undefined,
    );
    setLoading(false);
    if (result.success) {
      // از window.location استفاده می‌کنیم تا کوکی به‌درستی propagate شود
      // و middleware در رفرش بعدی توکن جدید را ببیند (جلوگیری از حلقه ریدایرکت)
      window.location.href = "/";
      return;
    } else {
      setError(result.message || "ثبت‌نام با مشکل مواجه شد. لطفاً دوباره تلاش کن.");
    }
  };

  return (
    <div className="auth-root" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-root { font-family:'Vazirmatn',sans-serif; min-height:100vh; display:flex; background:#080c10; color:#f0f4f8; }
        .auth-panel { display:none; position:relative; width:42%; overflow:hidden; background:linear-gradient(145deg,#0d1117 0%,#0a1628 100%); }
        @media(min-width:1024px){ .auth-panel{display:flex;flex-direction:column;justify-content:space-between;padding:3rem;} }
        .panel-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(163,230,53,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(163,230,53,.06) 1px,transparent 1px);background-size:40px 40px; }
        .panel-glow { position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none; }
        .glow-1 { width:400px;height:400px;background:rgba(163,230,53,.12);top:-100px;right:-100px; }
        .glow-2 { width:300px;height:300px;background:rgba(59,130,246,.08);bottom:100px;left:-50px; }
        .panel-logo { position:relative;z-index:2;display:flex;align-items:center;gap:10px; }
        .logo-icon { width:40px;height:40px;background:#D4A017;border-radius:10px;display:flex;align-items:center;justify-content:center; }
        .logo-text { font-size:1.25rem;font-weight:900;color:#fff;letter-spacing:-0.5px; }
        .logo-sub { font-size:.7rem;color:#D4A017;letter-spacing:2px;text-transform:uppercase; }
        .panel-hero { position:relative;z-index:2; }
        .panel-tagline { font-size:2.5rem;font-weight:900;line-height:1.15;color:#fff;margin-bottom:1.25rem; }
        .panel-tagline span { color:#D4A017; }
        .panel-desc { color:#64748b;font-size:.92rem;line-height:1.85; }
        .perks { position:relative;z-index:2;display:flex;flex-direction:column;gap:.75rem; }
        .perk-item { display:flex;align-items:center;gap:10px;color:#94a3b8;font-size:.85rem; }
        .perk-check { width:22px;height:22px;background:rgba(163,230,53,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .auth-form-wrap { flex:1;display:flex;align-items:center;justify-content:center;padding:2rem 1.5rem;position:relative;overflow:hidden;overflow-y:auto; }
        .form-bg-dot { position:absolute;inset:0;background-image:radial-gradient(circle,rgba(163,230,53,.04) 1px,transparent 1px);background-size:24px 24px; }
        .auth-card { position:relative;z-index:2;width:100%;max-width:430px;background:rgba(15,23,35,.9);border:1px solid rgba(255,255,255,.07);border-radius:24px;padding:2.25rem 2rem;backdrop-filter:blur(20px);box-shadow:0 25px 60px rgba(0,0,0,.5),0 0 0 1px rgba(163,230,53,.05) inset; }
        .card-header { text-align:center;margin-bottom:1.75rem; }
        .mobile-logo { display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:1.25rem; }
        @media(min-width:1024px){ .mobile-logo{display:none;} }
        .card-title { font-size:1.65rem;font-weight:900;color:#fff;margin-bottom:.3rem; }
        .card-sub { color:#475569;font-size:.85rem; }
        .form-row { display:grid;grid-template-columns:1fr 1fr;gap:1rem; }
        .form-group { margin-bottom:1.1rem; }
        .form-label { display:block;font-size:.78rem;font-weight:600;color:#94a3b8;margin-bottom:.45rem;letter-spacing:.3px; }
        .input-wrap { position:relative; }
        .form-input { width:100%;padding:.8rem 1rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#f0f4f8;font-family:'Vazirmatn',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s,background .2s,box-shadow .2s;direction:ltr;text-align:right; }
        .form-input::placeholder { color:#334155; }
        .form-input:focus { border-color:#D4A017;background:rgba(163,230,53,.04);box-shadow:0 0 0 3px rgba(163,230,53,.08); }
        .input-eye { position:absolute;left:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#475569;display:flex;align-items:center;padding:4px;transition:color .2s; }
        .input-eye:hover { color:#D4A017; }
        .strength-bar { display:flex;gap:4px;margin-top:8px; }
        .strength-seg { height:3px;flex:1;border-radius:9px;background:rgba(255,255,255,.08);transition:background .3s; }
        .strength-label { font-size:.72rem;color:#64748b;margin-top:4px;text-align:right; }
        .error-box { background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:.7rem 1rem;color:#fca5a5;font-size:.82rem;text-align:center;margin-bottom:1.1rem; }
        .btn-primary { width:100%;padding:.875rem;background:#D4A017;color:#080c10;border:none;border-radius:12px;font-family:'Vazirmatn',sans-serif;font-size:.95rem;font-weight:800;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;margin-top:.25rem; }
        .btn-primary:hover:not(:disabled) { background:#bef264;transform:translateY(-1px);box-shadow:0 8px 25px rgba(163,230,53,.3); }
        .btn-primary:disabled { opacity:.5;cursor:not-allowed; }
        .btn-shimmer { position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);animation:shimmer 2s infinite; }
        @keyframes shimmer { to { left:200%; } }
        .form-footer { text-align:center;margin-top:1.25rem;font-size:.84rem;color:#475569; }
        .form-footer a { color:#D4A017;font-weight:700;text-decoration:none; }
        .form-footer a:hover { opacity:.8; }
        .optional-tag { font-size:.7rem;color:#334155;margin-right:4px; }
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
            عضو خانواده
            <br />
            <span>مکمل‌شاپ</span>
            <br />
            بشو
          </div>
          <p className="panel-desc">
            بزرگ‌ترین فروشگاه آنلاین مکمل ورزشی
            <br />
            در ایران با بیش از ۵۰۰ محصول اورجینال
          </p>
        </div>
        <div className="perks">
          {[
            "ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان",
            "ضمانت اصالت کالا روی تمام محصولات",
            "پشتیبانی ۲۴ ساعته متخصصین تغذیه ورزشی",
            "تخفیف ویژه اعضا در مناسبت‌های خاص",
          ].map((t, i) => (
            <div className="perk-item" key={i}>
              <div className="perk-check">
                <Check size={13} color="#D4A017" />
              </div>
              <span>{t}</span>
            </div>
          ))}
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
            <h1 className="card-title">ایجاد حساب کاربری</h1>
            <p className="card-sub">به جمع ورزشکاران حرفه‌ای بپیوند</p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">نام و نام خانوادگی</label>
                <input
                  name="name"
                  className="form-input"
                  placeholder="علی رضایی"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  تلفن <span className="optional-tag">(اختیاری)</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="09120000000"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ direction: "ltr", textAlign: "right" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ایمیل</label>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">رمز عبور</label>
              <div className="input-wrap">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: "2.5rem" }}
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
              {formData.password && (
                <>
                  <div className="strength-bar">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="strength-seg"
                        style={{
                          background: i <= strength ? strengthColor : undefined,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    className="strength-label"
                    style={{ color: strengthColor }}
                  >
                    {strengthLabel}
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">تکرار رمز عبور</label>
              <div className="input-wrap">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
                <button
                  type="button"
                  className="input-eye"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {!loading && <span className="btn-shimmer" />}
              {loading ? "در حال ثبت‌نام..." : "ایجاد حساب کاربری"}
            </button>
          </form>

          <p className="form-footer">
            قبلاً عضو شدی؟ <Link href="/login">وارد شو</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
