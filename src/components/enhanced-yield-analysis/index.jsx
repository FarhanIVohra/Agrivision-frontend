import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Droplets,
  Bug,
  Thermometer,
  Leaf,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const EnhancedYieldAnalysis = ({ predictionData, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Extract data with fallbacks
  const confidence = predictionData?.confidence || 0;
  const soilHealth = predictionData?.soilHealth || {};
  const yieldPrediction = predictionData?.yieldPrediction || {};
  const pestRisk = predictionData?.pestRisk || {};
  const rainfall = predictionData?.rainfall || {};
  const insights = predictionData?.insights || [];
  const recommendations = predictionData?.recommendations || [];

  // Component is now fully self-contained with data extraction in render

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Confidence Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Overall Prediction Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-green-600">
              {predictionData?.confidence || 0}%
            </div>
            <div className="text-sm text-gray-600">
              Based on {predictionData?.fallback ? 'offline' : 'real-time'} data
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${predictionData?.confidence || 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm text-gray-600">Soil Health</div>
                <div className="text-xl font-semibold">
                  {predictionData?.soil?.soilHealthScore?.toFixed(1) || 'N/A'}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-600">Yield Prediction</div>
                <div className="text-xl font-semibold">
                  {predictionData?.yield?.predictedYield?.toFixed(1) || 'N/A'} t/ha
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm text-gray-600">Pest Risk</div>
                <div className="text-xl font-semibold">
                  {predictionData?.pest?.riskLevel || 'Low'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-500" />
              <div>
                <div className="text-sm text-gray-600">Rainfall Prob.</div>
                <div className="text-xl font-semibold">
                  {predictionData?.rainfall?.probability?.toFixed(0) || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="font-medium">{insight.message}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Category: {insight.category} • Impact: {insight.impact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Action Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{rec.action}</h4>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{rec.details}</p>
                  <div className="text-sm text-gray-500">
                    Timeline: {rec.timeline}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No immediate actions required. Your crops are in good condition!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDetailedAnalysis = () => (
    <div className="space-y-6">
      {/* Soil Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Soil Health Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Nutrient Levels</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Nitrogen (N)</span>
                  <span className="font-medium">{predictionData?.soil?.nitrogen || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phosphorus (P)</span>
                  <span className="font-medium">{predictionData?.soil?.phosphorus || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Potassium (K)</span>
                  <span className="font-medium">{predictionData?.soil?.potassium || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Soil Properties</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>pH Level</span>
                  <span className="font-medium">{predictionData?.soil?.ph || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Organic Matter</span>
                  <span className="font-medium">{predictionData?.soil?.organic_matter || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Moisture</span>
                  <span className="font-medium">{predictionData?.soil?.moisture || 'N/A'}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Weather Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {predictionData?.weather?.temperature || 'N/A'}°C
              </div>
              <div className="text-sm text-gray-600">Temperature</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {predictionData?.weather?.humidity || 'N/A'}%
              </div>
              <div className="text-sm text-gray-600">Humidity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {predictionData?.rainfall?.expectedAmount?.toFixed(1) || 'N/A'}mm
              </div>
              <div className="text-sm text-gray-600">Expected Rainfall</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pest Risk Details */}
      {predictionData?.pest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Pest Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Risk Level</h4>
                <div className="text-2xl font-bold text-orange-600">
                  {predictionData.pest.riskLevel}
                </div>
                <div className="text-sm text-gray-600">
                  Score: {predictionData.pest.riskScore?.toFixed(1)}/100
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Common Pests</h4>
                <div className="flex flex-wrap gap-2">
                  {predictionData.pest.commonPests?.map((pest, index) => (
                    <Badge key={index} variant="outline">{pest}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'recommendations', label: 'Recommendations', icon: CheckCircle },
    { id: 'detailed', label: 'Detailed Analysis', icon: BarChart3 }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Yield Analysis</h1>
          <p className="text-gray-600">
            Comprehensive insights for your crop yield predictions
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          Refresh Analysis
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'detailed' && renderDetailedAnalysis()}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Last updated: {predictionData?.timestamp ? new Date(predictionData.timestamp).toLocaleString() : 'N/A'}
          </div>
          <div>
            {predictionData?.fallback ? '🔄 Offline Mode' : '🌐 Real-time Data'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedYieldAnalysis;