import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import MainSidebar from '../../components/ui/MainSidebar';
import MobileNavigationBar from '../../components/ui/MobileNavigationBar';
import Icon from '../../components/AppIcon';
import ImageUploadArea from './components/ImageUploadArea';
import AnalysisResults from './components/AnalysisResults';
import TreatmentRecommendations from './components/TreatmentRecommendations';
import PestGallery from './components/PestGallery';
import WeatherRiskForecast from './components/WeatherRiskForecast';
import CommunityReports from './components/CommunityReports';
import pestDetectionService from '../../services/pestDetectionService';
import { toast } from 'react-hot-toast';

const PestDetection = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuthContext();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      return;
    }
  }, [isAuthenticated, logout]);

  const { isCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState(null);
  const [weatherRiskData, setWeatherRiskData] = useState(null);
  const [communityReports, setCommunityReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch weather risk data on component mount
  useEffect(() => {
    const fetchWeatherRiskData = async () => {
      try {
        const data = await pestDetectionService.getWeatherRiskData();
        setWeatherRiskData(data);
      } catch (error) {
        console.error('Error fetching weather risk data:', error);
        toast.error('Failed to load weather risk data');
      }
    };

    if (isAuthenticated) {
      fetchWeatherRiskData();
    }
  }, [isAuthenticated]);

  // Fetch community reports on component mount
  useEffect(() => {
    const fetchCommunityReports = async () => {
      try {
        const data = await pestDetectionService.getCommunityReports();
        setCommunityReports(data);
      } catch (error) {
        console.error('Error fetching community reports:', error);
        toast.error('Failed to load community reports');
      }
    };

    if (isAuthenticated) {
      fetchCommunityReports();
    }
  }, [isAuthenticated]);

  // Function to handle image analysis
  const handleImageAnalysis = async (imageData) => {
    try {
      setAnalyzing(true);
      const results = await pestDetectionService.analyzePestImage(imageData);
      setAnalysisResults(results);
      setActiveTab('results');

      // Get treatment recommendations based on analysis
      if (results && results.pestDetected) {
        const recommendations = await pestDetectionService.getTreatmentRecommendations({
          pestType: results.pestType,
          severity: results.severity,
          cropType: results.cropType
        });
        setTreatmentRecommendations(recommendations);
      }

      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Function to handle pest gallery fetch
  const handleFetchPestGallery = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await pestDetectionService.getPestGallery(filters);
      return data;
    } catch (error) {
      console.error('Error fetching pest gallery:', error);
      toast.error('Failed to load pest gallery');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'upload', label: t('pest.upload'), icon: 'Upload' },
    { id: 'results', label: t('pest.results'), icon: 'Search', disabled: !analysisResults },
    { id: 'treatment', label: t('pest.treatment'), icon: 'Leaf', disabled: !treatmentRecommendations },
    { id: 'gallery', label: t('pest.gallery'), icon: 'Image' },
    { id: 'weather', label: t('pest.weather'), icon: 'Cloud' },
    { id: 'community', label: t('pest.community'), icon: 'Users' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <MainSidebar />

      <main className={`transition-agricultural ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pb-16 lg:pb-0`}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('pest.title')}</h1>
                <p className="text-muted-foreground">{t('pest.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 lg:px-8 py-4 border-b border-border">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : tab.disabled
                    ? 'text-muted-foreground cursor-not-allowed'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 lg:px-8 py-6">
          {activeTab === 'upload' && (
            <ImageUploadArea
              onAnalysis={handleImageAnalysis}
              analyzing={analyzing}
            />
          )}

          {activeTab === 'results' && analysisResults && (
            <AnalysisResults results={analysisResults} />
          )}

          {activeTab === 'treatment' && treatmentRecommendations && (
            <TreatmentRecommendations recommendations={treatmentRecommendations} />
          )}

          {activeTab === 'gallery' && (
            <PestGallery onFetchGallery={handleFetchPestGallery} loading={loading} />
          )}

          {activeTab === 'weather' && weatherRiskData && (
            <WeatherRiskForecast data={weatherRiskData} />
          )}

          {activeTab === 'community' && (
            <CommunityReports reports={communityReports} />
          )}
        </div>
      </main>

      <MobileNavigationBar />
    </div>
  );
};

export default PestDetection;
