import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Card, Container, Row, Col, Table, Modal } from "react-bootstrap";
import API_BASE_URL from "./apiConfig"

const AdminOnlineStore = () => {
  const [modelName, setModelName] = useState("");
  const [price, setPrice] = useState("");
  const [off, setOff] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [customizeQuestion, setCustomizeQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [existingCategories, setExistingCategories] = useState([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Products list state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Update modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Refs for file inputs
  const photo1Ref = useRef(null);
  const photo2Ref = useRef(null);
  const photo3Ref = useRef(null);

  // Fetch existing categories and products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search and date
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.modelName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter) {
      const selectedDate = new Date(dateFilter).setHours(0, 0, 0, 0);
      filtered = filtered.filter(product => {
        const productDate = new Date(product.createdAt).setHours(0, 0, 0, 0);
        return productDate === selectedDate;
      });
    }

    setFilteredProducts(filtered);
  }, [searchTerm, dateFilter, products]);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/get-products`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setProducts(data.data);
        setFilteredProducts(data.data);
        
        // Extract unique categories
        const categories = [...new Set(data.data.map(product => product.category).filter(cat => cat))];
        setExistingCategories(categories);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleCategoryChange = (value) => {
    if (value === "custom") {
      setShowCustomCategory(true);
      setCategory("");
    } else {
      setShowCustomCategory(false);
      setCategory(value);
      setCustomCategory("");
    }
  };

  const handleCustomCategoryChange = (value) => {
    setCustomCategory(value);
    setCategory(value);
  };

  const handlePriceChange = (value) => {
    setPrice(value);
    if (value && off) {
      const discount = (value * off) / 100;
      setFinalPrice((value - discount).toFixed(2));
    }
  };

  const handleOffChange = (value) => {
    setOff(value);
    if (price && value) {
      const discount = (price * value) / 100;
      setFinalPrice((price - discount).toFixed(2));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("modelName", modelName);
    formData.append("price", price);
    formData.append("off", off);
    formData.append("finalPrice", finalPrice);
    formData.append("description", description);
    formData.append("customizeQuestion", customizeQuestion);
    formData.append("category", category);

    if (photo1Ref.current.files[0]) formData.append("images", photo1Ref.current.files[0]);
    if (photo2Ref.current.files[0]) formData.append("images", photo2Ref.current.files[0]);
    if (photo3Ref.current.files[0]) formData.append("images", photo3Ref.current.files[0]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Product created successfully!");

        setModelName("");
        setPrice("");
        setOff("");
        setFinalPrice("");
        setDescription("");
        setCustomizeQuestion("");
        setCategory("");
        setShowCustomCategory(false);
        setCustomCategory("");

        photo1Ref.current.value = "";
        photo2Ref.current.value = "";
        photo3Ref.current.value = "";

        // Refresh products list
        fetchProducts();
      } else {
        alert("❌ Upload failed: " + data.message);
      }
    } catch (error) {
      console.error("Error uploading product:", error);
      alert("❌ Server error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Product deleted successfully!");
        fetchProducts();
      } else {
        alert("❌ Delete failed: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("❌ Server error");
    }
  };

  const handleUpdate = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedProduct),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Product updated successfully!");
        setShowUpdateModal(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        alert("❌ Update failed: " + data.message);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("❌ Server error");
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Styles
  const containerStyle = {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #e2e8f0 100%)",
    minHeight: "100vh",
    padding: "40px 20px"
  };

  const mainCardStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
    backgroundColor: "#ffffff"
  };

  const cardHeaderStyle = {
    background: "linear-gradient(135deg, rgb(42,101,197) 0%, rgb(10,80,177) 100%)",
    color: "#fff",
    padding: "30px",
    position: "relative",
    overflow: "hidden"
  };

  const cardHeaderOverlayStyle = {
    position: "absolute",
    inset: "0",
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
  };

  const cardHeaderContentStyle = {
    position: "relative",
    zIndex: "10"
  };

  const cardHeaderTitleStyle = {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: "5px"
  };

  const cardHeaderSubtitleStyle = {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "1rem"
  };

  const cardBodyStyle = {
    padding: "40px"
  };

  const labelStyle = {
    fontWeight: "600",
    color: "#334155",
    marginBottom: "8px",
    fontSize: "0.95rem"
  };

  const requiredStyle = {
    color: "#ef4444",
    marginLeft: "4px"
  };

  const inputStyle = {
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "1rem",
    transition: "all 0.2s ease",
    outline: "none"
  };

  const inputFocusStyle = {
    ...inputStyle,
    borderColor: "rgb(42,101,197)",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 3px rgba(42, 101, 197, 0.1)"
  };

  const fileInputStyle = {
    ...inputStyle,
    cursor: "pointer"
  };

  const pricingCardStyle = {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    marginBottom: "24px"
  };

  const pricingSectionTitleStyle = {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center"
  };

  const bulletStyle = {
    width: "8px",
    height: "8px",
    backgroundColor: "rgb(42,101,197)",
    borderRadius: "50%",
    marginRight: "10px"
  };

  const finalPriceCardStyle = {
    marginTop: "16px",
    padding: "16px",
    background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)",
    borderRadius: "8px",
    border: "1px solid #22c55e"
  };

  const finalPriceStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  };

  const finalPriceAmountStyle = {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#16a34a"
  };

  const savingsStyle = {
    fontSize: "0.9rem",
    color: "#64748b",
    marginTop: "4px"
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: "120px",
    resize: "vertical"
  };

  const submitButtonStyle = {
    width: "100%",
    background: "linear-gradient(135deg, rgb(42,101,197) 0%, rgb(10,80,177) 100%)",
    border: "none",
    borderRadius: "12px",
    padding: "16px 32px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#ffffff",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  };

  const buttonIconStyle = {
    marginRight: "8px",
    fontSize: "1.2rem"
  };

  const actionButtonStyle = {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginRight: "8px"
  };

  const updateButtonStyle = {
    ...actionButtonStyle,
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff"
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#ffffff"
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .table-hover tbody tr:hover {
            background-color: #f1f5f9;
          }
        `}
      </style>
      
      <Container>
        {/* Main Card - Create Product */}
        <Card style={mainCardStyle}>
          <div style={cardHeaderStyle}>
            <div style={cardHeaderOverlayStyle}></div>
            <div style={cardHeaderContentStyle}>
              <h2 style={cardHeaderTitleStyle}>Create New Product</h2>
              <p style={cardHeaderSubtitleStyle}>Add product details and images</p>
            </div>
          </div>

          <Card.Body style={cardBodyStyle}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      Product Model Name
                      <span style={requiredStyle}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                      placeholder="e.g. Gun, Car, Doll"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      Category
                      <span style={requiredStyle}>*</span>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      value={showCustomCategory ? "custom" : category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                      required
                    >
                      <option value="">Select a category...</option>
                      {existingCategories.map((cat, index) => (
                        <option key={index} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="custom">+ Create New Category</option>
                    </Form.Control>
                    
                    {showCustomCategory && (
                      <Form.Control
                        type="text"
                        value={customCategory}
                        onChange={(e) => handleCustomCategoryChange(e.target.value)}
                        style={{ ...inputStyle, marginTop: "10px" }}
                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                        placeholder="Enter new category name"
                        required={showCustomCategory}
                      />
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      Primary Image
                      <span style={requiredStyle}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="file"
                      ref={photo1Ref}
                      style={fileInputStyle}
                      accept="image/*"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>Secondary Image</Form.Label>
                    <Form.Control
                      type="file"
                      ref={photo2Ref}
                      style={fileInputStyle}
                      accept="image/*"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>Additional Image</Form.Label>
                    <Form.Control
                      type="file"
                      ref={photo3Ref}
                      style={fileInputStyle}
                      accept="image/*"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div style={pricingCardStyle}>
                <h3 style={pricingSectionTitleStyle}>
                  <span style={bulletStyle}></span>
                  Pricing Information
                </h3>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={labelStyle}>
                        Original Price (₹)
                        <span style={requiredStyle}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        style={{ ...inputStyle, backgroundColor: "#ffffff" }}
                        onFocus={(e) => Object.assign(e.target.style, { ...inputFocusStyle, backgroundColor: "#ffffff" })}
                        onBlur={(e) => Object.assign(e.target.style, { ...inputStyle, backgroundColor: "#ffffff" })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={labelStyle}>Discount (%)</Form.Label>
                      <Form.Control
                        type="number"
                        value={off}
                        onChange={(e) => handleOffChange(e.target.value)}
                        style={{ ...inputStyle, backgroundColor: "#ffffff" }}
                        onFocus={(e) => Object.assign(e.target.style, { ...inputFocusStyle, backgroundColor: "#ffffff" })}
                        onBlur={(e) => Object.assign(e.target.style, { ...inputStyle, backgroundColor: "#ffffff" })}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {price && finalPrice && (
                  <div style={finalPriceCardStyle}>
                    <div style={finalPriceStyle}>
                      <span style={{ fontSize: "1rem", fontWeight: "500", color: "#64748b" }}>Final Price:</span>
                      <span style={finalPriceAmountStyle}>₹{finalPrice}</span>
                    </div>
                    {off && (
                      <div style={savingsStyle}>
                        You save: ₹{(price - finalPrice).toFixed(2)} ({off}% off)
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Form.Group className="mb-4">
                <Form.Label style={labelStyle}>Product Description</Form.Label>
                <Form.Control
                  as="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={textareaStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, textareaStyle)}
                  placeholder="Enter detailed product description..."
                  rows={4}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={labelStyle}>Product Customize Question</Form.Label>
                <Form.Control
                  type="text"
                  value={customizeQuestion}
                  onChange={(e) => setCustomizeQuestion(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                  placeholder="e.g. What color would you like? What size do you prefer?"
                />
              </Form.Group>

              <div style={{ paddingTop: "16px" }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    ...submitButtonStyle,
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer"
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = "scale(1.02)";
                      e.target.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          border: "2px solid #ffffff",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                          marginRight: "8px"
                        }}
                      ></div>
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <span style={buttonIconStyle}>+</span>
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Products List Section */}
        <Card style={{ ...mainCardStyle, marginTop: "40px", maxWidth: "1200px" }}>
          <div style={cardHeaderStyle}>
            <div style={cardHeaderOverlayStyle}></div>
            <div style={cardHeaderContentStyle}>
              <h2 style={cardHeaderTitleStyle}>Product List</h2>
              <p style={cardHeaderSubtitleStyle}>View and manage all products</p>
            </div>
          </div>

          <Card.Body style={cardBodyStyle}>
            {/* Search and Filter Section */}
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Search by Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={inputStyle}
                    placeholder="Search products..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Filter by Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={inputStyle}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Products Table */}
            {isLoadingProducts ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #e2e8f0",
                    borderTop: "4px solid rgb(42,101,197)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto"
                  }}
                ></div>
                <p style={{ marginTop: "16px", color: "#64748b" }}>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <p style={{ fontSize: "1.1rem" }}>No products found</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table hover responsive style={{ marginBottom: "0" }}>
                  <thead style={{ backgroundColor: "#f8fafc" }}>
                    <tr>
                      <th style={{ padding: "16px", fontWeight: "600", color: "#334155" }}>Image</th>
                      <th style={{ padding: "16px", fontWeight: "600", color: "#334155" }}>Name</th>
                      <th style={{ padding: "16px", fontWeight: "600", color: "#334155" }}>Category</th>
                      <th style={{ padding: "16px", fontWeight: "600", color: "#334155" }}>Price</th>
                      <th style={{ padding: "16px", fontWeight: "600", color: "#334155" }}>Discount</th>
                      <th style={{ padding: "16px", fontWeight: "600", color: "#334155" }}>Final Price</th>
                      <th style={{ padding: "16px", fontWeight: "600", color: "#334155" }}>Created At</th>
                      <th style={{ padding: "16px", fontWeight: "600", color: "#334155" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td style={{ padding: "16px" }}>
                          <img
                            src={product.images[0]}
                            alt={product.modelName}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0"
                            }}
                          />
                        </td>
                        <td style={{ padding: "16px", fontWeight: "500", color: "#334155" }}>
                          {product.modelName}
                        </td>
                        <td style={{ padding: "16px", color: "#64748b" }}>
                          {product.category}
                        </td>
                        <td style={{ padding: "16px", color: "#64748b" }}>
                          ₹{product.price}
                        </td>
                        <td style={{ padding: "16px", color: "#64748b" }}>
                          {product.off}%
                        </td>
                        <td style={{ padding: "16px", fontWeight: "600", color: "#16a34a" }}>
                          ₹{product.finalPrice}
                        </td>
                        <td style={{ padding: "16px", color: "#64748b", fontSize: "0.9rem" }}>
                          {formatDate(product.createdAt)}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <button
                            onClick={() => handleUpdate(product)}
                            style={updateButtonStyle}
                            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            style={deleteButtonStyle}
                            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            <div style={{ marginTop: "20px", color: "#64748b", textAlign: "center" }}>
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </Card.Body>
        </Card>

        {/* Update Modal */}
        <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} size="lg">
          <Modal.Header closeButton style={{ background: "linear-gradient(135deg, rgb(42,101,197) 0%, rgb(10,80,177) 100%)", color: "#ffffff" }}>
            <Modal.Title>Update Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <Form onSubmit={handleUpdateSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={labelStyle}>Product Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedProduct.modelName}
                        onChange={(e) => setSelectedProduct({ ...selectedProduct, modelName: e.target.value })}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={labelStyle}>Category</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedProduct.category}
                        onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label style={labelStyle}>Price (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        value={selectedProduct.price}
                        onChange={(e) => {
                          const newPrice = e.target.value;
                          const discount = (newPrice * selectedProduct.off) / 100;
                          setSelectedProduct({
                            ...selectedProduct,
                            price: newPrice,
                            finalPrice: (newPrice - discount).toFixed(2)
                          });
                        }}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label style={labelStyle}>Discount (%)</Form.Label>
                      <Form.Control
                        type="number"
                        value={selectedProduct.off}
                        onChange={(e) => {
                          const newOff = e.target.value;
                          const discount = (selectedProduct.price * newOff) / 100;
                          setSelectedProduct({
                            ...selectedProduct,
                            off: newOff,
                            finalPrice: (selectedProduct.price - discount).toFixed(2)
                          });
                        }}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label style={labelStyle}>Final Price (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        value={selectedProduct.finalPrice}
                        readOnly
                        style={{ ...inputStyle, backgroundColor: "#f0fdf4" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label style={labelStyle}>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={selectedProduct.description || ""}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                    style={textareaStyle}
                    rows={3}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={labelStyle}>Customize Question</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProduct.customizeQuestion || ""}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, customizeQuestion: e.target.value })}
                    style={inputStyle}
                  />
                </Form.Group>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                  <Button
                    variant="secondary"
                    onClick={() => setShowUpdateModal(false)}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontWeight: "600"
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, rgb(42,101,197) 0%, rgb(10,80,177) 100%)",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontWeight: "600"
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </Form>
            )}
          </Modal.Body>
        </Modal>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "40px", color: "#64748b", paddingBottom: "20px" }}>
          <p style={{ fontSize: "0.9rem" }}>Manage your products with ease and efficiency</p>
        </div>
      </Container>
    </div>
  );
};

export default AdminOnlineStore;