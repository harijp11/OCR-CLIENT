import React, { useState, useEffect } from "react";
import { fetchAllOcrData } from "@/services/ocrService";
import { deleteOcrData } from "@/services/ocrService";
import type { AadhaarInfo } from "@/types/adharType";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import OcrCard from "@/shared/customCard"; // Import the separated card component

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
                <OcrCard
                  key={item._id}
                  item={item}
                  onDelete={handleDelete}
                />
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