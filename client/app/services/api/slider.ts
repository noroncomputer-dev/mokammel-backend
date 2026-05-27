import axiosInstance from "./axios";

export interface Slider {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  order: number;
  isActive: boolean;
  buttonText: string;
  createdAt: string;
  updatedAt: string;
}

const sliderService = {
  // دریافت اسلایدهای فعال (صفحه اصلی)
  getActiveSlides: async (): Promise<Slider[]> => {
    const response = await axiosInstance.get("/sliders/active");
    return response.data.data.slides;
  },

  // دریافت همه اسلایدها (ادمین)
  getAllSlides: async (): Promise<Slider[]> => {
    const response = await axiosInstance.get("/sliders");
    return response.data.data.slides;
  },

  // ایجاد اسلاید جدید
  createSlide: async (data: Partial<Slider>): Promise<Slider> => {
    const response = await axiosInstance.post("/sliders", data);
    return response.data.data.slide;
  },

  // بروزرسانی اسلاید
  updateSlide: async (id: string, data: Partial<Slider>): Promise<Slider> => {
    const response = await axiosInstance.put(`/sliders/${id}`, data);
    return response.data.data.slide;
  },

  // حذف اسلاید
  deleteSlide: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/sliders/${id}`);
  },
};

export default sliderService;
