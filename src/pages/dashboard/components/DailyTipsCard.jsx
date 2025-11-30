import React from 'react';
import { useTranslation } from 'react-i18next';

const DailyTipsCard = () => {
  const { t } = useTranslation();

  const tips = [
    {
      title: t('dashboard.tips.waterConservation', 'Water Conservation'),
      description: t('dashboard.tips.waterConservationDesc', 'Use drip irrigation to reduce water usage by up to 50%'),
      icon: 'droplets'
    },
    {
      title: t('dashboard.tips.soilHealth', 'Soil Health'),
      description: t('dashboard.tips.soilHealthDesc', 'Regular soil testing helps maintain optimal nutrient levels'),
      icon: 'leaf'
    },
    {
      title: t('dashboard.tips.cropRotation', 'Crop Rotation'),
      description: t('dashboard.tips.cropRotationDesc', 'Rotate crops to prevent soil depletion and pest buildup'),
      icon: 'refresh-cw'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-2 rounded-lg mr-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {t('dashboard.dailyTips', 'Daily Farming Tips')}
        </h3>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{tip.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
          {t('dashboard.viewAllTips', 'View All Tips')}
        </button>
      </div>
    </div>
  );
};

export default DailyTipsCard;
