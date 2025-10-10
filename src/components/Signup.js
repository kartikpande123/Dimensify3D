import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Phone, Lock, User, Mail, Shield, CheckCircle, UserPlus } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from "./apiConfig"

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Create refs for input fields
    const nameRef = useRef(null);
    const phoneRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const scrollToError = (fieldName) => {
        const refs = {
            name: nameRef,
            phone: phoneRef,
            email: emailRef,
            password: passwordRef,
            confirmPassword: confirmPasswordRef
        };

        const ref = refs[fieldName];
        if (ref && ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            ref.current.focus();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Handle phone number input - only allow digits and limit to 10
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '');
            const limitedDigits = digitsOnly.slice(0, 10);
            setFormData(prev => ({
                ...prev,
                [name]: limitedDigits
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

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

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        
        // Scroll to first error field
        if (Object.keys(newErrors).length > 0) {
            const firstErrorField = Object.keys(newErrors)[0];
            setTimeout(() => scrollToError(firstErrorField), 100);
        }
        
        return Object.keys(newErrors).length === 0;
    };

    const checkExistingUser = async () => {
        try {
            // Mock API call for demo - replace with actual API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/users`);
            const data = await response.json();
            
            if (data.success && data.data) {
                const existingUsers = data.data;
                
                // Check for existing phone number
                const phoneExists = existingUsers.some(user => 
                    user.phone === formData.phone
                );
                
                // Check for existing email (only if email is provided)
                const emailExists = formData.email && existingUsers.some(user => 
                    user.email && user.email.toLowerCase() === formData.email.toLowerCase()
                );
                
                const validationErrors = {};
                
                if (phoneExists) {
                    validationErrors.phone = 'Phone number already registered';
                }
                
                if (emailExists) {
                    validationErrors.email = 'Email address already registered';
                }
                
                if (Object.keys(validationErrors).length > 0) {
                    setErrors(prev => ({ ...prev, ...validationErrors }));
                    // Scroll to first error field
                    const firstErrorField = Object.keys(validationErrors)[0];
                    setTimeout(() => scrollToError(firstErrorField), 100);
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error checking existing users:', error);
            toast.error('Error checking user data. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Check for existing users
            const canProceed = await checkExistingUser();
            if (!canProceed) {
                setIsLoading(false);
                return;
            }

            // Mock API call for demo - replace with actual API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Account created successfully! Please login to continue.', {
                    position: "top-right",
                    autoClose: 7000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                
                console.log('User created:', data.data);
                
                // Reset form
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                
                // Optional: Redirect to login page after a delay
                setTimeout(() => {
                    // window.location.href = '/login';
                }, 2000);
                
            } else {
                // Handle API errors
                setErrors({ 
                    submit: data.message || 'Failed to create account. Please try again.' 
                });
                toast.error(data.message || 'Failed to create account. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error('Signup error:', error);
            const errorMessage = 'Network error. Please check your connection and try again.';
            setErrors({ submit: errorMessage });
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                    /* Custom Toastify Styles */
                    .Toastify__toast-container {
                        font-family: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';
                    }
                    
                    .Toastify__toast {
                        border-radius: 12px;
                        font-size: 0.95rem;
                        padding: 1rem;
                        color: white !important;
                        font-weight: 500;
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    }
                    
                    .Toastify__toast--success {
                        background: linear-gradient(135deg, #10b981 0%, #047857 100%) !important;
                    }
                    
                    .Toastify__toast--error {
                        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
                    }
                    
                    .Toastify__toast-body {
                        color: white !important;
                        font-weight: 500;
                    }
                    
                    .Toastify__close-button {
                        color: white !important;
                        opacity: 0.8;
                    }
                    
                    .Toastify__close-button:hover {
                        opacity: 1;
                    }
                    
                    .Toastify__progress-bar {
                        background: rgba(255, 255, 255, 0.7) !important;
                    }

                    @media (max-width: 768px) {
                        .left-content {
                            display: none !important;
                        }
                        .right-content {
                            flex: 1 !important;
                            max-width: 100% !important;
                        }
                    }
                `}
            </style>
            
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
                                <Shield size={24} color="white" />
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
                                }}>Secure Signup</span>
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
                                Join Thousands of
                                <span style={{
                                    background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    display: 'block'
                                }}>Happy Customers</span>
                            </h2>

                            <p style={{
                                fontSize: '1.125rem',
                                color: '#64748b',
                                marginBottom: '2rem',
                                lineHeight: '1.6'
                            }}>
                                Create your account to unlock premium printing services, exclusive deals, and personalized support for all your business needs.
                            </p>

                            {/* Feature List */}
                            <div style={{ marginBottom: '2rem' }}>
                                {[
                                    'Instant Order Placement & Tracking',
                                    'Exclusive Member Pricing',
                                    'Priority Customer Support',
                                    'Free Design Consultation'
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
                                    "Join our growing community of satisfied customers"
                                </p>
                                <small style={{
                                    color: '#64748b',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                }}>- Start your journey with Dimensify3D</small>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Signup Form */}
                    <div style={{
                        flex: '0 0 450px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }} className="right-content">
                        <div style={{ width: '100%', maxWidth: '400px' }}>
                            {/* Signup Form Card */}
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
                                        <UserPlus size={28} color="white" />
                                    </div>
                                    <h3 style={{
                                        color: '#1e293b',
                                        fontWeight: '800',
                                        fontSize: '1.75rem',
                                        marginBottom: '8px',
                                        letterSpacing: '-0.02em'
                                    }}>Create Account</h3>
                                    <p style={{
                                        color: '#64748b',
                                        fontSize: '1rem',
                                        marginBottom: '0',
                                        fontWeight: '500'
                                    }}>Join Dimensify3D today</p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Name Field */}
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
                                            <User size={16} style={{ color: '#6b7280' }} />
                                            Full Name
                                        </label>
                                        <input
                                            ref={nameRef}
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '16px 20px',
                                                border: errors.name ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                                borderRadius: '12px',
                                                fontSize: '16px',
                                                transition: 'all 0.3s ease',
                                                backgroundColor: '#fafafa',
                                                fontWeight: '500',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                            placeholder="Enter your full name"
                                            disabled={isLoading}
                                            onFocus={(e) => {
                                                if (!errors.name) {
                                                    e.target.style.borderColor = '#2563eb';
                                                    e.target.style.backgroundColor = '#ffffff';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!errors.name) {
                                                    e.target.style.borderColor = '#e5e7eb';
                                                    e.target.style.backgroundColor = '#fafafa';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                        />
                                        {errors.name && <div style={{
                                            color: '#ef4444',
                                            fontSize: '0.875rem',
                                            marginTop: '6px',
                                            fontWeight: '500'
                                        }}>{errors.name}</div>}
                                    </div>

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
                                            Phone Number (10 digits only)
                                        </label>
                                        <input
                                            ref={phoneRef}
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            maxLength={10}
                                            style={{
                                                width: '100%',
                                                padding: '16px 20px',
                                                border: errors.phone ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                                borderRadius: '12px',
                                                fontSize: '16px',
                                                transition: 'all 0.3s ease',
                                                backgroundColor: '#fafafa',
                                                fontWeight: '500',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                            placeholder="Enter 10-digit phone number"
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
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#6b7280',
                                            marginTop: '4px',
                                            fontWeight: '500'
                                        }}>
                                            {formData.phone.length}/10 digits
                                        </div>
                                        {errors.phone && <div style={{
                                            color: '#ef4444',
                                            fontSize: '0.875rem',
                                            marginTop: '6px',
                                            fontWeight: '500'
                                        }}>{errors.phone}</div>}
                                    </div>

                                    {/* Email Field */}
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
                                            <Mail size={16} style={{ color: '#6b7280' }} />
                                            Email Address <span style={{ color: '#9ca3af', fontWeight: '400' }}>(Optional)</span>
                                        </label>
                                        <input
                                            ref={emailRef}
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '16px 20px',
                                                border: errors.email ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                                borderRadius: '12px',
                                                fontSize: '16px',
                                                transition: 'all 0.3s ease',
                                                backgroundColor: '#fafafa',
                                                fontWeight: '500',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                            placeholder="Enter your email address"
                                            disabled={isLoading}
                                            onFocus={(e) => {
                                                if (!errors.email) {
                                                    e.target.style.borderColor = '#2563eb';
                                                    e.target.style.backgroundColor = '#ffffff';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!errors.email) {
                                                    e.target.style.borderColor = '#e5e7eb';
                                                    e.target.style.backgroundColor = '#fafafa';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                        />
                                        {errors.email && <div style={{
                                            color: '#ef4444',
                                            fontSize: '0.875rem',
                                            marginTop: '6px',
                                            fontWeight: '500'
                                        }}>{errors.email}</div>}
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
                                                ref={passwordRef}
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
                                                    backgroundColor: '#fafafa',
                                                    fontWeight: '500',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                                placeholder="Create a password"
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

                                    {/* Confirm Password Field */}
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
                                            Confirm Password
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                ref={confirmPasswordRef}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                style={{
                                                    width: '100%',
                                                    padding: '16px 60px 16px 20px',
                                                    border: errors.confirmPassword ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    fontSize: '16px',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: '#fafafa',
                                                    fontWeight: '500',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                                placeholder="Confirm your password"
                                                disabled={isLoading}
                                                onFocus={(e) => {
                                                    if (!errors.confirmPassword) {
                                                        e.target.style.borderColor = '#2563eb';
                                                        e.target.style.backgroundColor = '#ffffff';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    if (!errors.confirmPassword) {
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
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <div style={{
                                            color: '#ef4444',
                                            fontSize: '0.875rem',
                                            marginTop: '6px',
                                            fontWeight: '500'
                                        }}>{errors.confirmPassword}</div>}
                                    </div>

                                    {/* Terms Link */}
                                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                        <p style={{
                                            color: '#64748b',
                                            fontSize: '0.875rem',
                                            margin: 0,
                                            fontWeight: '500'
                                        }}>
                                            By signing up, you agree to our{' '}
                                            <a href="/termsconditions" style={{
                                                color: '#2563eb',
                                                textDecoration: 'none',
                                                fontWeight: '600'
                                            }}>Terms and Conditions</a>{' '}
                                            and{' '}
                                            <a href="/privacypolicy" style={{
                                                color: '#2563eb',
                                                textDecoration: 'none',
                                                fontWeight: '600'
                                            }}>Privacy Policy</a>
                                        </p>
                                    </div>

                                    {/* Error Display */}
                                    {errors.submit && (
                                        <div style={{
                                            background: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            marginBottom: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>!</span>
                                            </div>
                                            <p style={{
                                                color: '#dc2626',
                                                fontSize: '0.875rem',
                                                margin: 0,
                                                fontWeight: '500'
                                            }}>
                                                {errors.submit}
                                            </p>
                                        </div>
                                    )}

                                    {/* Signup Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
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
                                        {isLoading ? 'Creating Account...' : 'Create My Account'}
                                    </button>

                                    {/* Login Link */}
                                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                        <p style={{
                                            color: '#64748b',
                                            fontSize: '0.875rem',
                                            margin: 0,
                                            fontWeight: '500'
                                        }}>
                                            Already have an account?{' '}
                                            <a href="/login" style={{
                                                color: '#2563eb',
                                                textDecoration: 'none',
                                                fontWeight: '600',
                                                transition: 'all 0.2s ease'
                                            }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.textDecoration = 'underline';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.textDecoration = 'none';
                                                }}>
                                                Login here
                                            </a>
                                        </p>
                                    </div>

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
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toast Container */}
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </>
    );
};

export default SignupPage;