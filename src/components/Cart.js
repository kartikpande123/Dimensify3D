import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package, CheckSquare, Square, X, ZoomIn } from 'lucide-react';
import API_BASE_URL from './apiConfig';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);

  const navigate = useNavigate()

  useEffect(() => {
    fetchUserCart();
  }, []);

  const fetchUserCart = async () => {
    try {
      const phone = localStorage.getItem('dimensify3duserphoneNo');
      
      if (!phone) {
        setShowLoginPopup(true);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user-by-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success && data.data.cart) {
        const items = Object.entries(data.data.cart).map(([id, item]) => ({
          id,
          name: item.modelName || item.name || 'Product',
          description: item.description || '',
          price: item.finalPrice || item.price || 0,
          originalPrice: item.price || 0,
          image: item.images?.[0] || 'https://via.placeholder.com/150',
          quantity: item.quantity || 1,
          off: item.off || 0,
          category: item.category || '',
          isCustomizable: item.isCustomizable || false,
          addedAt: item.addedAt || Date.now(), // Timestamp when item was added
        }));
        
        // Sort by newest first (highest timestamp first)
        const sortedItems = items.sort((a, b) => b.addedAt - a.addedAt);
        
        setCartItems(sortedItems);
        setSelectedItems(new Set(sortedItems.map(item => item.id)));
      } else {
        setCartItems([]);
      }
    } catch (err) {
      setError('Failed to load cart. Please try again.');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  const handleQuantityChange = (itemId, delta) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setDeletingItemId(itemId);
      const phone = localStorage.getItem('dimensify3duserphoneNo');

      if (!phone) {
        setError('Unable to remove item. Please login again.');
        setDeletingItemId(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/remove-from-cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phone,
          cartItemId: itemId 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      } else {
        setError(data.message || 'Failed to remove item from cart');
      }
    } catch (err) {
      console.error('Error removing cart item:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    // Check if all items are currently selected
    const allSelected = cartItems.length > 0 && cartItems.every(item => selectedItems.has(item.id));
    
    if (allSelected) {
      // If all are selected, unselect all
      setSelectedItems(new Set());
    } else {
      // If any item is unselected, select all items
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateSavings = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + ((item.originalPrice - item.price) * item.quantity), 0);
  };

  const handleCheckout = () => {
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
  if (selectedCartItems.length === 0) {
    alert('Please select at least one item to checkout');
    return;
  }
  
  // Navigate to online store checkout with cart items
  navigate('/onlinestorecheckout', { 
    state: { cartItems: selectedCartItems } 
  });
};

  const openFullscreen = (imageUrl) => {
    setFullscreenImage(imageUrl);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spinner animation="border" variant="primary" style={styles.spinner} />
        <p style={styles.loadingText}>Loading your cart...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        body {
          background: linear-gradient(135deg,
            #f5f5f5 0%,  
            #e9edf2 25%,  
            #dce2e8 50%,   
            #cfd6dd 75%,  
            #e9edf2 100%   
          );
          min-height: 100vh;
        }

        .cart-header {
          background: linear-gradient(316deg, #2a65c5 0%, #0a50b1 100%);
          color: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 1.2rem 0;
        }

        .cart-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0;
          font-weight: 700;
          font-size: 1.75rem;
        }

        .back-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateX(-3px);
        }

        .item-count-badge {
          background: rgba(255,255,255,0.95);
          color: #0a50b1;
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .cart-body {
          background: transparent;
          min-height: calc(100vh - 80px);
          padding: 2rem 0;
        }

        .select-all-card {
          background: white;
          border-radius: 15px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 15px rgba(0,0,0,0.08);
          border: none;
          transition: all 0.3s ease;
        }

        .select-all-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }

        .cart-item-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 15px rgba(0,0,0,0.08);
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .cart-item-card:hover {
          box-shadow: 0 8px 30px rgba(42, 101, 197, 0.25);
          border-color: #2a65c5;
          transform: translateY(-2px);
        }

        .cart-item-card.selected {
          border-color: #2a65c5;
          background: linear-gradient(to right, #ffffff 0%, #f8f9ff 100%);
        }

        .checkbox-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .checkbox-btn:hover {
          transform: scale(1.1);
        }

        .product-image-wrapper {
          position: relative;
          border-radius: 15px;
          overflow: hidden;
          width: 150px;
          height: 150px;
          flex-shrink: 0;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
          background: #f8f9fa;
        }

        .product-image-wrapper:hover .product-image {
          transform: scale(1.1);
        }

        .zoom-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          cursor: pointer;
        }

        .product-image-wrapper:hover .zoom-overlay {
          opacity: 1;
        }

        .discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #ff4757;
          color: white;
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(245, 87, 108, 0.4);
          z-index: 10;
        }

        .category-badge {
          background: linear-gradient(135deg, #2a65c5 0%, #0a50b1 100%);
          color: white;
          padding: 0.4rem 1rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(42, 101, 197, 0.3);
        }

        .product-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .product-description {
          color: #718096;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .price-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .current-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
        }

        .original-price {
          font-size: 1rem;
          color: #a0aec0;
          text-decoration: line-through;
        }

        .custom-price-text {
          color: #ed8936;
          font-style: italic;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          background: #f7fafc;
          border-radius: 12px;
          padding: 0.25rem;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
        }

        .quantity-btn {
          background: white;
          border: none;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2a65c5;
        }

        .quantity-btn:hover:not(:disabled) {
          background: #2a65c5;
          color: white;
          transform: scale(1.05);
        }

        .quantity-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .quantity-display {
          min-width: 45px;
          text-align: center;
          font-weight: 700;
          font-size: 1.1rem;
          color: #2d3748;
        }

        .item-total-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2a65c5;
        }

        .delete-btn {
          background: #fff5f5;
          border: none;
          padding: 0.75rem;
          border-radius: 12px;
          color: #e53e3e;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn:hover:not(:disabled) {
          background: #e53e3e;
          color: white;
          transform: scale(1.05);
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .summary-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 25px rgba(0,0,0,0.1);
          position: sticky;
          top: 100px;
          border: none;
        }

        .summary-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 3px solid #2a65c5;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          color: #4a5568;
          font-size: 1rem;
        }

        .summary-row.savings {
          color: #38a169;
          font-weight: 600;
        }

        .summary-row.total {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 2px solid #e2e8f0;
        }

        .total-label {
          color: #2d3748;
        }

        .total-amount {
          color: #2a65c5;
          font-size: 1.75rem;
        }

        .checkout-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: 700;
          border: none;
          border-radius: 15px;
          background: linear-gradient(316deg, #2a65c5 0%, #0a50b1 100%);
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(42, 101, 197, 0.4);
          margin-top: 1.5rem;
        }

        .checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(42, 101, 197, 0.5);
        }

        .checkout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .secure-badge {
          text-align: center;
          color: #718096;
          font-size: 0.9rem;
          margin-top: 1rem;
        }

        .empty-cart {
          background: white;
          border-radius: 25px;
          padding: 4rem 2rem;
          text-align: center;
          box-shadow: 0 4px 25px rgba(0,0,0,0.08);
        }

        .empty-cart-icon {
          margin: 0 auto 2rem;
          color: #cbd5e0;
        }

        .empty-cart-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .empty-cart-text {
          color: #718096;
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .shop-now-btn {
          padding: 1rem 3rem;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          background: linear-gradient(316deg, #2a65c5 0%, #0a50b1 100%);
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(42, 101, 197, 0.4);
        }

        .shop-now-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(42, 101, 197, 0.5);
        }

        .fullscreen-modal {
          background: rgba(0,0,0,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fullscreen-modal .modal-content {
          background: transparent;
          border: none;
        }

        .fullscreen-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.75rem;
          border-radius: 50%;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .fullscreen-close-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: rotate(90deg);
        }

        .fullscreen-image {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 10px;
        }

        @media (max-width: 991px) {
          .cart-title {
            font-size: 1.5rem;
          }

          .product-image-wrapper {
            width: 120px;
            height: 120px;
          }

          .summary-card {
            position: static;
            margin-top: 2rem;
          }
        }

        @media (max-width: 767px) {
          .cart-header {
            padding: 1rem 0;
          }

          .cart-title {
            font-size: 1.25rem;
            gap: 0.5rem;
          }

          .item-count-badge {
            padding: 0.4rem 1rem;
            font-size: 0.9rem;
          }

          .cart-body {
            padding: 1rem 0;
          }

          .cart-item-card {
            padding: 1rem;
          }

          .product-image-wrapper {
            width: 100px;
            height: 100px;
          }

          .product-name {
            font-size: 1.1rem;
          }

          .current-price {
            font-size: 1.25rem;
          }

          .item-total-price {
            font-size: 1.25rem;
          }

          .summary-card {
            padding: 1.5rem;
          }

          .summary-title {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div>
        {/* Header */}
        <div className="cart-header">
          <Container>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="back-btn"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft size={22} />
                </button>
                <h2 className="cart-title">
                  <ShoppingCart size={28} />
                  Shopping Cart
                </h2>
              </div>
              <div className="item-count-badge">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
              </div>
            </div>
          </Container>
        </div>

        {/* Main Content */}
        <div className="cart-body">
          <Container>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <Package size={100} className="empty-cart-icon" />
                <h3 className="empty-cart-title">Your cart is empty</h3>
                <p className="empty-cart-text">Looks like you haven't added any items yet!</p>
                <button 
                  className="shop-now-btn"
                  onClick={() => window.location.href = '/onlinestore'}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <Row>
                <Col lg={8}>
                  {/* Select All */}
                  <Card className="select-all-card">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-3">
                        <span style={{fontWeight: 600, color: '#2d3748'}}>Cart Items</span>
                        <span style={{color: '#718096', fontWeight: 500}}>
                          {selectedItems.size} of {cartItems.length} selected
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedItems(new Set(cartItems.map(item => item.id)))}
                        style={{
                          padding: '0.5rem 1.5rem',
                          fontWeight: 600,
                          background: 'linear-gradient(316deg, #2a65c5 0%, #0a50b1 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.875rem'
                        }}
                      >
                        Select All
                      </Button>
                    </div>
                  </Card>

                  {/* Cart Items */}
                  {cartItems.map((item) => (
                    <Card key={item.id} className={`cart-item-card ${selectedItems.has(item.id) ? 'selected' : ''}`}>
                      <div className="d-flex gap-3 flex-column flex-md-row">
                        <button 
                          className="checkbox-btn align-self-start"
                          onClick={() => handleSelectItem(item.id)}
                        >
                          {selectedItems.has(item.id) ? 
                            <CheckSquare size={24} color="#09e639ff" /> : 
                            <Square size={24} color="#666" />
                          }
                        </button>

                        <div className="product-image-wrapper">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="product-image"
                          />
                          <div 
                            className="zoom-overlay"
                            onClick={() => openFullscreen(item.image)}
                          >
                            <ZoomIn size={28} color="white" />
                          </div>
                          {item.off > 0 && (
                            <div className="discount-badge">
                              {item.off}% OFF
                            </div>
                          )}
                        </div>

                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start gap-2 mb-2 flex-wrap">
                            <h5 className="product-name mb-0">{item.name}</h5>
                            {item.category && (
                              <span className="category-badge">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <p className="product-description">{item.description}</p>
                          <div className="price-container">
                            {item.price === 0 ? (
                              <span className="custom-price-text">
                                Price will be decided at checkout page based on your requirements
                              </span>
                            ) : (
                              <>
                                <span className="current-price">₹{item.price?.toLocaleString()}</span>
                                {item.off > 0 && (
                                  <span className="original-price">₹{item.originalPrice?.toLocaleString()}</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="d-flex flex-column align-items-end justify-content-between gap-3">
                          <div className="quantity-controls">
                            <button
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={18} />
                            </button>
                            <span className="quantity-display">{item.quantity}</span>
                            <button
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              <Plus size={18} />
                            </button>
                          </div>

                          <div className="item-total-price">
                            {item.price === 0 ? (
                              <span className="custom-price-text">Custom</span>
                            ) : (
                              `₹${(item.price * item.quantity).toLocaleString()}`
                            )}
                          </div>

                          <button
                            className="delete-btn"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={deletingItemId === item.id}
                          >
                            {deletingItemId === item.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <Trash2 size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </Col>

                {/* Order Summary */}
                <Col lg={4}>
                  <Card className="summary-card">
                    <h4 className="summary-title">Order Summary</h4>
                    
                    <div className="summary-row">
                      <span>Items Selected:</span>
                      <span style={{fontWeight: 600}}>{selectedItems.size}</span>
                    </div>

                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span style={{fontWeight: 600}}>₹{calculateTotal().toLocaleString()}</span>
                    </div>

                    {calculateSavings() > 0 && (
                      <div className="summary-row savings">
                        <span>You Save:</span>
                        <span style={{fontWeight: 700}}>₹{calculateSavings().toLocaleString()}</span>
                      </div>
                    )}

                    <div className="summary-row total">
                      <span className="total-label">Total Amount:</span>
                      <span className="total-amount">₹{calculateTotal().toLocaleString()}</span>
                    </div>

                    <button
                      className="checkout-btn"
                      onClick={handleCheckout}
                      disabled={selectedItems.size === 0}
                    >
                      Proceed to Checkout
                    </button>

                    <div className="secure-badge">
                      🔒 100% Secure Checkout
                    </div>
                  </Card>
                </Col>
              </Row>
            )}
          </Container>
        </div>

        {/* Fullscreen Image Modal */}
        <Modal 
          show={!!fullscreenImage} 
          onHide={closeFullscreen}
          centered
          size="xl"
          className="fullscreen-modal"
        >
          <button 
            className="fullscreen-close-btn"
            onClick={closeFullscreen}
          >
            <X size={24} />
          </button>
          <Modal.Body className="p-0 d-flex align-items-center justify-content-center">
            <img 
              src={fullscreenImage} 
              alt="Fullscreen view" 
              className="fullscreen-image"
            />
          </Modal.Body>
        </Modal>

        {/* Login Modal */}
        <Modal 
          show={showLoginPopup} 
          onHide={() => setShowLoginPopup(false)}
          centered
        >
          <Modal.Body className="p-4">
            <h3 style={{fontSize: '1.75rem', fontWeight: 700, color: '#2d3748', marginBottom: '1rem'}}>
              Please Login to Continue
            </h3>
            <p style={{color: '#718096', marginBottom: '1.5rem'}}>
              You must be logged in to view your cart and make purchases.
            </p>
            <div className="d-flex gap-3">
              <Button 
                variant="primary"
                className="flex-grow-1"
                style={{
                  padding: '0.75rem',
                  fontWeight: 600,
                  background: 'linear-gradient(316deg, #2a65c5 0%, #0a50b1 100%)',
                  border: 'none',
                  borderRadius: '10px'
                }}
                onClick={handleLoginRedirect}
              >
                Go to Login
              </Button>
              <Button 
                variant="secondary"
                className="flex-grow-1"
                style={{
                  padding: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '10px'
                }}
                onClick={() => setShowLoginPopup(false)}
              >
                Cancel
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)',
  },
  spinner: {
    width: '4rem',
    height: '4rem',
    borderWidth: '4px',
  },
  loadingText: {
    marginTop: '1.5rem',
    color: '#4a5568',
    fontSize: '1.25rem',
    fontWeight: 500,
  },
};