import React from 'react';
import { TrendingUp, Target, AlertCircle, CheckCircle, BarChart3, Leaf, Droplets, Calendar, MapPin, Zap } from 'lucide-react';

const YieldPredictionResults = ({ yieldData }) => {
  if (!yieldData) return null;

  const getYieldCategoryColor = (category) => {
    switch (category) {
      case 'High': return 'text-green-600 bg-green-100 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Low': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getFactorIcon = (impact) => {
    switch (impact) {
      case 'Positive': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Negative': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getFactorColor = (impact) => {
    switch (impact) {
      case 'Positive': return 'bg-green-50 border-green-200';
      case 'Negative': return 'bg-red-50 border-red-200';
      default: return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <div className="flex items-center">
          <div className="p-2 bg-white/20 rounded-lg mr-3">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Yield Prediction Results</h3>
            <p className="text-green-100 text-sm">AI-powered crop yield analysis</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Predicted Yield */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getYieldCategoryColor(yieldData.yield_category)}`}>
                {yieldData.yield_category} Yield
              </span>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium mb-1">Predicted Yield</p>
              <p className="text-3xl font-bold text-green-800">
                {yieldData.predicted_yield_tons_per_hectare}
              </p>
              <p className="text-sm text-green-600">tons per hectare</p>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{yieldData.confidence}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Confidence Score</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${yieldData.confidence}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600">Model reliability indicator</p>
            </div>
          </div>

          {/* Yield Potential */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-600">Estimated Revenue</p>
                <p className="text-lg font-bold text-purple-800">
                  ${(yieldData.predicted_yield_tons_per_hectare * 300).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium mb-1">Yield Potential</p>
              <p className="text-2xl font-bold text-purple-800">
                {yieldData.yield_category}
              </p>
              <p className="text-xs text-purple-600">Based on farming conditions</p>
            </div>
          </div>
        </div>

        {/* Factors Analysis */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Leaf className="w-5 h-5 text-gray-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Impact Factors Analysis</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(yieldData.factors_analysis).map(([factor, impact]) => (
              <div key={factor} className={`rounded-lg p-4 border transition-all hover:shadow-md ${getFactorColor(impact)}`}>
                <div className="flex items-center space-x-3">
                  {getFactorIcon(impact)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {factor.replace('_impact', '').replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{impact} Impact</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h4>
          </div>
          <div className="space-y-3">
            {yieldData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all">
                <div className="p-1 bg-blue-500 rounded-full mt-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Generated: {new Date().toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                AgriSmart AI Model
              </span>
            </div>
            <span className="text-green-600 font-medium">✓ Analysis Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldPredictionResults;
