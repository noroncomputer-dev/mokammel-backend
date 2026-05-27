"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  MapPin,
  Edit,
  Trash2,
  Home,
  Building,
  Loader2,
} from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/addresses");
      if (response.data.success) {
        setAddresses(response.data.data.addresses);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      const response = await api.put(`/users/addresses/${addressId}/default`);
      if (response.data.success) {
        toast.success("آدرس پیش‌فرض با موفقیت تغییر کرد");
        fetchAddresses();
      }
    } catch (error) {
      toast.error("خطا در تغییر آدرس پیش‌فرض");
    }
  };

  const deleteAddress = async (addressId: string) => {
    setDeletingId(addressId);
    try {
      const response = await api.delete(`/users/addresses/${addressId}`);
      if (response.data.success) {
        toast.success("آدرس با موفقیت حذف شد");
        fetchAddresses();
      }
    } catch (error) {
      toast.error("خطا در حذف آدرس");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            آدرس‌های من
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            مدیریت آدرس‌های ارسال سفارش
          </p>
        </div>
        <Link
          href="/profile/addresses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
        >
          <Plus className="h-4 w-4" />
          آدرس جدید
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            هیچ آدرسی ثبت نشده است
          </p>
          <Link
            href="/profile/addresses/new"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm"
          >
            افزودن آدرس جدید
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 transition ${
                address.isDefault
                  ? "border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div
                    className={`p-2 rounded-xl ${address.isDefault ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800"}`}
                  >
                    {address.isDefault ? (
                      <Home className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Building className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {address.fullName}
                      </h3>
                      {address.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          آدرس پیش‌فرض
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {address.phone}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {address.province}، {address.city}، {address.address}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      کد پستی: {address.postalCode}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(address._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="تنظیم به عنوان پیش‌فرض"
                    >
                      <Home className="h-4 w-4" />
                    </button>
                  )}
                  <Link
                    href={`/profile/addresses/${address._id}/edit`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteAddress(address._id)}
                    disabled={deletingId === address._id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  >
                    {deletingId === address._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
