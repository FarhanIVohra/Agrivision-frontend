import { apiPost } from '../lib/api';

class YieldService {
  async predictYield(formData) {
    try {
      const response = await apiPost('/api/dashboard/yield-prediction', formData);
      return response;
    } catch (error) {
      console.error('Error predicting yield:', error);
      throw error;
    }
  }
}

export const yieldService = new YieldService();
export default yieldService;
