"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { _id: string; name: string }[];
  brands: { _id: string; name: string }[];
  filters: {
    category: string;
    brand: string;
    minPrice?: number;
    maxPrice?: number;
  };
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="text-sm font-bold text-foreground">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  isOpen,
  onClose,
  categories,
  brands,
  filters,
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || "",
    max: filters.maxPrice || "",
  });

  useEffect(() => {
    setPriceRange({
      min: filters.minPrice || "",
      max: filters.maxPrice || "",
    });
  }, [filters.minPrice, filters.maxPrice]);

  const applyPriceFilter = () => {
    onFilterChange(
      "minPrice",
      priceRange.min ? Number(priceRange.min) : undefined,
    );
    onFilterChange(
      "maxPrice",
      priceRange.max ? Number(priceRange.max) : undefined,
    );
  };

  const hasActiveFilters = !!(
    filters.category ||
    filters.brand ||
    filters.minPrice ||
    filters.maxPrice
  );

  const activeFilterCount = [
    filters.category,
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* هدر */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground text-base">فیلترها</h3>
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-black shadow-glow">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* بدنه */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-0">
        {/* دسته‌بندی */}
        <Section title="دسته‌بندی">
          <div className="space-y-2">
            <label
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
                !filters.category
                  ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <input
                type="radio"
                name="category"
                value=""
                checked={!filters.category}
                onChange={() => onFilterChange("category", "")}
                className="hidden"
              />
              همه دسته‌بندی‌ها
            </label>
            {categories.map((cat) => (
              <label
                key={cat._id}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
                  filters.category === cat._id
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat._id}
                  checked={filters.category === cat._id}
                  onChange={() => onFilterChange("category", cat._id)}
                  className="hidden"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </Section>

        {/* برند */}
        {brands.length > 0 && (
          <Section title="برند">
            <div className="space-y-2">
              <label
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
                  !filters.brand
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="brand"
                  value=""
                  checked={!filters.brand}
                  onChange={() => onFilterChange("brand", "")}
                  className="hidden"
                />
                همه برندها
              </label>
              {brands.map((brand) => (
                <label
                  key={brand._id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
                    filters.brand === brand._id
                      ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="brand"
                    value={brand._id}
                    checked={filters.brand === brand._id}
                    onChange={() => onFilterChange("brand", brand._id)}
                    className="hidden"
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </Section>
        )}

        {/* محدوده قیمت */}
        <Section title="محدوده قیمت (تومان)">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  حداقل
                </label>
                <input
                  type="number"
                  placeholder="۰"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  حداکثر
                </label>
                <input
                  type="number"
                  placeholder="نامحدود"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full py-2.5 rounded-xl btn-gold text-sm font-bold shadow-gold hover:shadow-gold-strong transition-all"
            >
              اعمال قیمت
            </button>
          </div>
        </Section>
      </div>

      {/* فوتر - دکمه حذف فیلترها */}
      {hasActiveFilters && (
        <div className="px-5 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={() => {
              onClearFilters();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-500 dark:text-rose-400 font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
          >
            حذف همه فیلترها
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ==================== موبایل ==================== */}
      <div className="lg:hidden">
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
        />
        <aside
          className={`fixed top-0 right-0 h-full w-[300px] bg-card z-50 shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          dir="rtl"
        >
          {sidebarContent}
        </aside>
      </div>

      {/* ==================== دسکتاپ ==================== */}
      <aside
        className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 bg-card rounded-2xl border border-border self-start sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden shadow-premium"
        dir="rtl"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
