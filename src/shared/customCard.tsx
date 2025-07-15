import React from "react";
import type { AadhaarInfo } from "@/types/adharType";

interface OcrCardProps {
  item: AadhaarInfo;
  onDelete: (id: string) => void;
}

const OcrCard: React.FC<OcrCardProps> = ({ item, onDelete }) => {
  const formatDob = (dob: string | null) => {
    if (!dob) return <span className="text-gray-600">N/A</span>;
    const [day, month, year] = dob.split("/").map((part) => part.trim());
    return (
      <div className="flex justify-center items-center space-x-2 h-full">
        <span className="bg-red-100 text-red-600 font-bold px-2 py-1 rounded-md border border-red-200 flex items-center justify-center text-sm">
          {day}
        </span>
        <span className="text-gray-600 flex items-center text-sm">-</span>
        <span className="bg-green-100 text-green-600 font-bold px-2 py-1 rounded-md border border-green-200 flex items-center justify-center text-sm">
          {month}
        </span>
        <span className="text-gray-600 flex items-center text-sm">-</span>
        <span className="bg-blue-100 text-blue-600 font-bold px-2 py-1 rounded-md border border-blue-200 flex items-center justify-center text-sm">
          {year}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 border border-gray-200 relative flex flex-col min-h-[500px]">
      <button
        onClick={() => onDelete(item._id)}
        className="absolute top-4 right-4 bg-red-600 text-white px-2 py-2 rounded-full hover:bg-red-700 transition duration-300 w-10 h-10 flex items-center justify-center z-10"
      >
        <span className="text-xl">🗑️</span>
      </button>

      <div className="flex-1 pt-12 pb-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            <span className="bg-yellow-100 px-3 py-2 rounded text-sm">
              Name: {item.name ?? "N/A"}
            </span>
          </h3>
          
          <p className="text-gray-600">
            <span className="bg-indigo-100 px-3 py-2 rounded text-sm">
              Aadhaar Number: {item.aadharNumber ?? "N/A"}
            </span>
          </p>
          
          <div className="text-gray-600">
            <div className="mb-2 text-sm font-medium">DOB:</div>
            {formatDob(item.dob)}
          </div>
          
          <p className="text-gray-600">
            <span className="bg-purple-100 px-3 py-2 rounded text-sm">
              Gender: {item.gender ?? "N/A"}
            </span>
          </p>
          
          <p className="text-gray-600">
            <span className="bg-orange-100 px-3 py-2 rounded text-sm">
              Father's Name: {item.fatherName ?? "N/A"}
            </span>
          </p>
          
          <div className="text-gray-600">
            <span className="bg-teal-100 px-3 py-2 rounded text-sm inline-block">
              Address: {item.address ?? "N/A"}
            </span>
          </div>
          
          <p className="text-gray-600">
            <span className="bg-pink-100 px-3 py-2 rounded text-sm">
              Pincode: {item.pinCode ?? "N/A"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OcrCard;