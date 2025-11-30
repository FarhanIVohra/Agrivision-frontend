import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuthContext } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import Button from '../../components/ui/Button';
import MainSidebar from '../../components/ui/MainSidebar';
import MobileNavigationBar from '../../components/ui/MobileNavigationBar';
import { useTranslation } from 'react-i18next';
import SoilMetricsCard from './components/SoilMetricsCard';
import SoilTrendChart from './components/SoilTrendChart';
import SoilTestingCard from './components/SoilTestingCard';
import SoilRecommendationCard from './components/SoilRecommendationCard';
import SoilMetricsInputForm from './components/SoilMetricsInputForm';
import FertilizerPredictionForm from '../../components/FertilizerPredictionForm';
import FertilizerPredictionResults from '../../components/FertilizerPredictionResults';
import { Leaf, Loader2, AlertCircle } from 'lucide-react';
import soilHealthService from '../../services/soilHealthService';
import { toast } from 'react-hot-toast';

const SoilHealthMonitor = () => {
  const { t } = useTranslation();
  const { isAuthenticated, makeAuthenticatedRequest, logout } = useAuthContext();
  
  // Redirect if not authenticated (additional check)
  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      return;
    }
  }, [isAuthenticated, logout]);

  const { isCollapsed } = useSidebar();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedField, setSelectedField] = useState('field_1');
  const [filters, setFilters] = useState({
    crop: 'all',
    field: 'all',
    timeRange: '30d',
    fertilizer: 'all',
    startDate: '',
    endDate: ''
  });

  // Current soil data from API
  const [currentSoilData, setCurrentSoilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInputForm, setShowInputForm] = useState(false);

  // User input soil metrics state for analysis
  const [userSoilMetrics, setUserSoilMetrics] = useState({
    nitrogen: 45,
    phosphorus: 28,
    potassium: 35,
    ph: 6.8,
    organic_matter: 3.2,
    moisture: 32,
    temperature: 25,
    soilType: "loam",
    humidity: 50
  });

  const [soilAnalysisResults, setSoilAnalysisResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Fertilizer prediction state
  const [showFertilizerForm, setShowFertilizerForm] = useState(false);
  const [fertilizerResults, setFertilizerResults] = useState(null);
  const [gettingFertilizer, setGettingFertilizer] = useState(false);

  // Fetch current soil data on component mount
  useEffect(() => {
    const fetchCurrentSoilData = async () => {
      try {
        setLoading(true);
        const data = await soilHealthService.getCurrentSoilData();
        setCurrentSoilData(data);

        // Update user metrics with current data
        setUserSoilMetrics(prev => ({
          ...prev,
          nitrogen: data.nitrogen || 45,
          phosphorus: data.phosphorus || 28,
          potassium: data.potassium || 35,
          ph: data.ph || 6.8,
          organic_matter: data.organic_matter || 3.2,
          moisture: data.moisture || 32,
          temperature: data.temperature || 25,
          humidity: data.humidity || 50
        }));

        // Auto-analyze with current data
        await analyzeSoilHealth({
          nitrogen: data.nitrogen || 45,
          phosphorus: data.phosphorus || 28,
          potassium: data.potassium || 35,
          ph: data.ph || 6.8,
          organic_matter: data.organic_matter || 3.2,
          moisture: data.moisture || 32,
          temperature: data.temperature || 25
        });

      } catch (error) {
        console.error('Error fetching current soil data:', error);
        setError('Failed to load soil data. Please try again.');
        toast.error('Failed to load soil data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCurrentSoilData();
    }
  }, [isAuthenticated]);

  // Function to analyze soil health using API
  const analyzeSoilHealth = async (soilData) => {
    try {
      setAnalyzing(true);
      const results = await soilHealthService.analyzeSoilHealth({
        nitrogen: soilData.nitrogen,
        phosphorus: soilData.phosphorus,
        potassium: soilData.potassium,
        ph: soilData.ph,
        organic_matter: soilData.organic_matter || 3.0,
        moisture: soilData.moisture,
        temperature: soilData.temperature
      });
      setSoilAnalysisResults(results);
      toast.success('Soil analysis completed');
    } catch (error) {
      console.error('Error analyzing soil health:', error);
      toast.error('Failed to analyze soil health');
    } finally {
      setAnalyzing(false);
    }
  };

  // Function to get fertilizer recommendation
  const getFertilizerRecommendation = async (fertilizerData) => {
    try {
      setGettingFertilizer(true);
      const results = await soilHealthService.getFertilizerRecommendation(fertilizerData);
      setFertilizerResults(results);
      setShowFertilizerForm(false);
      toast.success('Fertilizer recommendation generated');
    } catch (error) {
      console.error('Error getting fertilizer recommendation:', error);
      toast.error('Failed to get fertilizer recommendation');
    } finally {
      setGettingFertilizer(false);
    }
  };

  // Function to determine status based on values
  const getMetricStatus = (type, value) => {
    switch (type) {
      case 'nitrogen':
        if (value < 30) return 'critical';
        if (value < 50) return 'warning';
        return 'good';
      case 'phosphorus':
        if (value < 15) return 'critical';
        if (value < 25) return 'warning';
        return 'good';
      case 'temperature':
        if (value < 10 || value > 35) return 'critical';
        if (value < 15 || value > 30) return 'warning';
        return 'good';
      case 'humidity':
        if (value < 20 || value > 80) return 'critical';
        if (value < 30 || value > 70) return 'warning';
        return 'good';
      default:
        return 'good';
    }
  };

  // Function to get recommendations based on values
  const getRecommendation = (type, value, status) => {
    switch (type) {
      case 'nitrogen':
        if (status === 'critical') return 'Urgent: Apply nitrogen fertilizer immediately. Current levels are critically low.';
        if (status === 'warning') return 'Consider nitrogen fertilizer application. Current levels are below optimal range.';
        return 'Nitrogen levels are optimal. Continue current management practices.';
      case 'phosphorus':
        if (status === 'critical') return 'Critical: Apply phosphorus fertilizer urgently to prevent crop deficiency.';
        if (status === 'warning') return 'Apply phosphorus fertilizer to reach optimal levels for better crop growth.';
        return 'Phosphorus levels are within optimal range. Continue current management.';
      case 'temperature':
        if (status === 'critical') return 'Temperature is outside optimal range. Consider protective measures or timing adjustments.';
        if (status === 'warning') return 'Temperature is suboptimal. Monitor closely and adjust practices if needed.';
        return 'Soil temperature is optimal for current crop growth.';
      case 'humidity':
        if (status === 'critical') return value > 80 ? 'Humidity too high. Improve drainage and ventilation.' : 'Humidity too low. Increase irrigation frequency.';
        if (status === 'warning') return value > 70 ? 'Humidity slightly high. Monitor for fungal issues.' : 'Humidity low. Consider increasing irrigation.';
        return 'Humidity levels are optimal for crop growth.';
      default:
        return 'Levels are within acceptable range.';
    }
  };

  // Dynamic soil metrics based on API data and user input
  const soilMetrics = [
    {
      title: 'Nitrogen (N)',
      value: userSoilMetrics.nitrogen.toString(),
      unit: 'kg/ha',
      status: getMetricStatus('nitrogen', userSoilMetrics.nitrogen),
      icon: 'Leaf',
      recommendation: getRecommendation('nitrogen', userSoilMetrics.nitrogen, getMetricStatus('nitrogen', userSoilMetrics.nitrogen)),
      trend: 'stable',
      source: currentSoilData ? 'API' : 'Default',
      lastUpdated: currentSoilData ? new Date().toLocaleString() : null
    },
    {
      title: 'Phosphorus (P)',
      value: userSoilMetrics.phosphorus.toString(),
      unit: 'kg/ha',
      status: getMetricStatus('phosphorus', userSoilMetrics.phosphorus),
      icon: 'Sprout',
      recommendation: getRecommendation('phosphorus', userSoilMetrics.phosphorus, getMetricStatus('phosphorus', userSoilMetrics.phosphorus)),
      trend: 'stable',
      source: currentSoilData ? 'API' : 'Default',
      lastUpdated: currentSoilData ? new Date().toLocaleString() : null
    },
    {
      title: 'Potassium (K)',
      value: userSoilMetrics.potassium?.toString() || '35',
      unit: 'kg/ha',
      status: 'good',
      icon: 'Flower',
      recommendation: 'Potassium levels are optimal for crop growth.',
      trend: 'stable',
      source: currentSoilData ? 'API' : 'Default',
      lastUpdated: currentSoilData ? new Date().toLocaleString() : null
    },
    {
      title: 'pH Level',
      value: userSoilMetrics.ph.toString(),
      unit: '',
      status: userSoilMetrics.ph < 6.0 ? 'warning' : userSoilMetrics.ph > 7.5 ? 'warning' : 'good',
      icon: 'TestTube',
      recommendation: userSoilMetrics.ph < 6.0 ? 'Soil is acidic. Consider liming.' : userSoilMetrics.ph > 7.5 ? 'Soil is alkaline. Consider acidification.' : 'pH is optimal.',
      trend: 'stable',
      source: currentSoilData ? 'API' : 'Default',
      lastUpdated: currentSoilData ? new Date().toLocaleString() : null
    },
    {
      title: 'Temperature',
      value: userSoilMetrics.temperature.toString(),
      unit: '°C',
      status: getMetricStatus('temperature', userSoilMetrics.temperature),
      icon: 'Thermometer',
      recommendation: getRecommendation('temperature', userSoilMetrics.temperature, getMetricStatus('temperature', userSoilMetrics.temperature)),
      trend: 'stable',
      source: currentSoilData ? 'API' : 'Default',
      lastUpdated: currentSoilData ? new Date().toLocaleString() : null
    },
    {
      title: 'Moisture',
      value: userSoilMetrics.moisture.toString(),
      unit: '%',
      status: userSoilMetrics.moisture < 20 ? 'critical' : userSoilMetrics.moisture < 40 ? 'warning' : 'good',
      icon: 'Droplets',
      recommendation: userSoilMetrics.moisture < 20 ? 'Critical: Immediate irrigation required.' : userSoilMetrics.moisture < 40 ? 'Consider irrigation to maintain optimal moisture.' : 'Moisture levels are optimal.',
      trend: 'stable',
      source: currentSoilData ? 'API' : 'Default',
      lastUpdated: currentSoilData ? new Date().toLocaleString() : null
    },
    {
      title: 'Organic Matter',
      value: userSoilMetrics.organic_matter?.toString() || '3.2',
      unit: '%',
      status: 'good',
      icon: 'TreePine',
      recommendation: 'Organic matter content is healthy. Continue composting practices.',
      trend: 'stable',
      source: currentSoilData ? 'API' : 'Default',
      lastUpdated: currentSoilData ? new Date().toLocaleString() : null
    },
    {
      title: 'Humidity',
      value: userSoilMetrics.humidity.toString(),
      unit: '%',
      status: getMetricStatus('humidity', userSoilMetrics.humidity),
      icon: 'Cloud',
      recommendation: getRecommendation('humidity', userSoilMetrics.humidity, getMetricStatus('humidity', userSoilMetrics.humidity)),
      trend: 'stable',
      source: currentSoilData ? 'API' : 'Default',
      lastUpdated: currentSoilData ? new Date().toLocaleString() : null
    }
  ];

  // Trend data - in a real implementation, this would come from historical API data
  // For now, we'll show current data as a single point
  const trendData = [
    {
      date: new Date().toISOString().split('T')[0],
      nitrogen: userSoilMetrics.nitrogen,
      phosphorus: userSoilMetrics.phosphorus,
      potassium: userSoilMetrics.potassium,
      ph: userSoilMetrics.ph,
      moisture: userSoilMetrics.moisture
    }
  ];

  // Mock testing facilities
  const testingFacilities = [
    {
      id: 1,
      name: 'AgriLab Testing Center',
      address: '123 Farm Road, Agricultural District',
      distance: 3.2,
      rating: 4.8,
      turnaroundTime: '3-5 days',
      price: 1500,
      availableTests: ['NPK Analysis', 'pH Testing', 'Micronutrients', 'Organic Matter']
    },
    {
      id: 2,
      name: 'Soil Science Institute',
      address: '456 Research Avenue, University Campus',
      distance: 8.7,
      rating: 4.9,
      turnaroundTime: '5-7 days',
      price: 2200,
      availableTests: ['Complete Analysis', 'Heavy Metals', 'Salinity', 'Biological Activity']
    },
    {
      id: 3,
      name: 'FarmTech Diagnostics',
      address: '789 Technology Park, Innovation Hub',
      distance: 12.5,
      rating: 4.6,
      turnaroundTime: '2-3 days',
      price: 1800,
      availableTests: ['Quick NPK', 'pH & EC', 'Moisture Analysis', 'Texture Analysis']
    }
  ];

  // Dynamic recommendations based on API analysis results
  const recommendations = soilAnalysisResults?.recommendations?.map((rec, index) => ({
    id: index + 1,
    title: rec.length > 50 ? rec.substring(0, 50) + '...' : rec,
    category: rec.toLowerCase().includes('ph') ? 'pH Management' :
              rec.toLowerCase().includes('nitrogen') ? 'Nutrient Management' :
              rec.toLowerCase().includes('phosphorus') ? 'Nutrient Management' :
              rec.toLowerCase().includes('potassium') ? 'Nutrient Management' :
              rec.toLowerCase().includes('moisture') || rec.toLowerCase().includes('irrigation') ? 'Water Management' :
              'General Management',
    type: rec.toLowerCase().includes('lime') || rec.toLowerCase().includes('ph') ? 'ph_adjustment' :
          rec.toLowerCase().includes('fertilizer') ? 'fertilizer' :
          rec.toLowerCase().includes('irrigation') || rec.toLowerCase().includes('moisture') ? 'irrigation' :
          'general',
    priority: soilAnalysisResults.health_status === 'Poor' ? 'high' :
              soilAnalysisResults.health_status === 'Fair' ? 'medium' : 'low',
    description: rec,
    details: [rec], // Simplified for now - could be expanded
    expectedOutcome: 'Improved soil health and crop productivity',
    cost: rec.toLowerCase().includes('lime') ? 8500 :
          rec.toLowerCase().includes('fertilizer') ? 4200 :
          rec.toLowerCase().includes('irrigation') ? 2800 : 1500,
    timeframe: rec.toLowerCase().includes('immediate') ? 'Immediate' :
               rec.toLowerCase().includes('month') ? '2-3 months' : '2-4 weeks'
  })) || [];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleScheduleTest = (facility) => {
    console.log('Scheduling test with:', facility?.name);
    // Mock scheduling functionality
    alert(`Test scheduled with ${facility?.name}. You will receive a confirmation email shortly.`);
  };

  const handleApplyRecommendation = (recommendation) => {
    console.log('Applying recommendation:', recommendation?.title);
    // Mock apply functionality
    alert(`Recommendation "${recommendation?.title}" has been added to your action plan.`);
  };

  const handleSoilMetricsSubmit = (newMetrics) => {
    setUserSoilMetrics(newMetrics);
    setShowInputForm(false);
    // You could also save to localStorage or send to API here
    localStorage.setItem('userSoilMetrics', JSON.stringify(newMetrics));
  };

  // Load saved metrics on component mount
  useEffect(() => {
    const savedMetrics = localStorage.getItem('userSoilMetrics');
    if (savedMetrics) {
      setUserSoilMetrics(JSON.parse(savedMetrics));
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('soil.title')} - AgriSmart</title>
        <meta name="description" content="Monitor and analyze critical soil parameters for optimal crop management decisions with real-time metrics and recommendations." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <MainSidebar />
        
        <main className={`transition-agricultural ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pb-16 lg:pb-0`}>
          {/* Header */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="px-4 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{t('soil.title')}</h1>
                  <p className="text-muted-foreground">{t('soil.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={showInputForm ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setShowInputForm(!showInputForm)}
                    iconName={showInputForm ? "X" : "Edit"}
                    iconPosition="left"
                  >
                    {showInputForm ? 'Cancel' : 'Update Metrics'}
                  </Button>
                  <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
                    {t('soil.export')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 lg:px-8 py-6 space-y-6">
            {/* Soil Metrics Input Form */}
            {showInputForm && (
              <SoilMetricsInputForm
                onSubmit={handleSoilMetricsSubmit}
                initialValues={userSoilMetrics}
              />
            )}

            {/* Current Soil Metrics */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">{t('soil.currentMetrics')}</h2>
                <div className="text-sm text-muted-foreground">
                  {loading ? 'Loading soil data...' : `Last updated: ${new Date().toLocaleDateString()}`}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading soil data...</span>
                </div>
              ) : error ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-destructive mb-2">Failed to Load Soil Data</h3>
                  <p className="text-destructive/80 mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {soilMetrics?.map((metric, index) => (
                    <SoilMetricsCard
                      key={index}
                      title={metric?.title}
                      value={metric?.value}
                      unit={metric?.unit}
                      status={metric?.status}
                      icon={metric?.icon}
                      recommendation={metric?.recommendation}
                      trend={metric?.trend}
                      source={metric?.source}
                      lastUpdated={metric?.lastUpdated}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Soil Health Analysis Results */}
            {soilAnalysisResults && (
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-card-foreground">Soil Health Analysis</h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    soilAnalysisResults.health_status === 'Excellent' ? 'bg-green-100 text-green-800' :
                    soilAnalysisResults.health_status === 'Good' ? 'bg-blue-100 text-blue-800' :
                    soilAnalysisResults.health_status === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {soilAnalysisResults.health_status} ({soilAnalysisResults.overall_score}%)
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{soilAnalysisResults.overall_score}%</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{soilAnalysisResults.recommendations?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Recommendations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{soilAnalysisResults.deficiencies?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Deficiencies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{soilAnalysisResults.improvements?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Improvements</div>
                  </div>
                </div>

                {soilAnalysisResults.deficiencies && soilAnalysisResults.deficiencies.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-destructive mb-2">Nutrient Deficiencies:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {soilAnalysisResults.deficiencies.map((def, index) => (
                        <li key={index}>{def}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analyzing && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                    <span className="text-muted-foreground">Analyzing soil health...</span>
                  </div>
                )}
              </div>
            )}

            {/* Trend Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SoilTrendChart
                data={trendData}
                title={t('soil.trendNpk')}
                parameters={['nitrogen', 'phosphorus', 'potassium']}
              />
              <SoilTrendChart
                data={trendData}
                title={t('soil.trendPhMoist')}
                parameters={['ph', 'moisture']}
              />
            </div>

            {/* Fertilizer Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">AI Fertilizer Recommendations</h2>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-muted-foreground">
                    Get personalized fertilizer recommendations
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    iconName="Leaf" 
                    iconPosition="left"
                    onClick={() => {
                      console.log('Get Recommendation button clicked');
                      setShowFertilizerForm(true);
                    }}
                  >
                    Get Recommendation
                  </Button>
                </div>
              </div>
              
              {/* Show results if available */}
              {fertilizerResults ? (
                <FertilizerPredictionResults 
                  results={fertilizerResults} 
                  onClose={() => setFertilizerResults(null)}
                />
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Leaf className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Get AI-Powered Fertilizer Recommendations
                    </h3>
                    <p className="text-green-600 mb-4">
                      Enter your soil and environmental parameters to receive personalized fertilizer recommendations based on machine learning analysis.
                    </p>
                    <Button 
                      variant="default" 
                      iconName="Leaf" 
                      iconPosition="left"
                      onClick={() => {
                        console.log('Start Analysis button clicked');
                        setShowFertilizerForm(true);
                      }}
                    >
                      Start Analysis
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">{t('soil.recommendations')}</h2>
                <Button variant="outline" size="sm" iconName="Settings" iconPosition="left">
                  {t('soil.customize')}
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations?.map((recommendation) => (
                  <SoilRecommendationCard
                    key={recommendation?.id}
                    recommendation={recommendation}
                    onApplyRecommendation={handleApplyRecommendation}
                  />
                ))}
              </div>
            </div>

            {/* Soil Testing Facilities */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">{t('soil.testingFacilities')}</h2>
                <Button variant="outline" size="sm" iconName="MapPin" iconPosition="left">
                  {t('soil.viewMap')}
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {testingFacilities?.map((facility) => (
                  <SoilTestingCard
                    key={facility?.id}
                    facility={facility}
                    onScheduleTest={handleScheduleTest}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-agricultural">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">{t('soil.quickActions')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" fullWidth iconName="Calendar" iconPosition="left">
                  {t('soil.scheduleTest')}
                </Button>
                <Button variant="outline" fullWidth iconName="FileText" iconPosition="left">
                  {t('soil.viewHistory')}
                </Button>
                <Button variant="outline" fullWidth iconName="Bell" iconPosition="left">
                  {t('soil.setAlerts')}
                </Button>
                <Button variant="outline" fullWidth iconName="Share2" iconPosition="left">
                  {t('soil.shareReport')}
                </Button>
              </div>
            </div>
          </div>
        </main>

        <MobileNavigationBar />

        {/* Fertilizer Prediction Form Modal */}
        {showFertilizerForm && (
          <FertilizerPredictionForm
            isOpen={showFertilizerForm}
            onClose={() => setShowFertilizerForm(false)}
            onPredict={getFertilizerRecommendation}
            loading={gettingFertilizer}
          />
        )}
      </div>
    </>
  );
};

export default SoilHealthMonitor;