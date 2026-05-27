"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Search,
  X,
  Users as UsersIcon,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Sparkles,
  Shield,
} from "lucide-react";
import api from "../../../services/api/axios";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  addresses: any[];
  orders: any[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    isActive: true,
  });

  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        params: { page, limit, search: search || undefined },
      });

      let usersList: User[] = [];
      let pagination = { pages: 1 };

      if (res.data?.data?.users) {
        usersList = res.data.data.users;
        pagination = res.data.data.pagination || { pages: 1 };
      } else if (res.data?.users) {
        usersList = res.data.users;
        pagination = res.data.pagination || { pages: 1 };
      } else if (Array.isArray(res.data)) {
        usersList = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        usersList = res.data.data;
      }

      setUsers(usersList);
      setTotalPages(pagination.pages || 1);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "user",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("نام و ایمیل الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error saving user:", error);
      alert(error.response?.data?.message || "خطا در ذخیره کاربر");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteId}`);
      setDeleteId(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert(error.response?.data?.message || "خطا در حذف کاربر");
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="badge-gold bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800">
            <Shield className="h-3 w-3 inline ml-1" />
            مدیر
          </span>
        );
      case "moderator":
        return (
          <span className="badge-gold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            مدیر محتوا
          </span>
        );
      default:
        return (
          <span className="badge-gold bg-muted text-muted-foreground border-border">
            کاربر عادی
          </span>
        );
    }
  };

  const inputClass =
    "input-luxury w-full px-4 py-2.5 text-sm transition-all duration-200";
  const labelClass =
    "block text-sm font-medium text-foreground/80 mb-1.5 transition";

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==================== هدر طلایی ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
              پنل مدیریت
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gold-text">
            مدیریت مشتریان
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت و ویرایش اطلاعات کاربران فروشگاه
          </p>
        </div>
        <div className="badge-gold text-sm">
          <UsersIcon className="h-3.5 w-3.5 inline ml-1" />
          مجموع: {users.length} کاربر
        </div>
      </div>

      {/* ==================== جستجو با استایل طلایی ==================== */}
      <div className="card-luxury overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجوی کاربر (نام، ایمیل، تلفن)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-luxury w-full pr-10 pl-4 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ==================== جدول کاربران لوکس ==================== */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <UsersIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">کاربری یافت نشد</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    نام
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    ایمیل
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    تلفن
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    نقش
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    تاریخ ثبت نام
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="group hover:bg-muted/30 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UsersIcon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {user.phone || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.isActive ? (
                        <span className="badge-gold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="h-3 w-3 inline ml-1" /> فعال
                        </span>
                      ) : (
                        <span className="badge-gold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                          <XCircle className="h-3 w-3 inline ml-1" /> غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 group/btn"
                          title="ویرایش"
                        >
                          <Pencil className="h-4 w-4 text-primary/70 group-hover/btn:text-primary transition-colors" />
                        </button>
                        <button
                          onClick={() => setDeleteId(user._id)}
                          className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200 group/btn"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500/70 group-hover/btn:text-rose-500 transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ==================== صفحه‌بندی طلایی ==================== */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              صفحه <span className="text-primary font-medium">{page}</span> از{" "}
              {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent transition-all duration-200 text-sm font-medium"
              >
                قبلی
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent transition-all duration-200 text-sm font-medium"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== مودال ویرایش کاربر لوکس ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-luxury max-w-md w-full p-6 shadow-2xl animate-fadeUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold gold-text flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                ویرایش کاربر
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-muted transition-all duration-200"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>نام *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className={inputClass}
                  placeholder="نام کامل"
                />
              </div>
              <div>
                <label className={labelClass}>ایمیل *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className={inputClass}
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className={labelClass}>تلفن</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={inputClass}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                />
              </div>
              <div>
                <label className={labelClass}>نقش</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                  className={inputClass}
                >
                  <option value="user">کاربر عادی</option>
                  <option value="moderator">مدیر محتوا</option>
                  <option value="admin">مدیر کل</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary/30 focus:ring-offset-0"
                  />
                  <span className="text-sm text-foreground/70 group-hover:text-foreground transition">
                    فعال بودن
                  </span>
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-gold-outline px-5 py-2 text-sm font-medium"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold px-5 py-2 text-sm font-bold flex items-center gap-2"
                >
                  {submitting && (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  )}
                  {submitting ? "در حال ذخیره..." : "ذخیره"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== دیالوگ حذف لوکس ==================== */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-luxury max-w-md w-full p-6 shadow-2xl animate-fadeUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">حذف کاربر</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              آیا از حذف این کاربر اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-gold-outline px-5 py-2 text-sm font-medium"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold transition-all duration-200 shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                )}
                {deleting ? "در حال حذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
