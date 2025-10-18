import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import API_BASE_URL from "./apiConfig";

const OnlineStoreCheckout = () => {
  const [checkoutData, setCheckoutData] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressKey, setSelectedAddressKey] = useState(null);
  const [newAddress, setNewAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Address editing states
  const [editingAddressKey, setEditingAddressKey] = useState(null);
  const [editAddressForm, setEditAddressForm] = useState({
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
  });
  
  // Customization states
  const [customizations, setCustomizations] = useState({});
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [currentCustomizingItem, setCurrentCustomizingItem] = useState(null);
  const [tempCustomization, setTempCustomization] = useState({ bigText: "", mediumText: "", smallText: "", specialInstructions: "" });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.style.background =
      "linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)";

    return () => {
      document.body.style.background = "";
    };
  }, []);

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        const userPhone = localStorage.getItem("dimensify3duserphoneNo");
        if (!userPhone) {
          setShowLoginPopup(true);
          const timer = setTimeout(() => navigate("/login"), 5000);
          return () => clearTimeout(timer);
        }

        const res = await fetch(`${API_BASE_URL}/api/user-by-phone`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: userPhone }),
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
          const userAddresses = data.data.addresses ? Object.entries(data.data.addresses) : [];
          setAddresses(userAddresses);
          
          if (userAddresses.length === 1) {
            setSelectedAddressKey(userAddresses[0][0]);
          }
        }

        const cartItems = location.state?.cartItems;
        
        if (!cartItems || cartItems.length === 0) {
          toast.error("No items found for checkout. Redirecting...");
          setTimeout(() => navigate("/cart"), 2000);
          return;
        }

        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const savings = cartItems.reduce((total, item) => 
          total + ((item.originalPrice - item.price) * item.quantity), 0);

        const checkoutInfo = {
          items: cartItems,
          subtotal: subtotal,
          savings: savings,
          totalPrice: subtotal,
          itemCount: cartItems.length,
          totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        };

        setCheckoutData(checkoutInfo);
        
        // Initialize customizations for items with price 0
        const initialCustomizations = {};
        cartItems.forEach(item => {
          if (item.price === 0) {
            initialCustomizations[item.id] = {
              bigText: "",
              mediumText: "",
              smallText: "",
              specialInstructions: "",
              cost: 0
            };
          }
        });
        setCustomizations(initialCustomizations);
        
        setLoading(false);

      } catch (error) {
        console.error("Error loading checkout data:", error);
        toast.error("Failed to load checkout data");
        setLoading(false);
        setTimeout(() => navigate("/cart"), 2000);
      }
    };

    loadCheckoutData();
  }, [navigate, location]);

  // Address Management Functions
  const handleAddAddress = async () => {
    if (addresses.length >= 3) {
      toast.error('You can add only up to 3 addresses.');
      return;
    }
    if (!newAddress.addressLine1 || !newAddress.pincode || !newAddress.city || !newAddress.state) {
      toast.error('Please fill all required fields.');
      return;
    }

    const userPhone = localStorage.getItem("dimensify3duserphoneNo");
    if (!userPhone) {
      toast.error('User not logged in!');
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userPhone}/address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "",
          street: newAddress.addressLine1,
          addressLine2: newAddress.addressLine2,
          landmark: newAddress.landmark,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const updatedAddresses = [...addresses, [data.addressKey || Date.now(), newAddress]];
        setAddresses(updatedAddresses);
        setSelectedAddressKey(updatedAddresses[updatedAddresses.length - 1][0]);
        setNewAddress({ addressLine1: "", addressLine2: "", landmark: "", pincode: "", city: "", state: "" });
        setShowAddressForm(false);
        toast.success('Address saved successfully!');
      } else {
        toast.error(data.message || 'Failed to save address');
      }
    } catch (err) {
      console.error("Error saving address:", err);
      toast.error('Error saving address. Please try again.');
    }
  };

  const handleEditAddress = async (addressKey, updatedAddress) => {
    try {
      const userPhone = localStorage.getItem("dimensify3duserphoneNo");
      if (!userPhone) {
        toast.error('User not logged in!');
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/users/${userPhone}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: {
            [addressKey]: updatedAddress
          }
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        const updatedAddresses = addresses.map(([key, addr]) => 
          key === addressKey ? [key, updatedAddress] : [key, addr]
        );
        setAddresses(updatedAddresses);
        toast.success('Address updated successfully!');
        return true;
      } else {
        toast.error(data.message || 'Failed to update address');
        return false;
      }
    } catch (err) {
      console.error("Error updating address:", err);
      toast.error('Error updating address. Please try again.');
      return false;
    }
  };

  const handleDeleteAddress = async (addressKey) => {
    try {
      const userPhone = localStorage.getItem("dimensify3duserphoneNo");
      if (!userPhone) {
        toast.error('User not logged in!');
        return;
      }

      // Create updated addresses object without the deleted address
      const updatedAddresses = {};
      addresses.forEach(([key, addr]) => {
        if (key !== addressKey) {
          updatedAddresses[key] = addr;
        }
      });

      const res = await fetch(`${API_BASE_URL}/api/users/${userPhone}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: updatedAddresses
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        const filteredAddresses = addresses.filter(([key]) => key !== addressKey);
        setAddresses(filteredAddresses);
        
        // Reset selected address if it was deleted
        if (selectedAddressKey === addressKey) {
          setSelectedAddressKey(filteredAddresses.length > 0 ? filteredAddresses[0][0] : null);
        }
        
        toast.success('Address deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete address');
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      toast.error('Error deleting address. Please try again.');
    }
  };

  const openEditAddressForm = (addressKey, address) => {
    setEditingAddressKey(addressKey);
    setEditAddressForm({
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      pincode: address.pincode || "",
      city: address.city || "",
      state: address.state || "",
    });
  };

  const cancelEditAddress = () => {
    setEditingAddressKey(null);
    setEditAddressForm({
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      pincode: "",
      city: "",
      state: "",
    });
  };

  const saveEditedAddress = async () => {
    if (!editAddressForm.addressLine1 || !editAddressForm.pincode || !editAddressForm.city || !editAddressForm.state) {
      toast.error('Please fill all required fields.');
      return;
    }

    const success = await handleEditAddress(editingAddressKey, editAddressForm);
    if (success) {
      setEditingAddressKey(null);
    }
  };

  // Customization Functions
  const calculateCustomizationCost = (bigText, mediumText, smallText) => {
    const bigTextCost = bigText.replace(/\s/g, '').length * 10;
    const mediumTextCost = mediumText.replace(/\s/g, '').length * 8;
    const smallTextCost = smallText.replace(/\s/g, '').length * 5;
    return bigTextCost + mediumTextCost + smallTextCost;
  };

  const openCustomizationModal = (item) => {
    setCurrentCustomizingItem(item);
    const existing = customizations[item.id];
    if (existing) {
      setTempCustomization(existing);
    }
    setShowCustomizationModal(true);
  };

  const getTotalCustomizationCost = () => {
    return checkoutData.items.reduce((total, item) => {
      if (item.price === 0 && customizations[item.id]) {
        return total + (customizations[item.id].cost * item.quantity);
      }
      return total;
    }, 0);
  };

  const hasUncompletedCustomizations = () => {
    return checkoutData.items.some(item => {
      if (item.price === 0) {
        const customization = customizations[item.id];
        return !customization || !customization.mediumText || customization.mediumText.trim().length === 0;
      }
      return false;
    });
  };

  // Payment Functions
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    try {
      if (hasUncompletedCustomizations()) {
        toast.error("Please complete customization for all customizable items before proceeding to payment.");
        return;
      }

      const res = await loadRazorpay();
      if (!res) {
        toast.error('Failed to load Razorpay SDK. Check your internet connection.');
        return;
      }

      const userPhone = localStorage.getItem("dimensify3duserphoneNo");
      if (!userPhone) {
        toast.error('Please login first!');
        return;
      }

      const selectedAddr = addresses.find(([key]) => key === selectedAddressKey);
      if (!selectedAddr) {
        toast.error('Please select a delivery address.');
        return;
      }

      const deliveryCharge = 40;
      const customizationCost = getTotalCustomizationCost();
      const grandTotal = checkoutData.totalPrice + deliveryCharge + customizationCost;

      const orderRes = await fetch(`${API_BASE_URL}/api/createOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
          currency: "INR",
          receipt: "receipt_store_" + Date.now(),
        }),
      });

      const orderDataRes = await orderRes.json();
      if (!orderDataRes.success) {
        toast.error('Failed to create payment order');
        return;
      }

      const { order } = orderDataRes;

      const options = {
        key: "rzp_live_RUxw1CnUrnTqD3",
        amount: order.amount,
        currency: order.currency,
        name: "Dimensify3D",
        description: "Online Store Order Payment",
        order_id: order.id,
        handler: async function (response) {
          setShowPaymentSuccessModal(true);
          setIsProcessingOrder(true);

          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/verifyOrder`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              const orderData = {
                phone: userPhone,
                address: selectedAddr[1],
                orderTimestamp: new Date().toISOString(),
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                status: "paid",
                orderType: "online-store",
                totalPrice: grandTotal,
                subtotal: checkoutData.subtotal,
                savings: checkoutData.savings,
                deliveryCharge: deliveryCharge,
                customizationCost: customizationCost,
                items: checkoutData.items.map(item => {
                  const itemData = {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    originalPrice: item.originalPrice,
                    quantity: item.quantity,
                    image: item.image,
                    category: item.category,
                    off: item.off,
                    totalItemPrice: item.price * item.quantity
                  };

                  if (item.price === 0 && customizations[item.id]) {
                    itemData.customization = {
                      bigText: customizations[item.id].bigText,
                      mediumText: customizations[item.id].mediumText,
                      smallText: customizations[item.id].smallText,
                      specialInstructions: customizations[item.id].specialInstructions,
                      bigTextChars: customizations[item.id].bigTextChars,
                      mediumTextChars: customizations[item.id].mediumTextChars,
                      smallTextChars: customizations[item.id].smallTextChars,
                      customizationCostPerItem: customizations[item.id].cost,
                      totalCustomizationCost: customizations[item.id].cost * item.quantity
                    };
                    itemData.totalItemPrice = customizations[item.id].cost * item.quantity;
                  }

                  return itemData;
                }),
                itemCount: checkoutData.itemCount,
                totalQuantity: checkoutData.totalQuantity
              };

              const orderStoreRes = await fetch(`${API_BASE_URL}/api/store-orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
              });

              const orderStoreData = await orderStoreRes.json();
              if (orderStoreData.success) {
                for (const item of checkoutData.items) {
                  await fetch(`${API_BASE_URL}/api/remove-from-cart`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      phone: userPhone,
                      cartItemId: item.id 
                    }),
                  });
                }

                setIsProcessingOrder(false);
                setTimeout(() => {
                  setShowPaymentSuccessModal(false);
                  navigate("/");
                }, 3000);
              } else {
                setIsProcessingOrder(false);
                setShowPaymentSuccessModal(false);
                toast.error(orderStoreData.message || 'Failed to store order');
              }
            } else {
              setIsProcessingOrder(false);
              setShowPaymentSuccessModal(false);
              toast.error('Payment verification failed!');
            }
          } catch (err) {
            console.error("Error processing order:", err);
            setIsProcessingOrder(false);
            setShowPaymentSuccessModal(false);
            toast.error('Something went wrong. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "customer@example.com",
          contact: userPhone,
        },
        theme: { color: "#2a65c5" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("Error in checkout:", err);
      toast.error('Something went wrong. Please try again!');
    }
  };

  // Modal Components
  const PaymentSuccessModal = () => (
    <Modal show={showPaymentSuccessModal} centered backdrop="static" keyboard={false} size="md">
      <Modal.Body className="text-center py-5" style={{ background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)", color: "white", borderRadius: "0.5rem" }}>
        {isProcessingOrder ? (
          <>
            <div className="mb-4">
              <Spinner animation="border" size="lg" style={{ color: "white" }} />
            </div>
            <h4 className="mb-3">Processing Your Order...</h4>
            <p className="mb-4">Payment successful! We're saving your order details.</p>
            <div className="d-flex align-items-center justify-content-center">
              <Spinner animation="grow" size="sm" className="me-2" />
              <small>Please wait...</small>
              <Spinner animation="grow" size="sm" className="ms-2" />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <i className="fas fa-check-circle" style={{ fontSize: "4rem" }}></i>
            </div>
            <h4 className="mb-3">Order Confirmed!</h4>
            <p className="mb-4">Your order has been placed successfully.</p>
            <small>Redirecting to homepage...</small>
          </>
        )}
      </Modal.Body>
    </Modal>
  );

  const CustomizationModal = () => {
    const [localBigText, setLocalBigText] = useState("");
    const [localMediumText, setLocalMediumText] = useState("");
    const [localSmallText, setLocalSmallText] = useState("");
    const [localSpecialInstructions, setLocalSpecialInstructions] = useState("");

    useEffect(() => {
      if (currentCustomizingItem && tempCustomization) {
        setLocalBigText(tempCustomization.bigText || "");
        setLocalMediumText(tempCustomization.mediumText || "");
        setLocalSmallText(tempCustomization.smallText || "");
        setLocalSpecialInstructions(tempCustomization.specialInstructions || "");
      }
    }, [currentCustomizingItem, tempCustomization]);

    const handleSave = () => {
      if (!localMediumText || localMediumText.trim().length === 0) {
        toast.error("Medium text is mandatory. Please enter at least one character.");
        return;
      }

      const cost = calculateCustomizationCost(localBigText, localMediumText, localSmallText);

      const savedCustomization = {
        bigText: localBigText,
        mediumText: localMediumText,
        smallText: localSmallText,
        specialInstructions: localSpecialInstructions,
        cost: cost,
        bigTextChars: localBigText.replace(/\s/g, '').length,
        mediumTextChars: localMediumText.replace(/\s/g, '').length,
        smallTextChars: localSmallText.replace(/\s/g, '').length
      };

      setCustomizations(prev => ({
        ...prev,
        [currentCustomizingItem.id]: savedCustomization
      }));

      toast.success("Customization saved successfully!");
      setShowCustomizationModal(false);
      setCurrentCustomizingItem(null);
    };

    const handleClose = () => {
      setShowCustomizationModal(false);
      setCurrentCustomizingItem(null);
    };

    if (!currentCustomizingItem) return null;

    return (
      <Modal 
        show={showCustomizationModal} 
        onHide={handleClose} 
        centered 
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton style={{ background: "linear-gradient(316deg, rgb(42 101 197) 0%, rgb(10 80 177) 100%)", color: "#fff" }}>
          <Modal.Title>
            <i className="fas fa-pencil-alt me-2"></i>
            Customize: {currentCustomizingItem.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Alert variant="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Note:</strong> Spaces are allowed but won't be charged. Medium text is mandatory. Pricing: Big Text (₹10/char), Medium Text (₹8/char), Small Text (₹5/char)
          </Alert>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold" style={{ fontSize: "1.2rem", color: "#2a65c5" }}>
              <i className="fas fa-text-height me-2"></i>
              Big Text (Optional) - ₹10 per character
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter big text (optional)"
              value={localBigText}
              onChange={(e) => setLocalBigText(e.target.value)}
              style={{ fontSize: "1.5rem", padding: "0.75rem" }}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold" style={{ fontSize: "1rem", color: "#2a65c5" }}>
              <i className="fas fa-text-width me-2"></i>
              Medium Text (Mandatory) - ₹8 per character
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter medium text (required)"
              value={localMediumText}
              onChange={(e) => setLocalMediumText(e.target.value)}
              style={{ fontSize: "1.2rem", padding: "0.6rem" }}
              className="border-primary"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold" style={{ fontSize: "0.9rem", color: "#2a65c5" }}>
              <i className="fas fa-font me-2"></i>
              Small Text (Optional) - ₹5 per character
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter small text (optional)"
              value={localSmallText}
              onChange={(e) => setLocalSmallText(e.target.value)}
              style={{ fontSize: "0.9rem", padding: "0.5rem" }}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold" style={{ fontSize: "0.95rem", color: "#28a745" }}>
              <i className="fas fa-clipboard-list me-2"></i>
              Special Instructions (Optional)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter any special requirements like size, color, material preferences, etc. (optional)"
              value={localSpecialInstructions}
              onChange={(e) => setLocalSpecialInstructions(e.target.value)}
              style={{ fontSize: "0.9rem", padding: "0.75rem" }}
            />
            <Form.Text className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Example: "Size: Medium, Color: Blue, Material: Acrylic" or "Please use bold font style"
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={!localMediumText || localMediumText.trim().length === 0}
            style={{ background: "linear-gradient(316deg, rgb(42 101 197) 0%, rgb(10 80 177) 100%)", border: "none" }}
          >
            <i className="fas fa-save me-2"></i>
            Save Customization
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const enhancedStyles = `
    .checkout-container {
      min-height: 100vh;
      padding: 2rem 0;
    }

    .checkout-header {
      background: linear-gradient(316deg, rgb(42 101 197) 0%, rgb(10 80 177) 100%);
      color: #fff;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(42, 101, 197, 0.3);
      margin-bottom: 2rem;
    }

    .card-enhanced {
      border: none;
      border-radius: 1rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.95);
    }

    .card-enhanced:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .address-option {
      border: 2px solid #e9ecef;
      border-radius: 0.75rem;
      padding: 1.25rem;
      margin-bottom: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fff;
      position: relative;
    }

    .address-option:hover {
      border-color: #2a65c5;
      box-shadow: 0 5px 20px rgba(42, 101, 197, 0.15);
      transform: translateY(-2px);
    }

    .address-option.selected {
      border-color: #2a65c5;
      background: linear-gradient(145deg, rgba(42, 101, 197, 0.05) 0%, #fff 100%);
      box-shadow: 0 8px 25px rgba(42, 101, 197, 0.2);
    }

    .address-option.selected::before {
      content: '✓';
      position: absolute;
      top: 1rem;
      right: 1rem;
      color: #2a65c5;
      font-weight: bold;
      font-size: 1.2rem;
    }

    .address-actions {
      position: absolute;
      top: 1rem;
      right: 3rem;
      display: flex;
      gap: 0.5rem;
    }

    .btn-address-action {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
      border: none;
      border-radius: 0.4rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .btn-edit-address {
      background: linear-gradient(316deg, rgb(42 101 197) 0%, rgb(10 80 177) 100%);
      color: #fff;
    }

    .btn-edit-address:hover {
      background: linear-gradient(316deg, rgb(52 111 207) 0%, rgb(20 90 187) 100%);
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(42, 101, 197, 0.3);
    }

    .btn-delete-address {
      background: linear-gradient(316deg, #dc3545 0%, #c82333 100%);
      color: #fff;
    }

    .btn-delete-address:hover {
      background: linear-gradient(316deg, #e04b59 0%, #d92538 100%);
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(220, 53, 69, 0.3);
    }

    .product-card {
      border: 1px solid #e9ecef;
      border-radius: 0.75rem;
      padding: 1rem;
      margin-bottom: 1rem;
      background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
      transition: all 0.3s ease;
      display: flex;
      gap: 1rem;
      align-items: center;
    //   width:280px;
    // }

    .product-card:hover {
      border-color: #2a65c5;
      box-shadow: 0 3px 15px rgba(42, 101, 197, 0.1);
    }

    .product-card.customizable {
      border: 2px dashed #2a65c5;
      background: linear-gradient(145deg, #e3f2fd 0%, #e8eaf6 100%);
    }

    .product-image {
      width: 80px;
      height: 80px;
      object-fit: contain;
      border-radius: 0.5rem;
      background: #f8f9fa;
    }

    .price-summary {
      background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(42, 101, 197, 0.1);
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .price-row:last-child {
      border-bottom: none;
      font-weight: 700;
      font-size: 1.2rem;
      color: #28a745;
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 2px solid #28a745;
    }

    .pay-button {
      background: linear-gradient(316deg, rgb(42 101 197) 0%, rgb(10 80 177) 100%);
      border: none;
      border-radius: 0.75rem;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 5px 20px rgba(42, 101, 197, 0.3);
    }

    .pay-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(42, 101, 197, 0.4);
      background: linear-gradient(316deg, rgb(52 111 207) 0%, rgb(20 90 187) 100%);
    }

    .pay-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .info-section {
      border-radius: 0.75rem;
      background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
      border: 1px solid rgba(42, 101, 197, 0.1);
      margin-bottom: 1rem;
    }

    .info-label {
      font-weight: 600;
      color: #2a65c5;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .btn-add-address {
      background: linear-gradient(145deg, #28a745 0%, #20c997 100%);
      border: none;
      border-radius: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-add-address:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
    }

    .btn-customize {
      background: linear-gradient(145deg, #2a65c5 0%, #1e4db5 100%);
      border: none;
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.3s ease;
      color: white;
    }

    .btn-customize:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(42, 101, 197, 0.3);
      color: white;
    }

    .customization-badge {
      background: linear-gradient(145deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .security-note {
      background: linear-gradient(145deg, #e3f2fd 0%, #f3e5f5 100%);
      border: 1px solid rgba(42, 101, 197, 0.2);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-top: 1rem;
    }

    @media (min-width: 992px) {
      .sticky-sidebar {
        position: sticky;
        top: 2rem;
      }
    }

    .Toastify__toast {
      border-radius: 10px;
      font-size: 0.95rem;
      padding: 1rem;
      color: white !important;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .Toastify__toast--success {
      background: linear-gradient(135deg, #10b981 0%, #047857 100%) !important;
    }
    
    .Toastify__toast--error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    }
  `;

  if (showLoginPopup) {
    return (
      <Modal show centered backdrop="static">
        <Modal.Header style={{ background: "linear-gradient(316deg, rgb(42 101 197) 0%, rgb(10 80 177) 100%)", color: "#fff" }}>
          <Modal.Title>Authentication Required</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <h5 className="mb-3">Please login to continue</h5>
          <Spinner animation="border" size="sm" className="me-2" />
          <Button variant="primary" onClick={() => navigate("/login")}>Go to Login</Button>
        </Modal.Body>
      </Modal>
    );
  }

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8}>
            <Card className="shadow-lg p-4">
              <div className="text-center">
                <Spinner animation="border" />
                <p className="mt-3">Loading checkout details...</p>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!checkoutData) {
    return (
      <Container className="py-5">
        <Alert variant="danger">No checkout data found.</Alert>
      </Container>
    );
  }

  const deliveryPrice = 40;
  const customizationCost = getTotalCustomizationCost();
  const grandTotal = checkoutData.totalPrice + deliveryPrice + customizationCost;

  return (
    <div className="checkout-container">
      <style>{enhancedStyles}</style>
      
      <Container>
        <div className="checkout-header">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center mb-2">
                <i className="fas fa-shopping-bag me-3" style={{ fontSize: "1.5rem" }}></i>
                <div>
                  <h2 className="mb-1">Order Summary</h2>
                  <p className="mb-0 opacity-75">Review your order from the online store</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="d-flex flex-column align-items-md-end">
                <Badge bg="light" text="dark" className="mb-2 fs-6">Total Amount</Badge>
                <div style={{ fontSize: "2rem", fontWeight: "700" }}>₹{grandTotal}</div>
                <small className="opacity-75">{checkoutData.itemCount} product{checkoutData.itemCount > 1 ? 's' : ''} • {checkoutData.totalQuantity} item{checkoutData.totalQuantity > 1 ? 's' : ''}</small>
              </div>
            </Col>
          </Row>
        </div>

        <Row className="g-4">
          <Col lg={6}>
            <Card className="card-enhanced">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <i className="fas fa-map-marker-alt me-3 text-primary" style={{ fontSize: "1.5rem" }}></i>
                  <h4 className="mb-0">Delivery Address</h4>
                  <Badge bg="secondary" className="ms-auto">{addresses.length}/3</Badge>
                </div>

                {addresses.length === 0 ? (
                  <Alert variant="warning" className="text-center">
                    <i className="fas fa-exclamation-triangle mb-2 d-block"></i>
                    No delivery address found. Please add one to continue.
                  </Alert>
                ) : (
                  <div className="mb-3">
                    {addresses.map(([key, addr]) => (
                      <div
                        key={key}
                        className={`address-option ${selectedAddressKey === key ? 'selected' : ''}`}
                        onClick={() => setSelectedAddressKey(key)}
                      >
                        <div className="address-actions">
                          <Button
                            size="sm"
                            className="btn-address-action btn-edit-address"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditAddressForm(key, addr);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </Button>
                          {addresses.length > 1 && (
                            <Button
                              size="sm"
                              className="btn-address-action btn-delete-address"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this address?')) {
                                  handleDeleteAddress(key);
                                }
                              }}
                            >
                              <i className="fas fa-trash"></i>
                              Delete
                            </Button>
                          )}
                        </div>
                        
                        <Form.Check
                          type="radio"
                          name="address"
                          checked={selectedAddressKey === key}
                          onChange={() => setSelectedAddressKey(key)}
                          className="mb-2"
                        />
                        <div>
                          <strong>{addr.addressLine1}</strong>
                          {addr.addressLine2 && <div className="text-muted small">{addr.addressLine2}</div>}
                          {addr.landmark && <div className="text-muted small"><i className="fas fa-map-pin me-1"></i>{addr.landmark}</div>}
                          <div className="text-muted small mt-1">
                            <i className="fas fa-location-dot me-1"></i>
                            {addr.city}, {addr.state} - {addr.pincode}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit Address Form */}
                {editingAddressKey && (
                  <Card className="mt-3" style={{ 
                    background: "linear-gradient(145deg, rgba(42, 101, 197, 0.05) 0%, #fff 100%)", 
                    border: "2px solid #2a65c5" 
                  }}>
                    <Card.Body>
                      <h6 className="mb-3" style={{ color: "#2a65c5" }}>
                        <i className="fas fa-edit me-2"></i>
                        Edit Address
                      </h6>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Address Line 1 *</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Address Line 1" 
                            value={editAddressForm.addressLine1} 
                            onChange={(e) => setEditAddressForm({ ...editAddressForm, addressLine1: e.target.value })} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Address Line 2</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Address Line 2" 
                            value={editAddressForm.addressLine2} 
                            onChange={(e) => setEditAddressForm({ ...editAddressForm, addressLine2: e.target.value })} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Landmark</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Landmark" 
                            value={editAddressForm.landmark} 
                            onChange={(e) => setEditAddressForm({ ...editAddressForm, landmark: e.target.value })} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Pincode *</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Pincode" 
                            value={editAddressForm.pincode} 
                            onChange={(e) => setEditAddressForm({ ...editAddressForm, pincode: e.target.value })} 
                            maxLength={6} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>City *</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="City" 
                            value={editAddressForm.city} 
                            onChange={(e) => setEditAddressForm({ ...editAddressForm, city: e.target.value })} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>State *</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="State" 
                            value={editAddressForm.state} 
                            onChange={(e) => setEditAddressForm({ ...editAddressForm, state: e.target.value })} 
                          />
                        </Form.Group>
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                          <Button variant="outline-secondary" onClick={cancelEditAddress}>
                            Cancel
                          </Button>
                          <Button 
                            variant="primary" 
                            onClick={saveEditedAddress}
                            style={{ background: "linear-gradient(316deg, rgb(42 101 197) 0%, rgb(10 80 177) 100%)", border: "none" }}
                          >
                            <i className="fas fa-save me-2"></i>Update Address
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                )}

                {/* Add New Address Form */}
                {!showAddressForm && !editingAddressKey && addresses.length < 3 && (
                  <Button variant="outline-success" className="w-100 mb-3" onClick={() => setShowAddressForm(true)}>
                    <i className="fas fa-plus me-2"></i>Add New Address
                  </Button>
                )}

                {showAddressForm && !editingAddressKey && (
                  <Card className="mt-3" style={{ backgroundColor: "#f8f9fa" }}>
                    <Card.Body>
                      <h6 className="mb-3"><i className="fas fa-plus-circle me-2"></i>Add New Address</h6>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Address Line 1 *</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Address Line 1" 
                            value={newAddress.addressLine1} 
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Address Line 2</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Address Line 2" 
                            value={newAddress.addressLine2} 
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Landmark</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Landmark" 
                            value={newAddress.landmark} 
                            onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Pincode *</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Pincode" 
                            value={newAddress.pincode} 
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} 
                            maxLength={6} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>City *</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="City" 
                            value={newAddress.city} 
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>State *</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="State" 
                            value={newAddress.state} 
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} 
                          />
                        </Form.Group>
                        <div className="d-grid gap-2">
                          <Button className="btn-add-address" onClick={handleAddAddress}>
                            <i className="fas fa-save me-2"></i>Save Address
                          </Button>
                          <Button variant="outline-secondary" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                )}

                <Alert variant="info" className="mt-3">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-truck me-2"></i>
                    <small><strong>Estimated Delivery:</strong> 3-5 business days</small>
                  </div>
                </Alert>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <div className="sticky-sidebar">
              <Card className="card-enhanced">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <i className="fas fa-box-open me-3 text-primary" style={{ fontSize: "1.5rem" }}></i>
                    <h4 className="mb-0">Order Items</h4>
                    <Badge bg="secondary" className="ms-auto">{checkoutData.itemCount} Product{checkoutData.itemCount > 1 ? 's' : ''}</Badge>
                  </div>

                  {checkoutData.items.length > 0 ? (
                    <div className="info-section mb-4">
                      <div className="info-label">Products</div>
                      {checkoutData.items.map((item, index) => (
                        <div key={index} className={`product-card ${item.price === 0 ? 'customizable' : ''}`}>
                          <img src={item.image} alt={item.name} className="product-image" />
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{item.name}</div>
                            <small className="text-muted">{item.description}</small>
                            <div className="mt-1">
                              <small className="text-muted">Qty: {item.quantity}</small>
                              <span className="mx-2">•</span>
                              {item.price === 0 ? (
                                <>
                                  <strong className="text-primary">₹{customizations[item.id]?.cost ? customizations[item.id].cost * item.quantity : 0}</strong>
                                  {customizations[item.id]?.mediumText ? (
                                    <span className="customization-badge">
                                      <i className="fas fa-check me-1"></i>Customized
                                    </span>
                                  ) : (
                                    <Badge bg="danger" text="white" className="ms-2">
                                      <i className="fas fa-exclamation-triangle me-1"></i>Needs Customization
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <>
                                  <strong className="text-success">₹{item.price}</strong>
                                  {item.off > 0 && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <Badge bg="danger" className="ms-1">{item.off}% OFF</Badge>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                            {item.price === 0 && (
                              <div className="mt-2">
                                <Button 
                                  className="btn-customize" 
                                  size="sm"
                                  onClick={() => openCustomizationModal(item)}
                                >
                                  <i className="fas fa-pencil-alt me-1"></i>
                                  {customizations[item.id]?.bigText ? 'Edit Customization' : 'Add Customization'}
                                </Button>
                                {customizations[item.id]?.mediumText && (
                                  <div className="mt-2 p-2 bg-light rounded border">
                                    {customizations[item.id].bigText && (
                                      <small className="d-block">
                                        <strong>Big Text:</strong> {customizations[item.id].bigText}
                                      </small>
                                    )}
                                    <small className="d-block">
                                      <strong>Medium Text:</strong> {customizations[item.id].mediumText}
                                    </small>
                                    {customizations[item.id].smallText && (
                                      <small className="d-block">
                                        <strong>Small Text:</strong> {customizations[item.id].smallText}
                                      </small>
                                    )}
                                    {customizations[item.id].specialInstructions && (
                                      <small className="d-block text-success">
                                        <strong>Special Instructions:</strong> {customizations[item.id].specialInstructions}
                                      </small>
                                    )}
                                    <hr className="my-2" />
                                    <div className="mt-2">
                                      <small className="d-block text-muted">
                                        <strong>Customization Cost Breakdown:</strong>
                                      </small>
                                      {customizations[item.id].bigTextChars > 0 && (
                                        <small className="d-block">
                                          Big Text ({customizations[item.id].bigTextChars} chars × ₹10) = ₹{customizations[item.id].bigTextChars * 10}
                                        </small>
                                      )}
                                      <small className="d-block">
                                        Medium Text ({customizations[item.id].mediumTextChars} chars × ₹8) = ₹{customizations[item.id].mediumTextChars * 8}
                                      </small>
                                      {customizations[item.id].smallTextChars > 0 && (
                                        <small className="d-block">
                                          Small Text ({customizations[item.id].smallTextChars} chars × ₹5) = ₹{customizations[item.id].smallTextChars * 5}
                                        </small>
                                      )}
                                      <small className="d-block mt-1">
                                        <strong>Per Item Cost: ₹{customizations[item.id].cost}</strong>
                                      </small>
                                      {item.quantity > 1 && (
                                        <small className="d-block text-primary">
                                          <strong>Total (₹{customizations[item.id].cost} × {item.quantity} qty) = ₹{customizations[item.id].cost * item.quantity}</strong>
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert variant="warning" className="mb-4">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      No items found in order.
                    </Alert>
                  )}

                  <div className="info-section mb-4">
                    <div className="info-label">Order Summary</div>
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="text-center">
                          <div className="h4 mb-1 text-primary">{checkoutData.totalQuantity}</div>
                          <small className="text-muted">Total Items</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="price-summary mb-4">
                    <h5 className="mb-3">
                      <i className="fas fa-calculator me-2"></i>
                      Price Breakdown
                    </h5>
                    <div className="price-row">
                      <span>Subtotal ({checkoutData.totalQuantity} items)</span>
                      <span>₹{checkoutData.subtotal}</span>
                    </div>
                    {customizationCost > 0 && (
                      <div className="price-row" style={{ color: '#2a65c5', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                        <span>Customization Charges</span>
                        <span>₹{customizationCost}</span>
                      </div>
                    )}
                    {checkoutData.savings > 0 && (
                      <div className="price-row" style={{ color: '#28a745', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                        <span>You Save</span>
                        <span>-₹{checkoutData.savings}</span>
                      </div>
                    )}
                    <div className="price-row">
                      <span>Delivery Charges</span>
                      <span>₹{deliveryPrice}</span>
                    </div>
                    <div className="price-row">
                      <span>Grand Total</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>

                  {hasUncompletedCustomizations() && (
                    <Alert variant="warning" className="mb-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <strong>Action Required:</strong> Please complete customization for all customizable items before proceeding to payment.
                    </Alert>
                  )}

                  <div className="text-center">
                    <Button 
                      className="pay-button w-100" 
                      size="lg"
                      onClick={handlePayNow}
                      disabled={!selectedAddressKey || hasUncompletedCustomizations()}
                    >
                      <i className="fas fa-credit-card me-2"></i>
                      Proceed to Pay ₹{grandTotal}
                    </Button>
                  </div>

                  <div className="security-note text-center mt-3">
                    <small>
                      <i className="fas fa-shield-alt me-2"></i>
                      Secure payment powered by Razorpay. Your payment information is encrypted and secure.
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <Card className="card-enhanced">
              <Card.Body className="p-4 text-center">
                <Row className="g-4">
                  <Col md={4}>
                    <div className="mb-3">
                      <i className="fas fa-shield-alt text-primary" style={{ fontSize: "2rem" }}></i>
                    </div>
                    <h6>Secure Payment</h6>
                    <small className="text-muted">
                      Your payment is protected with 256-bit SSL encryption
                    </small>
                  </Col>
                  <Col md={4}>
                    <div className="mb-3">
                      <i className="fas fa-clock text-primary" style={{ fontSize: "2rem" }}></i>
                    </div>
                    <h6>Quick Delivery</h6>
                    <small className="text-muted">
                      Your order will be shipped within 24 hours
                    </small>
                  </Col>
                  <Col md={4}>
                    <div className="mb-3">
                      <i className="fas fa-headset text-primary" style={{ fontSize: "2rem" }}></i>
                    </div>
                    <h6>24/7 Support</h6>
                    <small className="text-muted">
                      Get help anytime with our dedicated customer support
                    </small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <PaymentSuccessModal />
      <CustomizationModal />
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
  );
};

export default OnlineStoreCheckout;