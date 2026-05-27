import {
  TrendingUp,
  ShoppingBag,
  Users,
  Eye,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Package,
  DollarSign,
  Clock,
  Truck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// داده‌های آماری (موقتی - باید از API واقعی بیاید)
const stats = [
  {
    title: "فروش امروز",
    value: "۲,۰۰۰,۰۰۰",
    change: "+۲۳٪",
    trend: "up",
    icon: DollarSign,
    color: "text-gold-500",
    bg: "bg-gold-500/10",
  },
  {
    title: "سفارش جدید",
    value: "۴۵",
    change: "+۱۲٪",
    trend: "up",
    icon: ShoppingBag,
    color: "text-gold-500",
    bg: "bg-gold-500/10",
  },
  {
    title: "کل فروش ماه",
    value: "۳۸۰,۰۰۰,۰۰۰",
    change: "+۸٪",
    trend: "up",
    icon: TrendingUp,
    color: "text-gold-500",
    bg: "bg-gold-500/10",
  },
  {
    title: "مشتریان فعال",
    value: "۱,۲۴۰",
    change: "+۴۲٪",
    trend: "up",
    icon: Users,
    color: "text-gold-500",
    bg: "bg-gold-500/10",
  },
];

const recentOrders = [
  {
    id: "#۱۲۵",
    customer: "رضا کریمی",
    date: "۱۴۰۴/۰۲/۲۸",
    amount: "۳,۸۰۰,۰۰۰",
    status: "تحویل شده",
    statusColor:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    id: "#۱۲۳۴۶",
    customer: "امیر حسینی",
    date: "۱۴۰۴/۰۲/۲۷",
    amount: "۱,۲۰۰,۰۰۰",
    status: "در حال پردازش",
    statusColor:
      "bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300",
  },
  {
    id: "#۱۲۳",
    customer: "سارا احمدی",
    date: "۱۴۰۴/۰۲/۲۶",
    amount: "۹۵۰,۰۰۰",
    status: "ارسال شده",
    statusColor:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    id: "#۱۲۳۴",
    customer: "محمد رضایی",
    date: "۱۴۰۴/۰۲/۲۵",
    amount: "۴,۵۰۰,۰۰۰",
    status: "لغو شده",
    statusColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
];

const notifications = [
  {
    type: "order",
    title: "سفارش جدید",
    desc: "سفارش شماره ۱۳۴ ثبت شد",
    time: "۲ دقیقه پیش",
    icon: ShoppingBag,
  },
  {
    type: "alert",
    title: "هشدار موجودی",
    desc: "پروتئین وی گلد به ۵ عدد رسید",
    time: "۱ ساعت پیش",
    icon: Package,
  },
  {
    type: "user",
    title: "مشتری جدید",
    desc: "رضا کریمی ثبت‌نام کرد",
    time: "۳ ساعت پیش",
    icon: Users,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* هدر - طلایی لوکس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
              داشبورد مدیریت
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            سلام علی! 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            امروز یه روز فوق‌العاده برای فروش داری.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:border-gold-500 transition-all duration-200 shadow-sm">
            دانلود گزارش
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-gold-500/25">
            افزودن محصول
          </button>
        </div>
      </div>

      {/* کارت‌های آمار - طلایی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gold-500/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={stat.color} size={22} />
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stat.trend === "up"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-500 text-sm font-medium mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نمودار فروش */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 dark:text-white">
              نمودار فروش ماهانه
            </h3>
            <select className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-400 outline-none focus:border-gold-500">
              <option>ماه جاری</option>
              <option>ماه گذشته</option>
              <option>سال جاری</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
              <span className="text-sm">در حال توسعه...</span>
            </div>
          </div>
        </div>

        {/* اعلانات */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">اعلانات</h3>
            <button className="text-xs text-gold-500 hover:text-gold-600 font-medium transition-colors">
              علامت‌گذاری همه
            </button>
          </div>
          <div className="space-y-3">
            {notifications.map((note, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-gold-500/5 border border-gold-500/20 flex gap-3 items-start hover:bg-gold-500/10 transition-all duration-200"
              >
                <div className="p-1.5 rounded-lg bg-gold-500/10">
                  <note.icon className="w-4 h-4 text-gold-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {note.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {note.desc}
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    {note.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-xs text-gray-500 hover:text-gold-500 border-t border-gray-200 dark:border-gray-800 transition-colors">
            مشاهده همه اعلانات
          </button>
        </div>
      </div>

      {/* سفارشات اخیر */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">
            سفارشات اخیر
          </h3>
          <Link
            href="/admin/orders"
            className="text-sm text-gold-500 font-medium hover:text-gold-600 transition-colors flex items-center gap-1"
          >
            مشاهده همه
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3 text-right font-semibold">
                  شماره سفارش
                </th>
                <th className="px-5 py-3 text-right font-semibold">مشتری</th>
                <th className="px-5 py-3 text-right font-semibold">تاریخ</th>
                <th className="px-5 py-3 text-right font-semibold">مبلغ</th>
                <th className="px-5 py-3 text-right font-semibold">وضعیت</th>
                <th className="px-5 py-3 text-center font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <td className="px-5 py-4 font-mono font-medium text-gray-900 dark:text-white">
                    {order.id}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium">
                    {order.customer}
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                    {order.amount} تومان
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.statusColor}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button className="text-gray-400 hover:text-gold-500 transition-colors p-1 rounded hover:bg-gold-50 dark:hover:bg-gold-950/20">
                      جزئیات
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* آمار سریع */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center hover:border-gold-500/30 transition-all">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            نرخ تبدیل
          </span>
          <span className="block text-2xl font-black text-gold-500 mt-1">
            ۳.۲٪
          </span>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center hover:border-gold-500/30 transition-all">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            رضایت مشتری
          </span>
          <span className="block text-2xl font-black text-gold-500 mt-1">
            ۹۴٪
          </span>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center hover:border-gold-500/30 transition-all">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            بازگشت کالا
          </span>
          <span className="block text-2xl font-black text-gold-500 mt-1">
            ۲.۱٪
          </span>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center hover:border-gold-500/30 transition-all">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            هدف ماهانه
          </span>
          <span className="block text-2xl font-black text-emerald-500 mt-1">
            ۷۸٪
          </span>
        </div>
      </div>
    </div>
  );
}
