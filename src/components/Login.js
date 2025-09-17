import React, { useState } from 'react';
import { Eye, EyeOff, Phone, Lock, Printer, Shield, CheckCircle } from 'lucide-react';
import API_BASE_URL from './apiConfig';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Fetch all users from the API
        const response = await fetch(`${API_BASE_URL}/api/users`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Invalid response from server');
        }

        // Find user with matching phone number
        const user = result.data.find(userData => userData.phone === formData.phone);
        
        if (!user) {
          // Set error for phone field specifically
          setErrors({ phone: 'This phone number is not registered. Please check your number or contact admin.' });
          setIsLoading(false);
          return;
        }

        // Check if password matches
        if (user.password !== formData.password) {
          // Set error for password field specifically
          setErrors({ password: 'Incorrect password. Please try again.' });
          setIsLoading(false);
          return;
        }

        // Check if user is active
        if (user.status !== 'active') {
          alert('Your account is inactive. Please contact admin for assistance.');
          setIsLoading(false);
          return;
        }

        // Login successful - clear any existing errors
        setErrors({});
        
        alert(`Login successful! Welcome back, ${user.name}! Redirecting...`);
        
        // Navigate back to previous page after 3 seconds
        setTimeout(() => {
          window.history.back();
        }, 3000);
        
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again or contact support.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)',
      fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif'
    }}>
      {/* Navigation Bar */}
      <nav style={{
        background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
        padding: '1rem 2rem',
        boxShadow: '0 4px 20px rgba(42, 101, 197, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="rgba(255,255,255,0.05)" fill-rule="evenodd"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }}></div>
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <Printer size={24} color="white" />
            </div>
            <div>
              <h1 style={{
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>Dimensify3D</h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                margin: 0,
                fontWeight: '500'
              }}>Professional Printing Solutions</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Shield size={16} color="white" />
              <span style={{
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>Secure Login</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 80px)',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Left Side - Features & Benefits */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingRight: '3rem'
        }} className="left-content">
          <div style={{ maxWidth: '500px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '1rem',
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}>
              Welcome Back to Your
              <span style={{
                background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block'
              }}>Printing Dashboard</span>
            </h2>

            <p style={{
              fontSize: '1.125rem',
              color: '#64748b',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Access your account to manage orders, track shipments, and explore our comprehensive printing solutions designed for modern businesses.
            </p>

            {/* Feature List */}
            <div style={{ marginBottom: '2rem' }}>
              {[
                'Order Management & Tracking',
                'Premium Quality Printing',
                '24/7 Customer Support',
                'Secure Payment Processing'
              ].map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '12px',
                  border: '1px solid rgba(42, 101, 197, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span style={{
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.95rem'
                  }}>{feature}</span>
                </div>
              ))}
            </div>

            <div style={{
              padding: '20px',
              background: 'rgba(42, 101, 197, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(42, 101, 197, 0.2)',
              borderLeft: '4px solid rgb(42, 101, 197)'
            }}>
              <p style={{
                color: '#1e293b',
                fontStyle: 'italic',
                margin: 0,
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                "Trusted by growing businesses for their printing needs"
              </p>
              <small style={{
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>- Dimensify3D Team</small>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          flex: '0 0 450px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} className="right-content">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            {/* Login Form Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              padding: '48px 40px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 20px rgba(42, 101, 197, 0.3)'
                }}>
                  <Lock size={28} color="white" />
                </div>
                <h3 style={{
                  color: '#1e293b',
                  fontWeight: '800',
                  fontSize: '1.75rem',
                  marginBottom: '8px',
                  letterSpacing: '-0.02em'
                }}>Login</h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '1rem',
                  marginBottom: '0',
                  fontWeight: '500'
                }}>Access your Dimensify3D account</p>
              </div>

              <div onSubmit={handleSubmit}>
                {/* Phone Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Phone size={16} style={{ color: '#6b7280' }} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: errors.phone ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      backgroundColor: errors.phone ? '#fef2f2' : '#fafafa',
                      fontWeight: '500',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                    onFocus={(e) => {
                      if (!errors.phone) {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.phone) {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.backgroundColor = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  {errors.phone && <div style={{
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '6px',
                    fontWeight: '500'
                  }}>{errors.phone}</div>}
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Lock size={16} style={{ color: '#6b7280' }} />
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '16px 60px 16px 20px',
                        border: errors.password ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        backgroundColor: errors.password ? '#fef2f2' : '#fafafa',
                        fontWeight: '500',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      onFocus={(e) => {
                        if (!errors.password) {
                          e.target.style.borderColor = '#2563eb';
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.password) {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.backgroundColor = '#fafafa';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'none',
                        color: '#6b7280',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#374151';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <div style={{
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '6px',
                    fontWeight: '500'
                  }}>{errors.password}</div>}
                </div>

                <div style={{ textAlign: 'right', marginBottom: '.5rem' }}>
                  <a href="/signup" style={{
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = 'underline';
                    e.target.style.color = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = 'none';
                    e.target.style.color = '#2563eb';
                  }}>
                    Didn't have account? Signup
                  </a>
                </div>
                
                {/* Forgot Password Link */}
                <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                  <a href="/help" style={{
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = 'underline';
                    e.target.style.color = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = 'none';
                    e.target.style.color = '#2563eb';
                  }}>
                    Forgot password? Contact admin
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  style={{
                    width: '100%',
                    background: isLoading
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                      : 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 24px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '700',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(42, 101, 197, 0.4)',
                    letterSpacing: '0.02em',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    marginBottom: '24px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 30px rgba(42, 101, 197, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 20px rgba(42, 101, 197, 0.4)';
                  }}
                >
                  {isLoading ? 'Logging In...' : 'Login to Dashboard'}
                </button>

                {/* Footer */}
                <div style={{
                  textAlign: 'center',
                  padding: '16px 0',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <p style={{
                    color: '#9ca3af',
                    fontSize: '0.75rem',
                    marginBottom: '0',
                    fontWeight: '500',
                    letterSpacing: '0.025em'
                  }}>
                    © 2025 Dimensify3D Solutions • Professional Printing Services
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .left-content {
            display: none !important;
          }
          .right-content {
            flex: 1 !important;
            padding: 1rem;
          }
        }
        
        @media (max-width: 640px) {
          nav {
            padding: 1rem !important;
          }
          
          .right-content > div {
            max-width: 100% !important;
          }
          
          .right-content > div > div {
            padding: 32px 24px !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;