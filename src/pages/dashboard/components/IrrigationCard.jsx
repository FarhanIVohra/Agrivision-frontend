import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const IrrigationCard = () => {
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        return JSON.parse(userProfile);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  };

  // Fetch irrigation recommendation from backend
  const fetchIrrigationRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = getUserData();
      const authToken = localStorage.getItem('auth_token');

      if (!authToken) {
        throw new Error('Authentication required');
      }

      // Use user's location if available, otherwise use defaults
      const latitude = user?.lat || 28.6139;
      const longitude = user?.lon || 77.2090;

      const params = new URLSearchParams({
        crop_type: 'wheat', // Default crop type
        soil_moisture: '30', // Default soil moisture
        field_size: '1.0', // Default field size
        soil_type: 'loamy', // Default soil type
        latitude: latitude.toString(),
        longitude: longitude.toString()
      });

      const response = await fetch(`http://localhost:8000/api/irrigation/recommendation?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setRecommendation(data);
      } else {
        throw new Error(data.message || 'Failed to get recommendation');
      }
    } catch (err) {
      console.error('Error fetching irrigation recommendation:', err);
      setError(err.message || 'Failed to fetch irrigation recommendation');
      toast.error('Irrigation data unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch recommendation when component mounts
    fetchIrrigationRecommendation();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-4 h-full flex flex-col">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="Droplets" size={20} color="var(--color-primary)" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">Smart Irrigation</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <Icon name="Loader2" size={24} className="animate-spin" />
            <span className="text-muted-foreground">Loading irrigation data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-4 h-full flex flex-col">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="Droplets" size={20} color="var(--color-primary)" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">Smart Irrigation</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Icon name="AlertTriangle" size={48} color="var(--color-destructive)" />
            <div>
              <p className="text-lg font-medium text-card-foreground">Unable to fetch recommendation</p>
              <p className="text-sm text-muted-foreground">Please check your connection and try again</p>
            </div>
            <Button
              onClick={fetchIrrigationRecommendation}
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state with recommendation data
  return (
    <div className="bg-card rounded-lg border border-border p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon name="Droplets" size={20} color="var(--color-primary)" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground">Smart Irrigation</h3>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4">
        {/* Main Recommendation Status */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                recommendation?.recommendation?.should_irrigate
                  ? 'bg-primary/10'
                  : 'bg-muted-foreground/10'
              }`}>
                <Icon
                  name="Droplets"
                  size={20}
                  color={recommendation?.recommendation?.should_irrigate ? "var(--color-primary)" : "var(--color-muted-foreground)"}
                />
              </div>
              <div>
                <h4 className="font-semibold text-card-foreground">
                  {recommendation?.recommendation?.should_irrigate ? 'Irrigation Recommended' : 'No Irrigation Needed'}
                </h4>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  recommendation?.recommendation?.soil_moisture_status === 'Good'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : recommendation?.recommendation?.soil_moisture_status === 'Moderate'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {recommendation?.recommendation?.soil_moisture_status || 'Optimal'}
                </div>
              </div>
            </div>
          </div>

          {/* Irrigation Details Grid */}
          {recommendation?.recommendation?.should_irrigate && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-primary/5 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="Clock" size={16} color="var(--color-primary)" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <p className="text-sm font-semibold">{recommendation?.recommendation?.irrigation_time || '6:00 AM'}</p>
              </div>
              <div className="bg-primary/5 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="Droplets" size={16} color="var(--color-primary)" />
                  <span className="text-sm font-medium">Amount</span>
                </div>
                <p className="text-sm font-semibold">{recommendation?.recommendation?.irrigation_amount_mm || 25}mm</p>
              </div>
              <div className="bg-primary/5 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="Calendar" size={16} color="var(--color-primary)" />
                  <span className="text-sm font-medium">Next Check</span>
                </div>
                <p className="text-sm font-semibold">{recommendation?.recommendation?.next_check_interval_days || 2} days</p>
              </div>
            </div>
          )}

          {/* Weather Info */}
          {recommendation?.weather_data && (
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="Cloud" size={16} />
                <p className="text-sm font-medium text-card-foreground">Current Weather</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Icon name="Thermometer" size={14} />
                  <span className="text-sm">{Math.round(recommendation.weather_data.temperature || 28)}°C</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Eye" size={14} />
                  <span className="text-sm">{recommendation.weather_data.humidity || 75}% humidity</span>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {recommendation.weather_data.weather_condition || 'Partly Cloudy'}
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="bg-primary/5 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} color="var(--color-primary)" className="mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Recommendation Reason</p>
                <p className="text-sm text-card-foreground">{recommendation?.recommendation?.reason || 'Based on current soil moisture and weather conditions'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationCard;
