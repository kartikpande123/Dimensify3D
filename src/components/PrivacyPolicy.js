import React from 'react';
import { Shield, User, Database, Share2, Lock, Eye, Cookie, FileText, Mail, Phone, AlertCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <style jsx>{`
        .privacy-policy {
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
          max-width: 900px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .intro-card {
          background: linear-gradient(135deg, #e8f4fd, #f0f8f0);
          border: none;
          border-radius: 15px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
          margin-bottom: 2rem;
          padding: 2rem;
          text-align: center;
          border-left: 5px solid #2a65c5;
        }

        .intro-text {
          font-size: 1.1rem;
          color: #2a65c5;
          line-height: 1.6;
          margin: 0;
          font-weight: 500;
        }

        .brand-name {
          background: linear-gradient(45deg, #2a65c5, #1e88e5);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
          font-size: 1.2rem;
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

        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .info-item {
          background: #f8f9fa;
          border-left: 4px solid #2a65c5;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.75rem;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .info-item:last-child {
          margin-bottom: 0;
        }

        .info-text {
          color: #495057;
          line-height: 1.6;
          margin: 0;
          font-size: 0.95rem;
        }

        .usage-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .usage-item {
          background: linear-gradient(45deg, #e8f5e8, #f0f8f0);
          border-left: 4px solid #28a745;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.75rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .usage-item:last-child {
          margin-bottom: 0;
        }

        .alert {
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .alert-success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-left: 4px solid #28a745;
          color: #155724;
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

        .security-highlight {
          background: linear-gradient(45deg, #e3f2fd, #f3e5f5);
          border: 2px solid #2a65c5;
          border-radius: 10px;
          padding: 1.5rem;
          margin: 1rem 0;
          text-align: center;
        }

        .security-title {
          color: #2a65c5;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .contact-info {
          background: linear-gradient(45deg, #fff3e0, #fce4ec);
          border-radius: 10px;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .contact-item:last-child {
          margin-bottom: 0;
        }

        .contact-link {
          color: #2a65c5;
          text-decoration: none;
          font-weight: 500;
        }

        .contact-link:hover {
          text-decoration: underline;
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
        }

        strong {
          color: #2a65c5;
        }

        .highlight-text {
          background: linear-gradient(45deg, #fff9c4, #f0f4c3);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          color: #827717;
        }

        .dot-icon {
          width: 8px;
          height: 8px;
          background: #2a65c5;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
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

          .info-item, .usage-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="header">
        <div className="container">
          <h1 className="header-title">
            <Shield size={40} />
            Privacy Policy
          </h1>
          <div className="header-subtitle">
            <div className="badge">
              Last updated: September 23rd, 2025
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        
        {/* Introduction */}
        <div className="intro-card">
          <p className="intro-text">
            At <span className="brand-name">Dimensify3D</span>, we value your privacy. This Privacy 
            Policy explains how we collect, use, and protect your personal information when you use 
            our website and mobile application.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Database size={24} />
              Information We Collect
            </h3>
          </div>
          <div className="card-body">
            <ul className="info-list">
              <li className="info-item">
                <User size={20} color="#2a65c5" />
                <p className="info-text">Personal details (name, email, phone number)</p>
              </li>
              <li className="info-item">
                <div className="dot-icon"></div>
                <p className="info-text">Shipping and billing address</p>
              </li>
              <li className="info-item">
                <div className="dot-icon"></div>
                <p className="info-text">Login and account details</p>
              </li>
              <li className="info-item">
                <Lock size={20} color="#28a745" />
                <p className="info-text">
                  Payment details (processed securely via payment gateways – we do not store CVV or card numbers)
                </p>
              </li>
              <li className="info-item">
                <div className="dot-icon"></div>
                <p className="info-text">Device information, cookies, and usage data</p>
              </li>
            </ul>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Eye size={24} />
              How We Use Your Information
            </h3>
          </div>
          <div className="card-body">
            <ul className="usage-list">
              <li className="usage-item">
                <div className="dot-icon" style={{background: '#28a745'}}></div>
                <p className="info-text">To process and deliver your orders</p>
              </li>
              <li className="usage-item">
                <div className="dot-icon" style={{background: '#28a745'}}></div>
                <p className="info-text">To send order updates, invoices, and customer support</p>
              </li>
              <li className="usage-item">
                <div className="dot-icon" style={{background: '#28a745'}}></div>
                <p className="info-text">To improve our services and personalize your experience</p>
              </li>
              <li className="usage-item">
                <div className="dot-icon" style={{background: '#28a745'}}></div>
                <p className="info-text">For legal compliance and fraud prevention</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Sharing of Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Share2 size={24} />
              Sharing of Information
            </h3>
          </div>
          <div className="card-body">
            <p className="content-text">
              We may share your information only with trusted third parties in the following cases:
            </p>
            <ul className="info-list">
              <li className="info-item">
                <div className="dot-icon"></div>
                <p className="info-text">With courier/shipping partners for order delivery</p>
              </li>
              <li className="info-item">
                <div className="dot-icon"></div>
                <p className="info-text">With payment gateways (e.g., Razorpay, Paytm) for secure payments</p>
              </li>
              <li className="info-item">
                <div className="dot-icon"></div>
                <p className="info-text">With legal authorities when required by law</p>
              </li>
            </ul>
            <div className="alert alert-success">
              <div className="icon-wrapper">
                <Shield size={20} />
              </div>
              <div>
                <strong>Important:</strong> We <span className="highlight-text">do not sell</span> or rent 
                your personal information to third parties.
              </div>
            </div>
          </div>
        </div>

        {/* Data Security */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Lock size={24} />
              Data Security
            </h3>
          </div>
          <div className="card-body">
            <div className="security-highlight">
              <div className="security-title">
                <Lock size={24} />
                Security Measures
              </div>
              <ul className="info-list">
                <li className="info-item">
                  <div className="dot-icon"></div>
                  <p className="info-text">We use secure servers, SSL encryption, and access controls</p>
                </li>
                <li className="info-item">
                  <div className="dot-icon"></div>
                  <p className="info-text">
                    Payments are handled by trusted payment gateways – we never store sensitive card data
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <User size={24} />
              Your Rights
            </h3>
          </div>
          <div className="card-body">
            <ul className="usage-list">
              <li className="usage-item">
                <div className="dot-icon" style={{background: '#28a745'}}></div>
                <p className="info-text">You may access, update, or request deletion of your personal data</p>
              </li>
              <li className="usage-item">
                <div className="dot-icon" style={{background: '#28a745'}}></div>
                <p className="info-text">You can opt out of promotional communications anytime</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Cookies & Tracking */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Cookie size={24} />
              Cookies & Tracking
            </h3>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              <div className="icon-wrapper">
                <Cookie size={20} />
              </div>
              <div>
                We may use cookies and analytics tools to enhance performance and personalize your 
                shopping experience. You can disable cookies from your browser settings.
              </div>
            </div>
          </div>
        </div>

        {/* Updates to Policy */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <FileText size={24} />
              Updates to Policy
            </h3>
          </div>
          <div className="card-body">
            <div className="alert alert-warning">
              <div className="icon-wrapper">
                <AlertCircle size={20} />
              </div>
              <div>
                We may update this Privacy Policy from time to time. Updates will be posted on this 
                page with a revised date.
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Mail size={24} />
              Contact Us
            </h3>
          </div>
          <div className="card-body">
            <p className="content-text">
              For privacy-related questions, please contact us:
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={20} color="#2a65c5" />
                <div>
                  <strong>Email:</strong> 
                  <a href="mailto:print.dimensify3d@gmail.com" className="contact-link">
                    print.dimensify3d@gmail.com
                  </a>
                </div>
              </div>
              <div className="contact-item">
                <Phone size={20} color="#2a65c5" />
                <div>
                  <strong>Phone:</strong> +91 9483914542
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
              <strong>Disclaimer:</strong> The above content is created at Dimensify3D's sole 
              discretion. Razorpay shall not be liable for any content provided here and shall 
              not be responsible for any claims and liability that may arise due to merchant's 
              non-adherence to it.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;