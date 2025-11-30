import React, { useState } from 'react';
import Button from './ui/Button';
import { X, Leaf } from 'lucide-react';
import { apiPost } from '../lib/api';

const FertilizerPredictionForm = ({ isOpen, onClose, onPredict }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    temperature: '',
    humidity: '',
    moisture: '',
    soil_type: '',
    crop_type: '',
    nitrogen: '',
    potassium: '',
    phosphorous: ''
  });

  const [errors, setErrors] = useState({});

  const soilTypes = [
    'Sandy',
    'Loamy', 
    'Black',
    'Red',
    'Clayey'
  ];

  const cropTypes = [
    'Maize',
    'Sugarcane',
    'Cotton',
    'Tobacco',
    'Paddy',
    'Barley',
    'Wheat',
    'Millets',
    'Oil seeds',
    'Pulses',
    'Ground Nuts'
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

    // Temperature validation (typical range: 0-50°C)
    if (!formData.temperature) {
      newErrors.temperature = 'Temperature is required';
    } else if (parseFloat(formData.temperature) < 0 || parseFloat(formData.temperature) > 50) {
      newErrors.temperature = 'Temperature should be between 0-50°C';
    }

    // Humidity validation (0-100%)
    if (!formData.humidity) {
      newErrors.humidity = 'Humidity is required';
    } else if (parseFloat(formData.humidity) < 0 || parseFloat(formData.humidity) > 100) {
      newErrors.humidity = 'Humidity should be between 0-100%';
    }

    // Moisture validation (0-100%)
    if (!formData.moisture) {
      newErrors.moisture = 'Moisture is required';
    } else if (parseFloat(formData.moisture) < 0 || parseFloat(formData.moisture) > 100) {
      newErrors.moisture = 'Moisture should be between 0-100%';
    }

    // Soil type validation
    if (!formData.soil_type) {
      newErrors.soil_type = 'Soil type is required';
    }

    // Crop type validation
    if (!formData.crop_type) {
      newErrors.crop_type = 'Crop type is required';
    }

    // Nitrogen validation - allow zero values
    if (formData.nitrogen === '' || formData.nitrogen === null || formData.nitrogen === undefined) {
      newErrors.nitrogen = 'Nitrogen content is required';
    } else if (parseFloat(formData.nitrogen) < 0) {
      newErrors.nitrogen = 'Nitrogen cannot be negative';
    }

    // Potassium validation - allow zero values
    if (formData.potassium === '' || formData.potassium === null || formData.potassium === undefined) {
      newErrors.potassium = 'Potassium content is required';
    } else if (parseFloat(formData.potassium) < 0) {
      newErrors.potassium = 'Potassium cannot be negative';
    }

    // Phosphorous validation - allow zero values
    if (formData.phosphorous === '' || formData.phosphorous === null || formData.phosphorous === undefined) {
      newErrors.phosphorous = 'Phosphorous content is required';
    } else if (parseFloat(formData.phosphorous) < 0) {
      newErrors.phosphorous = 'Phosphorous cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert form data to appropriate types
      const requestData = {
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        moisture: parseFloat(formData.moisture),
        soil_type: formData.soil_type,
        crop_type: formData.crop_type,
        nitrogen: parseFloat(formData.nitrogen),
        potassium: parseFloat(formData.potassium),
        phosphorous: parseFloat(formData.phosphorous)
      };

      const result = await apiPost('/soil-health/fertilizer-recommendation', requestData);

      // Call the onPredict callback with the result
      if (onPredict) {
        onPredict(result);
      }

      // Close the form
      onClose();
    } catch (error) {
      console.error('Error predicting fertilizer:', error);
      // You could set a general error state here
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Leaf className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Fertilizer Recommendation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Enter your soil and environmental parameters to get AI-powered fertilizer recommendations
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Environmental Parameters */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Environmental Conditions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.temperature ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 25"
                  step="0.1"
                />
                {errors.temperature && (
                  <p className="mt-1 text-sm text-red-600">{errors.temperature}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.humidity ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 65"
                  step="0.1"
                />
                {errors.humidity && (
                  <p className="mt-1 text-sm text-red-600">{errors.humidity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soil Moisture (%)
                </label>
                <input
                  type="number"
                  name="moisture"
                  value={formData.moisture}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.moisture ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 40"
                  step="0.1"
                />
                {errors.moisture && (
                  <p className="mt-1 text-sm text-red-600">{errors.moisture}</p>
                )}
              </div>
            </div>
          </div>

          {/* Soil and Crop Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Soil & Crop Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soil Type
                </label>
                <select
                  name="soil_type"
                  value={formData.soil_type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.soil_type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Soil Type</option>
                  {soilTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.soil_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.soil_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Type
                </label>
                <select
                  name="crop_type"
                  value={formData.crop_type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.crop_type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Crop Type</option>
                  {cropTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.crop_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.crop_type}</p>
                )}
              </div>
            </div>
          </div>

          {/* Nutrient Levels */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Nutrient Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nitrogen (kg/ha)
                </label>
                <input
                  type="number"
                  name="nitrogen"
                  value={formData.nitrogen}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.nitrogen ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 80"
                  step="0.1"
                />
                {errors.nitrogen && (
                  <p className="mt-1 text-sm text-red-600">{errors.nitrogen}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potassium (kg/ha)
                </label>
                <input
                  type="number"
                  name="potassium"
                  value={formData.potassium}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.potassium ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 40"
                  step="0.1"
                />
                {errors.potassium && (
                  <p className="mt-1 text-sm text-red-600">{errors.potassium}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phosphorous (kg/ha)
                </label>
                <input
                  type="number"
                  name="phosphorous"
                  value={formData.phosphorous}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.phosphorous ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 60"
                  step="0.1"
                />
                {errors.phosphorous && (
                  <p className="mt-1 text-sm text-red-600">{errors.phosphorous}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              iconName={loading ? "Loader2" : "Leaf"}
              iconPosition="left"
            >
              {loading ? 'Analyzing...' : 'Get Recommendation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FertilizerPredictionForm;