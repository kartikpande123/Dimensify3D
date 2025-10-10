// AdminTransaction.js
import React, { useEffect, useState, useMemo } from "react";
import { Container, Table, Spinner, Row, Col, Form, InputGroup, Card, Badge, Button } from "react-bootstrap";
import axios from "axios";
import API_BASE_URL from "./apiConfig";

const AdminTransaction = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [sourceFilter, setSourceFilter] = useState("all");
  const [scrollPosition, setScrollPosition] = useState(0);
  const tableContainerRef = React.useRef(null);

  // Fetch user data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users`);
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Process all transactions
  const processedTransactions = useMemo(() => {
    let allTransactions = [];
    
    users.forEach((user) => {
      // Process Online Store Orders
      if (user.onlinestoreorders) {
        Object.values(user.onlinestoreorders).forEach((order) => {
          const orderDate = order.orderTimestamp ? new Date(order.orderTimestamp) : new Date();
          
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              const discount = (item.originalPrice - item.price) * item.quantity || 0;
              const itemTotal = (item.originalPrice || item.price) * item.quantity;
              const finalPrice = item.totalItemPrice || (item.price * item.quantity);
              
              allTransactions.push({
                userName: user.name,
                userPhone: user.phone,
                orderId: order.orderId,
                productName: item.name || "N/A",
                category: item.category || "N/A",
                quantity: item.quantity || 1,
                unitPrice: item.price || 0,
                total: itemTotal,
                discount: discount,
                finalPrice: finalPrice,
                customizationCost: item.customization?.totalCustomizationCost || 0,
                deliveryCharge: order.deliveryCharge || 0,
                source: "Online Store",
                orderDate: orderDate,
                status: order.status || "N/A",
                paymentId: order.paymentId || "N/A",
                searchableText: `${user.name} ${order.orderId} ${item.name}`.toLowerCase()
              });
            });
          }
        });
      }

      // Process Custom Model Orders
      if (user.orders) {
        Object.values(user.orders).forEach((order) => {
          const orderDate = order.orderTimestamp ? new Date(order.orderTimestamp) : new Date();
          
          if (order.files && Array.isArray(order.files)) {
            order.files.forEach((file) => {
              const unitPrice = file.unitPrice || file.pricing?.finalPrice || 0;
              const quantity = file.quantity || 1;
              const total = unitPrice * quantity;
              const finalPrice = file.totalPrice || total;
              
              allTransactions.push({
                userName: user.name,
                userPhone: order.phone || user.phone,
                orderId: order.orderId,
                productName: file.originalName || "Custom Model",
                category: "Custom 3D Print",
                quantity: quantity,
                unitPrice: unitPrice,
                total: total,
                discount: order.discountAmount || 0,
                finalPrice: finalPrice,
                customizationCost: 0,
                deliveryCharge: order.deliveryCharge || 0,
                source: "Custom Model",
                orderDate: orderDate,
                status: order.status || "N/A",
                paymentId: order.paymentId || "N/A",
                materialType: file.printSettings?.materialType || "N/A",
                searchableText: `${user.name} ${order.orderId} ${file.originalName}`.toLowerCase()
              });
            });
          }
        });
      }
    });

    // Apply filters
    if (searchTerm) {
      allTransactions = allTransactions.filter(transaction => 
        transaction.searchableText.includes(searchTerm.toLowerCase())
      );
    }

    if (sourceFilter !== "all") {
      allTransactions = allTransactions.filter(transaction => 
        transaction.source === sourceFilter
      );
    }

    if (dateRange.from || dateRange.to) {
      allTransactions = allTransactions.filter(transaction => {
        const transactionDate = transaction.orderDate;
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to + 'T23:59:59') : null;
        
        return (!fromDate || transactionDate >= fromDate) && (!toDate || transactionDate <= toDate);
      });
    }

    // Apply sorting
    allTransactions.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return b.orderDate - a.orderDate;
        case "oldest":
          return a.orderDate - b.orderDate;
        case "highestAmount":
          return b.finalPrice - a.finalPrice;
        case "lowestAmount":
          return a.finalPrice - b.finalPrice;
        default:
          return 0;
      }
    });

    return allTransactions;
  }, [users, searchTerm, sortOption, dateRange, sourceFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    return processedTransactions.reduce((acc, transaction) => {
      acc.totalAmount += transaction.total;
      acc.totalDiscount += transaction.discount;
      acc.totalCustomization += transaction.customizationCost;
      acc.totalDelivery += transaction.deliveryCharge;
      acc.finalTotal += transaction.finalPrice + transaction.deliveryCharge;
      acc.totalQuantity += transaction.quantity;
      return acc;
    }, {
      totalAmount: 0,
      totalDiscount: 0,
      totalCustomization: 0,
      totalDelivery: 0,
      finalTotal: 0,
      totalQuantity: 0
    });
  }, [processedTransactions]);

  const clearFilters = () => {
    setSearchTerm("");
    setSortOption("newest");
    setDateRange({ from: "", to: "" });
    setSourceFilter("all");
  };

  return (
    <Container fluid className="mt-4 px-4">
      {/* Header Section */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '8px 8px 0 0'
        }}>
          <Row className="align-items-center text-white">
            <Col md={8}>
              <h3 className="mb-0 fw-bold">
                <i className="fas fa-receipt me-2"></i>
                Transaction Management
              </h3>
            </Col>
            <Col md={4} className="text-end">
              <div className="fs-6">Total Transactions: <span className="fw-bold">{processedTransactions.length}</span></div>
              <div className="fs-6">Total Revenue: <span className="fw-bold">₹{totals.finalTotal.toFixed(2)}</span></div>
            </Col>
          </Row>
        </Card.Header>
        
        {/* Summary Cards */}
        <Card.Body style={{ backgroundColor: '#f8f9fa', borderBottom: '3px solid #667eea' }}>
          <Row className="g-3 mb-3">
            <Col md={2}>
              <Card className="text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Card.Body className="py-3 text-white">
                  <i className="fas fa-shopping-cart fa-2x mb-2"></i>
                  <h6 className="mb-1">Total Items</h6>
                  <h4 className="mb-0 fw-bold">{totals.totalQuantity}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <Card.Body className="py-3 text-white">
                  <i className="fas fa-rupee-sign fa-2x mb-2"></i>
                  <h6 className="mb-1">Total Amount</h6>
                  <h4 className="mb-0 fw-bold">₹{totals.totalAmount.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <Card.Body className="py-3 text-white">
                  <i className="fas fa-tags fa-2x mb-2"></i>
                  <h6 className="mb-1">Total Discount</h6>
                  <h4 className="mb-0 fw-bold">₹{totals.totalDiscount.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <Card.Body className="py-3 text-white">
                  <i className="fas fa-magic fa-2x mb-2"></i>
                  <h6 className="mb-1">Customization</h6>
                  <h4 className="mb-0 fw-bold">₹{totals.totalCustomization.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
                <Card.Body className="py-3 text-white">
                  <i className="fas fa-truck fa-2x mb-2"></i>
                  <h6 className="mb-1">Delivery</h6>
                  <h4 className="mb-0 fw-bold">₹{totals.totalDelivery.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                <Card.Body className="py-3 text-dark">
                  <i className="fas fa-money-bill-wave fa-2x mb-2 text-success"></i>
                  <h6 className="mb-1">Final Total</h6>
                  <h4 className="mb-0 fw-bold text-success">₹{totals.finalTotal.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filter Controls */}
          <Row className="g-3">
            <Col md={3}>
              <Form.Label className="fw-semibold text-dark mb-1">
                <i className="fas fa-search me-1"></i>Search
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by user, order ID, product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2"
                />
                <Button 
                  variant="outline-secondary"
                  onClick={() => setSearchTerm("")}
                  disabled={!searchTerm}
                >
                  <i className="fas fa-times"></i>
                </Button>
              </InputGroup>
            </Col>
            
            <Col md={2}>
              <Form.Label className="fw-semibold text-dark mb-1">
                <i className="fas fa-filter me-1"></i>Source
              </Form.Label>
              <Form.Select 
                value={sourceFilter} 
                onChange={(e) => setSourceFilter(e.target.value)}
                className="border-2"
              >
                <option value="all">All Sources</option>
                <option value="Online Store">Online Store</option>
                <option value="Custom Model">Custom Model</option>
              </Form.Select>
            </Col>
            
            <Col md={2}>
              <Form.Label className="fw-semibold text-dark mb-1">
                <i className="fas fa-sort me-1"></i>Sort By
              </Form.Label>
              <Form.Select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="border-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highestAmount">Highest Amount</option>
                <option value="lowestAmount">Lowest Amount</option>
              </Form.Select>
            </Col>
            
            <Col md={2}>
              <Form.Label className="fw-semibold text-dark mb-1">
                <i className="fas fa-calendar-alt me-1"></i>From Date
              </Form.Label>
              <Form.Control
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="border-2"
              />
            </Col>
            
            <Col md={2}>
              <Form.Label className="fw-semibold text-dark mb-1">
                <i className="fas fa-calendar-alt me-1"></i>To Date
              </Form.Label>
              <Form.Control
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="border-2"
              />
            </Col>
            
            <Col md={1} className="d-flex align-items-end">
              <Button 
                variant="outline-danger"
                onClick={clearFilters}
                className="w-100"
                disabled={!searchTerm && sortOption === 'newest' && !dateRange.from && !dateRange.to && sourceFilter === 'all'}
              >
                <i className="fas fa-eraser"></i> Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {loading ? (
        <Card className="text-center py-5 shadow-sm">
          <Card.Body>
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 fs-5 text-muted">Loading transactions...</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0">
          <div style={{ overflowX: 'auto' }}>
            <Table striped bordered hover responsive className="mb-0" style={{ minWidth: '1400px' }}>
              <thead style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                <tr className="text-white">
                  <th style={{ minWidth: '60px' }} className="text-center">Sr. No.</th>
                  <th style={{ minWidth: '150px' }}>User Details</th>
                  <th style={{ minWidth: '120px' }}>Order ID</th>
                  <th style={{ minWidth: '200px' }}>Product Name</th>
                  <th style={{ minWidth: '80px' }} className="text-center">Quantity</th>
                  <th style={{ minWidth: '100px' }} className="text-end">Unit Price</th>
                  <th style={{ minWidth: '100px' }} className="text-end">Total</th>
                  <th style={{ minWidth: '100px' }} className="text-end">Discount</th>
                  <th style={{ minWidth: '120px' }} className="text-end">Customization</th>
                  <th style={{ minWidth: '120px' }} className="text-end">Delivery</th>
                  <th style={{ minWidth: '120px' }} className="text-end">Final Price</th>
                  <th style={{ minWidth: '120px' }} className="text-center">Source</th>
                  <th style={{ minWidth: '120px' }}>Date</th>
                  <th style={{ minWidth: '100px' }} className="text-center">Status</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {processedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="text-center text-muted py-5">
                      <i className="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                      <div className="fs-5">No transactions found</div>
                      <small>Try adjusting your filters</small>
                    </td>
                  </tr>
                ) : (
                  processedTransactions.map((transaction, index) => (
                    <tr key={`${transaction.orderId}-${index}`} className="align-middle">
                      <td className="text-center fw-bold">{index + 1}</td>
                      <td>
                        <div className="fw-semibold text-primary">{transaction.userName}</div>
                        <small className="text-muted">
                          <i className="fas fa-phone me-1"></i>{transaction.userPhone}
                        </small>
                      </td>
                      <td>
                        <code style={{ 
                          backgroundColor: '#f8f9fa', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '0.85rem'
                        }}>
                          {transaction.orderId}
                        </code>
                        <div>
                          <small className="text-muted">{transaction.paymentId}</small>
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{transaction.productName}</div>
                        <small className="text-muted">
                          <Badge bg="secondary" className="me-1">{transaction.category}</Badge>
                          {transaction.materialType && transaction.materialType !== 'N/A' && (
                            <Badge bg="info">{transaction.materialType}</Badge>
                          )}
                        </small>
                      </td>
                      <td className="text-center">
                        <Badge bg="primary" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                          {transaction.quantity}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <span className="text-muted">₹{transaction.unitPrice.toFixed(2)}</span>
                      </td>
                      <td className="text-end">
                        <span className="fw-semibold text-info">₹{transaction.total.toFixed(2)}</span>
                      </td>
                      <td className="text-end">
                        <span className="text-success">
                          {transaction.discount > 0 ? `-₹${transaction.discount.toFixed(2)}` : '₹0.00'}
                        </span>
                      </td>
                      <td className="text-end">
                        <span style={{ color: transaction.customizationCost > 0 ? '#ff6b6b' : '#6c757d' }}>
                          {transaction.customizationCost > 0 ? `+₹${transaction.customizationCost.toFixed(2)}` : '₹0.00'}
                        </span>
                      </td>
                      <td className="text-end">
                        <span className="text-warning">
                          {transaction.deliveryCharge > 0 ? `+₹${transaction.deliveryCharge.toFixed(2)}` : '₹0.00'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="fw-bold text-success" style={{ fontSize: '1.05rem' }}>
                          ₹{(transaction.finalPrice + transaction.deliveryCharge).toFixed(2)}
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge 
                          bg={transaction.source === "Online Store" ? "primary" : "dark"} 
                          className="px-3 py-2"
                        >
                          <i className={`fas ${transaction.source === "Online Store" ? "fa-store" : "fa-cube"} me-1`}></i>
                          {transaction.source}
                        </Badge>
                      </td>
                      <td>
                        <div className="text-muted">
                          <i className="fas fa-calendar me-1"></i>
                          {transaction.orderDate.toLocaleDateString('en-GB')}
                        </div>
                        <small className="text-muted">
                          {transaction.orderDate.toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </small>
                      </td>
                      <td className="text-center">
                        <Badge 
                          bg={
                            transaction.status === 'completed' || transaction.status === 'delivered' ? 'success' :
                            transaction.status === 'pending' ? 'warning' : 
                            transaction.status === 'packaging' ? 'info' :
                            transaction.status === 'processing' ? 'primary' :
                            'secondary'
                          }
                          className="px-3 py-2"
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      )}
      
      <div className="mt-4 text-center text-muted pb-4">
        <small>
          <i className="fas fa-info-circle me-1"></i>
          Showing all transaction details from both Online Store and Custom Model orders
        </small>
      </div>
    </Container>
  );
};

export default AdminTransaction;