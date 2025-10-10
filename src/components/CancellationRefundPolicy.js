import React from 'react';
import { RotateCcw, Clock, AlertTriangle, CheckCircle, Package, Shield, AlertCircle, CreditCard, Flower } from 'lucide-react';

const CancellationRefundPolicy = () => {
  return (
    <div className="cancellation-policy">
      <style jsx>{`
        .cancellation-policy {
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

        .intro-card {
          background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
          border: none;
          border-radius: 15px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
          margin-bottom: 2rem;
          padding: 2rem;
          text-align: center;
          border-left: 5px solid #28a745;
        }

        .intro-text {
          font-size: 1.1rem;
          color: #155724;
          line-height: 1.6;
          margin: 0;
          font-weight: 500;
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

        .policy-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .policy-item {
          background: #f8f9fa;
          border-left: 4px solid #2a65c5;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .policy-item:last-child {
          margin-bottom: 0;
        }

        .policy-text {
          color: #495057;
          line-height: 1.6;
          margin: 0;
          font-size: 0.95rem;
        }

        .time-badge {
          background: #dc3545;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          margin: 0 0.25rem;
        }

        .refund-badge {
          background: #28a745;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          margin: 0 0.25rem;
        }

        .alert {
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .alert-info {
          background: #d1ecf1;
          border: 1px solid #bee5eb;
          border-left: 4px solid #17a2b8;
          color: #0c5460;
        }

        .alert-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-left: 4px solid #ffc107;
          color: #856404;
        }

        .alert-success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-left: 4px solid #28a745;
          color: #155724;
        }

        .highlight-box {
          background: linear-gradient(45deg, #e3f2fd, #f3e5f5);
          border-radius: 10px;
          padding: 1.5rem;
          margin: 1rem 0;
          text-align: center;
          border: 2px dashed #2a65c5;
        }

        .highlight-title {
          color: #2a65c5;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
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
          flex-shrink: 0;
          margin-top: 2px;
        }

        strong {
          color: #2a65c5;
        }

        .perishable-items {
          background: linear-gradient(45deg, #ffeaa7, #ffecb3);
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
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
          
          .card-body {
            padding: 1rem;
          }

          .intro-card {
            padding: 1.5rem;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="header">
        <div className="container">
          <h1 className="header-title">
            <RotateCcw size={40} />
            Cancellation & Refund Policy
          </h1>
          <div className="header-subtitle">
            <div className="badge">
              Last updated: September 17th, 2025
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        
        {/* Introduction */}
        <div className="intro-card">
          <p className="intro-text">
            <CheckCircle size={24} style={{marginRight: '0.5rem', verticalAlign: 'text-bottom'}} />
            MOHAMMED ADIL BETAGERI believes in helping its customers as far as possible, 
            and has therefore a liberal cancellation policy.
          </p>
        </div>

        {/* General Cancellation Policy */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Clock size={24} />
              General Cancellation Terms
            </h3>
          </div>
          <div className="card-body">
            <ul className="policy-list">
              <li className="policy-item">
                <p className="policy-text">
                  Cancellations will be considered only if the request is made within
                  <span className="time-badge">2 days</span>
                  of placing the order. However, the cancellation request may not be entertained 
                  if the orders have been communicated to the vendors/merchants and they have 
                  initiated the process of shipping them.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Perishable Items Policy */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Flower size={24} />
              Perishable Items Policy
            </h3>
          </div>
          <div className="card-body">
            <div className="alert alert-warning">
              <div className="icon-wrapper">
                <AlertTriangle size={20} />
              </div>
              <div>
                <strong>Important:</strong> MOHAMMED ADIL BETAGERI does not accept cancellation 
                requests for perishable items like flowers, eatables etc.
              </div>
            </div>
            <div className="perishable-items">
              <Package size={20} color="#856404" />
              <div>
                <strong>Exception:</strong> Refund/replacement can be made if the customer 
                establishes that the quality of product delivered is not good.
              </div>
            </div>
          </div>
        </div>

        {/* Damaged/Defective Items */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <AlertTriangle size={24} />
              Damaged or Defective Items
            </h3>
          </div>
          <div className="card-body">
            <ul className="policy-list">
              <li className="policy-item">
                <p className="policy-text">
                  In case of receipt of damaged or defective items please report the same to 
                  our Customer Service team within
                  <span className="time-badge">2 days</span>
                  of receipt of the products.
                </p>
              </li>
              <li className="policy-item">
                <p className="policy-text">
                  The request will be entertained once the merchant has checked and determined 
                  the same at his own end. Our team will investigate and take appropriate action.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Product Expectations */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Package size={24} />
              Product Not as Expected
            </h3>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              <div className="icon-wrapper">
                <AlertCircle size={20} />
              </div>
              <div>
                If you feel that the product received is not as shown on the site or as per 
                your expectations, you must bring it to the notice of our customer service within
                <span className="time-badge">2 days</span>
                of receiving the product.
              </div>
            </div>
            <p className="content-text">
              The Customer Service Team after looking into your complaint will take an 
              appropriate decision based on the case details and merchant verification.
            </p>
          </div>
        </div>

        {/* Warranty Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Shield size={24} />
              Warranty Products
            </h3>
          </div>
          <div className="card-body">
            <div className="alert alert-success">
              <div className="icon-wrapper">
                <Shield size={20} />
              </div>
              <div>
                In case of complaints regarding products that come with a warranty from 
                manufacturers, please refer the issue directly to them for resolution.
              </div>
            </div>
          </div>
        </div>

        {/* Refund Processing */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <CreditCard size={24} />
              Refund Processing
            </h3>
          </div>
          <div className="card-body">
            <div className="highlight-box">
              <div className="highlight-title">
                <CreditCard size={24} />
                Refund Timeline
              </div>
              <p className="content-text" style={{marginBottom: 0, fontSize: '1.1rem'}}>
                In case of any refunds approved by MOHAMMED ADIL BETAGERI, it will take <span className="refund-badge">3-5 days</span> for the refund to be processed to the end customer.
              </p>
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

export default CancellationRefundPolicy;