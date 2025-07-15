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