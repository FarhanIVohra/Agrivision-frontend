import { apiGet, apiPost } from '../lib/api';

const pestDetectionService = {
  // Detect crop disease from image
  detectDisease: async (imageData) => {
    try {
      const response = await apiPost('/api/pest-detection/detect-disease', {
        image: imageData.image,
        cropType: imageData.cropType,
        location: imageData.location
      });
      return response;
    } catch (error) {
      console.error('Error detecting disease:', error);
      throw error;
    }
  },

  // Detect crop disease from base64 image
  detectDiseaseBase64: async (base64Data) => {
    try {
      const response = await apiPost('/api/pest-detection/detect-disease-base64', {
        base64_image: base64Data.image,
        cropType: base64Data.cropType,
        location: base64Data.location
      });
      return response;
    } catch (error) {
      console.error('Error detecting disease from base64:', error);
      throw error;
    }
  },

  // Analyze pest image
  analyzePestImage: async (imageData) => {
    try {
      // Use the existing detectDisease method or mock response
      const response = await pestDetectionService.detectDisease(imageData);
      return {
        pestDetected: response.prediction !== 'healthy',
        pestType: response.prediction,
        confidence: response.confidence,
        severity: response.severity || 'medium',
        cropType: imageData.cropType
      };
    } catch (error) {
      console.error('Error analyzing pest image:', error);
      throw error;
    }
  },

  // Get treatment recommendations
  getTreatmentRecommendations: async (pestData) => {
    try {
      // Mock treatment recommendations
      return {
        pestType: pestData.pestType,
        severity: pestData.severity,
        recommendations: [
          'Apply appropriate pesticide',
          'Monitor crop regularly',
          'Remove affected plant parts'
        ],
        preventiveMeasures: [
          'Crop rotation',
          'Proper irrigation',
          'Regular field monitoring'
        ]
      };
    } catch (error) {
      console.error('Error getting treatment recommendations:', error);
      throw error;
    }
  },

  // Get pest gallery
  getPestGallery: async (filters = {}) => {
    try {
      // Mock pest gallery data
      return [
        {
          id: 1,
          name: 'Aphids',
          image: '/images/aphids.jpg',
          description: 'Small sap-sucking insects',
          symptoms: ['Yellowing leaves', 'Stunted growth']
        },
        {
          id: 2,
          name: 'Leaf Spot',
          image: '/images/leaf-spot.jpg',
          description: 'Fungal disease causing spots on leaves',
          symptoms: ['Brown spots on leaves', 'Leaf yellowing']
        }
      ];
    } catch (error) {
      console.error('Error fetching pest gallery:', error);
      throw error;
    }
  },

  // Get supported diseases
  getSupportedDiseases: async () => {
    try {
      const response = await apiGet('/api/pest-detection/supported-diseases');
      return response;
    } catch (error) {
      console.error('Error fetching supported diseases:', error);
      throw error;
    }
  },

  // Get pest detection model information
  getModelInfo: async () => {
    try {
      const response = await apiGet('/api/pest-detection/model-info');
      return response;
    } catch (error) {
      console.error('Error fetching model info:', error);
      throw error;
    }
  },

  // Batch disease detection
  batchDetect: async (batchData) => {
    try {
      const response = await apiPost('/api/pest-detection/batch-detect', batchData);
      return response;
    } catch (error) {
      console.error('Error in batch detection:', error);
      throw error;
    }
  },

  // Predict pest risk based on environmental data
  predictPestRisk: async (environmentalData) => {
    try {
      const response = await apiPost('/api/pest-detection/predict', environmentalData);
      return response;
    } catch (error) {
      console.error('Error predicting pest risk:', error);
      throw error;
    }
  },

  // Alternative detect disease endpoint
  detectDiseaseAlt: async (imageData) => {
    try {
      const response = await apiPost('/api/pest-detection/', {
        image: imageData.image,
        cropType: imageData.cropType,
        location: imageData.location
      });
      return response;
    } catch (error) {
      console.error('Error detecting disease (alt):', error);
      throw error;
    }
  },

  // Get weather risk data
  getWeatherRiskData: async () => {
    try {
      // Mock weather risk data
      return {
        riskLevel: 'medium',
        conditions: ['High humidity', 'Moderate temperature'],
        recommendations: ['Monitor crops regularly', 'Apply preventive measures']
      };
    } catch (error) {
      console.error('Error fetching weather risk data:', error);
      throw error;
    }
  },

  // Get community reports
  getCommunityReports: async () => {
    try {
      // Mock community reports
      return [
        {
          id: 1,
          location: 'Farm A',
          pestType: 'Aphids',
          severity: 'high',
          date: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching community reports:', error);
      throw error;
    }
  }
};

export default pestDetectionService;
