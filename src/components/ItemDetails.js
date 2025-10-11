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
  ShoppingBag,
  Info,
  CheckCircle,
  AlertCircle
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

    if (isCustomizable && (!customization.mediumText || customization.mediumText.trim().length === 0)) {
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

    if (isCustomizable && (!customization.mediumText || customization.mediumText.trim().length === 0)) {
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

  return (
    <>
      <style>{`
        @import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css");
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%);
          font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
        }

        .item-details-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%);
        }

        .details-header {
          background: linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%);
          padding: 2rem 0;
          box-shadow: 0 10px 40px rgba(42, 101, 197, 0.4);
          margin-bottom: 3rem;
          position: relative;
          overflow: hidden;
        }

        .details-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.3;
        }

        .header-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1rem;
        }

        .header-title-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .header-icon-wrapper {
          display: none;
        }

        .header-title {
          color: white;
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: 1px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          margin: 0.5rem 0 0 0;
          font-weight: 400;
        }

        .header-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          margin: 0;
          font-weight: 400;
        }

        .back-button {
          position: absolute;
          left: 1rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.4);
          color: white;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          width: 48px;
          height: 48px;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: white;
          color: rgb(42, 101, 197);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .item-details-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          transition: all 0.3s ease;
        }

        .item-details-card:hover {
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
        }

        .image-gallery {
          position: relative;
          background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid rgba(0, 0, 0, 0.05);
        }

        .main-image {
          width: 100%;
          height: 600px;
          object-fit: contain;
          padding: 3rem;
          transition: transform 0.4s ease;
        }

        .main-image:hover {
          transform: scale(1.02);
        }

        .image-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
          border: none;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }

        .image-nav-btn:hover {
          background: linear-gradient(316deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 8px 25px rgba(42, 101, 197, 0.4);
        }

        .image-nav-btn.prev {
          left: 24px;
        }

        .image-nav-btn.next {
          right: 24px;
        }

        .thumbnail-container {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          overflow-x: auto;
          justify-content: center;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          scrollbar-width: thin;
          scrollbar-color: rgb(42, 101, 197) #e9edf2;
        }

        .thumbnail-container::-webkit-scrollbar {
          height: 8px;
        }

        .thumbnail-container::-webkit-scrollbar-track {
          background: #e9edf2;
          border-radius: 10px;
        }

        .thumbnail-container::-webkit-scrollbar-thumb {
          background: rgb(42, 101, 197);
          border-radius: 10px;
        }

        .thumbnail {
          width: 90px;
          height: 90px;
          border: 3px solid transparent;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          object-fit: contain;
          background: #f8f9fa;
          padding: 0.5rem;
          flex-shrink: 0;
        }

        .thumbnail:hover {
          border-color: rgba(42, 101, 197, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 4px 15px rgba(42, 101, 197, 0.2);
        }

        .thumbnail.active {
          border-color: rgb(42, 101, 197);
          box-shadow: 0 6px 20px rgba(42, 101, 197, 0.3);
          transform: translateY(-4px);
        }

        .discount-badge {
          position: absolute;
          top: 24px;
          right: 24px;
          background: linear-gradient(135deg, #ff4757 0%, #e84118 100%);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1.1rem;
          box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
          z-index: 10;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .product-info {
          padding: 3.5rem;
        }

        .category-badge {
          background: linear-gradient(135deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 15px rgba(42, 101, 197, 0.3);
        }

        .product-title {
          font-size: 2.8rem;
          font-weight: 900;
          color: #1a1a2e;
          margin: 1rem 0;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .product-description {
          color: #64748b;
          font-size: 1.15rem;
          line-height: 1.9;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        .price-section {
          background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 2.5rem;
          border-radius: 20px;
          margin: 2rem 0;
          border: 2px solid rgba(42, 101, 197, 0.1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }

        .price-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.75rem;
        }

        .price-display {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .final-price {
          font-size: 3.5rem;
          font-weight: 900;
          color: rgb(42, 101, 197);
          line-height: 1;
        }

        .original-price {
          font-size: 1.8rem;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 600;
        }

        .savings-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.65rem 1.25rem;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .price-on-checkout {
          background: linear-gradient(135deg, #e8f4fd 0%, #d4e9fa 100%);
          border: 3px solid rgba(42, 101, 197, 0.3);
          border-radius: 20px;
          padding: 2.5rem;
          text-align: center;
        }

        .price-on-checkout-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: rgb(42, 101, 197);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 1rem;
        }

        .price-on-checkout-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: rgb(10, 80, 177);
          line-height: 1.6;
          margin: 0 0 1.5rem 0;
        }

        .customization-cost {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 1.25rem;
          border-radius: 14px;
          text-align: center;
          font-size: 1.4rem;
          font-weight: 800;
          margin-top: 1.5rem;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }

        .customization-section {
          background: linear-gradient(145deg, #fef3c7 0%, #fde68a 100%);
          border: 3px solid rgba(245, 158, 11, 0.3);
          border-radius: 20px;
          padding: 2.5rem;
          margin: 2rem 0;
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.2);
        }

        .customize-box {
          background: white;
          padding: 1.5rem;
          border-radius: 14px;
          margin-bottom: 1.25rem;
          border: 2px solid rgba(245, 158, 11, 0.2);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .customize-question {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-top: 2.5rem;
        }

        .btn-add-cart {
          padding: 1.25rem 2rem;
          border: 3px solid rgb(42, 101, 197);
          background: white;
          color: rgb(42, 101, 197);
          border-radius: 14px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        }

        .btn-add-cart::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(316deg, rgb(42, 101, 197), rgb(10, 80, 177));
          transition: left 0.3s ease;
          z-index: -1;
        }

        .btn-add-cart:hover:not(:disabled)::before {
          left: 0;
        }

        .btn-add-cart:hover:not(:disabled) {
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(42, 101, 197, 0.4);
        }

        .btn-add-cart:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-buy-now {
          padding: 1.25rem 2rem;
          border: none;
          background: linear-gradient(316deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 6px 20px rgba(42, 101, 197, 0.4);
          position: relative;
          overflow: hidden;
        }

        .btn-buy-now::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .btn-buy-now:hover::before {
          width: 300px;
          height: 300px;
        }

        .btn-buy-now:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(42, 101, 197, 0.5);
        }

        .btn-customize {
          width: 100%;
          padding: 1rem 1.75rem;
          border: none;
          background: linear-gradient(316deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 6px 20px rgba(42, 101, 197, 0.3);
        }

        .btn-customize:hover {
          background: linear-gradient(316deg, rgb(52, 111, 207), rgb(20, 90, 187));
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(42, 101, 197, 0.4);
        }

        .btn-spinner {
          border: 3px solid rgba(42, 101, 197, 0.2);
          border-left-color: currentColor;
          border-radius: 50%;
          width: 20px;
          height: 20px;
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
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
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
          border-radius: 24px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
          max-width: 750px;
          width: 92%;
          max-height: 92vh;
          overflow-y: auto;
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-content::-webkit-scrollbar {
          width: 10px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: rgb(42, 101, 197);
          border-radius: 10px;
        }

        .modal-header {
          background: linear-gradient(316deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          padding: 2rem 2.5rem;
          border-radius: 24px 24px 0 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .modal-title {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-body {
          padding: 2.5rem;
        }

        .form-group {
          margin-bottom: 2rem;
        }

        .form-label {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1.05rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input:focus {
          border-color: rgb(42, 101, 197);
          outline: none;
          box-shadow: 0 0 0 4px rgba(42, 101, 197, 0.1);
        }

        .form-textarea {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1.05rem;
          resize: vertical;
          min-height: 120px;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-textarea:focus {
          border-color: rgb(42, 101, 197);
          outline: none;
          box-shadow: 0 0 0 4px rgba(42, 101, 197, 0.1);
        }

        .char-count {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .alert-info {
          background: linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%);
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 2rem;
          color: #1e40af;
          font-weight: 500;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          line-height: 1.6;
        }

        .modal-actions {
          display: flex;
          gap: 1.25rem;
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 2px solid #f1f5f9;
        }

        .btn-modal-cancel {
          flex: 1;
          padding: 1rem 1.75rem;
          border: 2px solid #e5e7eb;
          background: white;
          color: #64748b;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-modal-cancel:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-2px);
        }

        .btn-modal-save {
          flex: 2;
          padding: 1rem 1.75rem;
          border: none;
          background: linear-gradient(316deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(42, 101, 197, 0.3);
        }

        .btn-modal-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(42, 101, 197, 0.4);
        }

        .btn-modal-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
        }

        .login-popup {
          background: white;
          padding: 3rem;
          border-radius: 24px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
          max-width: 480px;
          width: 92%;
          text-align: center;
          animation: slideUp 0.4s ease;
        }

        .login-popup h3 {
          color: rgb(42, 101, 197);
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .login-popup p {
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 2.5rem;
          line-height: 1.7;
        }

        .popup-buttons {
          display: flex;
          gap: 1.25rem;
        }

        .popup-login-btn {
          flex: 1;
          padding: 1rem 2rem;
          border: none;
          background: linear-gradient(316deg, rgb(42, 101, 197), rgb(10, 80, 177));
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(42, 101, 197, 0.3);
        }

        .popup-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(42, 101, 197, 0.4);
        }

        .popup-cancel-btn {
          flex: 1;
          padding: 1rem 2rem;
          border: 2px solid #e5e7eb;
          background: white;
          color: #64748b;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .popup-cancel-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-2px);
        }

        @media (max-width: 992px) {
          .header-title {
            font-size: 2rem;
          }

          .product-title {
            font-size: 2.2rem;
          }

          .final-price {
            font-size: 2.8rem;
          }

          .product-info {
            padding: 2.5rem;
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
          .header-title {
            font-size: 1.5rem;
          }

          .back-button {
            left: 0.5rem;
            width: 40px;
            height: 40px;
            padding: 0.5rem;
          }

          .product-title {
            font-size: 1.8rem;
          }

          .final-price {
            font-size: 2.2rem;
          }

          .original-price {
            font-size: 1.4rem;
          }

          .product-info {
            padding: 2rem;
          }

          .main-image {
            height: 300px;
            padding: 1.5rem;
          }

          .image-gallery {
            min-height: 300px;
          }

          .thumbnail {
            width: 70px;
            height: 70px;
          }

          .modal-body {
            padding: 2rem;
          }

          .modal-header {
            padding: 1.5rem 2rem;
          }

          .modal-title {
            font-size: 1.5rem;
          }

          .popup-buttons {
            flex-direction: column;
          }
        }

        .Toastify__toast {
          border-radius: 14px;
          font-size: 1rem;
          padding: 1.25rem;
          font-weight: 600;
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
        }
        
        .Toastify__toast--success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .Toastify__toast--error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .Toastify__toast--info {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
      `}</style>

      <div className="item-details-wrapper">
        <ToastContainer
          position="top-right"
          autoClose={4000}
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
                <ArrowLeft size={24} />
              </button>
              <div className="header-title-section">
                <h1 className="header-title">Product Details</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingBottom: '4rem' }}>
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
                        <ChevronLeft size={28} color="#333" strokeWidth={2.5} />
                      </button>
                      <button className="image-nav-btn next" onClick={handleNextImage}>
                        <ChevronRight size={28} color="#333" strokeWidth={2.5} />
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
                    <Tag size={18} />
                    <span>{product.category}</span>
                  </div>

                  <h1 className="product-title">{product.modelName}</h1>
                  <p className="product-description">{product.description}</p>

                  {showPriceAtCheckout ? (
                    <div className="price-section">
                      <div className="price-on-checkout">
                        <div className="price-on-checkout-title">💰 Custom Pricing</div>
                        <p className="price-on-checkout-text">
                          Price will be calculated based on your customization requirements
                        </p>
                        <button 
                          className="btn-customize"
                          onClick={() => setShowCustomizationModal(true)}
                        >
                          <Package size={22} />
                          Customize Now
                        </button>
                        {customization.cost > 0 && (
                          <div className="customization-cost">
                            Estimated Cost: ₹{customization.cost}
                          </div>
                        )}
                      </div>
                    </div>
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
                          <CheckCircle size={18} />
                          Save ₹{product.price - product.finalPrice} ({product.off}% OFF)
                        </div>
                      )}
                    </div>
                  )}

                  {isCustomizable && customization.mediumText && (
                    <div className="customization-section">
                      <div className="customize-box" style={{ background: 'linear-gradient(145deg, #d1fae5 0%, #a7f3d0 100%)', border: '2px solid rgba(16, 185, 129, 0.3)' }}>
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: '700', fontSize: '1.1rem' }}>
                          <CheckCircle size={22} />
                          Customization Complete
                        </div>
                        {customization.bigText && (
                          <div style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                            <strong style={{ color: '#047857' }}>Big Text:</strong> <span style={{ color: '#065f46' }}>{customization.bigText}</span>
                          </div>
                        )}
                        <div style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                          <strong style={{ color: '#047857' }}>Medium Text:</strong> <span style={{ color: '#065f46' }}>{customization.mediumText}</span>
                        </div>
                        {customization.smallText && (
                          <div style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                            <strong style={{ color: '#047857' }}>Small Text:</strong> <span style={{ color: '#065f46' }}>{customization.smallText}</span>
                          </div>
                        )}
                        {customization.specialInstructions && (
                          <div style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                            <strong style={{ color: '#047857' }}>Special Instructions:</strong> <span style={{ color: '#065f46' }}>{customization.specialInstructions}</span>
                          </div>
                        )}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid rgba(16, 185, 129, 0.2)' }}>
                          <strong style={{ color: '#065f46', fontSize: '1.05rem' }}>
                            Customization Cost: ₹{customization.cost}
                          </strong>
                        </div>
                      </div>

                      <button 
                        className="btn-customize"
                        onClick={() => setShowCustomizationModal(true)}
                        style={{ marginTop: '1rem' }}
                      >
                        <Package size={22} />
                        Edit Customization
                      </button>
                    </div>
                  )}

                  {product.customizeQuestion && !isCustomizable && (
                    <div className="customize-box" style={{ marginTop: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <Info size={20} style={{ flexShrink: 0, marginTop: '0.2rem', color: 'rgb(42, 101, 197)' }} />
                        <div>
                          <strong style={{ color: '#1f2937' }}>Note:</strong> {product.customizeQuestion}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="action-buttons">
                    <button 
                      className="btn-add-cart"
                      onClick={handleAddToCart}
                      disabled={addingToCart || (isCustomizable && !customization.mediumText)}
                    >
                      {addingToCart ? (
                        <>
                          <div className="btn-spinner"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={22} />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button 
                      className="btn-buy-now"
                      onClick={handleBuyNow}
                      disabled={isCustomizable && !customization.mediumText}
                    >
                      <Zap size={22} />
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
                  <Package size={28} />
                  Customize: {product.modelName}
                </h3>
              </div>

              <div className="modal-body">
                <div className="alert-info">
                  <Info size={22} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Note:</strong> Spaces are allowed but won't be charged. Medium text is mandatory. 
                    <br />
                    <strong>Pricing:</strong> Big Text (₹10/char), Medium Text (₹8/char), Small Text (₹5/char)
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '1.1rem', color: 'rgb(42, 101, 197)' }}>
                    <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🔤</span>
                    Big Text (Optional) - ₹10 per character
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter big text (optional)"
                    value={customization.bigText}
                    onChange={(e) => handleCustomizationChange('bigText', e.target.value)}
                    style={{ fontSize: '1.5rem', fontWeight: '600' }}
                  />
                  <span className="char-count">
                    Characters (excluding spaces): <strong>{customization.bigText.replace(/\s/g, '').length}</strong>
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '1rem', color: 'rgb(42, 101, 197)' }}>
                    <span style={{ fontSize: '1.3rem', marginRight: '0.5rem' }}>📝</span>
                    Medium Text (Mandatory) - ₹8 per character *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter medium text (required)"
                    value={customization.mediumText}
                    onChange={(e) => handleCustomizationChange('mediumText', e.target.value)}
                    style={{ fontSize: '1.2rem', fontWeight: '600', borderColor: customization.mediumText ? '#e5e7eb' : '#ef4444' }}
                    required
                  />
                  <span className="char-count">
                    Characters (excluding spaces): <strong>{customization.mediumText.replace(/\s/g, '').length}</strong>
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.95rem', color: 'rgb(42, 101, 197)' }}>
                    <span style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>✏️</span>
                    Small Text (Optional) - ₹5 per character
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter small text (optional)"
                    value={customization.smallText}
                    onChange={(e) => handleCustomizationChange('smallText', e.target.value)}
                    style={{ fontSize: '0.95rem', fontWeight: '500' }}
                  />
                  <span className="char-count">
                    Characters (excluding spaces): <strong>{customization.smallText.replace(/\s/g, '').length}</strong>
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.95rem', color: '#10b981' }}>
                    <span style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>📋</span>
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter any special requirements like size, color, material preferences, etc. (optional)"
                    value={customization.specialInstructions}
                    onChange={(e) => handleCustomizationChange('specialInstructions', e.target.value)}
                  />
                  <span className="char-count">
                    💡 Example: "Size: Medium, Color: Blue, Material: Acrylic" or "Please use bold font style"
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
                    <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
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
              <div style={{ marginBottom: '1.5rem' }}>
                <AlertCircle size={64} color="rgb(42, 101, 197)" />
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