import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import axios from 'axios';
import './SoilHealthCard.css';


import { apiGet } from '../../../lib/api';


const SoilHealthCard = () => {
  const [soilData, setSoilData] = useState({});
  const [healthScores, setHealthScores] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [npkData, setNpkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('api');
  const [showNotification, setShowNotification] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [showTrends, setShowTrends] = useState(false);

  useEffect(() => {
    fetchSoilHealthData();
  }, []);

  // Generate mock trend data for demonstration
  const generateTrendData = (currentData) => {
    const trends = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ph: currentData?.ph_level ? (currentData.ph_level + (Math.random() - 0.5) * 0.5).toFixed(1) : 7.0,
        moisture: currentData?.moisture ? (currentData.moisture + (Math.random() - 0.5) * 10).toFixed(1) : 65,
        nitrogen: currentData?.nitrogen ? (currentData.nitrogen + (Math.random() - 0.5) * 5).toFixed(1) : 45,
        phosphorus: currentData?.phosphorus ? (currentData.phosphorus + (Math.random() - 0.5) * 3).toFixed(1) : 25,
        potassium: currentData?.potassium ? (currentData.potassium + (Math.random() - 0.5) * 8).toFixed(1) : 35
      });
    }
    
    return trends;
  };

  const fetchSoilHealthData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Call the new soil health API endpoint
      const response = await axios.get('http://localhost:8000/api/dashboard/soil', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;
      
      if (data.success) {
        // Update soil metrics
        setSoilData(data.metrics);
        setHealthScores(data.health_scores);
        setRecommendations(data.recommendations);
        setLastUpdated(data.last_updated);
        
        // Generate trend data based on current metrics
        const trends = generateTrendData(data.metrics);
        setTrendData(trends);
        
        // Update NPK chart data
        setNpkData([
          { 
            name: 'N', 
            value: data.metrics.nitrogen, 
            score: data.health_scores.nitrogen,
            color: data.health_scores.nitrogen >= 80 ? 'var(--color-success)' : 
                   data.health_scores.nitrogen >= 60 ? 'var(--color-warning)' : 'var(--color-error)'
          },
          { 
            name: 'P', 
            value: data.metrics.phosphorus, 
            score: data.health_scores.phosphorus,
            color: data.health_scores.phosphorus >= 80 ? 'var(--color-success)' : 
                   data.health_scores.phosphorus >= 60 ? 'var(--color-warning)' : 'var(--color-error)'
          },
          { 
            name: 'K', 
            value: data.metrics.potassium, 
            score: data.health_scores.potassium,
            color: data.health_scores.potassium >= 80 ? 'var(--color-success)' : 
                   data.health_scores.potassium >= 60 ? 'var(--color-warning)' : 'var(--color-error)'
          }
        ]);
        
        setDataSource('real_time');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (err) {
      console.error('Error fetching soil health data:', err);
      
      // Fallback to localStorage data
      const savedSoilMetrics = localStorage.getItem('userSoilMetrics');
      if (savedSoilMetrics) {
        try {
          const userData = JSON.parse(savedSoilMetrics);
          setSoilData(userData);
          
          const trends = generateTrendData(userData);
          setTrendData(trends);
          
          setNpkData([
            { name: 'N', value: userData.nitrogen || 0, color: 'var(--color-primary)' },
            { name: 'P', value: userData.phosphorus || 0, color: 'var(--color-secondary)' },
            { name: 'K', value: userData.potassium || 0, color: 'var(--color-accent)' }
          ]);
          setDataSource('localStorage');
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
          setError('Failed to load soil health data');
        }
      } else {
        // Final fallback to mock data
        const mockData = {
          nitrogen: 45, phosphorus: 28, potassium: 35,
          ph_level: 6.8, moisture: 32, temperature: 24,
          humidity: 65, soil_type: 'Loamy'
        };
        setSoilData(mockData);
        
        const trends = generateTrendData(mockData);
        setTrendData(trends);
        
        setNpkData([
          { name: 'N', value: 45, color: 'var(--color-primary)' },
          { name: 'P', value: 28, color: 'var(--color-secondary)' },
          { name: 'K', value: 35, color: 'var(--color-accent)' }
        ]);
        setDataSource('mock');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSoilHealthData();
  };

  // Listen for localStorage changes to update data in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userSoilMetrics' && e.newValue) {
        try {
          const userData = JSON.parse(e.newValue);
          setSoilData(userData);
          setNpkData([
            { name: 'N', value: userData.nitrogen, color: 'var(--color-primary)' },
            { name: 'P', value: userData.phosphorus, color: 'var(--color-secondary)' },
            { name: 'K', value: userData.potassium, color: 'var(--color-accent)' }
          ]);
          setDataSource('localStorage');
          // Show notification when new data is available
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000); // Hide after 5 seconds
        } catch (error) {
          console.error('Error updating soil data from localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle notification timeout
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);


  const getHealthStatus = (value, type) => {
    if (type === 'ph') {
      if (value >= 6.0 && value <= 7.5) return { status: 'Good', color: 'var(--color-success)' };
      if (value >= 5.5 && value <= 8.0) return { status: 'Fair', color: 'var(--color-warning)' };
      return { status: 'Poor', color: 'var(--color-error)' };
    }
    if (type === 'score') {
      if (value >= 80) return { status: 'Excellent', color: 'var(--color-success)' };
      if (value >= 60) return { status: 'Good', color: 'var(--color-warning)' };
      return { status: 'Needs Attention', color: 'var(--color-error)' };
    }
    if (value >= 70) return { status: 'Good', color: 'var(--color-success)' };
    if (value >= 50) return { status: 'Fair', color: 'var(--color-warning)' };
    return { status: 'Poor', color: 'var(--color-error)' };
  };

  const phStatus = getHealthStatus(soilData?.ph_level, 'ph');
  const moistureStatus = getHealthStatus(soilData?.moisture);
  const overallHealthStatus = getHealthStatus(healthScores?.overall, 'score');

  if (loading) {
    return <div className="bg-card rounded-lg border border-border p-6 shadow-agricultural">Loading soil health...</div>;
  }
  if (error) {
    return <div className="bg-card rounded-lg border border-border p-6 shadow-agricultural text-red-500">{error}</div>;
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-agricultural relative">
      {/* Notification Toast */}
      {showNotification && (
        <div className="absolute top-4 right-4 bg-success text-white px-4 py-2 rounded-lg shadow-lg z-10 animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} />
            <span className="text-sm font-medium">New soil data available!</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Icon name="Sprout" size={24} color="var(--color-secondary)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Soil Health Monitor</h3>
            <p className="text-sm text-muted-foreground">Real-time soil conditions</p>
          </div>
        </div>
        <Link to="/soil-health-monitor">
          <Button variant="outline" size="sm" iconName="ExternalLink" iconPosition="right">
            View Details
          </Button>
        </Link>
      </div>

      {/* Overall Health Score */}
      <div className="mb-6">
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: overallHealthStatus.color }}>
              {healthScores?.overall?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm font-medium" style={{ color: overallHealthStatus.color }}>
              {overallHealthStatus.status}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Overall Health Score</div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4 className="section-title">Recommendations</h4>
          <div className="recommendations-list">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className={`recommendation-item priority-${rec.priority.toLowerCase()}`}>
                <div className="recommendation-header">
                  <span className="recommendation-title">{rec.title}</span>
                  <span className={`priority-badge priority-${rec.priority.toLowerCase()}`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="recommendation-description">{rec.description}</p>
                <div className="recommendation-details">
                  <div className="expected-outcome">
                    <strong>Expected Outcome:</strong> {rec.expected_outcome}
                  </div>
                  <div className="cost-estimate">
                    <strong>Cost:</strong> {rec.cost}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NPK Charts and Trends */}
        <div className="charts-section">
          <div className="chart-header">
            <h4 className="section-title">Soil Analytics</h4>
            <div className="chart-toggle">
              <button 
                className={`toggle-btn ${!showTrends ? 'active' : ''}`}
                onClick={() => setShowTrends(false)}
              >
                Current NPK
              </button>
              <button 
                className={`toggle-btn ${showTrends ? 'active' : ''}`}
                onClick={() => setShowTrends(true)}
              >
                7-Day Trends
              </button>
            </div>
          </div>
          
          <div className="chart-container">
            {!showTrends ? (
              // NPK Bar Chart
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={npkData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              // Trend Line Chart
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ph" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="pH Level"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moisture" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Moisture %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="nitrogen" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    name="Nitrogen %"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      {/* Footer */}
      <div className="card-footer">
        <div className="footer-info">
          <div className="last-updated">
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
          </div>
          <div className="data-source">
            Source: {dataSource === 'localStorage' ? 'Local Storage' : 
                    dataSource === 'api' ? 'API' : 'Mock Data'}
          </div>
        </div>
        <button 
          className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Updating...' : 'Update Metrics'}
        </button>
      </div>
    </div>
  );
};

export default SoilHealthCard;