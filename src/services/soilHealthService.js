import { apiGet, apiPost } from '../lib/api';

export const soilHealthService = {
  // Get current soil health data
  async getCurrentSoilData() {
    try {
      return await apiGet('/api/soil-health/current');
    } catch (error) {
      console.error('Error fetching current soil data:', error);
      throw error;
    }
  },

  // Analyze soil health
  async analyzeSoilHealth(soilData) {
    try {
      return await apiPost('/api/soil-health/analyze', soilData);
    } catch (error) {
      console.error('Error analyzing soil health:', error);
      throw error;
    }
  },

  // Get fertilizer recommendation
  async getFertilizerRecommendation(fertilizerData) {
    try {
      return await apiPost('/api/soil-health/fertilizer-recommendation', fertilizerData);
    } catch (error) {
      console.error('Error getting fertilizer recommendation:', error);
      throw error;
    }
  }
};

export default soilHealthService;
