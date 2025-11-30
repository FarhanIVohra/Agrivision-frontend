import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import YieldPredictionModal from '../../components/YieldPredictionModal';
import MainSidebar from '../../components/ui/MainSidebar';
import MobileNavigationBar from '../../components/ui/MobileNavigationBar';
import ProfitAnalysisDashboard from '../../components/ProfitAnalysisDashboard';
import profitableCropsService from '../../services/profitableCropsService';
import { apiGet } from '../../lib/api';
import { toast } from 'react-hot-toast';

const ProfitableCrops = () => {
  const { t } = useTranslation();
  const { isAuthenticated, makeAuthenticatedRequest, logout } = useAuthContext();
  
  // Redirect if not authenticated (additional check)
  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      return;
    }
  }, [isAuthenticated, logout]);
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showYieldModal, setShowYieldModal] = useState(false);
  const [yieldResults, setYieldResults] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [customLocation, setCustomLocation] = useState('');
  const [availableCrops, setAvailableCrops] = useState([]);
  const [marketTrends, setMarketTrends] = useState(null);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    ph: '',
    humidity: '',
    rainfall: '',
    farm_size: '1'
  });
  const [modelStatus, setModelStatus] = useState('unknown'); // 'ML', 'Rule-based', 'unknown'

  // Summary card state variables
  const [bestCrop, setBestCrop] = useState('No recommendation');
  const [expectedROI, setExpectedROI] = useState(0);
  const [netProfit, setNetProfit] = useState('N/A');
  const [optionsCount, setOptionsCount] = useState(0);

  // Get user's current location using geolocation API
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  // Fetch weather data from API using location
  const fetchWeatherData = async (location = null) => {
    setWeatherLoading(true);

    let locationQuery = 'Nadiad, IN'; // Default fallback

    if (location) {
      if (typeof location === 'string') {
        locationQuery = location;
      } else if (location.latitude && location.longitude) {
        locationQuery = `${location.latitude},${location.longitude}`;
      }
    } else if (userLocation) {
      locationQuery = `${userLocation.latitude},${userLocation.longitude}`;
    }

    try {
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = new Date().getTime();
      const data = await apiGet(`/weather/current?location=${encodeURIComponent(locationQuery)}&_t=${cacheBuster}`);
      setWeatherData(data);

      // Force update form data with fresh weather values
      const temperature = data.current?.temperature?.toString() || '';
      const humidity = data.current?.humidity?.toString() || '';
      const rainfall = '0'; // Current weather doesn't provide rainfall amount

      console.log('🌤️ Fresh weather data received:', {
        temperature: data.current?.temperature,
        humidity: data.current?.humidity,
        source: data.source,
        timestamp: data.timestamp
      });

      // Force update form data by completely replacing weather-related fields
      setFormData(prev => {
        const updated = {
          ...prev,
          temperature: temperature,
          humidity: humidity,
          rainfall: rainfall
        };
        console.log('📝 Form data force updated:', {
          old_temp: prev.temperature,
          new_temp: temperature,
          old_humidity: prev.humidity,
          new_humidity: humidity
        });
        return updated;
      });

    } catch (error) {
      console.error('❌ Error fetching weather data:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Initialize location and weather data
  const initializeWeatherData = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setLocationError(null);
      await fetchWeatherData(location);
    } catch (error) {
      console.log('Geolocation error:', error.message);
      setLocationError(error.message);
      // Fallback to default location
      await fetchWeatherData();
    }
  };

  // Fetch weather data on component mount
  useEffect(() => {
    // Clear any cached weather data to ensure fresh data
    localStorage.removeItem('weatherData');
    sessionStorage.removeItem('weatherData');

    initializeWeatherData();
  }, []);

  // Fetch available crops on component mount
  useEffect(() => {
    const fetchAvailableCrops = async () => {
      setCropsLoading(true);
      try {
        const crops = await profitableCropsService.getAvailableCrops();
        setAvailableCrops(crops);
      } catch (error) {
        console.error('Error fetching available crops:', error);
        toast.error('Failed to load available crops');
      } finally {
        setCropsLoading(false);
      }
    };

    fetchAvailableCrops();
  }, []);

  // Fetch market trends on component mount
  useEffect(() => {
    const fetchMarketTrends = async () => {
      setTrendsLoading(true);
      try {
        const trends = await profitableCropsService.getMarketTrends();
        setMarketTrends(trends);
      } catch (error) {
        console.error('Error fetching market trends:', error);
        toast.error('Failed to load market trends');
      } finally {
        setTrendsLoading(false);
      }
    };

    fetchMarketTrends();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleYieldPredict = (data) => {
    setYieldResults(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload matching backend API
      const payload = {
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium || 35),
        ph: Number(formData.ph),
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        rainfall: Number(formData.rainfall),
        farm_size: Number(formData.farm_size || 1)
      };

      // Use the service to make the API call
      const data = await profitableCropsService.predictProfitableCrops(payload);

      // Set model status based on response
      setModelStatus(data.model_used || 'Rule-based');

      // Update summary card state variables with backend response
      if (data.top_crop === null) {
        toast.error("No profitable crop found for these inputs");
        // Reset to defaults but don't break UI
        setBestCrop('No recommendation');
        setExpectedROI(0);
        setNetProfit('N/A');
        setOptionsCount(0);
      } else {
        setBestCrop(data.top_crop);
        setExpectedROI(data.expected_roi);
        setNetProfit(data.net_profit);
        setOptionsCount(data.options ? data.options.length : 0);
      }

      // Use the response directly as it matches our expected structure
      setResults(data);
      setLoading(false);
    } catch (error) {
      console.error('Error predicting crops:', error);
      toast.error('Failed to predict profitable crops. Please try again.');
      // Fallback to mock on any error
      const mockResults = generateMockResults(formData);
      setResults(mockResults);
      setModelStatus('Rule-based');
      setLoading(false);
    }
  };

  const generateMockResults = (data) => {
    const nitrogen = parseFloat(data.nitrogen);
    const phosphorus = parseFloat(data.phosphorus);
    const potassium = isNaN(parseFloat(data.potassium)) ? 35 : parseFloat(data.potassium);
    const ph = parseFloat(data.ph);
    const temperature = parseFloat(data.temperature);
    const humidity = parseFloat(data.humidity);
    const rainfall = parseFloat(data.rainfall);
    const farmSize = 1; // assume 1 hectare for mock calculations

    // Calculate crop suitability based on actual soil conditions
    const crops = [
      {
        crop_name: "Wheat",
        base_roi: 75,
        nutrient_requirements: { N: 120, P: 60, K: 40, pH_min: 6.0, pH_max: 7.5 },
        market_price: 250,
        base_yield: 4.5,
        growing_season_days: 120,
        water_requirement: "medium"
      },
      {
        crop_name: "Rice", 
        base_roi: 85,
        nutrient_requirements: { N: 100, P: 50, K: 50, pH_min: 5.5, pH_max: 7.0 },
        market_price: 350,
        base_yield: 5.0,
        growing_season_days: 150,
        water_requirement: "high"
      },
      {
        crop_name: "Cotton",
        base_roi: 70,
        nutrient_requirements: { N: 80, P: 40, K: 80, pH_min: 5.8, pH_max: 8.0 },
        market_price: 1200,
        base_yield: 2.5,
        growing_season_days: 180,
        water_requirement: "high"
      },
      {
        crop_name: "Corn",
        base_roi: 80,
        nutrient_requirements: { N: 150, P: 70, K: 60, pH_min: 6.0, pH_max: 7.0 },
        market_price: 175,
        base_yield: 6.0,
        growing_season_days: 100,
        water_requirement: "medium"
      },
      {
        crop_name: "Soybean",
        base_roi: 65,
        nutrient_requirements: { N: 60, P: 80, K: 100, pH_min: 6.0, pH_max: 7.0 },
        market_price: 400,
        base_yield: 3.0,
        growing_season_days: 120,
        water_requirement: "medium"
      }
    ];

    // Calculate actual ROI based on soil conditions
    const analyzedCrops = crops.map(crop => {
      // pH suitability factor
      const ph_suitable = ph >= crop.nutrient_requirements.pH_min && ph <= crop.nutrient_requirements.pH_max;
      const ph_factor = ph_suitable ? 1.0 : 0.7;

      // Nutrient efficiency calculation
      const n_efficiency = Math.min(1.2, nitrogen / crop.nutrient_requirements.N);
      const p_efficiency = Math.min(1.2, phosphorus / crop.nutrient_requirements.P);
      const k_efficiency = Math.min(1.2, potassium / crop.nutrient_requirements.K);
      
      const nutrient_factor = (n_efficiency * 0.5 + p_efficiency * 0.3 + k_efficiency * 0.2);
      
      // Calculate final metrics
      // Climate suitability adds simple modifiers for demo when backend not available
      const temp_factor = isNaN(temperature) ? 1 : (temperature >= 20 && temperature <= 32 ? 1 : 0.85);
      const humidity_factor = isNaN(humidity) ? 1 : (humidity >= 40 && humidity <= 85 ? 1 : 0.9);
      const rain_factor = isNaN(rainfall) ? 1 : (rainfall >= 60 && rainfall <= 300 ? 1 : 0.8);
      const suitability_factor = nutrient_factor * ph_factor * temp_factor * humidity_factor * rain_factor;
      const actual_roi = crop.base_roi * suitability_factor;
      const expected_yield = crop.base_yield * suitability_factor;
      const total_yield = expected_yield * farmSize;
      
      // Calculate costs and profits
      const revenue_per_ha = expected_yield * crop.market_price;
      const fertilizer_cost_per_ha = Math.max(0, 
        (Math.max(0, crop.nutrient_requirements.N - nitrogen) * 0.5) +
        (Math.max(0, crop.nutrient_requirements.P - phosphorus) * 0.7) +
        (Math.max(0, crop.nutrient_requirements.K - potassium) * 0.4)
      );
      
      const other_costs_per_ha = crop.base_yield * 50; // Base farming costs
      const total_cost_per_ha = fertilizer_cost_per_ha + other_costs_per_ha;
      const net_profit_per_ha = revenue_per_ha - total_cost_per_ha;
      
      const total_revenue = revenue_per_ha * farmSize;
      const total_cost = total_cost_per_ha * farmSize;
      const net_profit = net_profit_per_ha * farmSize;

      return {
        crop_name: crop.crop_name,
        roi: Math.round(actual_roi * 10) / 10,
        net_profit: Math.round(net_profit),
        expected_yield: Math.round(expected_yield * 10) / 10,
        total_yield: Math.round(total_yield * 10) / 10,
        market_price: crop.market_price,
        total_revenue: Math.round(total_revenue),
        total_cost: Math.round(total_cost),
        growing_season_days: crop.growing_season_days,
        water_requirement: crop.water_requirement,
        ph_suitable: ph_suitable,
        suitability_score: Math.round(suitability_factor * 100),
        fertilizer_plan: {
          urea_bags: Math.round(Math.max(0, crop.nutrient_requirements.N - nitrogen) * farmSize / 50 * 10) / 10,
          dap_bags: Math.round(Math.max(0, crop.nutrient_requirements.P - phosphorus) * farmSize / 50 * 10) / 10,
          mop_bags: Math.round(Math.max(0, crop.nutrient_requirements.K - potassium) * farmSize / 50 * 10) / 10,
          total_fertilizer_cost: Math.round(fertilizer_cost_per_ha * farmSize)
        }
      };
    });

    // Sort by ROI
    analyzedCrops.sort((a, b) => b.roi - a.roi);

    return {
      status: "success",
      soil_analysis: {
        nitrogen: nitrogen,
        phosphorus: phosphorus,
        potassium: potassium,
        ph: ph,
        farm_size: farmSize
      },
      top_crops: analyzedCrops,
      summary: {
        best_crop: analyzedCrops[0].crop_name,
        max_roi: analyzedCrops[0].roi,
        total_investment_needed: analyzedCrops[0].total_cost,
        expected_profit: analyzedCrops[0].net_profit
      },
      recommendations: [
        `Plant ${analyzedCrops[0].crop_name} for maximum profitability (ROI: ${analyzedCrops[0].roi}%)`,
        `Invest $${analyzedCrops[0].fertilizer_plan.total_fertilizer_cost} in fertilizers for optimal yield`,
        `Alternative: ${analyzedCrops[1].crop_name} (ROI: ${analyzedCrops[1].roi}%)`,
        analyzedCrops[0].ph_suitable ? "Soil pH is suitable for recommended crop" : "Consider soil pH adjustment for better crop performance",
        "Monitor market prices regularly for timing your sales"
      ]
    };
  };

  const defaultUserData = {
    username: "Farm Manager",
    email: "manager@farm.com",
    phone: "+91 00000 00000"
  };

  return (
    <div className="min-h-screen bg-background">
      <MainSidebar
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        userData={defaultUserData}
      />
      <div className={`transition-agricultural ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        {/* Header */}
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Profitable Crop Predictor 🌾
              </h1>
              <p className="text-muted-foreground mt-1">
                Get AI-powered crop recommendations based on soil nutrients and market profitability
              </p>
              {modelStatus !== 'unknown' && (
                <div className="flex items-center mt-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    modelStatus === 'ML'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {modelStatus === 'ML' ? '🤖 ML Model' : '📊 Rule-based'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name="Sprout" size={24} color="var(--color-primary)" />
                </div>
                <h2 className="text-xl font-semibold text-card-foreground">Soil Analysis Input</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Nitrogen (N) - kg/ha
                    </label>
                    <input
                      type="number"
                      name="nitrogen"
                      value={formData.nitrogen}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 45"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Phosphorus (P) - kg/ha
                    </label>
                    <input
                      type="number"
                      name="phosphorus"
                      value={formData.phosphorus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 25"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Potassium (K) - kg/ha
                    </label>
                    <input
                      type="number"
                      name="potassium"
                      value={formData.potassium}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 35"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-card-foreground mb-2">
                      <span>Temperature (°C)</span>
                      {weatherData && (
                        <div className="flex items-center space-x-1 text-xs text-green-600">
                          <Icon name="Cloud" size={12} />
                          <span>Weather API</span>
                        </div>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., 26"
                        required
                      />
                      {weatherLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Icon name="Loader2" size={16} className="animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Soil pH
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="ph"
                      value={formData.ph}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 6.8"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-card-foreground mb-2">
                      <span>Humidity (%)</span>
                      {weatherData && (
                        <div className="flex items-center space-x-1 text-xs text-green-600">
                          <Icon name="Cloud" size={12} />
                          <span>Weather API</span>
                        </div>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        name="humidity"
                        value={formData.humidity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., 60"
                        required
                      />
                      {weatherLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Icon name="Loader2" size={16} className="animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-card-foreground mb-2">
                      <span>Rainfall (mm)</span>
                      {weatherData && (
                        <div className="flex items-center space-x-1 text-xs text-green-600">
                          <Icon name="Cloud" size={12} />
                          <span>Weather API</span>
                        </div>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        name="rainfall"
                        value={formData.rainfall}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., 120"
                        required
                      />
                      {weatherLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Icon name="Loader2" size={16} className="animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Farm Size (hectares)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="farm_size"
                      value={formData.farm_size}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 1"
                      min="0.1"
                      required
                    />
                  </div>
                </div>

                {/* Weather Data Refresh Button */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="Cloud" size={16} color="var(--color-blue-600)" />
                    <span className="text-sm text-blue-700">
                      {weatherData ? 'Weather data loaded' : 'No weather data'}
                    </span>
                    {weatherData && (
                      <span className="text-xs text-blue-600">
                        (Updated: {new Date().toLocaleTimeString()})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fetchWeatherData()}
                      disabled={weatherLoading}
                      iconName={weatherLoading ? "Loader2" : "RefreshCw"}
                      iconPosition="left"
                      className="text-blue-600 border-blue-300 hover:bg-blue-100"
                    >
                      {weatherLoading ? "Loading..." : "Refresh Weather"}
                    </Button>
                  </div>
                </div>

                {/* Location Input Section */}
                {locationError && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-600 text-sm font-medium">
                        📍 Location Access Denied
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      {locationError}. Please enter your location manually for accurate weather data.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter city, country (e.g., New York, US)"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="flex-1 px-3 py-2 border border-yellow-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (customLocation.trim()) {
                            fetchWeatherData(customLocation.trim());
                          }
                        }}
                        disabled={weatherLoading || !customLocation.trim()}
                        className="text-yellow-600 border-yellow-300 hover:bg-yellow-100"
                      >
                        Get Weather
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  iconName={loading ? "Loader2" : "TrendingUp"}
                  iconPosition="left"
                >
                  {loading ? "Analyzing..." : "Predict Profitable Crops"}
                </Button>
              </form>
            </div>

            {/* Results */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Icon name="BarChart3" size={24} color="var(--color-success)" />
                </div>
                <h2 className="text-xl font-semibold text-card-foreground">Profitability Analysis</h2>
              </div>

              {!results && !loading && (
                <div className="text-center py-12">
                  <Icon name="Sprout" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                  <p className="text-muted-foreground">Enter your soil data to get crop recommendations</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <Icon name="Loader2" size={48} color="var(--color-primary)" className="mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Analyzing soil data and market conditions...</p>
                </div>
              )}

              {results && (
                <div className="space-y-6">
                  {/* Enhanced Summary with Market Insights */}
                  <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-lg p-6 border border-success/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-success text-lg flex items-center">
                        <Icon name="TrendingUp" size={20} className="mr-2" />
                        Best Investment Opportunity
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                          {results.prediction_metadata?.algorithm || 'Enhanced ML'}
                        </span>
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          {results.total_crops || 0} Options
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">
                          {bestCrop}
                        </div>
                        <div className="text-sm text-muted-foreground">Top Crop</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {expectedROI}%
                        </div>
                        <div className="text-sm text-muted-foreground">Expected ROI</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{typeof netProfit === 'number' ? netProfit.toLocaleString() : netProfit}
                        </div>
                        <div className="text-sm text-muted-foreground">Net Profit</div>
                      </div>
                    </div>

                    {/* Market Analysis Insights */}
                    {results.profitable_crops?.[0]?.market_insights && (
                      <div className="bg-white/50 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-card-foreground mb-3 flex items-center">
                          <Icon name="BarChart3" size={16} className="mr-2" />
                          Market Analysis
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Price Trend:</span>
                            <span className={`font-medium ${
                              results.profitable_crops[0].market_insights.price_trend === 'increasing' ? 'text-green-600' :
                              results.profitable_crops[0].market_insights.price_trend === 'decreasing' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {results.profitable_crops[0].market_insights.price_trend || 'Stable'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Volatility:</span>
                            <span className={`font-medium ${
                              results.profitable_crops[0].market_insights.price_volatility === 'low' ? 'text-green-600' :
                              results.profitable_crops[0].market_insights.price_volatility === 'high' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {results.profitable_crops[0].market_insights.price_volatility || 'Medium'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Market Price:</span>
                            <span className="font-medium text-card-foreground">
                              ₹{results.profitable_crops[0].market_insights.market_price || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Risk Level:</span>
                            <span className={`font-medium ${
                              results.profitable_crops[0].market_insights.risk_level === 'Low' ? 'text-green-600' :
                              results.profitable_crops[0].market_insights.risk_level === 'High' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {results.profitable_crops[0].market_insights.risk_level || 'Medium'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <Button
                        type="button"
                        onClick={() => setShowYieldModal(true)}
                        iconName="TrendingUp"
                        iconPosition="left"
                        className="mr-3"
                      >
                        Predict My Yield
                      </Button>
                      {results.profitable_crops?.[0]?.crop_name && (
                        <Button
                          type="button"
                          variant="outline"
                          iconName="Download"
                          iconPosition="left"
                          onClick={() => {
                            const reportData = {
                              crop: results.profitable_crops[0].crop_name,
                              roi: results.profitable_crops[0].roi_percentage,
                              profit: results.profitable_crops[0].net_profit,
                              market_insights: results.profitable_crops[0].market_insights,
                              timestamp: new Date().toISOString()
                            };
                            const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `crop-analysis-${results.profitable_crops[0].crop_name.toLowerCase()}.json`;
                            a.click();
                          }}
                        >
                          Download Report
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Recommendations Section - Commented out for single crop recommendation */}
                  {/* 
                  {results.enhanced_recommendations && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Seasonal Advice */}
                      {/* <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                          <Icon name="Calendar" size={16} className="mr-2" />
                          Seasonal Advice
                        </h4>
                        <p className="text-blue-800 text-sm">
                          {results.enhanced_recommendations.seasonal_advice}
                        </p>
                      </div>

                      {/* Market Timing */}
                      {/* <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                          <Icon name="Clock" size={16} className="mr-2" />
                          Market Timing
                        </h4>
                        <p className="text-purple-800 text-sm">
                          {results.enhanced_recommendations.market_timing}
                        </p>
                      </div>

                      {/* Risk Assessment */}
                      {/* <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                          <Icon name="AlertTriangle" size={16} className="mr-2" />
                          Risk Assessment
                        </h4>
                        <p className="text-orange-800 text-sm">
                          {results.enhanced_recommendations.risk_assessment}
                        </p>
                      </div>

                      {/* Investment Insights */}
                      {/* {results.enhanced_recommendations.investment_insights && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                            <Icon name="DollarSign" size={16} className="mr-2" />
                            Investment Insights
                          </h4>
                          <div className="space-y-2 text-sm text-green-800">
                            <p><strong>Best ROI:</strong> {results.enhanced_recommendations.investment_insights.best_roi_crop}</p>
                            <p><strong>Lowest Risk:</strong> {results.enhanced_recommendations.investment_insights.lowest_risk_crop}</p>
                            <p><strong>Diversification Score:</strong> {Math.round(results.enhanced_recommendations.investment_insights.diversification_score)}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cost Optimization Insights */}
                  {/* {results.enhanced_recommendations?.cost_optimization && (
                    <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 mb-4 flex items-center">
                        <Icon name="Scissors" size={16} className="mr-2" />
                        Cost Optimization Opportunities
                      </h4>
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-yellow-800">
                          ₹{results.enhanced_recommendations.cost_optimization.potential_savings?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-yellow-700">Potential Savings</div>
                      </div>
                      {results.enhanced_recommendations.cost_optimization.top_optimizations && (
                        <div className="space-y-3">
                          {results.enhanced_recommendations.cost_optimization.top_optimizations.map((opt, index) => (
                            <div key={index} className="bg-white/50 rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-yellow-900">{opt.category}</span>
                                <span className="text-sm px-2 py-1 bg-yellow-200 text-yellow-800 rounded">
                                  {opt.difficulty}
                                </span>
                              </div>
                              <p className="text-sm text-yellow-800 mb-1">{opt.method}</p>
                              <p className="text-sm font-medium text-green-700">
                                Savings: ₹{opt.savings?.toLocaleString() || 0}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )} */}

                  {/* Profit Analysis Dashboard */}
                  <ProfitAnalysisDashboard results={results} />

                  {/* Enhanced Top Crops Display - Modified for Single Crop Recommendation */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-card-foreground flex items-center">
                        <Icon name="BarChart3" size={20} className="mr-2" />
                        Best Crop Recommendation
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        ROI: {results.profitable_crops?.[0]?.roi_percentage || 0}%
                      </div>
                    </div>
                    
                    {/* Display only the top crop */}
                    {results.profitable_crops && results.profitable_crops.length > 0 && (
                      <div className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-bold">#1</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-card-foreground">
                                {results.profitable_crops[0].crop_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Suitability: {results.profitable_crops[0].suitability_score}% • ROI: {results.profitable_crops[0].roi_percentage}%
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              results.profitable_crops[0].profit_potential === 'High' ? 'bg-success/20 text-success' : 
                              results.profitable_crops[0].profit_potential === 'Medium' ? 'bg-warning/20 text-warning' : 
                              'bg-destructive/20 text-destructive'
                            }`}>
                              {results.profitable_crops[0].profit_potential} Profit
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Financial Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-xl font-bold text-blue-600">
                              {results.profitable_crops[0].estimated_yield || 'N/A'}{results.profitable_crops[0].estimated_yield ? ' tons' : ''}
                            </div>
                            <div className="text-xs text-blue-700">Expected Yield</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xl font-bold text-green-600">
                              ₹{results.profitable_crops[0].market_insights?.market_price || 'N/A'}
                            </div>
                            <div className="text-xs text-green-700">Market Price/ton</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-xl font-bold text-purple-600">
                              ₹{results.profitable_crops[0].total_revenue?.toLocaleString() || 'N/A'}
                            </div>
                            <div className="text-xs text-purple-700">Total Revenue</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-xl font-bold text-red-600">
                              ₹{results.profitable_crops[0].total_cost?.toLocaleString() || 'N/A'}
                            </div>
                            <div className="text-xs text-red-700">Total Cost</div>
                          </div>
                          <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <div className={`text-xl font-bold ${results.profitable_crops[0].net_profit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              ₹{results.profitable_crops[0].net_profit?.toLocaleString() || 'N/A'}
                            </div>
                            <div className="text-xs text-emerald-700">Net Profit</div>
                          </div>
                        </div>

                        {/* Market Insights for the top crop */}
                        {results.profitable_crops[0].market_insights && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                              <Icon name="TrendingUp" size={14} className="mr-2" />
                              Market Intelligence
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Price Trend:</span>
                                <div className={`font-medium ${
                                  results.profitable_crops[0].market_insights.price_trend === 'increasing' ? 'text-green-600' :
                                  results.profitable_crops[0].market_insights.price_trend === 'decreasing' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {results.profitable_crops[0].market_insights.price_trend || 'Stable'}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Volatility:</span>
                                <div className={`font-medium ${
                                  results.profitable_crops[0].market_insights.price_volatility === 'low' ? 'text-green-600' :
                                  results.profitable_crops[0].market_insights.price_volatility === 'high' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {results.profitable_crops[0].market_insights.price_volatility || 'Medium'}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Risk Level:</span>
                                <div className={`font-medium ${
                                  results.profitable_crops[0].market_insights.risk_level === 'Low' ? 'text-green-600' :
                                  results.profitable_crops[0].market_insights.risk_level === 'High' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {results.profitable_crops[0].market_insights.risk_level || 'Medium'}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Profit Margin:</span>
                                <div className="font-medium text-blue-600">
                                  {results.profitable_crops[0].profit_margin || 'N/A'}%
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Enhanced Fertilizer Plan */}
                        {results.profitable_crops[0].fertilizer_plan && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                              <Icon name="Beaker" size={14} className="mr-2" />
                              Optimized Fertilizer Plan
                            </h5>
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-blue-800">{results.profitable_crops[0].fertilizer_plan.urea_bags}</div>
                                <div className="text-xs text-blue-600">Urea Bags</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-blue-800">{results.profitable_crops[0].fertilizer_plan.dap_bags}</div>
                                <div className="text-xs text-blue-600">DAP Bags</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-blue-800">{results.profitable_crops[0].fertilizer_plan.mop_bags}</div>
                                <div className="text-xs text-blue-600">MOP Bags</div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-blue-800">Total Fertilizer Cost:</span>
                              <span className="font-bold text-blue-900">₹{results.profitable_crops[0].fertilizer_plan.total_fertilizer_cost?.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {(results.recommendations || results.recommendations?.seasonal_advice) && (
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {Array.isArray(results.recommendations) 
                          ? results.recommendations.map((rec, index) => (
                              <li key={index} className="text-green-800 flex items-start">
                                <span className="text-green-600 mr-2">•</span>
                                {rec}
                              </li>
                            ))
                          : results.recommendations && (
                              <>
                                <li className="text-green-800 flex items-start">
                                  <span className="text-green-600 mr-2">•</span>
                                  {results.recommendations.seasonal_advice}
                                </li>
                                <li className="text-green-800 flex items-start">
                                  <span className="text-green-600 mr-2">•</span>
                                  Risk Assessment: {results.recommendations.risk_assessment}
                                </li>
                              </>
                            )
                        }
                      </ul>
                    </div>
                  )}

                  {yieldResults && (
                    <YieldPredictionResults yieldData={yieldResults} />
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <YieldPredictionModal
        isOpen={showYieldModal}
        onClose={() => setShowYieldModal(false)}
        recommendedCrop={
          results?.summary?.best_crop || 
          results?.recommendations?.top_crop?.crop_name || 
          (results?.top_crops && results.top_crops[0]?.crop_name) ||
          (results?.profitable_crops && results.profitable_crops[0]?.crop_name) ||
          ''
        }
        onPredict={handleYieldPredict}
      />
      <MobileNavigationBar />
    </div>
  );
};

export default ProfitableCrops;
