import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useAuthContext } from '../../../context/AuthContext';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { register } = useAuthContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    region: '',
    farm_size: '',
    main_crops: [],
    language: 'en',
    acceptTerms: false,
    acceptPrivacy: false,
    lat: null,
    lon: null
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [locationDetected, setLocationDetected] = useState(false);

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिंदी (Hindi)' },
    { value: 'gu', label: 'ગુજરાતી (Gujarati)' }
  ];


  const experienceOptions = [
    { value: 'beginner', label: 'Beginner (0-2 years)' },
    { value: 'intermediate', label: 'Intermediate (3-10 years)' },
    { value: 'experienced', label: 'Experienced (10+ years)' },
    { value: 'expert', label: 'Expert/Professional' }
  ];

  const cropTypeOptions = [
    { value: 'maize', label: 'Maize' },
    { value: 'potatoes', label: 'Potatoes' },
    { value: 'rice', label: 'Rice' },
    { value: 'sweet_potatoes', label: 'Sweet Potatoes' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'cassava', label: 'Cassava' },
    { value: 'soybean', label: 'Soybean' },
    { value: 'yams', label: 'Yams' }
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password?.length >= 6) strength += 25;
    if (/[A-Z]/?.test(password)) strength += 25;
    if (/[0-9]/?.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/?.test(password)) strength += 25;
    return strength;
  };

  // Location detection functionality
  const detectLocation = async () => {
    setLocationLoading(true);
    setErrors(prev => ({ ...prev, location: '' }));

    try {
      // Get user's current position
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;

      // Use Geoapify API to get address from coordinates
      const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to get location details');
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const properties = feature.properties;
        
        // Format the region string
        const region = [
          properties.city || properties.town || properties.village,
          properties.state || properties.county,
          properties.country
        ].filter(Boolean).join(', ');

        // Update form data with location
        setFormData(prev => ({
          ...prev,
          region: region,
          lat: latitude,
          lon: longitude
        }));

        setLocationDetected(true);
      } else {
        throw new Error('No location data found');
      }
    } catch (error) {
      console.error('Location detection error:', error);
      setErrors(prev => ({
        ...prev,
        location: error.message || 'Failed to detect location. Please enter manually.'
      }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData?.region) {
      newErrors.region = 'Please enter your farm region';
    }

    if (!formData?.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    if (!formData?.acceptPrivacy) {
      newErrors.acceptPrivacy = 'You must accept the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        region: formData.region,
        lat: formData.lat || 0, // Provide default if not detected
        lon: formData.lon || 0  // Provide default if not detected
      });
      
      if (success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setErrors({ general: err?.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-error';
    if (passwordStrength < 50) return 'bg-warning';
    if (passwordStrength < 75) return 'bg-accent';
    return 'bg-success';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {errors?.general && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="AlertCircle" size={20} color="var(--color-error)" />
            <div>
              <p className="text-sm text-error font-medium">Registration Failed</p>
              <p className="text-sm text-error/80 mt-1">{errors?.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
          <Icon name="User" size={20} color="var(--color-primary)" />
          <span>Personal Information</span>
        </h3>
        
        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={formData?.name}
          onChange={(e) => handleInputChange('name', e?.target?.value)}
          error={errors?.name}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData?.phone}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            error={errors?.phone}
            required
          />
        </div>

        <Select
          label="Preferred Language"
          description="Choose your preferred interface language"
          options={languageOptions}
          value={formData?.language}
          onChange={(value) => handleInputChange('language', value)}
          searchable
        />
      </div>
      {/* Security Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
          <Icon name="Shield" size={20} color="var(--color-primary)" />
          <span>Security</span>
        </h3>

        <div className="space-y-2">
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
          />
          
          {formData?.password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Password strength:</span>
                <span className={`font-medium ${
                  passwordStrength < 50 ? 'text-error' : 
                  passwordStrength < 75 ? 'text-warning' : 'text-success'
                }`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData?.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
          error={errors?.confirmPassword}
          required
        />
      </div>
      {/* Farm Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
          <Icon name="MapPin" size={20} color="var(--color-primary)" />
          <span>Farm Information</span>
        </h3>

        {/* Location Detection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-card-foreground">
              Farm Location
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={detectLocation}
              loading={locationLoading}
              iconName="MapPin"
              iconPosition="left"
            >
              {locationLoading ? 'Detecting...' : 'Detect Location'}
            </Button>
          </div>
          
          <Input
            type="text"
            placeholder="City, State, Country (or use detect location)"
            value={formData?.region}
            onChange={(e) => handleInputChange('region', e?.target?.value)}
            error={errors?.region || errors?.location}
            required
          />
          
          {locationDetected && (
            <div className="flex items-center space-x-2 text-sm text-success">
              <Icon name="CheckCircle" size={16} />
              <span>Location detected successfully</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Farm Size (acres)"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 10, 5, 2.5"
            value={formData?.farm_size}
            onChange={(e) => handleInputChange('farm_size', e?.target?.value)}
            error={errors?.farm_size}
            required
          />

          <Select
            label="Farming Experience"
            description="Your years of farming experience"
            options={experienceOptions}
            value={formData?.experienceLevel}
            onChange={(value) => handleInputChange('experienceLevel', value)}
            error={errors?.experienceLevel}
          />
        </div>

        <Select
          label="Primary Crop Types"
          description="Select the crops you primarily grow"
          options={cropTypeOptions}
          value={formData?.main_crops}
          onChange={(value) => handleInputChange('main_crops', value)}
          multiple
          searchable
          clearable
          error={errors?.main_crops}
          required
        />
      </div>
      {/* Terms and Conditions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
          <Icon name="FileText" size={20} color="var(--color-primary)" />
          <span>Terms & Privacy</span>
        </h3>

        <div className="space-y-3">
          <Checkbox
            label={
              <span className="text-sm">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline font-medium">
                  Terms and Conditions
                </Link>
              </span>
            }
            checked={formData?.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e?.target?.checked)}
            error={errors?.acceptTerms}
            required
          />

          <Checkbox
            label={
              <span className="text-sm">
                I accept the{' '}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </span>
            }
            checked={formData?.acceptPrivacy}
            onChange={(e) => handleInputChange('acceptPrivacy', e?.target?.checked)}
            error={errors?.acceptPrivacy}
            required
          />
        </div>
      </div>
      {/* Submit Button */}
      <div className="space-y-4">
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          iconName="UserPlus"
          iconPosition="left"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </span>
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;