import React from 'react';
import { FileText, Users, Shield, Globe, Copyright, Link, Scale, CreditCard, AlertCircle, MapPin } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="terms-conditions">
      <style jsx>{`
        .terms-conditions {
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

        .definitions-card {
          background: linear-gradient(135deg, #e8f4f8, #f0f8f0);
          border: none;
          border-radius: 15px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
          margin-bottom: 2rem;
          padding: 2rem;
          border-left: 5px solid #17a2b8;
        }

        .definitions-title {
          color: #0c5460;
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .definition-item {
          background: rgba(255,255,255,0.7);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          border-left: 3px solid #17a2b8;
        }

        .definition-item:last-child {
          margin-bottom: 0;
        }

        .definition-text {
          color: #495057;
          line-height: 1.6;
          margin: 0;
          font-size: 0.95rem;
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

        .terms-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .terms-item {
          background: #f8f9fa;
          border-left: 4px solid #2a65c5;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .terms-item:last-child {
          margin-bottom: 0;
        }

        .terms-text {
          color: #495057;
          line-height: 1.6;
          margin: 0;
          font-size: 0.95rem;
        }

        .alert {
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .alert-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-left: 4px solid #ffc107;
          color: #856404;
        }

        .alert-danger {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-left: 4px solid #dc3545;
          color: #721c24;
        }

        .alert-info {
          background: #d1ecf1;
          border: 1px solid #bee5eb;
          border-left: 4px solid #17a2b8;
          color: #0c5460;
        }

        .jurisdiction-box {
          background: linear-gradient(45deg, #fff8e1, #f3e5f5);
          border: 2px solid #ffc107;
          border-radius: 10px;
          padding: 1.5rem;
          margin: 1rem 0;
          text-align: center;
        }

        .jurisdiction-title {
          color: #2a65c5;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .address-box {
          background: linear-gradient(45deg, #e3f2fd, #f3e5f5);
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
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

        .emphasis {
          background: linear-gradient(45deg, #fff9c4, #f0f4c3);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          color: #827717;
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

          .definitions-card {
            padding: 1.5rem;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="header">
        <div className="container">
          <h1 className="header-title">
            <FileText size={40} />
            Terms & Conditions
          </h1>
          <div className="header-subtitle">
            <div className="badge">
              Last updated: September 17th, 2025
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        
        {/* Definitions Section */}
        <div className="definitions-card">
          <h3 className="definitions-title">
            <Users size={24} />
            Definitions & Scope
          </h3>
          <div className="definition-item">
            <p className="definition-text">
              <strong>"We", "Us", "Our"</strong> refers to <span className="emphasis">MOHAMMED ADIL BETAGERI</span>
            </p>
            <div className="address-box">
              <MapPin size={20} color="#2a65c5" />
              <div>
                <strong>Registered/Operational Office:</strong><br />
                Mehaboob Nagar shivalli plot Gulganjikoppa dharwad<br />
                Dharwad, Karnataka 580008, India
              </div>
            </div>
          </div>
          <div className="definition-item">
            <p className="definition-text">
              <strong>"You", "Your", "User", "Visitor"</strong> refers to any natural or legal person 
              who is visiting our website and/or agreed to purchase from us.
            </p>
          </div>
        </div>

        {/* Governing Statement */}
        <div className="card">
          <div className="card-body">
            <div className="alert alert-info">
              <div className="icon-wrapper">
                <Scale size={20} />
              </div>
              <div>
                <strong>Governing Terms:</strong> Your use of the website and/or purchase from us 
                are governed by the following Terms and Conditions.
              </div>
            </div>
          </div>
        </div>

        {/* Website Content & Accuracy */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Globe size={24} />
              Website Content & Accuracy
            </h3>
          </div>
          <div className="card-body">
            <ul className="terms-list">
              <li className="terms-item">
                <p className="terms-text">
                  The content of the pages of this website is subject to change without notice.
                </p>
              </li>
              <li className="terms-item">
                <p className="terms-text">
                  Neither we nor any third parties provide any warranty or guarantee as to the 
                  accuracy, timeliness, performance, completeness or suitability of the information 
                  and materials found or offered on this website for any particular purpose. You 
                  acknowledge that such information and materials may contain inaccuracies or errors 
                  and we expressly exclude liability for any such inaccuracies or errors to the 
                  fullest extent permitted by law.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* User Responsibility */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Shield size={24} />
              User Responsibility & Risk
            </h3>
          </div>
          <div className="card-body">
            <div className="alert alert-warning">
              <div className="icon-wrapper">
                <AlertCircle size={20} />
              </div>
              <div>
                <strong>Important:</strong> Your use of any information or materials on our website 
                and/or product pages is entirely at your own risk, for which we shall not be liable.
              </div>
            </div>
            <p className="content-text">
              It shall be your own responsibility to ensure that any products, services or information 
              available through our website and/or product pages meet your specific requirements.
            </p>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Copyright size={24} />
              Intellectual Property Rights
            </h3>
          </div>
          <div className="card-body">
            <ul className="terms-list">
              <li className="terms-item">
                <p className="terms-text">
                  Our website contains material which is owned by or licensed to us. This material 
                  includes, but is not limited to, the design, layout, look, appearance and graphics. 
                  Reproduction is prohibited other than in accordance with the copyright notice, which 
                  forms part of these terms and conditions.
                </p>
              </li>
              <li className="terms-item">
                <p className="terms-text">
                  All trademarks reproduced in our website which are not the property of, or licensed 
                  to, the operator are acknowledged on the website.
                </p>
              </li>
            </ul>
            <div className="alert alert-danger">
              <div className="icon-wrapper">
                <AlertCircle size={20} />
              </div>
              <div>
                <strong>Legal Warning:</strong> Unauthorized use of information provided by us shall 
                give rise to a claim for damages and/or be a criminal offense.
              </div>
            </div>
          </div>
        </div>

        {/* External Links */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Link size={24} />
              External Links & Linking Policy
            </h3>
          </div>
          <div className="card-body">
            <ul className="terms-list">
              <li className="terms-item">
                <p className="terms-text">
                  From time to time our website may also include links to other websites. These links 
                  are provided for your convenience to provide further information.
                </p>
              </li>
              <li className="terms-item">
                <p className="terms-text">
                  You may not create a link to our website from another website or document without 
                  <strong> MOHAMMED ADIL BETAGERI's prior written consent.</strong>
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Jurisdiction & Payment Terms */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">
              <Scale size={24} />
              Legal Jurisdiction & Payment Terms
            </h3>
          </div>
          <div className="card-body">
            <div className="jurisdiction-box">
              <div className="jurisdiction-title">
                <Scale size={24} />
                Governing Law
              </div>
              <p className="content-text" style={{marginBottom: 0, fontSize: '1.1rem'}}>
                Any dispute arising out of use of our website and/or purchase with us and/or any 
                engagement with us is subject to the <strong>laws of India</strong>.
              </p>
            </div>
            
            <div className="alert alert-info">
              <div className="icon-wrapper">
                <CreditCard size={20} />
              </div>
              <div>
                <strong>Payment Transactions:</strong> We shall be under no liability whatsoever in 
                respect of any loss or damage arising directly or indirectly out of the decline of 
                authorization for any transaction, on account of the cardholder having exceeded the 
                preset limit mutually agreed by us with our acquiring bank from time to time.
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

export default TermsConditions;