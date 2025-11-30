import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import modelPredictionService from '../../lib/modelPredictionService';

const YieldPredictionModal = ({ isOpen, onClose, soilData, weatherData }) => {
  const [predictionData, setPredictionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && !predictionData) {
      generatePrediction();
    }
  }, [isOpen]);

  const generatePrediction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const inputData = {
        soilData: soilData || {},
        weatherData: weatherData || {},
        location: 'Default Farm',
        cropType: 'Mixed Crops'
      };

      const result = await modelPredictionService.generatePredictions(inputData);
      setPredictionData(result);
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Failed to generate prediction. Using fallback data.');
      
      // Provide comprehensive fallback data
      setPredictionData({
        confidence: 75,
        soilHealth: {
          score: 'Good',
          ph: '6.8',
          moisture: '65',
          nutrients: 'Balanced',
          analysis: 'Soil conditions are favorable for most crops with good pH balance and adequate moisture levels.'
        },
        yieldPrediction: {
          value: '4.2 tons/ha',
          efficiency: '85%',
          trend: 'positive'
        },
        pestRisk: {
          level: 'Low',
          confidence: '80',
          analysis: 'Current environmental conditions show low pest activity risk.',
          commonPests: ['Aphids', 'Caterpillars']
        },
        rainfall: {
          probability: '70',
          temperatureImpact: 'Favorable',
          analysis: 'Weather conditions are optimal for crop growth with adequate rainfall expected.'
        },
        insights: [
          'Soil pH levels are within optimal range for most crops',
          'Current moisture levels support healthy plant growth',
          'Weather patterns indicate favorable growing conditions',
          'Low pest risk allows for reduced pesticide usage'
        ],
        recommendations: [
          'Maintain current irrigation schedule',
          'Monitor soil moisture weekly',
          'Apply organic fertilizer in 2 weeks',
          'Implement preventive pest control measures',
          'Consider crop rotation for next season'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 80) return 'CheckCircle';
    if (confidence >= 60) return 'AlertTriangle';
    return 'AlertCircle';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'soil', label: 'Soil Analysis', icon: 'Sprout' },
    { id: 'weather', label: 'Weather Impact', icon: 'Cloud' },
    { id: 'pest', label: 'Pest Risk', icon: 'Bug' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="TrendingUp" size={32} color="white" />
              <div>
                <h2 className="text-2xl font-bold">AI Crop Yield Prediction</h2>
                <p className="text-green-100">Comprehensive agricultural insights</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2"
            >
              <Icon name="X" size={24} color="white" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing your farm data...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 m-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={20} color="#f59e0b" />
              <p className="text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {predictionData && !isLoading && (
          <div className="flex h-[calc(90vh-140px)]">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon name={tab.icon} size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Overall Confidence */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Prediction Confidence</h3>
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={getConfidenceIcon(predictionData.confidence)} 
                          size={20} 
                          color={predictionData.confidence >= 80 ? '#16a34a' : predictionData.confidence >= 60 ? '#ca8a04' : '#dc2626'} 
                        />
                        <span className={`text-2xl font-bold ${getConfidenceColor(predictionData.confidence)}`}>
                          {predictionData.confidence}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          predictionData.confidence >= 80 ? 'bg-green-500' : 
                          predictionData.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${predictionData.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Icon name="Sprout" size={24} color="#16a34a" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Soil Health</p>
                          <p className="text-xl font-bold text-gray-900">{predictionData.soilHealth.score}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon name="TrendingUp" size={24} color="#2563eb" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Predicted Yield</p>
                          <p className="text-xl font-bold text-gray-900">{predictionData.yieldPrediction.value}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Icon name="Bug" size={24} color="#dc2626" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pest Risk</p>
                          <p className="text-xl font-bold text-gray-900">{predictionData.pestRisk.level}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          <Icon name="Droplets" size={24} color="#0891b2" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rainfall Probability</p>
                          <p className="text-xl font-bold text-gray-900">{predictionData.rainfall.probability}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Icon name="Lightbulb" size={20} color="#2563eb" />
                      <span className="ml-2">Key Insights</span>
                    </h3>
                    <div className="space-y-3">
                      {predictionData.insights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="p-1 bg-blue-100 rounded-full mt-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                          <p className="text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Icon name="CheckCircle" size={20} color="#16a34a" />
                      <span className="ml-2">Recommendations</span>
                    </h3>
                    <div className="space-y-3">
                      {predictionData.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <Icon name="CheckCircle" size={16} color="#16a34a" />
                          <p className="text-gray-700">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'soil' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Icon name="Sprout" size={20} color="#16a34a" />
                      <span className="ml-2">Soil Health Analysis</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">pH Level</p>
                        <p className="text-2xl font-bold text-gray-900">{predictionData.soilHealth.ph}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Moisture</p>
                        <p className="text-2xl font-bold text-gray-900">{predictionData.soilHealth.moisture}%</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Nutrients</p>
                        <p className="text-2xl font-bold text-gray-900">{predictionData.soilHealth.nutrients}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-gray-700">{predictionData.soilHealth.analysis}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'weather' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Icon name="Cloud" size={20} color="#0891b2" />
                      <span className="ml-2">Weather Impact Analysis</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Temperature Impact</p>
                        <p className="text-lg font-semibold text-gray-900">{predictionData.rainfall.temperatureImpact}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Rainfall Probability</p>
                        <p className="text-lg font-semibold text-gray-900">{predictionData.rainfall.probability}%</p>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-gray-700">{predictionData.rainfall.analysis}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pest' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Icon name="Bug" size={20} color="#dc2626" />
                      <span className="ml-2">Pest Risk Assessment</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                        <p className="text-lg font-semibold text-gray-900">{predictionData.pestRisk.level}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Confidence</p>
                        <p className="text-lg font-semibold text-gray-900">{predictionData.pestRisk.confidence}%</p>
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg mb-4">
                      <p className="text-gray-700">{predictionData.pestRisk.analysis}</p>
                    </div>
                    {predictionData.pestRisk.commonPests && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Common Pests in Season:</p>
                        <div className="flex flex-wrap gap-2">
                          {predictionData.pestRisk.commonPests.map((pest, index) => (
                            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                              {pest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Analysis generated on {new Date().toLocaleDateString()}
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                iconName="RefreshCw"
                iconPosition="left"
                onClick={generatePrediction}
                disabled={isLoading}
              >
                Regenerate
              </Button>
              <Button
                variant="primary"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldPredictionModal;