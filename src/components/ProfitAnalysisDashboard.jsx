import React from 'react';
import Icon from './AppIcon';

const ProfitAnalysisDashboard = ({ results }) => {
  if (!results || !results.profitable_crops) {
    return null;
  }

  const topCrop = results.profitable_crops[0];
  const totalRevenue = results.profitable_crops.reduce((sum, crop) => sum + (crop.total_revenue || 0), 0);
  const totalCost = results.profitable_crops.reduce((sum, crop) => sum + (crop.total_cost || 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const averageROI = results.enhanced_recommendations?.average_roi || 0;

  const riskDistribution = results.profitable_crops.reduce((acc, crop) => {
    const risk = crop.market_insights?.risk_level || 'Medium';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {});

  const profitPotentialDistribution = results.profitable_crops.reduce((acc, crop) => {
    const potential = crop.profit_potential || 'Medium';
    acc[potential] = (acc[potential] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Icon name="PieChart" size={24} className="mr-3 text-primary" />
          Profit Analysis Dashboard
        </h2>
        <div className="text-sm text-gray-500">
          {results.profitable_crops.length} crops analyzed
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Profit Potential</p>
              <p className="text-2xl font-bold text-green-800">₹{totalProfit.toLocaleString()}</p>
            </div>
            <Icon name="TrendingUp" size={32} className="text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Average ROI</p>
              <p className="text-2xl font-bold text-blue-800">{averageROI}%</p>
            </div>
            <Icon name="Target" size={32} className="text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Investment</p>
              <p className="text-2xl font-bold text-purple-800">₹{totalCost.toLocaleString()}</p>
            </div>
            <Icon name="DollarSign" size={32} className="text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Best Crop ROI</p>
              <p className="text-2xl font-bold text-orange-800">{topCrop?.roi_percentage || 0}%</p>
            </div>
            <Icon name="Award" size={32} className="text-orange-600" />
          </div>
        </div>
      </div>

      {/* Risk and Profit Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="Shield" size={18} className="mr-2" />
            Risk Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(riskDistribution).map(([risk, count]) => (
              <div key={risk} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    risk === 'Low' ? 'bg-green-500' :
                    risk === 'High' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{risk} Risk</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">{count} crops</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        risk === 'Low' ? 'bg-green-500' :
                        risk === 'High' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${(count / results.profitable_crops.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profit Potential Distribution */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="BarChart3" size={18} className="mr-2" />
            Profit Potential
          </h3>
          <div className="space-y-3">
            {Object.entries(profitPotentialDistribution).map(([potential, count]) => (
              <div key={potential} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    potential === 'High' ? 'bg-green-500' :
                    potential === 'Low' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{potential} Potential</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">{count} crops</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        potential === 'High' ? 'bg-green-500' :
                        potential === 'Low' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${(count / results.profitable_crops.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
        <h3 className="font-semibold text-indigo-900 mb-4 flex items-center">
          <Icon name="Trophy" size={18} className="mr-2" />
          Top Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.profitable_crops.slice(0, 3).map((crop, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{crop.crop_name}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  {index + 1}
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI:</span>
                  <span className="font-medium text-green-600">{crop.roi_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit:</span>
                  <span className="font-medium text-blue-600">₹{crop.net_profit?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risk:</span>
                  <span className={`font-medium ${
                    crop.market_insights?.risk_level === 'Low' ? 'text-green-600' :
                    crop.market_insights?.risk_level === 'High' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {crop.market_insights?.risk_level || 'Medium'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Trends Summary */}
      {results.enhanced_recommendations && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
          <h3 className="font-semibold text-teal-900 mb-4 flex items-center">
            <Icon name="TrendingUp" size={18} className="mr-2" />
            Market Intelligence Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-teal-800 mb-2">Key Insights</h4>
              <ul className="space-y-2 text-sm text-teal-700">
                <li className="flex items-start">
                  <Icon name="CheckCircle" size={16} className="mr-2 mt-0.5 text-teal-600" />
                  Best ROI crop: {results.enhanced_recommendations.investment_insights?.best_roi_crop || topCrop?.crop_name}
                </li>
                <li className="flex items-start">
                  <Icon name="Shield" size={16} className="mr-2 mt-0.5 text-teal-600" />
                  Lowest risk option: {results.enhanced_recommendations.investment_insights?.lowest_risk_crop || 'Not specified'}
                </li>
                <li className="flex items-start">
                  <Icon name="PieChart" size={16} className="mr-2 mt-0.5 text-teal-600" />
                  Portfolio diversification: {Math.round(results.enhanced_recommendations.investment_insights?.diversification_score || 0)}%
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-teal-800 mb-2">Recommendations</h4>
              <div className="text-sm text-teal-700 space-y-2">
                <p className="flex items-start">
                  <Icon name="Calendar" size={16} className="mr-2 mt-0.5 text-teal-600" />
                  {results.enhanced_recommendations.seasonal_advice}
                </p>
                <p className="flex items-start">
                  <Icon name="Clock" size={16} className="mr-2 mt-0.5 text-teal-600" />
                  {results.enhanced_recommendations.market_timing}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitAnalysisDashboard;