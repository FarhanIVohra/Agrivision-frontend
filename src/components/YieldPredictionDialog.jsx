import React, { useState } from 'react';
import Button from './ui/Button';
import { X, TrendingUp, Loader2 } from 'lucide-react';

const YieldPredictionDialog = ({ isOpen, onClose, onPredict }) => {
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    crop: '',
    year: '2025',
    season: '',
    area: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const crops = [
    'Rice', 'Wheat', 'Maize', 'Bajra', 'Jowar', 'Sugarcane', 'Cotton(lint)',
    'Groundnut', 'Soyabean', 'Arhar/Tur(Pulses)', 'Gram', 'Masoor', 'Sesamum',
    'Sunflower', 'Safflower', 'Castor seed', 'Linseed', 'Niger seed', 'Rapeseed &Mustard'
  ];

  const seasons = [
    'Kharif', 'Rabi', 'Summer', 'Whole Year', 'Autumn', 'Winter'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.crop) newErrors.crop = 'Crop is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.season) newErrors.season = 'Season is required';
    if (!formData.area) {
      newErrors.area = 'Area is required';
    } else if (isNaN(formData.area) || parseFloat(formData.area) <= 0) {
      newErrors.area = 'Area must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onPredict(formData);
      onClose();
      // Reset form
      setFormData({
        state: '',
        district: '',
        crop: '',
        year: '2025',
        season: '',
        area: ''
      });
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      state: '',
      district: '',
      crop: '',
      year: '2025',
      season: '',
      area: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Predict Crop Yield</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* State and District Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.state ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Enter district name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.district ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">{errors.district}</p>
              )}
            </div>
          </div>

          {/* Crop and Year Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crop
              </label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.crop ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Crop</option>
                {crops.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
              {errors.crop && (
                <p className="mt-1 text-sm text-red-600">{errors.crop}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="2020"
                max="2030"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.year ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Season and Area Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season
              </label>
              <select
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.season ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Season</option>
                {seasons.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
              {errors.season && (
                <p className="mt-1 text-sm text-red-600">{errors.season}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area (Hectares)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="e.g., 2.5"
                step="0.1"
                min="0.1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.area ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.area && (
                <p className="mt-1 text-sm text-red-600">{errors.area}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Predict Yield
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default YieldPredictionDialog;