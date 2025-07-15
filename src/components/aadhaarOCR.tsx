import React, { useState } from 'react';
import { uploadImage } from '@/services/cloudinaryService';
import { sendAadhaarImages } from '@/services/ocrService';
import { saveAadharData } from '@/services/ocrService'; // Adjust the import path as needed
import type { AadhaarInput } from '@/types/adharType';
import { useNavigate } from 'react-router-dom';

interface AadhaarDetails {
  name: string | null;
  aadharNumber: string | null;
  dob: string | null;
  gender: string | null;
  address: string | null;
  pinCode: string | null;
  fatherName: string | null;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const AadhaarOCR: React.FC = () => {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [details, setDetails] = useState<AadhaarDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editedDetails, setEditedDetails] = useState<AadhaarInput>({
    dob: null,
    aadharNumber: null,
    gender: null,
    name: null,
    fatherName: null,
    address: null,
    pinCode: '',
  });
  
  const navigate = useNavigate()
  // Toast management
  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    const newToast: Toast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isFront) {
          setFrontImage(file);
          setFrontPreview(reader.result as string);
        } else {
          setBackImage(file);
          setBackPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImage || !backImage) {
      addToast('Please upload both front and back images.', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setDetails(null);

    try {
      addToast('Uploading images...', 'info');
      const frontImageUrl = await uploadImage(frontImage);
      const backImageUrl = await uploadImage(backImage);

      if (!frontImageUrl || !backImageUrl) {
        throw new Error('Failed to upload one or both images to Cloudinary.');
      }

      addToast('Processing Aadhaar images...', 'info');
      const response = await sendAadhaarImages(frontImageUrl, backImageUrl);

      if (!response.success) {
        throw new Error(response.message || 'Failed to process Aadhaar images.');
      }

      setDetails(response.parsedData);
      setEditedDetails({
        dob: response.parsedData.dob,
        aadharNumber: response.parsedData.aadharNumber,
        gender: response.parsedData.gender,
        name: response.parsedData.name,
        fatherName: response.parsedData.fatherName,
        address: response.parsedData.address,
        pinCode: response.parsedData.pinCode || '',
      });
      addToast('Aadhaar details extracted successfully!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFrontImage(null);
    setBackImage(null);
    setFrontPreview(null);
    setBackPreview(null);
    setDetails(null);
    setError(null);
    setLoading(false);
    setSaving(false);
    setEditedDetails({
      dob: null,
      aadharNumber: null,
      gender: null,
      name: null,
      fatherName: null,
      address: null,
      pinCode: '',
    });
    document.querySelectorAll('input[type="file"]').forEach((input) => {
      (input as HTMLInputElement).value = '';
    });
  };

  const handleSave = async () => {
    if (details) {
      setSaving(true);
      try {
        await saveAadharData(editedDetails);
        setDetails({ ...details, ...editedDetails });
        addToast('Aadhaar data saved successfully!', 'success');
          handleReset();
      
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save data.';
        setError(errorMessage);
        addToast(errorMessage, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigateToOcrList = () => {
    navigate("/ocr")
  };

  const isExtractDisabled = !frontImage || !backImage || loading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
              toast.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : toast.type === 'error' 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full transform transition-all duration-300 hover:shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700">Aadhaar OCR Scanner</h1>
          <button
            onClick={navigateToOcrList}
            className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
          >
            View OCR List
          </button>
        </div>
        <p className="text-gray-600 mb-8 text-center text-lg">Upload front and back images of an Aadhaar card to extract details.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-start">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Front Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, true)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 transition duration-200"
            />
            {frontPreview && (
              <img
                src={frontPreview}
                alt="Front Preview"
                className="mt-4 w-full h-48 object-contain rounded-lg border border-gray-200 shadow-sm"
              />
            )}
          </div>
          <div className="flex flex-col items-start">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Back Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, false)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 transition duration-200"
            />
            {backPreview && (
              <img
                src={backPreview}
                alt="Back Preview"
                className="mt-4 w-full h-48 object-contain rounded-lg border border-gray-200 shadow-sm"
              />
            )}
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isExtractDisabled}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition duration-300 ${
                isExtractDisabled
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Extract Details'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Reset
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}

        {details && (
          <div className="mt-8 p-6 bg-gray-50 rounded-xl shadow-inner">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Extracted Aadhaar Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-600">Name</p>
                <input
                  type="text"
                  name="name"
                  value={editedDetails.name || ''}
                  onChange={handleInputChange}
                  className="text-lg font-bold text-gray-900 bg-yellow-100 px-3 py-1 rounded w-full text-center"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-600">Aadhaar Number</p>
                <input
                  type="text"
                  name="aadharNumber"
                  value={editedDetails.aadharNumber || ''}
                  onChange={handleInputChange}
                  className="text-lg font-bold text-gray-900 bg-green-100 px-3 py-1 rounded w-full text-center"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                <input
                  type="text"
                  name="dob"
                  value={editedDetails.dob || ''}
                  onChange={handleInputChange}
                  className="text-gray-800 bg-gray-100 px-3 py-1 rounded w-full text-center"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-600">Gender</p>
                <input
                  type="text"
                  name="gender"
                  value={editedDetails.gender || ''}
                  onChange={handleInputChange}
                  className="text-gray-800 bg-gray-100 px-3 py-1 rounded w-full text-center"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-600">Father's Name</p>
                <input
                  type="text"
                  name="fatherName"
                  value={editedDetails.fatherName || ''}
                  onChange={handleInputChange}
                  className="text-gray-800 bg-gray-100 px-3 py-1 rounded w-full text-center"
                />
              </div>
              <div className="md:col-span-2 flex flex-col">
                <p className="text-sm font-medium text-gray-600">Address</p>
                <input
                  type="text"
                  name="address"
                  value={editedDetails.address || ''}
                  onChange={handleInputChange}
                  className="text-gray-800 bg-gray-100 px-3 py-1 rounded w-full text-center"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-600">Pincode</p>
                <input
                  type="text"
                  name="pinCode"
                  value={editedDetails.pinCode}
                  onChange={handleInputChange}
                  className="text-gray-800 bg-gray-100 px-3 py-1 rounded w-full text-center"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`font-semibold py-2 px-6 rounded-lg transition duration-300 ${
                  saving
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AadhaarOCR;