import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import NotFound from "./pages/NotFound";
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/login';
import Dashboard from './pages/dashboard';
import SoilHealthMonitor from './pages/soil-health-monitor/index';
import PestDetection from './pages/pest-detection/index';
import Reports from './pages/reports-analytics';
import Register from './pages/register';
import ProfitableCrops from './pages/profitable-crops';
import YieldResults from './pages/yield-results';

const Routes = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/soil-health-monitor" element={<ProtectedRoute><SoilHealthMonitor /></ProtectedRoute>} />
        <Route path="/pest-detection" element={<ProtectedRoute><PestDetection /></ProtectedRoute>} />
        <Route path="/reports-analytics" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/profitable-crops" element={<ProtectedRoute><ProfitableCrops /></ProtectedRoute>} />
        <Route path="/yield-results" element={<ProtectedRoute><YieldResults /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  );
};

export default Routes;
