"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowRight,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Package,
  Flame,
  Zap,
  Star,
} from "lucide-react";
import api from "@/services/api/axios";

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface Flavor {
  name: string;
  inStock: boolean;
}

interface Specifications {
  weight: string;
  servingSize: string;
  servingsPerContainer: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
  caffeine: number;
  creatine: number;
  betaAlanine: number;
  bcaa: number;
  glutamine: number;
}

interface ProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  price: string;
  discountPrice: string;
  category: string;
  brand: string;
  stock: string;
  isActive: boolean;
  isFeatured: boolean;
  specifications: Specifications;
  flavors: Flavor[];
  ingredients: string[];
  howToUse: string;
  warnings: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const isEditMode = !!productId;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "basic" | "specs" | "flavors" | "details"
  >("basic");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    discountPrice: "",
    category: "",
    brand: "",
    stock: "",
    isActive: true,
    isFeatured: false,
    specifications: {
      weight: "",
      servingSize: "",
      servingsPerContainer: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      caffeine: 0,
      creatine: 0,
      betaAlanine: 0,
      bcaa: 0,
      glutamine: 0,
    },
    flavors: [{ name: "", inStock: true }],
    ingredients: [""],
    howToUse: "",
    warnings: "",
  });

  // دریافت دسته‌بندی‌ها و برندها
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get("/categories"),
          api.get("/brands"),
        ]);

        let cats: Category[] = [];
        let brnds: Brand[] = [];

        if (catRes.data?.data?.categories) cats = catRes.data.data.categories;
        else if (catRes.data?.data) cats = catRes.data.data;
        else if (Array.isArray(catRes.data)) cats = catRes.data;
        else if (catRes.data?.categories) cats = catRes.data.categories;

        if (brandRes.data?.data?.brands) brnds = brandRes.data.data.brands;
        else if (brandRes.data?.data) brnds = brandRes.data.data;
        else if (Array.isArray(brandRes.data)) brnds = brandRes.data;
        else if (brandRes.data?.brands) brnds = brandRes.data.brands;

        setCategories(cats);
        setBrands(brnds);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // دریافت اطلاعات محصول در حالت ویرایش
  useEffect(() => {
    if (isEditMode && productId) {
      fetchProductData();
    }
  }, [isEditMode, productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/id/${productId}`);
      if (response.data.success) {
        const product = response.data.data.product;
        setFormData({
          name: product.name || "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          price: product.price?.toString() || "",
          discountPrice: product.discountPrice?.toString() || "",
          category: product.category?._id || product.category || "",
          brand: product.brand?._id || product.brand || "",
          stock: product.stock?.toString() || "",
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          specifications: {
            weight: product.specifications?.weight || "",
            servingSize: product.specifications?.servingSize || "",
            servingsPerContainer:
              product.specifications?.servingsPerContainer || 0,
            calories: product.specifications?.calories || 0,
            protein: product.specifications?.protein || 0,
            carbs: product.specifications?.carbs || 0,
            fat: product.specifications?.fat || 0,
            sugar: product.specifications?.sugar || 0,
            sodium: product.specifications?.sodium || 0,
            caffeine: product.specifications?.caffeine || 0,
            creatine: product.specifications?.creatine || 0,
            betaAlanine: product.specifications?.betaAlanine || 0,
            bcaa: product.specifications?.bcaa || 0,
            glutamine: product.specifications?.glutamine || 0,
          },
          flavors: product.flavors?.length
            ? product.flavors.map((f: string) => ({ name: f, inStock: true }))
            : [{ name: "", inStock: true }],
          ingredients: product.ingredients?.length ? product.ingredients : [""],
          howToUse: product.howToUse || "",
          warnings: product.warnings || "",
        });
        setImageUrls(product.images || []);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("خطا در دریافت اطلاعات محصول");
    } finally {
      setLoading(false);
    }
  };

  // ==================== هندلرهای فرم ====================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSpecChange = (
    key: keyof Specifications,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value },
    }));
  };

  const addFlavor = () => {
    setFormData((prev) => ({
      ...prev,
      flavors: [...prev.flavors, { name: "", inStock: true }],
    }));
  };

  const removeFlavor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      flavors: prev.flavors.filter((_, i) => i !== index),
    }));
  };

  const updateFlavor = (
    index: number,
    field: keyof Flavor,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      flavors: prev.flavors.map((f, i) =>
        i === index ? { ...f, [field]: value } : f,
      ),
    }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? value : ing,
      ),
    }));
  };

  // ==================== آپلود تصویر ====================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadError("");

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setUploadError("فقط فایل‌های تصویری مجاز هستند.");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setUploadError("حجم هر تصویر نباید بیشتر از ۵ مگابایت باشد.");
          continue;
        }

        const fd = new FormData();
        fd.append("image", file);

        const res = await api.post("/upload", fd);
        const uploadedUrl = res.data?.data?.url;

        if (uploadedUrl) {
          setImageUrls((prev) => [...prev, uploadedUrl]);
        } else {
          setUploadError(res.data?.message || "آپلود ناموفق بود.");
        }
      }
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message;
      const status = err?.response?.status;
      let msg = serverMsg || "خطا در آپلود تصویر.";

      if (status === 401) msg = "دسترسی غیرمجاز — لطفاً دوباره وارد شوید.";
      else if (status === 403) msg = "فقط ادمین اجازه آپلود دارد.";
      else if (status === 413) msg = "حجم فایل بیشتر از حد مجاز است.";
      else if (!err?.response) msg = "ارتباط با سرور برقرار نشد.";

      setUploadError(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ==================== ذخیره نهایی ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (imageUrls.length === 0) {
      setError("حداقل یک تصویر برای محصول آپلود کنید.");
      return;
    }

    if (!formData.name.trim()) {
      setError("نام محصول الزامی است.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("قیمت محصول معتبر نیست.");
      return;
    }

    if (!formData.category) {
      setError("دسته‌بندی محصول الزامی است.");
      return;
    }

    if (!formData.brand) {
      setError("برند محصول الزامی است.");
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription?.trim() || "",
        price: Number(formData.price),
        discountPrice: formData.discountPrice
          ? Number(formData.discountPrice)
          : 0,
        category: formData.category,
        brand: formData.brand,
        stock: Number(formData.stock) || 0,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        images: imageUrls,
        flavors: formData.flavors
          .filter((f) => f.name?.trim())
          .map((f) => f.name.trim()),
        ingredients: formData.ingredients.filter((i) => i.trim()),
        howToUse: formData.howToUse?.trim() || "",
        warnings: formData.warnings?.trim() || "",
        specifications: {
          weight: formData.specifications.weight || "",
          servingSize: formData.specifications.servingSize || "",
          servingsPerContainer:
            Number(formData.specifications.servingsPerContainer) || 0,
          calories: Number(formData.specifications.calories) || 0,
          protein: Number(formData.specifications.protein) || 0,
          carbs: Number(formData.specifications.carbs) || 0,
          fat: Number(formData.specifications.fat) || 0,
          sugar: Number(formData.specifications.sugar) || 0,
          sodium: Number(formData.specifications.sodium) || 0,
          caffeine: Number(formData.specifications.caffeine) || 0,
          creatine: Number(formData.specifications.creatine) || 0,
          betaAlanine: Number(formData.specifications.betaAlanine) || 0,
          bcaa: Number(formData.specifications.bcaa) || 0,
          glutamine: Number(formData.specifications.glutamine) || 0,
        },
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/products/${productId}`, productData);
      } else {
        response = await api.post("/products", productData);
      }

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/products");
        }, 1500);
      } else {
        setError(response.data.message || "خطا در ثبت محصول");
      }
    } catch (err: any) {
      console.error("❌ Error:", err);
      console.error("📦 Response:", err.response?.data);
      setError(err.response?.data?.message || "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "input-luxury w-full px-4 py-2.5 text-sm transition-all duration-200";
  const labelClass =
    "block text-sm font-medium text-foreground/80 mb-1.5 transition";

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-primary/10 transition-all duration-200 group"
        >
          <ArrowRight className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gold-text">
            {isEditMode ? "ویرایش محصول" : "افزودن محصول جدید"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEditMode
              ? "اطلاعات محصول را ویرایش کنید"
              : "اطلاعات محصول را با دقت وارد کنید"}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {isEditMode
            ? "محصول با موفقیت ویرایش شد!"
            : "محصول با موفقیت ثبت شد!"}{" "}
          در حال انتقال...
        </div>
      )}

      <div className="flex gap-1 border-b border-border/60">
        {[
          { id: "basic", label: "اطلاعات پایه" },
          { id: "specs", label: "مشخصات فنی" },
          { id: "flavors", label: "طعم‌ها و ترکیبات" },
          { id: "details", label: "راهنما و هشدارها" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* تب اطلاعات پایه - همین کد قبلی */}
        {activeTab === "basic" && (
          <div className="card-luxury p-6 space-y-5">
            {/* کد تب اطلاعات پایه مثل قبل */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelClass}>نام محصول *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="مثال: پروتئین وی ایزوله گلد"
                />
              </div>

              <div>
                <label className={labelClass}>برند *</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">انتخاب برند</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>دسته‌بندی *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>قیمت اصلی (تومان) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className={inputClass}
                  placeholder="۰"
                />
              </div>

              <div>
                <label className={labelClass}>قیمت با تخفیف (تومان)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  min="0"
                  className={inputClass}
                  placeholder="۰"
                />
              </div>

              <div>
                <label className={labelClass}>موجودی *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className={inputClass}
                  placeholder="۰"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary/30 focus:ring-offset-0"
                  />
                  <span className="text-sm text-foreground/70 group-hover:text-foreground transition">
                    فعال بودن محصول
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary/30 focus:ring-offset-0"
                  />
                  <Star className="h-4 w-4 text-primary/60 group-hover:text-primary transition" />
                  <span className="text-sm font-medium text-primary/80 group-hover:text-primary transition">
                    محصول ویژه (نمایش در صفحه اصلی)
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className={labelClass}>توضیحات کوتاه (SEO)</label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                rows={2}
                className={inputClass}
                placeholder="توضیحات مختصر برای موتورهای جستجو..."
              />
            </div>

            <div>
              <label className={labelClass}>توضیحات کامل *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className={inputClass}
                placeholder="توضیحات کامل محصول..."
              />
            </div>

            {/* تصاویر */}
            <div>
              <h3 className="text-md font-bold gold-text mb-2">تصاویر محصول</h3>
              <p className="text-xs text-muted-foreground mb-4">
                فرمت‌های مجاز: JPG، PNG، WEBP — حداکثر ۵ مگابایت هر تصویر
              </p>
              {uploadError && (
                <div className="text-red-500 text-sm mb-2">{uploadError}</div>
              )}
              <div className="flex flex-wrap gap-4">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`تصویر ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded-xl border-2 border-border/50 group-hover:border-primary/50 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImageUrls((p) => p.filter((_, i) => i !== idx))
                      }
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 badge-gold text-[9px] px-1.5 py-0.5">
                        اصلی
                      </span>
                    )}
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors mt-1">
                        آپلود
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* تب مشخصات فنی */}
        {activeTab === "specs" && (
          <div className="space-y-5">
            <div className="card-luxury p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
                <Package className="h-5 w-5" />
                مشخصات فیزیکی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>وزن محصول</label>
                  <input
                    type="text"
                    value={formData.specifications.weight}
                    onChange={(e) => handleSpecChange("weight", e.target.value)}
                    className={inputClass}
                    placeholder="مثال: ۹۰۸ گرم"
                  />
                </div>
                <div>
                  <label className={labelClass}>حجم هر سروینگ</label>
                  <input
                    type="text"
                    value={formData.specifications.servingSize}
                    onChange={(e) =>
                      handleSpecChange("servingSize", e.target.value)
                    }
                    className={inputClass}
                    placeholder="مثال: ۱ پیمانه (۳۲ گرم)"
                  />
                </div>
                <div>
                  <label className={labelClass}>تعداد سروینگ</label>
                  <input
                    type="number"
                    value={formData.specifications.servingsPerContainer}
                    onChange={(e) =>
                      handleSpecChange(
                        "servingsPerContainer",
                        Number(e.target.value),
                      )
                    }
                    className={inputClass}
                    placeholder="مثال: ۲۸"
                  />
                </div>
              </div>
            </div>

            <div className="card-luxury p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
                <Flame className="h-5 w-5" />
                ارزش غذایی (هر سروینگ)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* کالری */}
                <div>
                  <label className={labelClass}>کالری</label>
                  <input
                    type="number"
                    value={formData.specifications.calories}
                    onChange={(e) =>
                      handleSpecChange("calories", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>پروتئین (گرم)</label>
                  <input
                    type="number"
                    value={formData.specifications.protein}
                    onChange={(e) =>
                      handleSpecChange("protein", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>کربوهیدرات (گرم)</label>
                  <input
                    type="number"
                    value={formData.specifications.carbs}
                    onChange={(e) =>
                      handleSpecChange("carbs", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>چربی (گرم)</label>
                  <input
                    type="number"
                    value={formData.specifications.fat}
                    onChange={(e) =>
                      handleSpecChange("fat", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>قند (گرم)</label>
                  <input
                    type="number"
                    value={formData.specifications.sugar}
                    onChange={(e) =>
                      handleSpecChange("sugar", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>سدیم (میلی‌گرم)</label>
                  <input
                    type="number"
                    value={formData.specifications.sodium}
                    onChange={(e) =>
                      handleSpecChange("sodium", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="card-luxury p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
                <Zap className="h-5 w-5" />
                مواد فعال (اختیاری)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>کافئین (میلی‌گرم)</label>
                  <input
                    type="number"
                    value={formData.specifications.caffeine}
                    onChange={(e) =>
                      handleSpecChange("caffeine", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>کراتین (گرم)</label>
                  <input
                    type="number"
                    value={formData.specifications.creatine}
                    onChange={(e) =>
                      handleSpecChange("creatine", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>بتا آلانین (گرم)</label>
                  <input
                    type="number"
                    value={formData.specifications.betaAlanine}
                    onChange={(e) =>
                      handleSpecChange("betaAlanine", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>BCAA (گرم)</label>
                  <input
                    type="number"
                    value={formData.specifications.bcaa}
                    onChange={(e) =>
                      handleSpecChange("bcaa", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>گلوتامین (گرم)</label>
                  <input
                    type="number"
                    value={formData.specifications.glutamine}
                    onChange={(e) =>
                      handleSpecChange("glutamine", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تب طعم‌ها و ترکیبات */}
        {activeTab === "flavors" && (
          <div className="space-y-5">
            <div className="card-luxury p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold gold-text">طعم‌های موجود</h3>
                <button
                  type="button"
                  onClick={addFlavor}
                  className="btn-gold-outline inline-flex items-center gap-1 text-sm px-3 py-1.5"
                >
                  <Plus className="h-4 w-4" /> افزودن طعم
                </button>
              </div>
              <div className="space-y-3">
                {formData.flavors.map((flavor, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={flavor.name}
                      onChange={(e) =>
                        updateFlavor(idx, "name", e.target.value)
                      }
                      className="flex-1 input-luxury px-3 py-2 text-sm"
                      placeholder="نام طعم"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flavor.inStock}
                        onChange={(e) =>
                          updateFlavor(idx, "inStock", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary/30"
                      />
                      <span className="text-sm text-foreground/70">موجود</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFlavor(idx)}
                      className="p-2 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-luxury p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold gold-text">ترکیبات</h3>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="btn-gold-outline inline-flex items-center gap-1 text-sm px-3 py-1.5"
                >
                  <Plus className="h-4 w-4" /> افزودن ترکیب
                </button>
              </div>
              <div className="space-y-2">
                {formData.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={ing}
                      onChange={(e) => updateIngredient(idx, e.target.value)}
                      className="flex-1 input-luxury px-3 py-2 text-sm"
                      placeholder="نام ترکیب"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="p-2 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* تب راهنما و هشدارها */}
        {activeTab === "details" && (
          <div className="card-luxury p-6 space-y-4">
            <div>
              <label className={labelClass}>نحوه مصرف</label>
              <textarea
                value={formData.howToUse}
                onChange={(e) =>
                  setFormData({ ...formData, howToUse: e.target.value })
                }
                rows={4}
                className={inputClass}
                placeholder="طرز مصرف مناسب محصول..."
              />
            </div>
            <div>
              <label className={labelClass}>هشدارها و نکات</label>
              <textarea
                value={formData.warnings}
                onChange={(e) =>
                  setFormData({ ...formData, warnings: e.target.value })
                }
                rows={3}
                className={inputClass}
                placeholder="هشدارهای مصرف..."
              />
            </div>
          </div>
        )}

        {/* دکمه‌ها */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-gold-outline px-5 py-2.5 text-sm font-medium"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-gold px-6 py-2.5 text-sm font-bold flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading
              ? "در حال ذخیره..."
              : isEditMode
                ? "ویرایش محصول"
                : "ذخیره محصول"}
          </button>
        </div>
      </form>
    </div>
  );
}
