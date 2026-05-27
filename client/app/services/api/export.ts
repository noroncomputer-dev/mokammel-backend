import api from "./axios";

// ذخیره فایل در کامپیوتر
const saveToFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// گزارش سفارشات به صورت TEXT
export const exportOrdersToText = async (filters?: any) => {
  try {
    const response = await api.get("/orders", { params: filters });
    const orders = response.data.data?.orders || response.data.orders || [];

    let reportText = "=".repeat(60) + "\n";
    reportText += "گزارش سفارشات فروشگاه\n";
    reportText += `تاریخ: ${new Date().toLocaleDateString("fa-IR")}\n`;
    reportText += `ساعت: ${new Date().toLocaleTimeString("fa-IR")}\n`;
    reportText += "=".repeat(60) + "\n\n";

    reportText += `تعداد کل سفارشات: ${orders.length}\n`;
    reportText += "-".repeat(60) + "\n\n";

    orders.forEach((order: any, index: number) => {
      reportText += `[${index + 1}] شماره سفارش: ${order.orderNumber || order._id.slice(-8)}\n`;
      reportText += `   مشتری: ${order.user?.name || "مهمان"}\n`;
      reportText += `   تلفن: ${order.shippingAddress?.phone || "-"}\n`;
      reportText += `   آدرس: ${order.shippingAddress?.address || "-"}\n`;
      reportText += `   تاریخ: ${new Date(order.createdAt).toLocaleDateString("fa-IR")}\n`;
      reportText += `   وضعیت: ${order.status}\n`;
      reportText += `   مبلغ: ${order.finalPrice.toLocaleString("fa-IR")} تومان\n`;
      reportText += `   محصولات:\n`;
      order.items?.forEach((item: any) => {
        reportText += `      - ${item.name} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString("fa-IR")} تومان\n`;
      });
      reportText += "-".repeat(40) + "\n";
    });

    reportText += "\n" + "=".repeat(60) + "\n";
    reportText += `جمع کل سفارشات: ${orders.reduce((sum: number, o: any) => sum + o.finalPrice, 0).toLocaleString("fa-IR")} تومان\n`;
    reportText += "=".repeat(60);

    saveToFile(
      reportText,
      `orders_report_${new Date().toISOString().slice(0, 19)}.txt`,
    );
    return true;
  } catch (error) {
    console.error("Error exporting orders:", error);
    return false;
  }
};

// ✅ اصلاح شده - گزارش محصولات پرفروش

export const exportTopProductsToText = async () => {
  try {
    // ✅ اصلاح مسیر: /products/bestsellers → /products/best-sellers
    const response = await api.get("/products/best-sellers", {
      params: { limit: 50 },
    });

    // ساختار پاسخ را چک کن
    let products = [];
    if (response.data?.data?.products) {
      products = response.data.data.products;
    } else if (response.data?.products) {
      products = response.data.products;
    } else if (Array.isArray(response.data)) {
      products = response.data;
    }

    if (products.length === 0) {
      console.warn("No products found");
      return false;
    }

    let reportText = "=".repeat(60) + "\n";
    reportText += "📊 گزارش محصولات پرفروش\n";
    reportText += `📅 تاریخ: ${new Date().toLocaleDateString("fa-IR")}\n`;
    reportText += "=".repeat(60) + "\n\n";

    reportText += `📦 تعداد محصولات: ${products.length}\n\n`;

    products.forEach((product: any, index: number) => {
      const soldCount = product.sold || product.soldCount || 0;
      reportText += `${index + 1}. ${product.name}\n`;
      reportText += `   🏷️ برند: ${product.brand?.name || "-"}\n`;
      reportText += `   📂 دسته: ${product.category?.name || "-"}\n`;
      reportText += `   💰 قیمت: ${product.price?.toLocaleString("fa-IR") || 0} تومان\n`;
      reportText += `   📦 موجودی: ${product.stock || 0} عدد\n`;
      reportText += `   🔥 تعداد فروش: ${soldCount.toLocaleString("fa-IR")}\n`;
      reportText += "-".repeat(40) + "\n";
    });

    saveToFile(
      reportText,
      `top_products_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`,
    );
    return true;
  } catch (error: any) {
    console.error("Error exporting top products:", error);
    console.error("Response:", error.response?.data);
    return false;
  }
};

// گزارش کاربران
export const exportUsersToText = async () => {
  try {
    const response = await api.get("/users");
    const users = response.data.data?.users || response.data.users || [];

    let reportText = "=".repeat(60) + "\n";
    reportText += "گزارش کاربران فروشگاه\n";
    reportText += `تاریخ: ${new Date().toLocaleDateString("fa-IR")}\n`;
    reportText += "=".repeat(60) + "\n\n";

    reportText += `تعداد کل کاربران: ${users.length}\n\n`;

    users.forEach((user: any, index: number) => {
      reportText += `${index + 1}. نام: ${user.name}\n`;
      reportText += `   ایمیل: ${user.email}\n`;
      reportText += `   تلفن: ${user.phone || "-"}\n`;
      reportText += `   نقش: ${user.role === "admin" ? "مدیر" : "کاربر"}\n`;
      reportText += `   تاریخ ثبت نام: ${new Date(user.createdAt).toLocaleDateString("fa-IR")}\n`;
      reportText += "-".repeat(40) + "\n";
    });

    saveToFile(
      reportText,
      `users_report_${new Date().toISOString().slice(0, 19)}.txt`,
    );
    return true;
  } catch (error) {
    console.error("Error exporting users:", error);
    return false;
  }
};
