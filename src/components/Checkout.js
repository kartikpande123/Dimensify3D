import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [checkoutData, setCheckoutData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load checkout data from localStorage
    const savedData = localStorage.getItem('checkoutData');
    if (savedData) {
      try {
        setCheckoutData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing checkout data:', error);
        navigate('/'); // Redirect to home if data is corrupted
      }
    } else {
      // No checkout data found, redirect to home
      navigate('/');
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitOrder = async () => {
    // Validate required fields
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would send this data to your backend
      const orderData = {
        customer: customerInfo,
        print: checkoutData,
        orderId: 'ORD-' + Date.now(),
        orderDate: new Date().toISOString(),
        status: 'confirmed'
      };

      console.log('Order submitted:', orderData);
      
      // Clear checkout data
      localStorage.removeItem('checkoutData');
      
      // Show success and redirect
      alert('Order placed successfully! You will receive a confirmation email shortly.');
      navigate('/');
      
    } catch (error) {
      console.error('Order processing error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === "N/A") return "N/A";
    const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
    if (isNaN(numSeconds)) return "N/A";
    
    const hrs = Math.floor(numSeconds / 3600);
    const mins = Math.floor((numSeconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    } else if (mins > 0) {
      return `${mins}m`;
    } else {
      return `${Math.floor(numSeconds)}s`;
    }
  };

  if (!checkoutData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-600">Loading checkout data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Checkout</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          ← Back to Print Setup
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
          
          {/* STL File Info */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">STL File</h3>
            <p className="text-sm text-gray-600">{checkoutData.stlFile?.name || 'Unknown file'}</p>
          </div>

          {/* Dimensions */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Model Dimensions</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">H:</span> {checkoutData.dimensions?.height}mm
              </div>
              <div>
                <span className="text-gray-500">W:</span> {checkoutData.dimensions?.width}mm
              </div>
              <div>
                <span className="text-gray-500">D:</span> {checkoutData.dimensions?.depth}mm
              </div>
            </div>
          </div>

          {/* Print Settings */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Print Settings</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Material: {checkoutData.printSettings?.materialType?.toUpperCase()} ({checkoutData.printSettings?.materialColor})</div>
              <div>Layer Height: {checkoutData.printSettings?.layerHeight}mm</div>
              <div>Infill: {checkoutData.printSettings?.infillDensity}%</div>
              <div>Support: {checkoutData.printSettings?.supportEnable ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {/* Print Details */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Print Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Estimated Time: {formatTime(checkoutData.printDetails?.estimatedTime)}</div>
              <div>Filament Used: {checkoutData.printDetails?.filamentUsedGrams}g</div>
              {checkoutData.printDetails?.layerCount && (
                <div>Total Layers: {checkoutData.printDetails.layerCount}</div>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Quantity</h3>
            <p className="text-lg font-semibold text-blue-600">{checkoutData.quantity} item(s)</p>
          </div>

          {/* Special Notes */}
          {checkoutData.specialNotes && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Special Notes</h3>
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-sm text-yellow-800">{checkoutData.specialNotes}</p>
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-3">Price Breakdown</h3>
            {checkoutData.quantity > 1 && (
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Unit Price:</span>
                <span>₹{checkoutData.pricing?.unitPrice}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold text-green-600">
              <span>Total Amount:</span>
              <span>₹{checkoutData.pricing?.finalPrice}</span>
            </div>
          </div>
        </div>

        {/* Customer Information Form */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (Optional)
              </label>
              <textarea
                value={customerInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Delivery address if different from pickup location"
              />
            </div>
          </form>

          {/* Order Button */}
          <div className="mt-8">
            <button
              onClick={handleSubmitOrder}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-colors duration-200 ${
                isProcessing
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              }`}
            >
              {isProcessing ? 'Processing Order...' : `Place Order - ₹${checkoutData.pricing?.finalPrice}`}
            </button>
          </div>

          {/* Terms */}
          <div className="mt-4 text-xs text-gray-500">
            <p>
              By placing this order, you agree to our terms and conditions. 
              You will receive an email confirmation with pickup/delivery details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;