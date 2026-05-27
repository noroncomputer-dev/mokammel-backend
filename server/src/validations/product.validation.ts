import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, "نام محصول باید حداقل ۲ کاراکتر باشد")
    .max(200, "نام محصول نباید بیشتر از ۲۰۰ کاراکتر باشد"),
  description: z.string().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
  shortDescription: z.string().max(300).optional(),
  price: z.number().min(0, "قیمت نمیتواند منفی باشد"),
  discountPrice: z.number().min(0).optional(),
  images: z.array(z.string()).default([]),
  category: z.string().min(1, "دسته‌بندی الزامی است"),
  brand: z.string().min(1, "برند الزامی است"),
  stock: z.number().min(0, "موجودی نمیتواند منفی باشد"),
  flavors: z.array(z.string()).default([]),
  weights: z.array(z.string()).default([]),
  nutritionFacts: z
    .object({
      servingSize: z.string().default(""),
      calories: z.number().default(0),
      protein: z.number().default(0),
      carbs: z.number().default(0),
      fat: z.number().default(0),
      extra: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .optional(),
    })
    .optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
