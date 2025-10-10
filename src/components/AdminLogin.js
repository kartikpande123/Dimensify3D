import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import API_BASE_URL from './apiConfig';


export default function AdminLogin() {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin-credentials`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch admin credentials');
    }
    
    const adminCredentials = result.data;
    
    if (
      formData.userId.trim() === adminCredentials.userid.trim() &&
      formData.password === adminCredentials.password
    ) {
      // ✅ Store login flag in localStorage
      localStorage.setItem("d3dadminLogin", "true");

      // Redirect to dashboard
      window.location.href = '/admindashboard';
    } else {
      setError('Invalid user ID or password');
    }
    
  } catch (error) {
    console.error('Login error:', error);
    setError('Login failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const styles = {
    body: {
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    loginContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    loginCard: {
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      maxWidth: '450px',
      width: '100%',
      transform: 'scale(1)',
      transition: 'all 0.3s ease'
    },
    loginCardHover: {
      transform: 'scale(1.02)',
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
    },
    header: {
      background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
      padding: '40px 30px',
      textAlign: 'center',
      color: 'white'
    },
    headerIcon: {
      width: '80px',
      height: '80px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      margin: '0 auto 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerTitle: {
      fontSize: '2.2rem',
      fontWeight: 'bold',
      margin: '0 0 10px 0',
      letterSpacing: '1px'
    },
    headerSubtitle: {
      fontSize: '0.95rem',
      opacity: '0.9',
      margin: '0'
    },
    formContainer: {
      padding: '40px 30px'
    },
    formGroup: {
      marginBottom: '25px',
      position: 'relative'
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
      display: 'block'
    },
    inputGroup: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    inputIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9CA3AF',
      zIndex: 2
    },
    formControl: {
      width: '100%',
      padding: '15px 15px 15px 45px',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      fontSize: '1rem',
      backgroundColor: '#F9FAFB',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    formControlFocus: {
      borderColor: '#3B82F6',
      backgroundColor: 'white',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    formControlError: {
      borderColor: '#EF4444',
      backgroundColor: '#FEF2F2'
    },
    passwordToggle: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#9CA3AF',
      transition: 'color 0.2s ease',
      padding: '5px'
    },
    errorMessage: {
      color: '#EF4444',
      fontSize: '0.9rem',
      marginTop: '15px',
      textAlign: 'center',
      padding: '10px',
      backgroundColor: '#FEF2F2',
      borderRadius: '8px',
      border: '1px solid #FECACA'
    },
    submitButton: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
      marginTop: '30px'
    },
    submitButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
    },
    submitButtonDisabled: {
      background: '#9CA3AF',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none'
    },
    buttonIcon: {
      marginRight: '8px'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid transparent',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '10px'
    }
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.body}>
        <div style={styles.loginContainer}>
          <div style={styles.loginCard}>
            
            {/* Header */}
            <div style={styles.header}>
              <h1 style={styles.headerTitle}>Admin Login</h1>
              <p style={styles.headerSubtitle}>Access your administrative panel</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={styles.formContainer}>
              
              {/* User ID Field */}
              <div style={styles.formGroup}>
                <label style={styles.label}>User ID</label>
                <div style={styles.inputGroup}>
                  <User size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    style={{
                      ...styles.formControl,
                      ...(error ? styles.formControlError : {})
                    }}
                    placeholder="Enter your user ID"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputGroup}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    style={{
                      ...styles.formControl,
                      paddingRight: '50px',
                      ...(error ? styles.formControlError : {})
                    }}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={styles.errorMessage}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...styles.submitButton,
                  ...(isLoading ? styles.submitButtonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    Object.assign(e.target.style, styles.submitButtonHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div style={styles.spinner}></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield size={18} style={styles.buttonIcon} />
                    Sign in to Admin Panel
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}