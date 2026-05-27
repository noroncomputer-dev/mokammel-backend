"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
}

export default function AvatarUpload({
  currentAvatar,
  onAvatarChange,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // اعتبارسنجی
    if (!file.type.startsWith("image/")) {
      toast.error("فایل انتخابی باید تصویر باشد");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم تصویر نباید بیشتر از ۲ مگابایت باشد");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/upload", formData);
      const imageUrl = response.data.data?.url;

      if (imageUrl) {
        await api.put("/users/avatar", { avatarUrl: imageUrl });
        onAvatarChange(imageUrl);
        toast.success("عکس پروفایل با موفقیت آپدیت شد");
      }
    } catch (error) {
      toast.error("خطا در آپلود عکس");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt="آواتار"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
            ?
          </div>
        )}
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
