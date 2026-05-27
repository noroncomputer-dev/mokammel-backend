import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(50, "نام نباید بیشتر از ۵۰ کاراکتر باشد"),
  email: z.string().email("فرمت ایمیل صحیح نیست"),
  password: z
    .string()
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
    .max(32, "رمز عبور نباید بیشتر از ۳۲ کاراکتر باشد"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("فرمت ایمیل صحیح نیست"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
