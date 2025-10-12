import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Zap, 
  ArrowLeft, 
  Tag,
  Package,
  Info,
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  Edit3
} from 'lucide-react';
import API_BASE_URL from "./apiConfig";

export default function ItemDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [customization, setCustomization] = useState({
    bigText: "",
    mediumText: "",
    smallText: "",
    specialInstructions: "",
    cost: 0
  });

  // Generate random review data once when component mounts
  const [reviewData] = useState(() => {
    const totalReviews = Math.floor(Math.random() * 80) + 21; // 21-100 reviews
    const avgRating = (Math.random() * 0.7 + 4.3).toFixed(1); // 4.3-5.0 rating
    return { totalReviews, avgRating: parseFloat(avgRating) };
  });

  useEffect(() => {
    if (!product) {
      toast.error("No product data found. Redirecting...");
      setTimeout(() => navigate('/online-store'), 2000);
    }
  }, [product, navigate]);

  if (!product) {
    return null;
  }

  const hasMultipleImages = product.images && product.images.length > 1;
  const showPriceAtCheckout = !product.finalPrice || product.finalPrice === 0;
  const isCustomizable = showPriceAtCheckout;
  const hasCustomization = customization.mediumText && customization.mediumText.trim().length > 0;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      (prev + 1) % product.images.length
    );
  };

  const checkUserLogin = () => {
    const phone = localStorage.getItem("dimensify3duserphoneNo");
    if (!phone) {
      setShowLoginPopup(true);
      return false;
    }
    return true;
  };

  const calculateCustomizationCost = (bigText, mediumText, smallText) => {
    const bigTextCost = bigText.replace(/\s/g, '').length * 10;
    const mediumTextCost = mediumText.replace(/\s/g, '').length * 8;
    const smallTextCost = smallText.replace(/\s/g, '').length * 5;
    return bigTextCost + mediumTextCost + smallTextCost;
  };

  const handleCustomizationChange = (field, value) => {
    const updated = { ...customization, [field]: value };
    if (field !== 'specialInstructions') {
      const cost = calculateCustomizationCost(
        updated.bigText,
        updated.mediumText,
        updated.smallText
      );
      updated.cost = cost;
    }
    setCustomization(updated);
  };

  const handleAddToCart = async () => {
    if (!checkUserLogin()) {
      return;
    }

    if (isCustomizable && !hasCustomization) {
      toast.error("Please complete customization before adding to cart.");
      setShowCustomizationModal(true);
      return;
    }

    setAddingToCart(true);

    const phone = localStorage.getItem("dimensify3duserphoneNo");

    try {
      const userResponse = await fetch(`${API_BASE_URL}/api/user-by-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const userResult = await userResponse.json();

      if (!userResult.success || !userResult.data) {
        toast.error("User not found. Please re-login.");
        localStorage.removeItem("dimensify3duserphoneNo");
        setShowLoginPopup(true);
        return;
      }

      const user = userResult.data;
      const cart = user.cart ? Object.values(user.cart) : [];

      const alreadyInCart = cart.some(item => item.id === product.id);
      if (alreadyInCart) {
        toast.info(`"${product.modelName}" is already in your cart!`);
        return;
      }

      const productToAdd = {
        ...product,
        customization: isCustomizable ? customization : null
      };

      const response = await fetch(`${API_BASE_URL}/api/add-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, product: productToAdd }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${product.modelName} added to cart successfully!`);
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Something went wrong while adding to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!checkUserLogin()) {
      return;
    }

    if (isCustomizable && !hasCustomization) {
      toast.error("Please complete customization before proceeding to checkout.");
      setShowCustomizationModal(true);
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.modelName,
      description: product.description,
      price: isCustomizable ? customization.cost : (product.finalPrice || product.price || 0),
      originalPrice: product.price || 0,
      image: product.images?.[0] || 'https://via.placeholder.com/150',
      quantity: 1,
      off: product.off || 0,
      category: product.category || '',
      isCustomizable: isCustomizable,
      customization: isCustomizable ? customization : null
    };

    navigate('/onlinestorecheckout', { 
      state: { cartItems: [cartItem] } 
    });
    
    toast.success(`Proceeding to checkout for ${product.modelName}`);
  };

  const handleLoginRedirect = () => {
    setShowLoginPopup(false);
    navigate("/login");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" size={18} fill="#fbbf24" color="#fbbf24" style={{ opacity: 0.5 }} />);
    }
    const remaining = 5 - Math.ceil(rating);
    for (let i = 0; i < remaining; i++) {
      stars.push(<Star key={`empty-${i}`} size={18} color="#d1d5db" />);
    }
    return stars;
  };

  return (
    <>
      <style>{`
        @import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css");
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #f8fafc;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
        }

        .item-details-wrapper {
          min-height: 100vh;
          background: #f8fafc;
        }

        .details-header {
          background: linear-gradient(135deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%);
          padding: 1.75rem 0;
          box-shadow: 0 4px 24px rgba(42, 101, 197, 0.2);
          margin-bottom: 2.5rem;
          position: relative;
        }

        .header-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1rem;
        }

        .header-title {
          color: white;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .back-button {
          position: absolute;
          left: 1rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.625rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 1);
          color: rgb(42, 101, 197);
          transform: translateY(-1px);
        }

        .item-details-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .image-gallery {
          position: relative;
          background: #ffffff;
          min-height: 550px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid #f3f4f6;
        }

        .main-image {
          width: 100%;
          height: 550px;
          object-fit: contain;
          padding: 2.5rem;
          transition: transform 0.3s ease;
        }

        .image-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: white;
          border: 1px solid #e5e7eb;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .image-nav-btn:hover {
          background: rgb(42, 101, 197);
          color: white;
          border-color: rgb(42, 101, 197);
          transform: translateY(-50%) scale(1.05);
        }

        .image-nav-btn.prev {
          left: 20px;
        }

        .image-nav-btn.next {
          right: 20px;
        }

        .thumbnail-container {
          display: flex;
          gap: 0.75rem;
          padding: 1.25rem;
          background: white;
          overflow-x: auto;
          justify-content: center;
          border-top: 1px solid #f3f4f6;
        }

        .thumbnail-container::-webkit-scrollbar {
          height: 6px;
        }

        .thumbnail-container::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }

        .thumbnail-container::-webkit-scrollbar-thumb {
          background: rgb(42, 101, 197);
          border-radius: 10px;
        }

        .thumbnail {
          width: 80px;
          height: 80px;
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          object-fit: contain;
          background: #f9fafb;
          padding: 0.5rem;
          flex-shrink: 0;
        }

        .thumbnail:hover {
          border-color: rgb(42, 101, 197);
          transform: translateY(-2px);
        }

        .thumbnail.active {
          border-color: rgb(42, 101, 197);
          box-shadow: 0 4px 12px rgba(42, 101, 197, 0.2);
        }

        .discount-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          z-index: 10;
        }

        .product-info {
          padding: 2.5rem;
        }

        .category-badge {
          background: #eff6ff;
          color: rgb(42, 101, 197);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .product-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0.75rem 0;
          line-height: 1.3;
          letter-spacing: -0.5px;
        }

        .product-description {
          color: #6b7280;
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .reviews-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          border: 1px solid #fbbf24;
        }

        .stars-container {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .rating-text {
          font-weight: 700;
          color: #92400e;
          font-size: 1.125rem;
          margin-left: 0.5rem;
        }

        .review-count {
          color: #78350f;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-weight: 500;
        }

        .price-section {
          background: #f9fafb;
          padding: 2rem;
          border-radius: 16px;
          margin: 1.5rem 0;
          border: 1px solid #e5e7eb;
        }

        .price-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .price-display {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .final-price {
          font-size: 2.5rem;
          font-weight: 800;
          color: rgb(42, 101, 197);
          line-height: 1;
        }

        .original-price {
          font-size: 1.5rem;
          color: #9ca3af;
          text-decoration: line-through;
          font-weight: 500;
        }

        .savings-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          margin-top: 0.75rem;
        }

        .price-on-checkout {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border: 2px solid #3b82f6;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
        }

        .price-on-checkout-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 0.75rem;
        }

        .price-on-checkout-text {
          font-size: 0.9375rem;
          color: #1e3a8a;
          line-height: 1.6;
          margin: 0 0 1.25rem 0;
        }

        .customization-cost {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 1rem;
          border-radius: 12px;
          text-align: center;
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.25rem;
        }

        .customization-display {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          border: 2px solid #10b981;
          border-radius: 16px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }

        .customization-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(16, 185, 129, 0.2);
        }

        .customization-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #065f46;
          font-weight: 700;
          font-size: 1rem;
        }

        .btn-edit-customization {
          background: white;
          color: #059669;
          border: 2px solid #059669;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .btn-edit-customization:hover {
          background: #059669;
          color: white;
          transform: translateY(-1px);
        }

        .customization-details {
          display: grid;
          gap: 0.75rem;
        }

        .customization-item {
          display: flex;
          font-size: 0.9375rem;
          color: #065f46;
        }

        .customization-item strong {
          color: #047857;
          min-width: 140px;
        }

        .customization-cost-display {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid rgba(16, 185, 129, 0.2);
          font-weight: 700;
          color: #065f46;
          font-size: 1.125rem;
          text-align: center;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-add-cart {
          padding: 1rem 1.5rem;
          border: 2px solid rgb(42, 101, 197);
          background: white;
          color: rgb(42, 101, 197);
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-add-cart:hover:not(:disabled) {
          background: rgb(42, 101, 197);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(42, 101, 197, 0.3);
        }

        .btn-add-cart:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-buy-now {
          padding: 1rem 1.5rem;
          border: none;
          background: linear-gradient(135deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(42, 101, 197, 0.3);
        }

        .btn-buy-now:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(42, 101, 197, 0.4);
        }

        .btn-buy-now:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-customize {
          width: 100%;
          padding: 0.875rem 1.5rem;
          border: none;
          background: linear-gradient(135deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-customize:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(42, 101, 197, 0.4);
        }

        .btn-spinner {
          border: 2px solid rgba(42, 101, 197, 0.2);
          border-left-color: currentColor;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          padding: 0;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 700px;
          width: 92%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: rgb(42, 101, 197);
          border-radius: 10px;
        }

        .modal-header {
          background: linear-gradient(135deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          padding: 1.75rem 2rem;
          border-radius: 20px 20px 0 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .modal-body {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.9375rem;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-input:focus {
          border-color: rgb(42, 101, 197);
          outline: none;
          box-shadow: 0 0 0 3px rgba(42, 101, 197, 0.1);
        }

        .form-textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 1rem;
          resize: vertical;
          min-height: 100px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-textarea:focus {
          border-color: rgb(42, 101, 197);
          outline: none;
          box-shadow: 0 0 0 3px rgba(42, 101, 197, 0.1);
        }

        .char-count {
          display: block;
          margin-top: 0.375rem;
          font-size: 0.8125rem;
          color: #6b7280;
          font-weight: 500;
        }

        .alert-info {
          background: #dbeafe;
          border: 1px solid #3b82f6;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #1e40af;
          font-weight: 500;
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          line-height: 1.6;
          font-size: 0.875rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-modal-cancel {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border: 2px solid #e5e7eb;
          background: white;
          color: #6b7280;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-modal-cancel:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .btn-modal-save {
          flex: 2;
          padding: 0.875rem 1.5rem;
          border: none;
          background: linear-gradient(135deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(42, 101, 197, 0.3);
        }

        .btn-modal-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(42, 101, 197, 0.4);
        }

        .btn-modal-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease;
        }

        .login-popup {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 440px;
          width: 92%;
          text-align: center;
          animation: slideUp 0.3s ease;
        }

        .login-popup h3 {
          color: rgb(42, 101, 197);
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .login-popup p {
          color: #6b7280;
          font-size: 1rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .popup-buttons {
          display: flex;
          gap: 1rem;
        }

        .popup-login-btn {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border: none;
          background: linear-gradient(135deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(42, 101, 197, 0.3);
        }

        .popup-login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(42, 101, 197, 0.4);
        }

        .popup-cancel-btn {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border: 2px solid #e5e7eb;
          background: white;
          color: #6b7280;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .popup-cancel-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        @media (max-width: 992px) {
          .header-title {
            font-size: 1.5rem;
          }

          .product-title {
            font-size: 1.75rem;
          }

          .final-price {
            font-size: 2rem;
          }

          .product-info {
            padding: 2rem;
          }

          .main-image {
            height: 400px;
          }

          .image-gallery {
            min-height: 400px;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .details-header {
            padding: 1.25rem 0;
            margin-bottom: 1.5rem;
          }

          .header-title {
            font-size: 1.25rem;
          }

          .back-button {
            left: 0.75rem;
            width: 36px;
            height: 36px;
            padding: 0.5rem;
          }

          .product-title {
            font-size: 1.5rem;
          }

          .final-price {
            font-size: 1.75rem;
          }

          .original-price {
            font-size: 1.25rem;
          }

          .product-info {
            padding: 1.5rem;
          }

          .main-image {
            height: 300px;
            padding: 1.5rem;
          }

          .image-gallery {
            min-height: 300px;
          }

          .thumbnail {
            width: 60px;
            height: 60px;
          }

          .image-nav-btn {
            width: 36px;
            height: 36px;
          }

          .image-nav-btn.prev {
            left: 12px;
          }

          .image-nav-btn.next {
            right: 12px;
          }

          .reviews-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            padding: 0.875rem;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .modal-header {
            padding: 1.25rem 1.5rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .popup-buttons {
            flex-direction: column;
          }

          .action-buttons {
            gap: 0.75rem;
          }

          .btn-add-cart, .btn-buy-now {
            padding: 0.875rem 1.25rem;
            font-size: 0.9375rem;
          }
        }

        @media (max-width: 480px) {
          .product-title {
            font-size: 1.25rem;
          }

          .category-badge {
            font-size: 0.8125rem;
            padding: 0.375rem 0.75rem;
          }

          .price-section {
            padding: 1.5rem;
          }

          .final-price {
            font-size: 1.5rem;
          }

          .main-image {
            height: 250px;
            padding: 1rem;
          }

          .image-gallery {
            min-height: 250px;
          }

          .customization-display {
            padding: 1.25rem;
          }

          .customization-item {
            flex-direction: column;
            gap: 0.25rem;
          }

          .customization-item strong {
            min-width: auto;
          }
        }

        .Toastify__toast {
          border-radius: 12px;
          font-size: 0.9375rem;
          padding: 1rem;
          font-weight: 600;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .Toastify__toast--success {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .Toastify__toast--error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .Toastify__toast--info {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
      `}</style>

      <div className="item-details-wrapper">
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />

        <div className="details-header">
          <div className="container">
            <div className="header-content">
              <button className="back-button" onClick={handleBackClick}>
                <ArrowLeft size={20} />
              </button>
              <h1 className="header-title">Product Details</h1>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingBottom: '3rem' }}>
          <div className="item-details-card">
            <div className="row g-0">
              <div className="col-lg-6">
                <div className="image-gallery">
                  {product.off > 0 && !showPriceAtCheckout && (
                    <div className="discount-badge">{product.off}% OFF</div>
                  )}
                  
                  <img 
                    src={product.images[currentImageIndex]} 
                    alt={product.modelName}
                    className="main-image"
                  />

                  {hasMultipleImages && (
                    <>
                      <button className="image-nav-btn prev" onClick={handlePrevImage}>
                        <ChevronLeft size={24} strokeWidth={2.5} />
                      </button>
                      <button className="image-nav-btn next" onClick={handleNextImage}>
                        <ChevronRight size={24} strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                </div>

                {hasMultipleImages && (
                  <div className="thumbnail-container">
                    {product.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${product.modelName} ${idx + 1}`}
                        className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="col-lg-6">
                <div className="product-info">
                  <div className="category-badge">
                    <Tag size={16} />
                    <span>{product.category}</span>
                  </div>

                  <h1 className="product-title">{product.modelName}</h1>
                  <p className="product-description">{product.description}</p>

                  {/* Reviews Section */}
                  <div className="reviews-section">
                    <div className="stars-container">
                      {renderStars(reviewData.avgRating)}
                      <span className="rating-text">{reviewData.avgRating}</span>
                    </div>
                    <div className="review-count">
                      <Users size={16} />
                      <span>{reviewData.totalReviews} reviews</span>
                    </div>
                  </div>

                  {showPriceAtCheckout ? (
                    <>
                      <div className="price-section">
                        <div className="price-on-checkout">
                          <div className="price-on-checkout-title">💰 Custom Pricing</div>
                          <p className="price-on-checkout-text">
                            Price will be calculated based on your customization requirements
                          </p>
                          {!hasCustomization && (
                            <button 
                              className="btn-customize"
                              onClick={() => setShowCustomizationModal(true)}
                            >
                              <Package size={20} />
                              Customize Now
                            </button>
                          )}
                          {customization.cost > 0 && (
                            <div className="customization-cost">
                              Estimated Cost: ₹{customization.cost}
                            </div>
                          )}
                        </div>
                      </div>

                      {hasCustomization && (
                        <div className="customization-display">
                          <div className="customization-header">
                            <div className="customization-title">
                              <CheckCircle size={20} />
                              Customization Complete
                            </div>
                            <button 
                              className="btn-edit-customization"
                              onClick={() => setShowCustomizationModal(true)}
                            >
                              <Edit3 size={16} />
                              Edit
                            </button>
                          </div>

                          <div className="customization-details">
                            {customization.bigText && (
                              <div className="customization-item">
                                <strong>Big Text:</strong>
                                <span>{customization.bigText}</span>
                              </div>
                            )}
                            <div className="customization-item">
                              <strong>Medium Text:</strong>
                              <span>{customization.mediumText}</span>
                            </div>
                            {customization.smallText && (
                              <div className="customization-item">
                                <strong>Small Text:</strong>
                                <span>{customization.smallText}</span>
                              </div>
                            )}
                            {customization.specialInstructions && (
                              <div className="customization-item">
                                <strong>Special Instructions:</strong>
                                <span>{customization.specialInstructions}</span>
                              </div>
                            )}
                          </div>

                          <div className="customization-cost-display">
                            Total Cost: ₹{customization.cost}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="price-section">
                      <div className="price-label">Price Details</div>
                      <div className="price-display">
                        <span className="final-price">₹{product.finalPrice}</span>
                        {product.off > 0 && (
                          <span className="original-price">₹{product.price}</span>
                        )}
                      </div>
                      {product.off > 0 && (
                        <div className="savings-badge">
                          <CheckCircle size={16} />
                          Save ₹{product.price - product.finalPrice} ({product.off}% OFF)
                        </div>
                      )}
                    </div>
                  )}

                  <div className="action-buttons">
                    <button 
                      className="btn-add-cart"
                      onClick={handleAddToCart}
                      disabled={addingToCart || (isCustomizable && !hasCustomization)}
                    >
                      {addingToCart ? (
                        <>
                          <div className="btn-spinner"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button 
                      className="btn-buy-now"
                      onClick={handleBuyNow}
                      disabled={isCustomizable && !hasCustomization}
                    >
                      <Zap size={20} />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Modal */}
        {showCustomizationModal && (
          <div className="modal-overlay" onClick={() => setShowCustomizationModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <Package size={24} />
                  Customize: {product.modelName}
                </h3>
              </div>

              <div className="modal-body">
                <div className="alert-info">
                  <Info size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Note:</strong> Spaces are allowed but won't be charged. Medium text is mandatory. 
                    <br />
                    <strong>Pricing:</strong> Big Text (₹10/char), Medium Text (₹8/char), Small Text (₹5/char)
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '1rem', color: 'rgb(42, 101, 197)' }}>
                    <span style={{ fontSize: '1.375rem', marginRight: '0.375rem' }}>🔤</span>
                    Big Text (Optional) - ₹10 per character
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter big text (optional)"
                    value={customization.bigText}
                    onChange={(e) => handleCustomizationChange('bigText', e.target.value)}
                    style={{ fontSize: '1.375rem', fontWeight: '600' }}
                  />
                  <span className="char-count">
                    Characters (excluding spaces): <strong>{customization.bigText.replace(/\s/g, '').length}</strong>
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.9375rem', color: 'rgb(42, 101, 197)' }}>
                    <span style={{ fontSize: '1.25rem', marginRight: '0.375rem' }}>📝</span>
                    Medium Text (Mandatory) - ₹8 per character *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter medium text (required)"
                    value={customization.mediumText}
                    onChange={(e) => handleCustomizationChange('mediumText', e.target.value)}
                    style={{ fontSize: '1.125rem', fontWeight: '600', borderColor: customization.mediumText ? '#e5e7eb' : '#ef4444' }}
                    required
                  />
                  <span className="char-count">
                    Characters (excluding spaces): <strong>{customization.mediumText.replace(/\s/g, '').length}</strong>
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.875rem', color: 'rgb(42, 101, 197)' }}>
                    <span style={{ fontSize: '1rem', marginRight: '0.375rem' }}>✏️</span>
                    Small Text (Optional) - ₹5 per character
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter small text (optional)"
                    value={customization.smallText}
                    onChange={(e) => handleCustomizationChange('smallText', e.target.value)}
                    style={{ fontSize: '0.875rem', fontWeight: '500' }}
                  />
                  <span className="char-count">
                    Characters (excluding spaces): <strong>{customization.smallText.replace(/\s/g, '').length}</strong>
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.875rem', color: '#10b981' }}>
                    <span style={{ fontSize: '1rem', marginRight: '0.375rem' }}>📋</span>
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter any special requirements like size, color, material preferences, etc. (optional)"
                    value={customization.specialInstructions}
                    onChange={(e) => handleCustomizationChange('specialInstructions', e.target.value)}
                  />
                  <span className="char-count">
                    💡 Example: "Size: Medium, Color: Blue, Material: Acrylic"
                  </span>
                </div>

                <div className="customization-cost">
                  Total Customization Cost: ₹{customization.cost}
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-modal-cancel"
                    onClick={() => setShowCustomizationModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-modal-save"
                    onClick={() => {
                      if (!customization.mediumText || customization.mediumText.trim().length === 0) {
                        toast.error("Medium text is mandatory. Please enter at least one character.");
                        return;
                      }
                      toast.success("Customization saved successfully!");
                      setShowCustomizationModal(false);
                    }}
                    disabled={!customization.mediumText || customization.mediumText.trim().length === 0}
                  >
                    <CheckCircle size={18} />
                    Save Customization
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Popup */}
        {showLoginPopup && (
          <div className="login-popup-overlay">
            <div className="login-popup">
              <div style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={56} color="rgb(42, 101, 197)" />
              </div>
              <h3>Please Login to Continue</h3>
              <p>You must be logged in to add items to your cart or make a purchase.</p>
              <div className="popup-buttons">
                <button className="popup-login-btn" onClick={handleLoginRedirect}>
                  Go to Login
                </button>
                <button className="popup-cancel-btn" onClick={() => setShowLoginPopup(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}