"use client";

import { Plus, Trash2, Sparkles } from "lucide-react";

interface SpecificationsProps {
  data: any;
  onChange: (data: any) => void;
}

export default function ProductSpecifications({
  data,
  onChange,
}: SpecificationsProps) {
  const inputClass =
    "w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all text-sm";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  const updateSpec = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const addFlavor = () => {
    updateSpec("flavors", [...data.flavors, { name: "", inStock: true }]);
  };

  const removeFlavor = (index: number) => {
    updateSpec(
      "flavors",
      data.flavors.filter((_: any, i: number) => i !== index),
    );
  };

  const updateFlavor = (index: number, field: string, value: any) => {
    const newFlavors = [...data.flavors];
    newFlavors[index] = { ...newFlavors[index], [field]: value };
    updateSpec("flavors", newFlavors);
  };

  const addIngredient = () => {
    updateSpec("ingredients", [...data.ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    updateSpec(
      "ingredients",
      data.ingredients.filter((_: any, i: number) => i !== index),
    );
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...data.ingredients];
    newIngredients[index] = value;
    updateSpec("ingredients", newIngredients);
  };

  return (
    <div className="space-y-6">
      {/* مشخصات فیزیکی */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 bg-gold-500 rounded-full" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            مشخصات فیزیکی
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>وزن محصول</label>
            <input
              type="text"
              value={data.specifications?.weight || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  weight: e.target.value,
                })
              }
              className={inputClass}
              placeholder="مثال: 908 گرم، 5 پوند"
            />
          </div>
          <div>
            <label className={labelClass}>حجم هر سروینگ</label>
            <input
              type="text"
              value={data.specifications?.servingSize || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  servingSize: e.target.value,
                })
              }
              className={inputClass}
              placeholder="مثال: 1 پیمانه (32 گرم)"
            />
          </div>
          <div>
            <label className={labelClass}>تعداد سروینگ</label>
            <input
              type="number"
              value={data.specifications?.servingsPerContainer || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  servingsPerContainer: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="مثال: 28"
            />
          </div>
        </div>
      </div>

      {/* ارزش غذایی */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 bg-gold-500 rounded-full" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            ارزش غذایی (هر سروینگ)
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>کالری</label>
            <input
              type="number"
              value={data.specifications?.calories || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  calories: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="کالری"
            />
          </div>
          <div>
            <label className={labelClass}>پروتئین (گرم)</label>
            <input
              type="number"
              value={data.specifications?.protein || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  protein: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="پروتئین"
            />
          </div>
          <div>
            <label className={labelClass}>کربوهیدرات (گرم)</label>
            <input
              type="number"
              value={data.specifications?.carbs || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  carbs: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="کربوهیدرات"
            />
          </div>
          <div>
            <label className={labelClass}>چربی (گرم)</label>
            <input
              type="number"
              value={data.specifications?.fat || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  fat: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="چربی"
            />
          </div>
          <div>
            <label className={labelClass}>قند (گرم)</label>
            <input
              type="number"
              value={data.specifications?.sugar || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  sugar: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="قند"
            />
          </div>
          <div>
            <label className={labelClass}>سدیم (میلی‌گرم)</label>
            <input
              type="number"
              value={data.specifications?.sodium || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  sodium: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="سدیم"
            />
          </div>
        </div>
      </div>

      {/* مواد فعال */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-4 h-4 text-gold-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            مواد فعال (اختیاری)
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>کافئین (میلی‌گرم)</label>
            <input
              type="number"
              value={data.specifications?.caffeine || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  caffeine: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="کافئین"
            />
          </div>
          <div>
            <label className={labelClass}>کراتین (گرم)</label>
            <input
              type="number"
              value={data.specifications?.creatine || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  creatine: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="کراتین"
            />
          </div>
          <div>
            <label className={labelClass}>بتا آلانین (گرم)</label>
            <input
              type="number"
              value={data.specifications?.betaAlanine || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  betaAlanine: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="بتا آلانین"
            />
          </div>
          <div>
            <label className={labelClass}>BCAA (گرم)</label>
            <input
              type="number"
              value={data.specifications?.bcaa || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  bcaa: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="BCAA"
            />
          </div>
          <div>
            <label className={labelClass}>گلوتامین (گرم)</label>
            <input
              type="number"
              value={data.specifications?.glutamine || ""}
              onChange={(e) =>
                updateSpec("specifications", {
                  ...data.specifications,
                  glutamine: parseInt(e.target.value) || 0,
                })
              }
              className={inputClass}
              placeholder="گلوتامین"
            />
          </div>
        </div>
      </div>

      {/* طعم‌ها */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gold-500 rounded-full" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              طعم‌های موجود
            </h3>
          </div>
          <button
            type="button"
            onClick={addFlavor}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gold-600 dark:text-gold-400 hover:bg-gold-500/10 rounded-xl transition-all"
          >
            <Plus className="h-4 w-4" /> افزودن طعم
          </button>
        </div>
        <div className="space-y-3">
          {data.flavors?.map((flavor: any, index: number) => (
            <div
              key={index}
              className="flex gap-3 items-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50"
            >
              <input
                type="text"
                value={flavor.name}
                onChange={(e) => updateFlavor(index, "name", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-gold-500"
                placeholder="نام طعم"
              />
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={flavor.inStock}
                  onChange={(e) =>
                    updateFlavor(index, "inStock", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300 focus:ring-gold-500"
                />
                موجود
              </label>
              <button
                type="button"
                onClick={() => removeFlavor(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {(!data.flavors || data.flavors.length === 0) && (
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center py-4">
            هنوز طعمی اضافه نشده است
          </p>
        )}
      </div>

      {/* ترکیبات */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gold-500 rounded-full" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              ترکیبات
            </h3>
          </div>
          <button
            type="button"
            onClick={addIngredient}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gold-600 dark:text-gold-400 hover:bg-gold-500/10 rounded-xl transition-all"
          >
            <Plus className="h-4 w-4" /> افزودن ترکیب
          </button>
        </div>
        <div className="space-y-2">
          {data.ingredients?.map((ingredient: string, index: number) => (
            <div
              key={index}
              className="flex gap-3 items-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50"
            >
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-gold-500"
                placeholder="نام ترکیب"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {(!data.ingredients || data.ingredients.length === 0) && (
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center py-4">
            هنوز ترکیبی اضافه نشده است
          </p>
        )}
      </div>

      {/* نحوه مصرف و هشدارها */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 bg-gold-500 rounded-full" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            راهنمای مصرف
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>نحوه مصرف</label>
            <textarea
              value={data.howToUse || ""}
              onChange={(e) => updateSpec("howToUse", e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="طرز مصرف مناسب محصول..."
            />
          </div>
          <div>
            <label className={labelClass}>هشدارها و نکات</label>
            <textarea
              value={data.warnings || ""}
              onChange={(e) => updateSpec("warnings", e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="هشدارهای مصرف..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
