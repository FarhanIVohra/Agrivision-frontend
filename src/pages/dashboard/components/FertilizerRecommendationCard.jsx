import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import './FertilizerRecommendationCard.css';

// Backend URL from environment (Vite) - normalize to avoid double slashes
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

const FertilizerRecommendationCard = () => {
  const [fertilizerData, setFertilizerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock soil data for fertilizer prediction
  const mockSoilData = {
    nitrogen: 45,
    phosphorus: 28,
    potassium: 35,
    ph: 6.8,
    moisture: 32,
    temperature: 25,
    humidity: 50,
    soil_type: "loam"
  };

  useEffect(() => {
    fetchFertilizerRecommendation();
  }, []);

  const fetchFertilizerRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Call the fertilizer recommendation API endpoint
      const response = await axios.post(
        `${BACKEND_URL}/api/soil-health/fertilizer-recommendation`,
        mockSoilData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setFertilizerData(response.data.data);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to get fertilizer recommendation');
      }
    } catch (err) {
      console.error('Error fetching fertilizer recommendation:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load fertilizer recommendation');
      
      // Fallback to mock data for demonstration
      setFertilizerData({
        fertilizer_type: "DAP",
        application_guidelines: {
          timing: "Apply during soil preparation, 2-3 weeks before sowing",
          method: "Broadcast application followed by incorporation into soil",
          frequency: "Once per season at the beginning of crop cycle",
          precautions: "Avoid application during heavy rainfall. Ensure proper soil moisture."
        },
        cost_estimate: {
          fertilizer_type: "DAP",
          cost_per_kg: 45.0,
          recommended_quantity_per_acre: 50,
          total_cost_per_acre: 2250.0,
          currency: "INR",
          last_updated: new Date().toISOString()
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setApplied(true);
    setShowSuccess(true);
    
    // Log acceptance
    console.log('Fertilizer recommendation applied:', {
      fertilizer_type: fertilizerData?.fertilizer_type,
      timestamp: new Date().toISOString(),
      user_action: 'accepted'
    });

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleRefresh = () => {
    setApplied(false);
    fetchFertilizerRecommendation();
  };

  if (loading) {
    return (
      <div className="fertilizer-card loading-card">
        <div className="card-header">
          <div className="header-icon">
            <Icon name="Sprout" size={24} color="var(--color-primary)" />
          </div>
          <div className="header-content">
            <h3 className="card-title">Fertilizer Recommendation</h3>
            <p className="card-subtitle">AI-powered fertilizer suggestions</p>
          </div>
        </div>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Analyzing soil conditions...</p>
        </div>
      </div>
    );
  }

  if (error && !fertilizerData) {
    return (
      <div className="fertilizer-card error-card">
        <div className="card-header">
          <div className="header-icon">
            <Icon name="AlertTriangle" size={24} color="var(--color-error)" />
          </div>
          <div className="header-content">
            <h3 className="card-title">Fertilizer Recommendation</h3>
            <p className="card-subtitle">Unable to load recommendations</p>
          </div>
        </div>
        <div className="error-content">
          <p className="error-message">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            iconName="RefreshCw"
            iconPosition="left"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fertilizer-card">
      {/* Success notification */}
      {showSuccess && (
        <div className="success-notification">
          <Icon name="CheckCircle" size={16} />
          <span>Recommendation applied successfully!</span>
        </div>
      )}

      <div className="card-header">
        <div className="header-icon">
          <Icon name="Sprout" size={24} color="var(--color-primary)" />
        </div>
        <div className="header-content">
          <h3 className="card-title">Fertilizer Recommendation</h3>
          <p className="card-subtitle">AI-powered fertilizer suggestions</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          iconName="RefreshCw"
        />
      </div>

      {fertilizerData && (
        <div className="card-content">
          {/* Recommended Fertilizer */}
          <div className="fertilizer-type-section">
            <div className="fertilizer-badge">
              <Icon name="Leaf" size={16} />
              <span className="fertilizer-name">{fertilizerData.fertilizer_type}</span>
            </div>
            <div className="recommendation-status">
              <span className="status-indicator recommended"></span>
              <span className="status-text">Recommended</span>
            </div>
          </div>

          {/* Cost Information */}
          {fertilizerData.cost_estimate && (
            <div className="cost-section">
              <h4 className="section-title">Cost Estimate</h4>
              <div className="cost-grid">
                <div className="cost-item">
                  <span className="cost-label">Price per kg</span>
                  <span className="cost-value">
                    ₹{fertilizerData.cost_estimate.cost_per_kg}
                  </span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">Quantity needed</span>
                  <span className="cost-value">
                    {fertilizerData.cost_estimate.recommended_quantity_per_acre} kg/acre
                  </span>
                </div>
                <div className="cost-item total-cost">
                  <span className="cost-label">Total cost per acre</span>
                  <span className="cost-value">
                    ₹{fertilizerData.cost_estimate.total_cost_per_acre}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Application Guidelines */}
          {fertilizerData.application_guidelines && (
            <div className="guidelines-section">
              <h4 className="section-title">Application Guidelines</h4>
              <div className="guidelines-list">
                <div className="guideline-item">
                  <Icon name="Clock" size={14} />
                  <div className="guideline-content">
                    <span className="guideline-label">Timing:</span>
                    <span className="guideline-text">{fertilizerData.application_guidelines.timing}</span>
                  </div>
                </div>
                <div className="guideline-item">
                  <Icon name="Settings" size={14} />
                  <div className="guideline-content">
                    <span className="guideline-label">Method:</span>
                    <span className="guideline-text">{fertilizerData.application_guidelines.method}</span>
                  </div>
                </div>
                <div className="guideline-item">
                  <Icon name="RotateCcw" size={14} />
                  <div className="guideline-content">
                    <span className="guideline-label">Frequency:</span>
                    <span className="guideline-text">{fertilizerData.application_guidelines.frequency}</span>
                  </div>
                </div>
                {fertilizerData.application_guidelines.precautions && (
                  <div className="guideline-item warning">
                    <Icon name="AlertTriangle" size={14} />
                    <div className="guideline-content">
                      <span className="guideline-label">Precautions:</span>
                      <span className="guideline-text">{fertilizerData.application_guidelines.precautions}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="action-section">
            {!applied ? (
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleApply}
                iconName="Check"
                iconPosition="left"
              >
                Apply Recommendation
              </Button>
            ) : (
              <Button 
                variant="success" 
                fullWidth 
                disabled
                iconName="CheckCircle"
                iconPosition="left"
              >
                Applied Successfully
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="card-footer">
            <div className="footer-info">
              <Icon name="Brain" size={12} />
              <span>AI-powered recommendation</span>
            </div>
            {fertilizerData.cost_estimate?.last_updated && (
              <div className="last-updated">
                Updated: {new Date(fertilizerData.cost_estimate.last_updated).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerRecommendationCard;