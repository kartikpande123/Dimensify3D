import React, { useState, useEffect } from "react";
import { Calendar, Upload, MessageCircle, Sparkles, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { toast } from 'react-toastify';
import API_BASE_URL from "./apiConfig";

const Consultancy = () => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [problem, setProblem] = useState("");
  const [photo, setPhoto] = useState(null);
  const [date, setDate] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userPhone = localStorage.getItem("dimensify3duserphoneNo");
    if (!userPhone) {
      setShowLoginPopup(true);
      setIsLoggedIn(false);
      setTimeout(() => {
        window.location.href = "/login";
      }, 4000);
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userPhone = localStorage.getItem("dimensify3duserphoneNo");

      let base64Photo = null;
      if (photo) {
        base64Photo = await toBase64(photo);
      }

      const payload = {
        phone: userPhone,
        problem,
        date,
        photo: base64Photo,
      };

      const response = await fetch(`${API_BASE_URL}/api/consultancy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("🎉 Appointment booked successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setProblem("");
        setPhoto(null);
        setDate("");
      } else {
        toast.error(`❌ ${result.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error booking consultancy:", error);
      toast.error("Something went wrong, please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }

    setLoading(false);
  };

  const styles = {
    body: {
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e0 50%, #a0aec0 75%, #e2e8f0 100%)",
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    header: {
      background: "linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)",
      color: "white",
      padding: "1rem 0",
      marginBottom: "2rem",
      position: "relative",
    },
    headerContainer: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "0 1rem",
      position: "relative",
    },
    backButton: {
      position: "absolute",
      top: "50%",
      left: "1rem",
      transform: "translateY(-50%)",
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      borderRadius: "12px",
      color: "white",
      padding: "12px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    headerContent: {
      textAlign: "center",
    },
    headerTitle: {
      fontSize: "2.5rem",
      fontWeight: "800",
      marginBottom: "0.5rem",
      lineHeight: "1.2",
    },
    headerSubtitle: {
      fontSize: "1.1rem",
      opacity: "0.9",
      fontWeight: "400",
    },
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "0 1rem 2rem",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: showLoginPopup ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      maxWidth: "400px",
      width: "90%",
      animation: "fadeInScale 0.3s ease-out",
    },
    modalHeader: {
      background: "linear-gradient(135deg, #2a65c5 0%, #1e4a8c 50%, #0a50b1 100%)",
      color: "white",
      padding: "1.5rem",
      display: "flex",
      alignItems: "center",
    },
    modalBody: {
      padding: "2rem",
      textAlign: "center",
    },
    modalFooter: {
      padding: "1rem 2rem 2rem",
      textAlign: "center",
    },
    freeCard: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
      borderRadius: "16px",
      padding: "2rem",
      marginBottom: "2rem",
      color: "white",
      position: "relative",
      overflow: "hidden",
      animation: "fadeInUp 0.8s ease-out 0.2s both",
    },
    freeCardContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "1rem",
    },
    freeCardLeft: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    freeIcon: {
      width: "48px",
      height: "48px",
      background: "rgba(255, 255, 255, 0.2)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "bounce 2s infinite",
    },
    priceBadge: {
      background: "rgba(255, 255, 255, 0.2)",
      color: "white",
      padding: "12px 20px",
      borderRadius: "25px",
      fontSize: "1.5rem",
      fontWeight: "bold",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      animation: "pulse 2s ease-in-out infinite",
    },
    mainCard: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(10px)",
      animation: "fadeInUp 0.8s ease-out 0.4s both",
    },
    cardHeader: {
      background: "linear-gradient(135deg, #2a65c5 0%, #1e4a8c 50%, #0a50b1 100%)",
      color: "white",
      padding: "1.5rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerDecoration: {
      width: "60px",
      height: "4px",
      background: "rgba(255, 255, 255, 0.3)",
      borderRadius: "2px",
    },
    cardBody: {
      padding: "2rem",
    },
    formGroup: {
      marginBottom: "2rem",
    },
    label: {
      display: "flex",
      alignItems: "center",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "0.5rem",
      gap: "0.5rem",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e5e7eb",
      borderRadius: "12px",
      fontSize: "16px",
      transition: "all 0.3s ease",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(10px)",
    },
    textarea: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e5e7eb",
      borderRadius: "12px",
      fontSize: "16px",
      transition: "all 0.3s ease",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(10px)",
      resize: "none",
      fontFamily: "inherit",
      minHeight: "120px",
    },
    fileUploadArea: {
      border: "2px dashed #cbd5e0",
      borderRadius: "12px",
      padding: "2rem",
      textAlign: "center",
      transition: "all 0.3s ease",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      cursor: "pointer",
      position: "relative",
    },
    fileInput: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      opacity: 0,
      cursor: "pointer",
    },
    submitButton: {
      background: "linear-gradient(135deg, #2a65c5 0%, #1e4a8c 50%, #0a50b1 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px 32px",
      fontSize: "18px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 8px 16px rgba(42, 101, 197, 0.3)",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      margin: "0 auto",
    },
    spinner: {
      width: "20px",
      height: "20px",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderTop: "2px solid white",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
  };

  return (
    <div style={styles.body}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .modern-input:focus {
          border-color: #2a65c5 !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(42, 101, 197, 0.1);
          transform: translateY(-2px);
        }
        
        .file-upload-area:hover {
          border-color: #2a65c5;
          background: rgba(42, 101, 197, 0.05);
          transform: scale(1.02);
        }
        
        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(42, 101, 197, 0.4);
        }
        
        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-50%) scale(1.05);
        }
        
        @media (max-width: 768px) {
          .header-title {
            font-size: 2rem !important;
          }
          
          .free-card-content {
            flex-direction: column !important;
            text-align: center;
          }
          
          .back-button {
            position: relative !important;
            transform: none !important;
            margin-bottom: 1rem !important;
          }
        }
      `}</style>

      {/* Login Modal */}
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <Clock size={24} style={{ marginRight: "0.5rem" }} />
            <h3 style={{ margin: 0, fontWeight: "600" }}>Login Required</h3>
          </div>
          <div style={styles.modalBody}>
            <CheckCircle size={48} color="#2a65c5" style={{ animation: "pulse 2s ease-in-out infinite", marginBottom: "1rem" }} />
            <p style={{ margin: 0, color: "#64748b" }}>Please login to continue with your consultation booking.</p>
          </div>
          <div style={styles.modalFooter}>
            <button
              style={{...styles.submitButton, padding: "12px 24px"}}
              onClick={() => (window.location.href = "/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>

      {isLoggedIn && (
        <>
          {/* Header Section */}
          <div style={styles.header}>
            <div style={styles.headerContainer}>
              <button
                style={styles.backButton}
                className="back-button"
                onClick={() => window.history.back()}
                title="Go Back"
              >
                <ArrowLeft size={24} />
              </button>
              <div style={styles.headerContent}>
                <h1 style={styles.headerTitle} className="header-title">Professional Consultation</h1>
                <p style={styles.headerSubtitle}>Get expert advice tailored to your needs</p>
              </div>
            </div>
          </div>

          <div style={styles.container}>
            {/* Free Consultancy Highlight */}
            <div style={styles.freeCard}>
              <div style={styles.freeCardContent} className="free-card-content">
                <div style={styles.freeCardLeft}>
                  <div style={styles.freeIcon}>
                    <Sparkles size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>100% FREE Consultation</h3>
                    <p style={{ margin: 0, opacity: 0.8 }}>No hidden charges • Expert guidance • Professional advice</p>
                  </div>
                </div>
                <div style={styles.priceBadge}>₹0</div>
              </div>
            </div>

            {/* Main Form Card */}
            <div style={styles.mainCard}>
              <div style={styles.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar size={24} />
                  <h3 style={{ margin: 0, fontWeight: "600" }}>Book Your Appointment</h3>
                </div>
                <div style={styles.headerDecoration}></div>
              </div>
              
              <div style={styles.cardBody}>
                <form onSubmit={handleSubmit}>
                  {/* Problem Description */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <MessageCircle size={18} />
                      Describe Your Problem (Optional)
                    </label>
                    <textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="Tell us about your concern or question..."
                      style={styles.textarea}
                      className="modern-input"
                    />
                  </div>

                  {/* File Upload */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Upload size={18} />
                      Upload Supporting Image (Optional)
                    </label>
                    <div style={styles.fileUploadArea} className="file-upload-area">
                      <Upload size={32} color="#9ca3af" style={{ marginBottom: "0.5rem" }} />
                      <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>Drop your image here or click to browse</p>
                      <input 
                        type="file" 
                        onChange={(e) => setPhoto(e.target.files[0])}
                        style={styles.fileInput}
                        accept="image/*"
                      />
                      {photo && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{
                            backgroundColor: "#10b981",
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}>
                            {photo.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Calendar size={18} />
                      Select Preferred Date *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      style={styles.input}
                      className="modern-input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Submit Button */}
                  <div style={{ textAlign: "center", marginTop: "3rem" }}>
                    <button 
                      type="submit" 
                      style={styles.submitButton}
                      className="submit-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div style={styles.spinner}></div>
                          Booking Appointment...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Book Free Consultation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Consultancy;