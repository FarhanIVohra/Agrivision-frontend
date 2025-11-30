import React from 'react';
import { CheckCircle, Leaf, DollarSign, Clock, AlertTriangle, Info } from 'lucide-react';

const FertilizerPredictionResults = ({ results, onClose }) => {
  if (!results) return null;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 80) return <CheckCircle className="w-5 h-5" />;
    if (confidence >= 60) return <Info className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getNutrientStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'adequate':
        return 'text-green-600 bg-green-50';
      case 'deficient':
        return 'text-red-600 bg-red-50';
      case 'excess':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Leaf className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fertilizer Recommendation</h2>
            <p className="text-gray-600">AI-powered analysis results</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Main Recommendation */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-full">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-800">Recommended Fertilizer</h3>
              <p className="text-green-600">Best match for your soil conditions</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full border flex items-center space-x-2 ${getConfidenceColor(results.confidence)}`}>
            {getConfidenceIcon(results.confidence)}
            <span className="font-medium">{results.confidence}% Confidence</span>
          </div>
        </div>
        
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-green-800 mb-2">
            {results.recommended_fertilizer}
          </div>
          <p className="text-green-600">
            This fertilizer is optimal for your current soil and crop conditions
          </p>
        </div>
      </div>

      {/* Soil Analysis Summary */}
      {results.soil_analysis && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            Soil Analysis Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nutrient Status */}
            {results.soil_analysis && results.soil_analysis.nutrient_status && Object.entries(results.soil_analysis.nutrient_status).map(([nutrient, status]) => (
              <div key={nutrient} className={`rounded-lg p-4 border ${getNutrientStatusColor(status)}`}>
                <div className="text-sm font-medium capitalize">{nutrient}</div>
                <div className="text-xs mt-1 capitalize">{status}</div>
              </div>
            ))}
            
            {/* Soil Condition */}
            {results.soil_analysis.soil_condition && (
              <div className="rounded-lg p-4 border bg-blue-50 text-blue-800">
                <div className="text-sm font-medium">Soil Type</div>
                <div className="text-xs mt-1">{results.soil_analysis.soil_condition}</div>
              </div>
            )}
            
            {/* Moisture Level */}
            {results.soil_analysis.moisture_level && (
              <div className={`rounded-lg p-4 border ${
                results.soil_analysis.moisture_level === 'optimal' 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-yellow-50 text-yellow-800'
              }`}>
                <div className="text-sm font-medium">Moisture</div>
                <div className="text-xs mt-1 capitalize">{results.soil_analysis.moisture_level.replace('_', ' ')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cost Estimate */}
      {results.cost_estimate && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            Cost Estimate
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{results.cost_estimate.cost_per_kg}
                </div>
                <div className="text-sm text-gray-600">Price per kg</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {results.cost_estimate.recommended_quantity_per_acre} kg
                </div>
                <div className="text-sm text-gray-600">Quantity per acre</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₹{results.cost_estimate.total_cost_per_acre}
                </div>
                <div className="text-sm text-gray-600">Total cost per acre</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Guidelines */}
      {results.application_guidelines && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            Application Guidelines
          </h4>
          <div className="space-y-3">
            {results.application_guidelines.map((guideline, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="p-1 bg-blue-500 rounded-full mt-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium">{guideline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Generated: {new Date().toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Leaf className="w-4 h-4 mr-1" />
              AgriSmart AI Model
            </span>
          </div>
          <span className="text-green-600 font-medium">✓ Analysis Complete</span>
        </div>
      </div>
    </div>
  );
};

export default FertilizerPredictionResults;