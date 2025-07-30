import axiosInstance from "@/api/AxiosInstance";
import type { CustomError } from "@/types/adharType";
import axios from "axios";
import { toast } from "sonner";

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImage = async (file: File | null): Promise<string | null> => {
    try {

        if (!file) return null

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const cloudinaryResponse = await axios.post(import.meta.env.VITE_CLOUDINARY_URL, formData);
        return cloudinaryResponse.data.secure_url;

    } catch (error) {
        console.error("Error uploading to cloudinary", error);
        toast.error("Error uploading image");
        throw error;
    }
}


export const deleteImageFromCloudinary = async (publicId: string) => {
  try {
    const response = await axiosInstance.post("/cloudinary/delete", { publicId });
    return response.data;
  } catch (error) {
    const err  = error as CustomError
    console.error("Error deleting image:", err);
    throw new Error(err?.response?.data?.message || "Failed to delete image");
  }
};


