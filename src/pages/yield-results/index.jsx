import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { ArrowLeft, Download, Share2, TrendingUp, Target, AlertCircle, CheckCircle, BarChart3, Leaf, Calendar, MapPin, Zap, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import MobileNavigationBar from '../../components/ui/MobileNavigationBar';
import yieldService from '../../services/yieldService';
import { toast } from 'react-hot-toast';

const YieldResultsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, makeAuthenticatedRequest, logout } = useAuthContext();

  // Form state
  const [formData, setFormData] = useState({
    crop: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    rainfall: '',
    temperature: '',
    humidity: ''
  });

  // Prediction state
  const [yieldData, setYieldData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);

  // Redirect if not authenticated (additional check)
  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      return;
    }
  }, [isAuthenticated, logout]);

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

  const handleDownloadReport = () => {
    if (!yieldData) return;
    
    const reportContent = `
Crop Yield Prediction Report
============================

Crop: ${yieldData.input_parameters?.crop || 'N/A'}
Location: ${yieldData.input_parameters?.state || 'N/A'}, ${yieldData.input_parameters?.district || 'N/A'}
Season: ${yieldData.input_parameters?.season || 'N/A'}
Area: ${yieldData.input_parameters?.area || 'N/A'} hectares

Prediction Results:
- Predicted Yield: ${yieldData.predicted_yield_tons_per_hectare || 'N/A'} tons/ha
- Total Production: ${yieldData.total_production_tons || 'N/A'} tons
- Yield Category: ${yieldData.yield_category || 'N/A'}
- Confidence: ${yieldData.confidence || 'N/A'}%

Recommendations:
${yieldData.recommendations?.map((rec, i) => `${i + 1}. ${rec}`).join('\n') || 'No recommendations available'}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yield-prediction-${yieldData.input_parameters?.crop || 'crop'}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share && yieldData) {
      try {
        await navigator.share({
          title: 'Crop Yield Prediction Results',
          text: `My ${yieldData.input_parameters?.crop || 'crop'} yield prediction: ${yieldData.predicted_yield_tons_per_hectare || 'N/A'} tons/ha with ${yieldData.confidence || 'N/A'}% confidence`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `My ${yieldData?.input_parameters?.crop || 'crop'} yield prediction: ${yieldData?.predicted_yield_tons_per_hectare || 'N/A'} tons/ha with ${yieldData?.confidence || 'N/A'}% confidence`;
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!yieldData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Prediction Data Found</h2>
          <p className="text-gray-600 mb-6">Please make a new prediction to see results.</p>
          <Button onClick={() => navigate('/dashboard')} iconName="ArrowLeft" iconPosition="left">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                iconName="Share2"
                iconPosition="left"
              >
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
                iconName="Download"
                iconPosition="left"
              >
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg border border-green-200 overflow-hidden mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Yield Prediction Results</h1>
                <p className="text-green-100 text-lg">AI-powered crop yield analysis complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Predicted Yield */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getYieldCategoryColor(yieldData.yield_category)}`}>
                {yieldData.yield_category || 'Medium'} Yield
              </span>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium mb-1">Predicted Yield</p>
              <p className="text-4xl font-bold text-green-800 mb-1">
                {yieldData.predicted_yield_tons_per_hectare || 'N/A'}
              </p>
              <p className="text-sm text-green-600">tons per hectare</p>
              {yieldData.total_production_tons && (
                <p className="text-xs text-gray-500 mt-2">
                  Total Production: {yieldData.total_production_tons} tons
                </p>
              )}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">{yieldData.confidence || 85}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium mb-2">Confidence Score</p>
              <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${yieldData.confidence || 85}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600">Model reliability indicator</p>
            </div>
          </div>

          {/* Crop Information */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-600">Estimated Revenue</p>
                <p className="text-lg font-bold text-purple-800">
                  ${((yieldData.predicted_yield_tons_per_hectare || 0) * 300).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium mb-1">Crop Details</p>
              <p className="text-2xl font-bold text-purple-800 mb-1">
                {yieldData.input_parameters?.crop || 'N/A'}
              </p>
              <p className="text-xs text-purple-600">
                {yieldData.input_parameters?.state || 'N/A'}, {yieldData.input_parameters?.district || 'N/A'}
              </p>
              <p className="text-xs text-purple-600">
                Season: {yieldData.input_parameters?.season || 'N/A'} | Area: {yieldData.input_parameters?.area || 'N/A'} ha
              </p>
            </div>
          </div>
        </div>

        {/* Factors Analysis */}
        {yieldData.factors_analysis && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <div className="flex items-center mb-6">
              <Leaf className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Impact Factors Analysis</h2>
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
        )}

        {/* Recommendations */}
        {yieldData.recommendations && yieldData.recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <div className="flex items-center mb-6">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Optimization Recommendations</h2>
            </div>
            <div className="space-y-4">
              {yieldData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all">
                  <div className="p-1 bg-blue-500 rounded-full mt-1 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/profitable-crops')}
              iconName="TrendingUp"
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              Make Another Prediction
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              iconName="BarChart3"
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              View Dashboard
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Generated: {new Date().toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                AgriSmart AI Model v1.0
              </span>
            </div>
            <span className="text-green-600 font-medium">✓ Analysis Complete</span>
          </div>
        </div>
      </div>

      <MobileNavigationBar />
    </div>
  );
};

export default YieldResultsPage;