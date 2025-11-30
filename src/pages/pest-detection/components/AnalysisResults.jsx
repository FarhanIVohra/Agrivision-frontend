import React from 'react';
import Icon from '../../../components/AppIcon';


const AnalysisResults = ({ results }) => {
  if (!results) return null;

  // Handle new API response: disease, confidence (0-100), severity, treatment
  const prediction = results.disease || results.prediction || 'Unknown disease';
  const rawConf = results.confidence ?? 0;
  const confidence = rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf);
  const severity = (results.severity || '').trim() || getSeverityFromConfidence(confidence);
  const treatment = results.treatment || null;

  const getSeverityFromConfidence = (confidence) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  const getStatusBg = (confidence) => {
    if (confidence >= 80) return 'bg-success/10';
    if (confidence >= 60) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getStatusColor = (confidence) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-error';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Search" size={24} color="var(--color-primary)" />
        <h2 className="text-xl font-semibold text-card-foreground">Analysis Results</h2>
      </div>
      <div className="space-y-6">
        {/* Primary Detection */}
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {prediction}
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                AI-Powered Disease Detection
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(confidence)} ${getStatusColor(confidence)}`}>
                {severity} Confidence
              </span>
              <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
                {confidence}% Accuracy
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-card-foreground">Disease/Condition:</span>
                <p className="text-muted-foreground">{prediction}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-card-foreground">Confidence Level:</span>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        confidence >= 80 ? 'bg-success' :
                        confidence >= 60 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{confidence}%</span>
                </div>
              </div>
              {treatment && (
                <div>
                  <span className="text-sm font-medium text-card-foreground">Treatment:</span>
                  <p className="text-muted-foreground">{treatment}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-card-foreground">Status:</span>
                <p className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
                  {confidence >= 80 ? 'High Accuracy Detection' : 
                   confidence >= 60 ? 'Moderate Accuracy Detection' : 
                   'Low Accuracy Detection - Manual Verification Recommended'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detection Details */}
        <div>
          <h4 className="text-md font-semibold text-card-foreground mb-3">
            Detection Details
          </h4>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-card-foreground">Model:</span>
                <p className="text-muted-foreground">TensorFlow CNN (128×128, 22 classes)</p>
              </div>
              <div>
                <span className="font-medium text-card-foreground">Classes:</span>
                <p className="text-muted-foreground">22 Disease Types</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
          <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-agricultural">
            <Icon name="Shield" size={16} color="white" />
            <span className="text-sm">View Treatment</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-agricultural">
            <Icon name="BookOpen" size={16} color="white" />
            <span className="text-sm">Learn More</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-agricultural">
            <Icon name="Share2" size={16} color="var(--color-muted-foreground)" />
            <span className="text-sm text-muted-foreground">Share Results</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;