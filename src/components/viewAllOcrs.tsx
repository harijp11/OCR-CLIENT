import React, { useState, useEffect } from "react";
import { fetchAllOcrData } from "@/services/ocrService";
import { deleteOcrData } from "@/services/ocrService";
import type { AadhaarInfo } from "@/types/adharType";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ViewAllOcr: React.FC = () => {
  const [ocrData, setOcrData] = useState<AadhaarInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [count, setCount] = useState<number>(0);
  const navigate = useNavigate();
  const limit = 3;

  useEffect(() => {
    refetchData(page);
  }, [page, limit])

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const refetchData = async (targetPage: number = page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllOcrData(limit, targetPage);
      if (response.AdhaarData && Array.isArray(response.AdhaarData)) {
        setOcrData(response.AdhaarData);
        setCount(response.count);
        setTotalPages(Math.ceil(response.count / limit));
        setPage(targetPage);
      } else {
        setOcrData([]);
        setTotalPages(0);
        setCount(0);
        setPage(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch OCR data.";
      console.error("Refetch Error:", errorMessage);
      setError(errorMessage);
      setOcrData([]);
      setTotalPages(0);
      setCount(0);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ocrId: string) => {
    try {
      await deleteOcrData(ocrId);
      
      // Calculate potential new state
      const newCount = count - 1;
      const newTotalPages = Math.ceil(newCount / limit);
      
      // Determine which page to fetch after deletion
      let targetPage = page;
      
      if (newCount === 0) {
        // If no data left, go to page 1
        targetPage = 1;
      } else if (ocrData.length === 1 && page > 1) {
        // If this was the last item on current page and we're not on page 1, go to previous page
        targetPage = page - 1;
      } else if (page > newTotalPages && newTotalPages > 0) {
        // If current page exceeds total pages, go to last page
        targetPage = newTotalPages;
      }
      
      // Refetch data for the target page
      await refetchData(targetPage);
      
      toast.success("OCR data deleted successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete OCR data.";
      console.error("Delete Error:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

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

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl w-full transform transition-all duration-300 hover:shadow-2xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackClick}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-extrabold text-blue-700 flex-1 text-center">
            View All Saved OCR Data
          </h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {loading && <p className="text-center text-gray-600">Loading...</p>}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}
        {!loading && !error && count === 0 && (
          <p className="text-center text-gray-600">No data available.</p>
        )}
        {!loading && !error && count > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ocrData.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 border border-gray-200 relative flex flex-col min-h-[500px]"
                >
                  <button
                    onClick={() => handleDelete(item._id)}
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
              ))}
            </div>

            {/* Only show pagination if there are multiple pages */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewAllOcr;