import { apiGet, apiPost } from '../lib/api';

const profitableCropsService = {
  // Get available crops for selection
  async getAvailableCrops() {
    try {
      return await apiGet('/api/profitable-crops/available-crops');
    } catch (error) {
      console.error('Error fetching available crops:', error);
      throw error;
    }
  },

  // Get market trends data
  async getMarketTrends() {
    try {
      return await apiGet('/api/profitable-crops/market-trends');
    } catch (error) {
      console.error('Error fetching market trends:', error);
      throw error;
    }
  },

  // Predict multiple profitable crops
  async predictMultiple(formData) {
    try {
      return await apiPost('/api/profitable-crops/predict-multiple', formData);
    } catch (error) {
      console.error('Error predicting profitable crops:', error);
      throw error;
    }
  },

  // Predict profitable crops (legacy method for compatibility)
  async predictProfitableCrops(formData) {
    try {
      const response = await this.predictMultiple(formData);

      // Transform response to match frontend expectations
      if (response.profitable_crops && response.profitable_crops.length > 0) {
        const topCrop = response.profitable_crops[0];
        return {
          ...response,
          top_crop: topCrop.crop_name,
          expected_roi: topCrop.roi_percentage,
          net_profit: topCrop.net_profit,
          options: response.profitable_crops,
          model_used: response.model_used
        };
      } else {
        return {
          ...response,
          top_crop: null,
          expected_roi: 0,
          net_profit: 'N/A',
          options: [],
          model_used: 'Rule-based'
        };
      }
    } catch (error) {
      console.error('Error predicting profitable crops:', error);
      throw error;
    }
  }
};

export default profitableCropsService;
