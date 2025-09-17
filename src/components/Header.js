import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, HelpCircle, Store, LogIn, UserPlus, Menu, X, ChevronDown, MessageCircle, LogOut } from 'lucide-react';
import logo from "../images/logo-1.png"
import './Header.css';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL  from "./apiConfig"

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Sample 3D model images - replace with your actual images
    const modelImages = [
        { id: 1, src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop&crop=center", alt: "3D Printed Prototype 1", title: "Mechanical Parts" },
        { id: 2, src: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop&crop=center", alt: "3D Printed Prototype 2", title: "Architectural Model" },
        { id: 3, src: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=300&fit=crop&crop=center", alt: "3D Printed Prototype 3", title: "Medical Device" },
        { id: 4, src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop&crop=center", alt: "3D Printed Prototype 4", title: "Custom Tools" },
        { id: 5, src: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop&crop=center", alt: "3D Printed Prototype 5", title: "Art Sculpture" },
        { id: 6, src: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=300&fit=crop&crop=center", alt: "3D Printed Prototype 6", title: "Industrial Component" },
        { id: 7, src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop&crop=center", alt: "3D Printed Prototype 7", title: "Consumer Product" },
        { id: 8, src: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop&crop=center", alt: "3D Printed Prototype 8", title: "Electronics Housing" }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        // Check if user is logged in when component mounts
        checkUserLogin();
    }, []);

    const checkUserLogin = async () => {
        try {
            const phoneNumber = localStorage.getItem('dimensify3duserphoneNo');
            
            if (!phoneNumber) {
                setIsLoggedIn(false);
                setLoading(false);
                return;
            }

            // Call the API to get user data
            const response = await fetch(`${API_BASE_URL}/api/user-by-phone`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: phoneNumber })
            });

            const data = await response.json();

            if (data.success && data.data) {
                setIsLoggedIn(true);
                setUser(data.data);
            } else {
                setIsLoggedIn(false);
                // Remove invalid phone number from localStorage
                localStorage.removeItem('dimensify3duserphoneNo');
            }
        } catch (error) {
            console.error('Error checking user login:', error);
            setIsLoggedIn(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const handleLogout = () => {
        setShowLogoutPopup(true);
    };

    const confirmLogout = () => {
        // Remove the user's phone number from localStorage
        localStorage.removeItem('dimensify3duserphoneNo');
        
        setIsLoggedIn(false);
        setUser(null);
        setShowLogoutPopup(false);
        // Optionally navigate to home page or login page
        // navigate('/');
    };

    const cancelLogout = () => {
        setShowLogoutPopup(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleConsultancy = () => {
        // Add your consultancy navigation logic here
        console.log('Navigate to consultancy');
        // navigate('/consultancy');
    };

    return (
        <>
            <header className={`header-container ${scrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <div className="header-row">
                        {/* Logo and Brand */}
                        <div className="brand-container">
                            <div className="logo-wrapper">
                               <img src={logo} alt="logo"/>
                            </div>
                            <div>
                                <h1 className="brand-text">Dimensify3D</h1>
                                <p className="brand-subtitle">3D Printing Solutions</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="desktop-nav">
                            <div className="nav-desktop">
                                <button className="nav-item">
                                    <User size={18} />
                                    <span>Account</span>
                                </button>
                                <button className="nav-item">
                                    <HelpCircle size={18} />
                                    <span>Help</span>
                                </button>
                                <button className="nav-item" onClick={handleConsultancy}>
                                    <MessageCircle size={18} />
                                    <span>Consultancy</span>
                                </button>
                                <button className="nav-item">
                                    <Store size={18} />
                                    <span>Online Store</span>
                                </button>
                                <div className="cart-container">
                                    <button className="nav-item">
                                        <ShoppingCart size={18} />
                                        <span>Cart</span>
                                    </button>
                                    <span className="cart-badge">3</span>
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="auth-container">
                                {loading ? (
                                    <button className="btn-signup" disabled>
                                        <span>Loading...</span>
                                    </button>
                                ) : isLoggedIn ? (
                                    <button className="btn-signup" onClick={handleLogout}>
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                ) : (
                                    <button className="btn-signup" onClick={handleLogin}>
                                        <UserPlus size={18} />
                                        <span>Login</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="mobile-menu-btn" onClick={toggleMenu}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <div className={`mobile-menu ${isMenuOpen ? 'open' : 'closed'}`}>
                        <div>
                            <button className="mobile-nav-item">
                                <User size={18} />
                                <span>Account</span>
                            </button>
                            <button className="mobile-nav-item">
                                <HelpCircle size={18} />
                                <span>Help</span>
                            </button>
                            <button className="mobile-nav-item" onClick={handleConsultancy}>
                                <MessageCircle size={18} />
                                <span>Consultancy</span>
                            </button>
                            <button className="mobile-nav-item">
                                <Store size={18} />
                                <span>Online Store</span>
                            </button>
                            <div style={{ position: 'relative' }}>
                                <button className="mobile-nav-item">
                                    <ShoppingCart size={18} />
                                    <span>Cart</span>
                                </button>
                                <span style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '36px'
                                }} className="cart-badge">3</span>
                            </div>

                            <div className="mobile-auth-section">
                                {loading ? (
                                    <button className="mobile-btn-signup" disabled>
                                        <span>Loading...</span>
                                    </button>
                                ) : isLoggedIn ? (
                                    <button className="mobile-btn-signup" onClick={handleLogout}>
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                ) : (
                                    <button className="mobile-btn-signup" onClick={handleLogin}>
                                        <UserPlus size={18} />
                                        <span>Login</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Popup */}
            {showLogoutPopup && (
                <div className="logout-popup-overlay">
                    <div className="logout-popup">
                        <h3>Confirm Logout</h3>
                        <p>Are you sure you want to logout?</p>
                        <div className="logout-popup-buttons">
                            <button className="btn-cancel" onClick={cancelLogout}>
                                Cancel
                            </button>
                            <button className="btn-confirm" onClick={confirmLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Demo Content Area */}
            <div className="content-area">
                <div className="demo-content">
                    <h2 className="demo-title">Professional 3D Printing</h2>
                    <p className="demo-subtitle">
                        Transform your ideas into reality with cutting-edge 3D printing technology.
                        From prototypes to production, we deliver precision and quality.
                        {isLoggedIn && user && (
                            <span className="welcome-text"> Welcome back, {user.name || user.phone}!</span>
                        )}
                    </p>
                </div>

                {/* 3D Models Gallery */}
                <div className="models-gallery">
                    <div className="gallery-header">
                        <h3>Our Recent 3D Printed Models</h3>
                        <p>Explore our portfolio of precision-crafted 3D printed products</p>
                    </div>
                    
                    <div className="gallery-container">
                        <div className={`gallery-track ${modelImages.length > 5 ? 'infinite-scroll' : ''}`}>
                            {/* Original images */}
                            {modelImages.map((image) => (
                                <div key={image.id} className="gallery-item">
                                    <div className="image-wrapper">
                                        <img 
                                            src={image.src} 
                                            alt={image.alt}
                                            loading="lazy"
                                        />
                                        <div className="image-overlay">
                                            <h4>{image.title}</h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Duplicate images for infinite scroll effect */}
                            {modelImages.length > 5 && modelImages.map((image) => (
                                <div key={`duplicate-${image.id}`} className="gallery-item">
                                    <div className="image-wrapper">
                                        <img 
                                            src={image.src} 
                                            alt={image.alt}
                                            loading="lazy"
                                        />
                                        <div className="image-overlay">
                                            <h4>{image.title}</h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .models-gallery {
                    width: 100%;
                    padding: 60px 0;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    overflow: hidden;
                }

                .gallery-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding: 0 20px;
                }

                .gallery-header h3 {
                    font-size: 2.2rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .gallery-header p {
                    font-size: 1.1rem;
                    color: #64748b;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                .gallery-container {
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                }

                .gallery-track {
                    display: flex;
                    gap: 20px;
                    padding: 20px;
                    width: fit-content;
                }

                .gallery-track.infinite-scroll {
                    animation: scrollGallery 30s linear infinite;
                }

                @keyframes scrollGallery {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .gallery-item {
                    flex-shrink: 0;
                    width: 320px;
                    height: 240px;
                    position: relative;
                }

                .image-wrapper {
                    width: 100%;
                    height: 100%;
                    border-radius: 16px;
                    overflow: hidden;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    background: #fff;
                }

                .image-wrapper:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
                }

                .image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .image-wrapper:hover img {
                    transform: scale(1.05);
                }

                .image-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
                    padding: 20px;
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                }

                .image-wrapper:hover .image-overlay {
                    transform: translateY(0);
                }

                .image-overlay h4 {
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0;
                }

                /* Pause animation on hover for better user experience */
                .gallery-track.infinite-scroll:hover {
                    animation-play-state: paused;
                }

                /* Mobile responsiveness */
                @media (max-width: 768px) {
                    .models-gallery {
                        padding: 40px 0;
                    }

                    .gallery-header h3 {
                        font-size: 1.8rem;
                    }

                    .gallery-header p {
                        font-size: 1rem;
                    }

                    .gallery-item {
                        width: 280px;
                        height: 200px;
                    }

                    .gallery-track {
                        gap: 15px;
                        padding: 15px;
                    }

                    .gallery-track.infinite-scroll {
                        animation-duration: 25s;
                    }
                }

                @media (max-width: 480px) {
                    .gallery-item {
                        width: 250px;
                        height: 180px;
                    }

                    .gallery-header h3 {
                        font-size: 1.6rem;
                    }
                }
            `}</style>
        </>
    );
};

export default Header;