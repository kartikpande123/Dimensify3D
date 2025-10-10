import React from 'react';
import { Truck, Globe, Clock, Phone, Mail, Shield, MapPin, AlertCircle } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className="shipping-policy">
      <style jsx>{`
        .shipping-policy {
          background: linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%);
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .header {
          background: linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%);
          color: white;
          padding: 3rem 0;
          margin-bottom: 2rem;
          border-radius: 0 0 20px 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          text-align: center;
        }

        .header-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .header-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          font-weight: 300;
        }

        .badge {
          background: rgba(255,255,255,0.9);
          color: #2a65c5;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          display: inline-block;
          margin-top: 0.5rem;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          margin-bottom: 1.5rem;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .card-header {
          background: linear-gradient(45deg, #f8f9fa, #e9ecef);
          border-bottom: 2px solid #dee2e6;
          padding: 1.25rem;
        }

        .section-title {
          color: #2a65c5;
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-body {
          padding: 1.5rem;
        }

        .content-text {
          line-height: 1.7;
          color: #495057;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .highlight-box {
          background: linear-gradient(45deg, #e3f2fd, #f3e5f5);
          border-left: 4px solid #2a65c5;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .contact-info {
          background: linear-gradient(45deg, #fff3e0, #fce4ec);
          border-radius: 10px;
          padding: 1.5rem;
          margin-top: 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }

        .processing-badge {
          background: #2a65c5;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0 0.5rem;
        }

        .alert {
          background: #d1ecf1;
          border: 1px solid #bee5eb;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          border-left: 4px solid #17a2b8;
        }

        .alert-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-left: 4px solid #ffc107;
        }

        .disclaimer {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 1rem;
          font-size: 0.9rem;
          margin-top: 2rem;
          color: #856404;
        }

        .icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        strong {
          color: #2a65c5;
        }

        @media (max-width: 768px) {
          .header-title {
            font-size: 2rem;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .container {
            padding: 0 0.5rem;
          }
          
          .contact-info {
            grid-template-columns: 1fr;
          }
          
          .card-body {
            padding: 1rem;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="header">
        <div className="container">
          <h1 className="header-title">
            <Truck size={40} />
            Shipping & Delivery Policy
          </h1>
          <div className="header-subtitle">
            <div className="badge">
              Last updated: September 17th, 2025
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        
        {/* International Shipping */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Globe size={24} />
              International Shipping
            </h3>
          </div>
          <div className="card-body">
            <p className="content-text">
              For international buyers, all orders are processed and shipped through 
              <strong> registered international courier companies</strong> and/or 
              <strong> International Speed Post</strong> only. We ensure secure and 
              trackable delivery to your destination worldwide.
            </p>
          </div>
        </div>

        {/* Domestic Shipping */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <MapPin size={24} />
              Domestic Shipping
            </h3>
          </div>
          <div className="card-body">
            <p className="content-text">
              For domestic buyers, orders are shipped through 
              <strong> registered domestic courier companies</strong> and/or 
              <strong> Speed Post</strong> only, ensuring reliable and efficient delivery 
              within the country.
            </p>
          </div>
        </div>

        {/* Processing & Delivery Time */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Clock size={24} />
              Processing & Delivery Timeline
            </h3>
          </div>
          <div className="card-body">
            <div className="highlight-box">
              <p className="content-text" style={{marginBottom: 0}}>
                <strong>Processing Time:</strong> Orders are shipped within
                <span className="processing-badge">0-7 days</span>
                or as per the delivery date agreed at the time of order confirmation.
              </p>
            </div>
            <p className="content-text">
              Delivery timeframes are subject to courier company and postal office norms. 
              We guarantee to hand over your consignment to the courier company or postal 
              authorities within the specified timeframe from the date of order and payment.
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Shield size={24} />
              Important Notice
            </h3>
          </div>
          <div className="card-body">
            <div className="alert">
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <AlertCircle size={20} color="#17a2b8" />
                <strong>Delivery Responsibility</strong>
              </div>
              MOHAMMED ADIL BETAGERI is not liable for any delays in delivery by courier 
              companies or postal authorities once the shipment has been handed over.
            </div>
            <p className="content-text">
              <strong>Delivery Address:</strong> All orders will be delivered to the address 
              provided by the buyer at the time of purchase. Please ensure your address 
              details are accurate and complete.
            </p>
            <p className="content-text">
              <strong>Service Confirmation:</strong> Delivery of all services will be confirmed 
              via email to the address specified during registration.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Phone size={24} />
              Need Help?
            </h3>
          </div>
          <div className="card-body">
            <p className="content-text">
              For any issues in utilizing our services, please contact our helpdesk:
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <Phone size={20} color="#2a65c5" />
                <div>
                  <strong>Phone:</strong><br />
                  9483914542
                </div>
              </div>
              <div className="contact-item">
                <Mail size={20} color="#2a65c5" />
                <div>
                  <strong>Email:</strong><br />
                  <a href="mailto:print.dimensify3d@gmail.com" style={{color: '#2a65c5', textDecoration: 'none', fontWeight: '500'}}>
                    print.dimensify3d@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer">
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.5rem'}}>
            <AlertCircle size={18} color="#856404" style={{marginTop: '2px', flexShrink: 0}} />
            <div>
              <strong>Disclaimer:</strong> The above content is created at MOHAMMED ADIL BETAGERI's 
              sole discretion. Razorpay shall not be liable for any content provided here and shall 
              not be responsible for any claims and liability that may arise due to merchant's 
              non-adherence to it.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShippingPolicy;