import { apiGet, apiPost } from '../lib/api';

class DashboardService {
  async getOverview() {
    try {
      return await apiGet('/api/dashboard/overview');
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      return await apiGet('/api/dashboard/stats');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getSoilData() {
    try {
      return await apiGet('/api/dashboard/soil');
    } catch (error) {
      console.error('Error fetching soil data:', error);
      throw error;
    }
  }

  async getWeatherData() {
    try {
      console.log('Dashboard service: Starting weather data fetch...');

      // Get user location (same logic as WeatherCard)
      const position = await new Promise((resolve, reject) => {
        console.log('Dashboard service: Checking geolocation...');
        if (!navigator.geolocation) {
          console.log('Dashboard service: Geolocation not supported, using default location');
          resolve({ latitude: 28.6139, longitude: 77.2090 });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('Dashboard service: Got user location:', pos.coords.latitude, pos.coords.longitude);
            resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          },
          (error) => {
            console.log('Dashboard service: Geolocation error, using default location');
            resolve({ latitude: 28.6139, longitude: 77.2090 });
          },
          { timeout: 5000 }
        );
      });

      // Fetch current weather using same API as WeatherCard
      const apiKey = '4d16be1669a3625caa757c4df10d2f60';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.latitude}&lon=${position.longitude}&appid=${apiKey}&units=metric`;

      console.log('Dashboard service: Fetching weather from:', url);

      const response = await fetch(url);

      console.log('Dashboard service: API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Weather API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dashboard service: Weather API Response:', data);

      // Format weather data to match backend response format
      const weatherData = {
        success: true,
        data: {
          current: {
            temperature: Math.round(data.main.temp),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            visibility: data.visibility ? Math.round(data.visibility / 1000) : 10,
            rainfall: data.rain ? data.rain['1h'] || 0 : 0,
            location: `${data.name}, ${data.sys.country}`
          }
        },
        user_location: {
          lat: position.latitude,
          lon: position.longitude,
          region: 'Unknown'
        }
      };

      console.log('Dashboard service: Formatted weather data:', weatherData);
      return weatherData;

    } catch (error) {
      console.error('Dashboard service: Error fetching weather data:', error);
      // Return mock data on error (same as WeatherCard)
      return {
        success: true,
        data: {
          current: {
            temperature: 25,
            condition: 'Clear',
            description: 'clear sky (mock data)',
            humidity: 65,
            wind_speed: 12,
            visibility: 10,
            rainfall: 0,
            location: 'Mock Location'
          }
        },
        user_location: {
          lat: 28.6139,
          lon: 77.2090,
          region: 'Unknown'
        }
      };
    }
  }

  async getIrrigationRecommendation(params) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/irrigation/recommendation${queryString ? `?${queryString}` : ''}`;
      return await apiGet(url);
    } catch (error) {
      console.error('Error fetching irrigation recommendation:', error);
      throw error;
    }
  }

  async predictYield(predictionData) {
    try {
      // Ensure the data matches the expected YieldPredictionRequest format
      const formattedData = {
        state: predictionData.state || 'Maharashtra',
        district: predictionData.district || 'Mumbai',
        crop: predictionData.crop || 'Rice',
        year: predictionData.year || new Date().getFullYear().toString(),
        season: predictionData.season || 'Kharif',
        area: predictionData.area || 1.0
      };
      return await apiPost('/api/dashboard/yield-prediction', formattedData);
    } catch (error) {
      console.error('Error predicting yield:', error);
      throw error;
    }
  }

  async getLatestYieldPrediction() {
    try {
      // Use POST endpoint with default parameters as per endpoints.txt
      const defaultParams = {
        state: 'Maharashtra',
        district: 'Mumbai',
        crop: 'Rice',
        year: new Date().getFullYear().toString(),
        season: 'Kharif',
        area: 4.0
      };
      return await apiPost('/api/dashboard/yield-prediction', defaultParams);
    } catch (error) {
      console.warn('Yield prediction API unavailable, returning mock data');
      // Return mock data when API is unavailable
      return {
        success: true,
        data: {
          predicted_yield_tons_per_hectare: 4.2,
          total_production_tons: 168.0,
          confidence: 87,
          yield_category: 'High',
          crop: 'Rice',
          state: 'Maharashtra',
          season: 'Kharif',
          recommendations: [
            'Maintain optimal irrigation schedule',
            'Monitor for pest activity',
            'Apply balanced NPK fertilizer'
          ]
        }
      };
    }
  }

  async getDashboardData() {
    try {
      // Fetch data from multiple endpoints concurrently
      const [weatherData, yieldData, soilData] = await Promise.allSettled([
        this.getWeatherData().catch(() => null),
        this.getLatestYieldPrediction().catch(() => null),
        this.getSoilData().catch(() => null)
      ]);

      // Structure the data as expected by dashboard components
      const dashboardData = {
        weather: weatherData.status === 'fulfilled' ? weatherData.value?.data : null,
        yield: yieldData.status === 'fulfilled' ? yieldData.value?.data : null,
        irrigation: soilData.status === 'fulfilled' ? {
          soilMoisture: soilData.value?.data?.moisture,
          recommendations: soilData.value?.data?.recommendations?.filter(r => r.title?.toLowerCase().includes('irrigation')) || []
        } : null,
        soil: soilData.status === 'fulfilled' ? soilData.value?.data : null
      };

      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return empty data structure on error
      return {
        weather: null,
        yield: null,
        irrigation: null,
        soil: null
      };
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
