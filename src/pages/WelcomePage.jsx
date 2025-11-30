import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { 
  Cloud, 
  Cpu, 
  TrendingUp, 
  Droplets, 
  Sun, 
  Leaf, 
  BarChart3, 
  Shield, 
  Users, 
  Award,
  ChevronRight,
  Menu,
  X,
  Star,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';

const WelcomePage = () => {
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Success metrics with animation
  const [metrics, setMetrics] = useState({
    farmers: 0,
    accuracy: 0,
    yield: 0,
    water: 0
  });

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    const animateMetrics = () => {
      const targets = { farmers: 50000, accuracy: 94, yield: 35, water: 40 };
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        setMetrics({
          farmers: Math.floor(targets.farmers * progress),
          accuracy: Math.floor(targets.accuracy * progress),
          yield: Math.floor(targets.yield * progress),
          water: Math.floor(targets.water * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
          setMetrics(targets);
        }
      }, stepTime);

      return () => clearInterval(timer);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateMetrics();
          }
        });
      },
      { threshold: 0.5 }
    );

    const metricsElement = document.getElementById('metrics-section');
    if (metricsElement) {
      observer.observe(metricsElement);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "AI-Powered Yield Prediction",
      description: "Advanced machine learning algorithms analyze historical data, weather patterns, and soil conditions to predict crop yields with 94% accuracy."
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "Smart Irrigation Management",
      description: "Optimize water usage with intelligent irrigation scheduling based on real-time soil moisture, weather forecasts, and crop requirements."
    },
    {
      icon: <Sun className="w-8 h-8" />,
      title: "Weather Intelligence",
      description: "Comprehensive weather monitoring and forecasting to help you make informed decisions about planting, harvesting, and crop protection."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Market Price Analytics",
      description: "Real-time market price tracking and trend analysis to help you maximize profits and plan your selling strategy."
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Crop Health Monitoring",
      description: "Early detection of diseases and pests using satellite imagery and IoT sensors to prevent crop losses."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Risk Assessment",
      description: "Comprehensive risk analysis including weather risks, market volatility, and crop insurance recommendations."
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Cloud-Based Platform",
      description: "Access your farm data anywhere, anytime with our secure, scalable cloud infrastructure."
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "IoT Integration",
      description: "Seamlessly connect with various IoT devices and sensors for comprehensive farm monitoring."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Consultation",
      description: "Connect with agricultural experts and get personalized recommendations for your specific crops and conditions."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Certification Support",
      description: "Digital documentation and compliance tracking for organic and sustainable farming certifications."
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-12 h-12 text-green-600" />,
      title: "Increase Yield",
      description: "Up to 35% increase in crop yield through optimized farming practices",
      metric: "+35%"
    },
    {
      icon: <Droplets className="w-12 h-12 text-blue-600" />,
      title: "Save Water",
      description: "Reduce water consumption by up to 40% with smart irrigation",
      metric: "-40%"
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-purple-600" />,
      title: "Boost Profits",
      description: "Maximize revenue with market intelligence and cost optimization",
      metric: "+50%"
    },
    {
      icon: <Shield className="w-12 h-12 text-orange-600" />,
      title: "Reduce Risk",
      description: "Minimize losses with predictive analytics and early warnings",
      metric: "-60%"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Connect Your Farm",
      description: "Register your farm details and connect IoT sensors for data collection"
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "Our AI analyzes your data, weather patterns, and market conditions"
    },
    {
      number: "03",
      title: "Get Insights",
      description: "Receive personalized recommendations and predictions"
    },
    {
      number: "04",
      title: "Take Action",
      description: "Implement suggestions and monitor results in real-time"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Punjab, India",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "AgriVision helped me increase my wheat yield by 40% while reducing water usage. The AI predictions are incredibly accurate!"
    },
    {
      name: "Maria Santos",
      location: "São Paulo, Brazil",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "The market price analytics feature helped me time my corn sales perfectly. I made 25% more profit this season."
    },
    {
      name: "John Mitchell",
      location: "Iowa, USA",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "Smart irrigation management saved me thousands in water costs. The ROI was evident within the first season."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Leaf className="w-8 h-8 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">AgriVision</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                <a href="#benefits" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Benefits</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">How It Works</a>
                <a href="#testimonials" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Testimonials</a>
                <button onClick={handleGetStarted} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-green-600 focus:outline-none focus:text-green-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
              <a href="#features" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium">Features</a>
              <a href="#benefits" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium">Benefits</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium">Testimonials</a>
              <button onClick={handleGetStarted} className="bg-green-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-16 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Farm with
                <span className="text-green-600 block">AI-Powered Insights</span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Maximize crop yields, optimize resource usage, and boost profits with our comprehensive agricultural intelligence platform powered by cutting-edge AI and IoT technology.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  14-day free trial
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Farm Dashboard</h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">94%</div>
                      <div className="text-sm text-gray-600">Prediction Accuracy</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">-40%</div>
                      <div className="text-sm text-gray-600">Water Usage</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">+35%</div>
                      <div className="text-sm text-gray-600">Crop Yield</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">$12K</div>
                      <div className="text-sm text-gray-600">Saved This Year</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              The Challenges Modern Farmers Face
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional farming methods are no longer sufficient to meet the growing demands of our world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unpredictable Yields</h3>
              <p className="text-gray-600">Farmers struggle with uncertain crop yields, making planning and financial decisions difficult.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Water Scarcity</h3>
              <p className="text-gray-600">Inefficient irrigation leads to water waste and increased costs in water-scarce regions.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Volatility</h3>
              <p className="text-gray-600">Fluctuating market prices make it challenging to maximize profits and plan investments.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Climate Risks</h3>
              <p className="text-gray-600">Unpredictable weather patterns and climate change increase farming risks and losses.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Solution</h3>
              <p className="text-lg text-gray-600 mb-6">
                AgriVision combines artificial intelligence, IoT sensors, and real-time data analytics to transform traditional farming into smart, data-driven agriculture.
              </p>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">AI</div>
                  <div className="text-sm text-gray-600">Powered</div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">IoT</div>
                  <div className="text-sm text-gray-600">Connected</div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">Smart</div>
                  <div className="text-sm text-gray-600">Farming</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Comprehensive Agricultural Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to optimize your farm operations in one powerful platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Highlights */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Powered by Cutting-Edge Technology
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Our platform leverages the latest advances in AI, machine learning, and cloud computing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cpu className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Advanced AI Models</h3>
              <p className="opacity-90 leading-relaxed">
                Deep learning algorithms trained on millions of data points for accurate predictions and recommendations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cloud className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Cloud Infrastructure</h3>
              <p className="opacity-90 leading-relaxed">
                Scalable, secure cloud platform ensuring 99.9% uptime and global accessibility for your farm data.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Enterprise Security</h3>
              <p className="opacity-90 leading-relaxed">
                Bank-level security with end-to-end encryption protecting your valuable agricultural data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Measurable Results for Your Farm
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of farmers who have transformed their operations with AgriVision
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-center mb-6">
                  {benefit.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{benefit.metric}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How AgriVision Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and see results in days with our simple 4-step process
            </p>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full">
                      <div className="w-full h-0.5 bg-green-200"></div>
                      <ChevronRight className="w-6 h-6 text-green-600 absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 bg-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section id="metrics-section" className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Trusted by Farmers Worldwide
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Our platform delivers real results for agricultural operations of all sizes
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">{metrics.farmers.toLocaleString()}+</div>
              <div className="text-lg opacity-90">Active Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">{metrics.accuracy}%</div>
              <div className="text-lg opacity-90">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">+{metrics.yield}%</div>
              <div className="text-lg opacity-90">Average Yield Increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">-{metrics.water}%</div>
              <div className="text-lg opacity-90">Water Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What Our Farmers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real farmers who have transformed their operations with AgriVision
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Trusted & Certified
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform meets the highest standards for security, reliability, and agricultural excellence
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-2 text-gray-600" />
              <div className="text-sm font-semibold">ISO 27001 Certified</div>
            </div>
            <div className="text-center">
              <Award className="w-16 h-16 mx-auto mb-2 text-gray-600" />
              <div className="text-sm font-semibold">AgTech Innovation Award</div>
            </div>
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-2 text-gray-600" />
              <div className="text-sm font-semibold">FAO Partnership</div>
            </div>
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-2 text-gray-600" />
              <div className="text-sm font-semibold">GDPR Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <Leaf className="w-8 h-8 text-green-500 mr-2" />
                <span className="text-2xl font-bold">AgriVision</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Transforming agriculture through AI-powered insights, helping farmers maximize yields while minimizing environmental impact.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 AgriVision. All rights reserved. Built with ❤️ for farmers worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;