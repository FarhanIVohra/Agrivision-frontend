import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import LanguageSelector from '../login/components/LanguageSelector';
import MainSidebar from '../../components/ui/MainSidebar';
import MobileNavigationBar from '../../components/ui/MobileNavigationBar';
import dashboardService from '../../services/dashboardService';

// Import all dashboard components
import WeatherCard from './components/WeatherCard';
import CropYieldCard from './components/CropYieldCard';
import IrrigationCard from './components/IrrigationCard';
import DailyTipsCard from './components/DailyTipsCard';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <MainSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Icon name="dashboard" className="h-8 w-8 text-green-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('dashboard.title', 'Dashboard')}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSelector />
                <Button
                  onClick={() => navigate('/reports')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {t('dashboard.viewReports', 'View Reports')}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <WeatherCard data={dashboardData?.weather || null} />
              <CropYieldCard data={dashboardData?.yield || null} />
              <IrrigationCard data={dashboardData?.irrigation || null} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyTipsCard />
              {/* Add more dashboard components here */}
            </div>
          </div>
        </main>

        <MobileNavigationBar />
      </div>
    </div>
  );
};

export default Dashboard;
