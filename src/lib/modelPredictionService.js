// Model Prediction Service for Crop Yield, Soil Analysis, and Pest Detection
// Uses Python backend API with pretrained models: soil_model.joblib, rainfall_model.joblib, crop_disease_model.h5

class ModelPredictionService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  }

  // Check cache for recent predictions
  getCachedPrediction(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Cache prediction results
  setCachedPrediction(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Predict soil health using Python backend API
  async predictSoilHealth(soilData) {
    const cacheKey = `soil_${JSON.stringify(soilData)}`;
    const cached = this.getCachedPrediction(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      console.log('Calling Python backend for soil health prediction...');
      
      const response = await fetch(`${this.backendUrl}/api/soil-health/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(soilData)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const prediction = await response.json();
      
      console.log('Received soil health prediction from backend:', prediction);
      
      this.setCachedPrediction(cacheKey, prediction);
      return prediction;

    } catch (error) {
      console.error('Soil prediction error:', error);
      console.log('Using fallback prediction...');
      return this.getFallbackSoilPrediction(soilData);
    }
  }

  // Predict crop yield using Python backend API
  async predictCropYield(inputData) {
    const cacheKey = `yield_${JSON.stringify(inputData)}`;
    const cached = this.getCachedPrediction(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      console.log('Calling Python backend for crop yield prediction...');
      
      const response = await fetch(`${this.backendUrl}/api/crop-prediction/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const prediction = await response.json();
      
      console.log('Received crop yield prediction from backend:', prediction);
      
      this.setCachedPrediction(cacheKey, prediction);
      return prediction;

    } catch (error) {
      console.error('Yield prediction error:', error);
      console.log('Using fallback prediction...');
      return this.getFallbackYieldPrediction(inputData);
    }
  }

  // Predict pest risk using Python backend API
  async predictPestRisk(environmentData) {
    const cacheKey = `pest_${JSON.stringify(environmentData)}`;
    const cached = this.getCachedPrediction(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      console.log('Calling Python backend for pest risk prediction...');
      
      const response = await fetch(`${this.backendUrl}/api/predictions/pest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(environmentData)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const prediction = await response.json();
      
      console.log('Received pest risk prediction from backend:', prediction);
      
      this.setCachedPrediction(cacheKey, prediction);
      return prediction;

    } catch (error) {
      console.error('Pest prediction error:', error);
      console.log('Using fallback prediction...');
      return this.getFallbackPestPrediction();
    }
  }

  // Predict rainfall using Python backend API
  async predictRainfall(weatherData) {
    const cacheKey = `rainfall_${JSON.stringify(weatherData)}`;
    const cached = this.getCachedPrediction(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      console.log('Calling Python backend for rainfall prediction...');
      
      const response = await fetch(`${this.backendUrl}/api/predictions/rainfall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(weatherData)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const prediction = await response.json();
      
      console.log('Received rainfall prediction from backend:', prediction);
      
      this.setCachedPrediction(cacheKey, prediction);
      return prediction;

    } catch (error) {
      console.error('Rainfall prediction error:', error);
      console.log('Using fallback prediction...');
      return this.getFallbackRainfallPrediction();
    }
  }

  // Unified prediction method - my preferred approach
  async generatePredictions(soilData, weatherData, cropData = null) {
    try {
      console.log('🌱 Generating comprehensive predictions...');
      
      // Prepare unified input data
      const unifiedInput = this.prepareUnifiedInput(soilData, weatherData, cropData);
      
      // Run parallel predictions for efficiency
      const [soilPrediction, yieldPrediction, pestPrediction, rainfallPrediction] = await Promise.allSettled([
        this.predictSoilHealth(unifiedInput.soil),
        this.predictCropYield(unifiedInput),  // Pass complete unified input instead of just crop data
        this.predictPestRisk(unifiedInput.pest),
        this.predictRainfall(unifiedInput.weather)
      ]);

      // Process results with intelligent fallbacks
      const results = {
        soil: this.processResult(soilPrediction, 'soil'),
        yield: this.processResult(yieldPrediction, 'yield'),
        pest: this.processResult(pestPrediction, 'pest'),
        rainfall: this.processResult(rainfallPrediction, 'rainfall'),
        timestamp: new Date().toISOString(),
        confidence: this.calculateOverallConfidence([soilPrediction, yieldPrediction, pestPrediction, rainfallPrediction])
      };

      // Generate intelligent insights
      results.insights = this.generateIntelligentInsights(results);
      results.recommendations = this.generateSmartRecommendations(results);
      
      console.log('✅ Comprehensive predictions generated successfully');
      return results;

    } catch (error) {
      console.error('❌ Error in generatePredictions:', error);
      return this.getComprehensiveFallback(soilData, weatherData, cropData);
    }
  }

  // Prepare unified input from various data sources
  prepareUnifiedInput(soilData, weatherData, cropData) {
    const defaultSoil = {
      ph: 6.5,
      nitrogen: 50,
      phosphorus: 30,
      potassium: 40,
      organic_matter: 3.5,
      moisture: 25
    };

    const defaultWeather = {
      temperature: 25,
      humidity: 65,
      rainfall: 100,
      wind_speed: 10,
      pressure: 1013
    };

    return {
      soil: { ...defaultSoil, ...soilData },
      weather: { ...defaultWeather, ...weatherData },
      crop: cropData || { crop_type: 'wheat', area: 1 },
      pest: {
        temperature: weatherData?.temperature || 25,
        humidity: weatherData?.humidity || 65,
        season: this.getCurrentSeason()
      }
    };
  }

  // Process individual prediction results
  processResult(settledResult, type) {
    if (settledResult.status === 'fulfilled') {
      return settledResult.value;
    } else {
      console.warn(`⚠️ ${type} prediction failed, using fallback`);
      return this.getFallbackByType(type);
    }
  }

  // Calculate overall confidence score
  calculateOverallConfidence(results) {
    const validResults = results.filter(r => r.status === 'fulfilled');
    if (validResults.length === 0) return 60;
    
    const avgConfidence = validResults.reduce((sum, result) => {
      const confidence = result.value?.confidence || result.value?.soilHealthScore || 70;
      return sum + confidence;
    }, 0) / validResults.length;
    
    return Math.round(avgConfidence);
  }

  // Generate intelligent insights based on all predictions
  generateIntelligentInsights(results) {
    const insights = [];
    
    // Soil-based insights
    if (results.soil?.soilHealthScore) {
      if (results.soil.soilHealthScore > 80) {
        insights.push({
          type: 'positive',
          category: 'soil',
          message: 'Excellent soil conditions detected - optimal for high-yield crops',
          impact: 'high'
        });
      } else if (results.soil.soilHealthScore < 60) {
        insights.push({
          type: 'warning',
          category: 'soil',
          message: 'Soil health needs improvement - consider organic amendments',
          impact: 'medium'
        });
      }
    }

    // Weather-based insights
    if (results.rainfall?.probability > 70) {
      insights.push({
        type: 'info',
        category: 'weather',
        message: 'High rainfall probability - adjust irrigation schedule',
        impact: 'medium'
      });
    }

    // Pest risk insights
    if (results.pest?.riskScore > 70) {
      insights.push({
        type: 'alert',
        category: 'pest',
        message: 'Elevated pest risk detected - implement preventive measures',
        impact: 'high'
      });
    }

    return insights;
  }

  // Generate smart recommendations
  generateSmartRecommendations(results) {
    const recommendations = [];
    
    // Priority-based recommendations
    if (results.soil?.soilHealthScore < 70) {
      recommendations.push({
        priority: 'high',
        action: 'Improve soil health',
        details: 'Add organic compost and test nutrient levels',
        timeline: '2-4 weeks'
      });
    }

    if (results.pest?.riskScore > 60) {
      recommendations.push({
        priority: 'medium',
        action: 'Pest monitoring',
        details: 'Increase field inspections and consider organic pesticides',
        timeline: '1-2 weeks'
      });
    }

    if (results.rainfall?.probability < 30) {
      recommendations.push({
        priority: 'medium',
        action: 'Irrigation planning',
        details: 'Ensure adequate water supply and efficient irrigation',
        timeline: 'Immediate'
      });
    }

    return recommendations;
  }

  // Get fallback by prediction type
  getFallbackByType(type) {
    switch (type) {
      case 'soil':
        return this.getFallbackSoilPrediction({});
      case 'yield':
        return this.getFallbackYieldPrediction({});
      case 'pest':
        return this.getFallbackPestPrediction();
      case 'rainfall':
        return this.getFallbackRainfallPrediction();
      default:
        return { confidence: 60, status: 'fallback' };
    }
  }

  // Comprehensive fallback for complete system failure
  getComprehensiveFallback(soilData, weatherData, cropData) {
    return {
      soil: this.getFallbackSoilPrediction(soilData || {}),
      yield: this.getFallbackYieldPrediction(cropData || {}),
      pest: this.getFallbackPestPrediction(),
      rainfall: this.getFallbackRainfallPrediction(),
      confidence: 65,
      insights: [{
        type: 'info',
        category: 'system',
        message: 'Using offline predictions - connect to internet for enhanced accuracy',
        impact: 'low'
      }],
      recommendations: [{
        priority: 'low',
        action: 'System check',
        details: 'Verify internet connection for real-time predictions',
        timeline: 'When convenient'
      }],
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  // Get current season for contextual predictions
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  // Predict pest risk based on environmental conditions
  async predictPestRisk(pestData) {
    try {
      const response = await fetch(`${this.backendUrl}/predict/pest-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pestData)
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Pest prediction API failed, using fallback');
    }
    
    return this.getFallbackPestPrediction();
  }

  // Predict rainfall probability
  async predictRainfall(weatherData) {
    try {
      const response = await fetch(`${this.backendUrl}/predict/rainfall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weatherData)
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Rainfall prediction API failed, using fallback');
    }
    
    return this.getFallbackRainfallPrediction();
  }

  // Fallback pest prediction
  getFallbackPestPrediction() {
    const season = this.getCurrentSeason();
    const baseRisk = season === 'summer' ? 65 : season === 'spring' ? 55 : 45;
    
    return {
      riskScore: baseRisk + Math.random() * 20,
      riskLevel: baseRisk > 60 ? 'High' : baseRisk > 40 ? 'Medium' : 'Low',
      commonPests: this.getSeasonalPests(season),
      confidence: 70,
      recommendations: [
        'Monitor crops regularly for early pest detection',
        'Consider integrated pest management practices'
      ]
    };
  }

  // Fallback rainfall prediction
  getFallbackRainfallPrediction() {
    const season = this.getCurrentSeason();
    const baseProbability = season === 'summer' ? 40 : season === 'winter' ? 70 : 55;
    
    return {
      probability: baseProbability + Math.random() * 30,
      expectedAmount: Math.random() * 50 + 20,
      confidence: 65,
      forecast: '7-day outlook based on seasonal patterns'
    };
  }

  // Get seasonal pests
  getSeasonalPests(season) {
    const pestMap = {
      spring: ['Aphids', 'Cutworms', 'Flea beetles'],
      summer: ['Spider mites', 'Thrips', 'Corn borers'],
      autumn: ['Armyworms', 'Stink bugs', 'Root weevils'],
      winter: ['Stored grain pests', 'Rodents', 'Fungal diseases']
    };
    return pestMap[season] || pestMap.spring;
  }
  getBaseYieldForCrop(cropType) {
    const baseYields = {
      wheat: 4.2,
      rice: 5.8,
      corn: 6.5,
      soybean: 3.2,
      cotton: 2.8,
      sugarcane: 45.0
    };
    return baseYields[cropType.toLowerCase()] || 4.0;
  }

  calculateWeatherFactor(weatherData) {
    const { temperature, humidity, rainfall = 0 } = weatherData;
    let factor = 1.0;
    
    // Temperature factor
    if (temperature >= 20 && temperature <= 30) factor *= 1.1;
    else if (temperature < 15 || temperature > 35) factor *= 0.8;
    
    // Humidity factor
    if (humidity >= 50 && humidity <= 70) factor *= 1.05;
    else if (humidity < 30 || humidity > 85) factor *= 0.9;
    
    // Rainfall factor
    if (rainfall >= 50 && rainfall <= 150) factor *= 1.1;
    else if (rainfall > 200) factor *= 0.85;
    
    return Math.max(0.6, Math.min(1.4, factor));
  }

  getSoilRecommendations(score, soilData) {
    const recommendations = [];
    
    if (soilData.nitrogen < 30) {
      recommendations.push('Apply nitrogen fertilizer (60-80 kg/ha)');
    }
    if (soilData.phosphorus < 15) {
      recommendations.push('Add phosphorus supplement (40-50 kg/ha)');
    }
    if (soilData.ph < 6.0) {
      recommendations.push('Apply lime to increase soil pH');
    }
    if (score < 60) {
      recommendations.push('Consider soil testing for micronutrients');
    }
    
    return recommendations;
  }

  getYieldRecommendations(yieldValue, soilHealth, weatherData) {
    const recommendations = [];
    
    if (yieldValue < 3.0) {
      recommendations.push('Consider crop rotation or variety change');
    }
    if (soilHealth.soilHealthScore < 60) {
      recommendations.push('Improve soil health with organic matter');
    }
    if (weatherData.temperature > 30) {
      recommendations.push('Implement heat stress management');
    }
    
    return recommendations;
  }

  getCropPestRisk(cropType) {
    const riskFactors = {
      wheat: 15,
      rice: 25,
      corn: 20,
      cotton: 30,
      soybean: 18
    };
    return riskFactors[cropType.toLowerCase()] || 20;
  }

  getCommonPests(cropType, riskScore) {
    const pestsByCrop = {
      wheat: ['Aphids', 'Rust', 'Armyworm'],
      rice: ['Brown planthopper', 'Stem borer', 'Blast'],
      corn: ['Corn borer', 'Armyworm', 'Cutworm'],
      cotton: ['Bollworm', 'Whitefly', 'Thrips']
    };
    
    const pests = pestsByCrop[cropType.toLowerCase()] || ['General pests', 'Aphids', 'Caterpillars'];
    return riskScore > 60 ? pests : pests.slice(0, 2);
  }

  getPestPreventiveMeasures(riskScore) {
    if (riskScore >= 70) {
      return ['Apply preventive pesticides', 'Increase monitoring frequency', 'Use pheromone traps'];
    } else if (riskScore >= 40) {
      return ['Regular field monitoring', 'Maintain field hygiene', 'Use biological controls'];
    } else {
      return ['Continue routine monitoring', 'Maintain crop health'];
    }
  }

  // Fallback methods for error cases
  getFallbackSoilPrediction(soilData) {
    return {
      soilHealthScore: 65,
      classification: 'Good',
      confidence: 75,
      recommendations: ['Regular soil testing recommended'],
      timestamp: new Date().toISOString()
    };
  }

  getFallbackYieldPrediction(inputData) {
    return {
      predictedYield: 4.0,
      totalProduction: 4.0,
      unit: 'tons/hectare',
      confidence: 70,
      cropType: inputData.cropType || 'wheat',
      fieldArea: inputData.fieldArea || 1,
      factors: {
        soilHealth: 65,
        weatherConditions: 75,
        overallRating: 'Good'
      },
      recommendations: ['Monitor crop regularly'],
      timestamp: new Date().toISOString()
    };
  }

  getFallbackPestPrediction() {
    return {
      riskLevel: 'Medium',
      riskScore: 45,
      confidence: 70,
      commonPests: ['General pests'],
      preventiveMeasures: ['Regular monitoring'],
      timestamp: new Date().toISOString()
    };
  }

  getFallbackRainfallPrediction() {
    return {
      probability: 30,
      expectedAmount: 2,
      timeframe: '24 hours',
      confidence: 65,
      recommendation: 'Continue normal irrigation',
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export default new ModelPredictionService();