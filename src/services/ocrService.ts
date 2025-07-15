import axiosInstance from "@/api/AxiosInstance"; // or wherever your file is
import type { AadhaarInput, response, retrieveResponse, SaveResponse } from "@/types/adharType";

export async function sendAadhaarImages(frontImage: string, backImage: string){
    const response = await axiosInstance.post("/ocr/aadhar", {
      frontImage,
      backImage,
    });
  return response.data;
}

export const saveAadharData = async (data:AadhaarInput):Promise<SaveResponse> => {
    const response = await axiosInstance.post("/ocr/save", data);
    return response.data
};

export const fetchAllOcrData = async (limit:number,page:number):Promise<retrieveResponse> => {
    const response = await axiosInstance.get("/ocr/aadhar",
        {params:{limit,page}});
    return response.data;
  }


  export const deleteOcrData = async (ocrId: string):Promise<response> => {
    const response = await axiosInstance.delete(`/ocr/delete/${ocrId}`);
    return response.data;
  }