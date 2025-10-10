import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Nav, Dropdown, Button, Modal, Form } from 'react-bootstrap';
import { User, ShoppingCart, Settings, Headphones, Calendar, MapPin, Package, Filter, HelpCircle, MessageSquare, Edit } from 'lucide-react';
import API_BASE_URL from './apiConfig';

const AccountSidebar = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('account');
  const [orderFilter, setOrderFilter] = useState('all');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const phoneNumber = localStorage.getItem('dimensify3duserphoneNo');
      if (!phoneNumber) {
        setError('Phone number not found in local storage');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user-by-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const result = await response.json();

      if (result.success) {
        setUserData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportClick = () => {
    setActiveTab('support');
  };

  const handleUpdateAddress = (addressKey, address) => {
    setEditingAddress(addressKey);
    setAddressForm({
      name: address.name || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      landmark: address.landmark || ''
    });
    setShowAddressModal(true);
  };

  const handleCloseModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    setAddressForm({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    });
  };

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateUserAddress = async () => {
    if (!editingAddress) return;

    setUpdating(true);
    try {
      const phoneNumber = localStorage.getItem('dimensify3duserphoneNo');
      if (!phoneNumber) {
        alert('Phone number not found');
        return;
      }

      // Create updated addresses object
      const updatedAddresses = {
        ...userData.addresses,
        [editingAddress]: addressForm
      };

      const response = await fetch(`${API_BASE_URL}/api/users/${phoneNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: updatedAddresses
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setUserData(prev => ({
          ...prev,
          addresses: updatedAddresses
        }));
        handleCloseModal();
        alert('Address updated successfully!');
      } else {
        alert('Failed to update address: ' + result.message);
      }
    } catch (err) {
      console.error('Error updating address:', err);
      alert('Failed to update address');
    } finally {
      setUpdating(false);
    }
  };

  const filterOrders = (orders) => {
    if (!orders || orderFilter === 'all') return orders;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch(orderFilter) {
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '1year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return orders;
    }
    
    return Object.entries(orders).reduce((acc, [key, order]) => {
      if (new Date(order.orderTimestamp) >= filterDate) {
        acc[key] = order;
      }
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your account information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <Container style={styles.container}>
          <div style={styles.errorMessage}>
            <div style={styles.errorIcon}>⚠️</div>
            <h3 style={styles.errorTitle}>Oops! Something went wrong</h3>
            <p style={styles.errorText}>{error}</p>
            <button style={styles.retryButton} onClick={fetchUserData}>
              Try Again
            </button>
          </div>
        </Container>
      </div>
    );
  }

  if (!userData) return null;

  const filteredOnlineOrders = filterOrders(userData.onlinestoreorders);
  const filteredCustomOrders = filterOrders(userData.orders);

  return (
    <div style={styles.body}>
      <Container style={styles.container}>
        <Row>
          <Col lg={3} md={4} style={styles.sidebarCol}>
            <Card style={styles.sidebarCard}>
              <div style={styles.userProfile}>
                <div style={styles.avatarWrapper}>
                  <div style={styles.avatar}>
                    {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={styles.statusDot}></div>
                </div>
                <h5 style={styles.userName}>{userData.name || 'User'}</h5>
                <p style={styles.userEmail}>{userData.email}</p>
              </div>
              
              <div style={styles.navContainer}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'account'}
                      onClick={() => setActiveTab('account')}
                      style={{...styles.navLink, ...(activeTab === 'account' ? styles.navLinkActive : {})}}
                    >
                      <User size={18} style={styles.navIcon} />
                      <span>My Account</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'onlineOrders'}
                      onClick={() => setActiveTab('onlineOrders')}
                      style={{...styles.navLink, ...(activeTab === 'onlineOrders' ? styles.navLinkActive : {})}}
                    >
                      <ShoppingCart size={18} style={styles.navIcon} />
                      <span>Online Store Orders</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'customOrders'}
                      onClick={() => setActiveTab('customOrders')}
                      style={{...styles.navLink, ...(activeTab === 'customOrders' ? styles.navLinkActive : {})}}
                    >
                      <Settings size={18} style={styles.navIcon} />
                      <span>Custom Model Orders</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'support'}
                      onClick={handleSupportClick}
                      style={{...styles.navLink, ...(activeTab === 'support' ? styles.navLinkActive : {})}}
                    >
                      <Headphones size={18} style={styles.navIcon} />
                      <span>Support</span>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
            </Card>
          </Col>

          <Col lg={9} md={8}>
            {/* My Account Tab */}
            {activeTab === 'account' && (
              <Card style={styles.contentCard}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>
                    <User size={24} style={styles.headerIcon} />
                    My Account Details
                  </h4>
                </div>
                <Card.Body style={styles.cardBody}>
                  <Row>
                    <Col md={6}>
                      <div style={styles.detailItem}>
                        <label style={styles.detailLabel}>Full Name</label>
                        <p style={styles.detailValue}>{userData.name}</p>
                      </div>
                      <div style={styles.detailItem}>
                        <label style={styles.detailLabel}>Email Address</label>
                        <p style={styles.detailValue}>{userData.email}</p>
                      </div>
                      <div style={styles.detailItem}>
                        <label style={styles.detailLabel}>Phone Number</label>
                        <p style={styles.detailValue}>{userData.phone}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div style={styles.detailItem}>
                        <label style={styles.detailLabel}>User ID</label>
                        <p style={styles.detailValue}>{userData.userId}</p>
                      </div>
                      <div style={styles.detailItem}>
                        <label style={styles.detailLabel}>Account Status</label>
                        <Badge bg="success" style={styles.statusBadge}>
                          {userData.status}
                        </Badge>
                      </div>
                      <div style={styles.detailItem}>
                        <label style={styles.detailLabel}>Member Since</label>
                        <p style={styles.detailValue}>
                          <Calendar size={14} style={{marginRight: '6px', verticalAlign: 'middle'}} />
                          {new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </Col>
                  </Row>

                  {userData.addresses && Object.keys(userData.addresses).length > 0 && (
                    <div style={styles.section}>
                      <h5 style={styles.sectionTitle}>
                        <MapPin size={20} style={{marginRight: '8px', verticalAlign: 'middle'}} />
                        Saved Addresses
                      </h5>
                      <Row>
                        {Object.entries(userData.addresses).map(([key, address]) => (
                          <Col md={6} key={key}>
                            <Card style={styles.addressCard}>
                              <Card.Body>
                                <div style={styles.addressHeader}>
                                  <h6 style={styles.addressName}>{address.name}</h6>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleUpdateAddress(key, address)}
                                    style={styles.updateButton}
                                  >
                                    <Edit size={14} style={{marginRight: '4px'}} />
                                    Update
                                  </Button>
                                </div>
                                <p style={styles.addressLine}>{address.addressLine1}</p>
                                {address.addressLine2 && <p style={styles.addressLine}>{address.addressLine2}</p>}
                                <p style={styles.addressLine}>
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p style={styles.addressLandmark}>
                                  <MapPin size={12} style={{marginRight: '4px'}} />
                                  {address.landmark}
                                </p>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Online Store Orders Tab */}
            {activeTab === 'onlineOrders' && (
              <Card style={styles.contentCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.headerContent}>
                    <h4 style={styles.cardTitle}>
                      <ShoppingCart size={24} style={styles.headerIcon} />
                      Online Store Orders
                    </h4>
                    <Dropdown>
                      <Dropdown.Toggle variant="light" style={styles.filterButton}>
                        <Filter size={16} style={{marginRight: '6px'}} />
                        {orderFilter === 'all' ? 'All Time' : 
                         orderFilter === '30days' ? 'Last 30 Days' : 
                         orderFilter === '3months' ? 'Last 3 Months' : 'Last Year'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setOrderFilter('all')}>All Time</Dropdown.Item>
                        <Dropdown.Item onClick={() => setOrderFilter('30days')}>Last 30 Days</Dropdown.Item>
                        <Dropdown.Item onClick={() => setOrderFilter('3months')}>Last 3 Months</Dropdown.Item>
                        <Dropdown.Item onClick={() => setOrderFilter('1year')}>Last Year</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
                <Card.Body style={styles.cardBody}>
                  {filteredOnlineOrders && Object.keys(filteredOnlineOrders).length > 0 ? (
                    Object.entries(filteredOnlineOrders).map(([orderKey, order]) => (
                      <Card key={orderKey} style={styles.orderCard}>
                        <Card.Body style={styles.orderCardBody}>
                          <Row>
                            <Col md={8}>
                              <div style={styles.orderHeader}>
                                <h6 style={styles.orderId}>
                                  <Package size={16} style={{marginRight: '6px'}} />
                                  Order #{order.orderId}
                                </h6>
                                <Badge bg={order.status === 'paid' ? 'success' : 'warning'} style={styles.orderStatusBadge}>
                                  {order.status}
                                </Badge>
                              </div>
                              <p style={styles.orderDate}>
                                <Calendar size={14} style={{marginRight: '6px'}} />
                                {new Date(order.orderTimestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                              <div style={styles.orderItems}>
                                {order.items.map((item, index) => (
                                  <div key={index} style={styles.orderItemCard}>
                                    <img src={item.image} alt={item.name} style={styles.itemImage} />
                                    <span style={styles.itemName}>{item.name}</span>
                                  </div>
                                ))}
                              </div>
                            </Col>
                            <Col md={4} style={styles.orderSummary}>
                              <div style={styles.priceItem}>
                                <span style={styles.priceLabel}>Subtotal:</span>
                                <span style={styles.priceValue}>₹{order.subtotal}</span>
                              </div>
                              <div style={styles.priceItem}>
                                <span style={styles.priceLabel}>Delivery:</span>
                                <span style={styles.priceValue}>₹{order.deliveryCharge}</span>
                              </div>
                              <div style={styles.totalPrice}>
                                <strong>Total Amount:</strong>
                                <strong style={styles.totalAmount}>₹{order.totalPrice}</strong>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <div style={styles.noData}>
                      <Package size={48} style={styles.noDataIcon} />
                      <p style={styles.noDataText}>No orders found for the selected period</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Custom Model Orders Tab */}
            {activeTab === 'customOrders' && (
              <Card style={styles.contentCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.headerContent}>
                    <h4 style={styles.cardTitle}>
                      <Settings size={24} style={styles.headerIcon} />
                      Custom Model Orders
                    </h4>
                    <Dropdown>
                      <Dropdown.Toggle variant="light" style={styles.filterButton}>
                        <Filter size={16} style={{marginRight: '6px'}} />
                        {orderFilter === 'all' ? 'All Time' : 
                         orderFilter === '30days' ? 'Last 30 Days' : 
                         orderFilter === '3months' ? 'Last 3 Months' : 'Last Year'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setOrderFilter('all')}>All Time</Dropdown.Item>
                        <Dropdown.Item onClick={() => setOrderFilter('30days')}>Last 30 Days</Dropdown.Item>
                        <Dropdown.Item onClick={() => setOrderFilter('3months')}>Last 3 Months</Dropdown.Item>
                        <Dropdown.Item onClick={() => setOrderFilter('1year')}>Last Year</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
                <Card.Body style={styles.cardBody}>
                  {filteredCustomOrders && Object.keys(filteredCustomOrders).length > 0 ? (
                    Object.entries(filteredCustomOrders).map(([orderKey, order]) => (
                      <Card key={orderKey} style={styles.orderCard}>
                        <Card.Body style={styles.orderCardBody}>
                          <Row>
                            <Col md={8}>
                              <div style={styles.orderHeader}>
                                <h6 style={styles.orderId}>
                                  <Package size={16} style={{marginRight: '6px'}} />
                                  Order #{order.orderId}
                                </h6>
                                <Badge bg="info" style={styles.orderStatusBadge}>
                                  {order.status}
                                </Badge>
                              </div>
                              <p style={styles.orderDate}>
                                <Calendar size={14} style={{marginRight: '6px'}} />
                                {new Date(order.orderTimestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                              <div style={styles.filesSection}>
                                <strong style={styles.filesTitle}>Uploaded Files ({order.fileCount}):</strong>
                                <div style={styles.filesList}>
                                  {order.files.map((file, index) => (
                                    <div key={index} style={styles.fileItem}>
                                      <span style={styles.fileIcon}>📄</span>
                                      <span style={styles.fileName}>{file.originalName}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </Col>
                            <Col md={4} style={styles.orderSummary}>
                              <div style={styles.priceItem}>
                                <span style={styles.priceLabel}>Subtotal:</span>
                                <span style={styles.priceValue}>₹{order.subtotal}</span>
                              </div>
                              <div style={styles.priceItem}>
                                <span style={styles.priceLabel}>Delivery:</span>
                                <span style={styles.priceValue}>₹{order.deliveryCharge}</span>
                              </div>
                              {order.discountAmount && (
                                <div style={styles.priceItem}>
                                  <span style={styles.priceLabel}>Discount:</span>
                                  <span style={styles.discountValue}>-₹{order.discountAmount}</span>
                                </div>
                              )}
                              <div style={styles.totalPrice}>
                                <strong>Total Amount:</strong>
                                <strong style={styles.totalAmount}>₹{order.totalPrice}</strong>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <div style={styles.noData}>
                      <Settings size={48} style={styles.noDataIcon} />
                      <p style={styles.noDataText}>No custom orders found for the selected period</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <Card style={styles.contentCard}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>
                    <Headphones size={24} style={styles.headerIcon} />
                    Support & Assistance
                  </h4>
                </div>
                <Card.Body style={styles.cardBody}>
                  <p style={styles.supportIntro}>How can we help you today? Choose from the options below:</p>
                  <Row>
                    <Col md={6}>
                      <Card 
                        style={styles.supportCard}
                        onClick={() => window.location.href = '/help'}
                      >
                        <Card.Body style={styles.supportCardBody}>
                          <div style={styles.supportIconWrapper}>
                            <HelpCircle size={40} style={styles.supportIcon} />
                          </div>
                          <h5 style={styles.supportCardTitle}>Help Center</h5>
                          <p style={styles.supportCardText}>
                            Find answers to frequently asked questions, tutorials, and step-by-step guides to help you navigate our platform.
                          </p>
                          <button style={styles.supportButton}>
                            Visit Help Center →
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card 
                        style={styles.supportCard}
                        onClick={() => window.location.href = '/consultancy'}
                      >
                        <Card.Body style={styles.supportCardBody}>
                          <div style={styles.supportIconWrapper}>
                            <MessageSquare size={40} style={styles.supportIcon} />
                          </div>
                          <h5 style={styles.supportCardTitle}>Consultancy</h5>
                          <p style={styles.supportCardText}>
                            Get personalized consultation from our experts for your custom 3D printing projects and design requirements.
                          </p>
                          <button style={styles.supportButton}>
                            Request Consultation →
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* Address Update Modal */}
      <Modal show={showAddressModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={styles.modalTitle}>
            <Edit size={20} style={{marginRight: '10px'}} />
            Update Address
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={styles.formLabel}>Address Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={addressForm.name}
                    onChange={handleAddressFormChange}
                    placeholder="e.g., Home, Office"
                    style={styles.formControl}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={styles.formLabel}>Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    name="pincode"
                    value={addressForm.pincode}
                    onChange={handleAddressFormChange}
                    placeholder="Enter pincode"
                    style={styles.formControl}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label style={styles.formLabel}>Address Line 1</Form.Label>
              <Form.Control
                type="text"
                name="addressLine1"
                value={addressForm.addressLine1}
                onChange={handleAddressFormChange}
                placeholder="Street address, P.O. Box, Company name"
                style={styles.formControl}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={styles.formLabel}>Address Line 2</Form.Label>
              <Form.Control
                type="text"
                name="addressLine2"
                value={addressForm.addressLine2}
                onChange={handleAddressFormChange}
                placeholder="Apartment, suite, unit, building, floor, etc."
                style={styles.formControl}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={styles.formLabel}>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressFormChange}
                    placeholder="Enter city"
                    style={styles.formControl}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={styles.formLabel}>State</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={addressForm.state}
                    onChange={handleAddressFormChange}
                    placeholder="Enter state"
                    style={styles.formControl}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label style={styles.formLabel}>Landmark</Form.Label>
              <Form.Control
                type="text"
                name="landmark"
                value={addressForm.landmark}
                onChange={handleAddressFormChange}
                placeholder="Nearby landmark (optional)"
                style={styles.formControl}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button variant="secondary" onClick={handleCloseModal} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={updateUserAddress} 
            disabled={updating}
            style={styles.updateModalButton}
          >
            {updating ? 'Updating...' : 'Update Address'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const styles = {
  body: {
    background: 'linear-gradient(135deg, #f5f5f0 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: '20px 0'
  },
  container: {
    maxWidth: '1400px'
  },
  sidebarCol: {
    marginBottom: '30px'
  },
  sidebarCard: {
    border: 'none',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    background: 'white',
    overflow: 'hidden',
    position: 'sticky',
    top: '20px'
  },
  userProfile: {
    background: 'linear-gradient(135deg, #2a65c5 0%, #0a50b1 100%)',
    color: 'white',
    padding: '40px 25px',
    textAlign: 'center',
    position: 'relative'
  },
  avatarWrapper: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '15px'
  },
  avatar: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: '700',
    border: '4px solid rgba(255,255,255,0.3)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
  },
  statusDot: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    width: '18px',
    height: '18px',
    background: '#00ff88',
    borderRadius: '50%',
    border: '3px solid white',
    boxShadow: '0 2px 8px rgba(0,255,136,0.4)'
  },
  userName: {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '6px',
    letterSpacing: '0.3px'
  },
  userEmail: {
    fontSize: '13px',
    opacity: '0.95',
    marginBottom: '0',
    fontWeight: '400'
  },
  navContainer: {
    padding: '15px 0'
  },
  navLink: {
    padding: '16px 25px',
    color: '#4a5568',
    border: 'none',
    borderRadius: '0',
    textAlign: 'left',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    borderLeft: '4px solid transparent',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    background: 'transparent'
  },
  navLinkActive: {
    background: 'linear-gradient(90deg, rgba(42,101,197,0.08) 0%, rgba(42,101,197,0.02) 100%)',
    borderLeftColor: '#2a65c5',
    color: '#2a65c5',
    fontWeight: '600'
  },
  navIcon: {
    marginRight: '12px'
  },
  contentCard: {
    border: 'none',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    background: 'white',
    overflow: 'hidden',
    marginBottom: '25px'
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #2a65c5 0%, #0a50b1 100%)',
    color: 'white',
    padding: '25px 30px',
    borderBottom: 'none'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  cardTitle: {
    margin: '0',
    fontSize: '24px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.3px'
  },
  headerIcon: {
    marginRight: '12px'
  },
  filterButton: {
    background: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2a65c5',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  cardBody: {
    padding: '30px'
  },
  detailItem: {
    marginBottom: '24px',
    padding: '18px 20px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
    borderRadius: '12px',
    borderLeft: '4px solid #2a65c5',
    transition: 'all 0.3s ease'
  },
  detailLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#718096',
    textTransform: 'uppercase',
    marginBottom: '8px',
    letterSpacing: '1px'
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    margin: '0',
    display: 'flex',
    alignItems: 'center'
  },
  statusBadge: {
    fontSize: '13px',
    padding: '8px 16px',
    borderRadius: '25px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(40,167,69,0.3)'
  },
  section: {
    marginTop: '40px',
    paddingTop: '30px',
    borderTop: '2px solid #e9ecef'
  },
  sectionTitle: {
    color: '#2a65c5',
    fontWeight: '700',
    marginBottom: '20px',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  addressCard: {
    border: '3px solid #e9ecef', // Thicker border
    borderRadius: '15px',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  addressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  addressName: {
    color: '#2a65c5',
    fontWeight: '700',
    fontSize: '16px',
    margin: '0'
  },
  updateButton: {
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '600'
  },
  addressLine: {
    fontSize: '14px',
    color: '#4a5568',
    marginBottom: '6px',
    lineHeight: '1.6'
  },
  addressLandmark: {
    fontSize: '13px',
    color: '#718096',
    marginTop: '10px',
    marginBottom: '0',
    display: 'flex',
    alignItems: 'center',
    fontStyle: 'italic'
  },
  orderCard: {
    border: '3px solid #e9ecef', // Thicker border
    borderRadius: '16px',
    marginBottom: '25px',
    transition: 'all 0.3s ease',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    overflow: 'hidden'
  },
  orderCardBody: {
    padding: '25px'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  orderId: {
    color: '#2a65c5',
    fontWeight: '700',
    marginBottom: '0',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center'
  },
  orderDate: {
    color: '#718096',
    fontSize: '14px',
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500'
  },
  orderStatusBadge: {
    fontSize: '12px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  orderItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '15px'
  },
  orderItemCard: {
    background: 'white',
    padding: '12px',
    borderRadius: '12px',
    border: '3px solid #e9ecef', // Thicker border for order items
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  itemImage: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    objectFit: 'cover',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    maxWidth: '200px'
  },
  orderSummary: {
    borderLeft: '3px solid #e9ecef', // Thicker border
    paddingLeft: '25px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  priceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '15px'
  },
  priceLabel: {
    color: '#718096',
    fontWeight: '500'
  },
  priceValue: {
    color: '#2d3748',
    fontWeight: '600'
  },
  totalPrice: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '3px solid #e9ecef', // Thicker border
    fontSize: '16px',
    fontWeight: '700'
  },
  totalAmount: {
    color: '#2a65c5',
    fontSize: '20px'
  },
  discountValue: {
    color: '#28a745',
    fontWeight: '700'
  },
  filesSection: {
    marginTop: '15px',
    padding: '15px',
    background: 'white',
    borderRadius: '12px',
    border: '3px solid #e9ecef' // Thicker border
  },
  filesTitle: {
    fontSize: '14px',
    color: '#2d3748',
    marginBottom: '12px',
    display: 'block'
  },
  filesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    border: '2px solid #e9ecef' // Border for file items
  },
  fileIcon: {
    fontSize: '18px',
    marginRight: '10px'
  },
  fileName: {
    fontSize: '13px',
    color: '#4a5568',
    fontWeight: '500',
    wordBreak: 'break-word'
  },
  noData: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#718096'
  },
  noDataIcon: {
    color: '#cbd5e0',
    marginBottom: '20px'
  },
  noDataText: {
    fontSize: '16px',
    fontWeight: '500',
    margin: '0'
  },
  supportIntro: {
    fontSize: '16px',
    color: '#4a5568',
    marginBottom: '30px',
    textAlign: 'center',
    fontWeight: '500'
  },
  supportCard: {
    border: '3px solid #e9ecef', // Thicker border
    borderRadius: '16px',
    marginBottom: '25px',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    height: '100%'
  },
  supportCardBody: {
    padding: '35px 30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  supportIconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #2a65c5 0%, #0a50b1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '25px',
    boxShadow: '0 8px 20px rgba(42,101,197,0.3)',
    transition: 'all 0.3s ease'
  },
  supportIcon: {
    color: 'white'
  },
  supportCardTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '15px'
  },
  supportCardText: {
    fontSize: '15px',
    color: '#718096',
    lineHeight: '1.7',
    marginBottom: '25px'
  },
  supportButton: {
    background: 'linear-gradient(135deg, #2a65c5 0%, #0a50b1 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '25px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(42,101,197,0.3)'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #f5f5f0 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)'
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid #e9ecef',
    borderTop: '6px solid #2a65c5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '25px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#4a5568',
    fontWeight: '600'
  },
  errorContainer: {
    background: 'linear-gradient(135deg, #f5f5f0 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center'
  },
  errorMessage: {
    textAlign: 'center',
    padding: '60px 40px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    marginTop: '50px'
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  errorTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '12px'
  },
  errorText: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '30px'
  },
  retryButton: {
    background: 'linear-gradient(135deg, #2a65c5 0%, #0a50b1 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 35px',
    borderRadius: '30px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(42,101,197,0.3)'
  },
  // Modal Styles
  modalHeader: {
    background: 'linear-gradient(135deg, #2a65c5 0%, #0a50b1 100%)',
    color: 'white',
    borderBottom: 'none',
    padding: '20px 30px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center'
  },
  modalBody: {
    padding: '30px'
  },
  modalFooter: {
    borderTop: '2px solid #e9ecef',
    padding: '20px 30px'
  },
  formLabel: {
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
    fontSize: '14px'
  },
  formControl: {
    padding: '12px 15px',
    borderRadius: '10px',
    border: '2px solid #e9ecef',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  cancelButton: {
    background: '#6c757d',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  updateModalButton: {
    background: 'linear-gradient(135deg, #2a65c5 0%, #0a50b1 100%)',
    border: 'none',
    padding: '10px 25px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .nav-link:hover {
    background: rgba(42,101,197,0.05) !important;
  }
  
  .orderCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(0,0,0,0.12);
    border-color: #2a65c5;
  }
  
  .orderItemCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #2a65c5;
  }
  
  .addressCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    border-color: #2a65c5;
  }
  
  .supportCard:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    border-color: #2a65c5;
  }
  
  .supportCard:hover .supportIconWrapper {
    transform: scale(1.1) rotate(5deg);
  }
  
  .supportButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(42,101,197,0.4);
  }
  
  .retryButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(42,101,197,0.4);
  }
  
  .detailItem:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transform: translateX(4px);
  }
  
  .fileItem:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }
  
  .form-control:focus {
    border-color: #2a65c5;
    box-shadow: 0 0 0 0.2rem rgba(42,101,197,0.25);
  }
  
  .cancelButton:hover {
    background: #5a6268 !important;
    transform: translateY(-1px);
  }
  
  .updateModalButton:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(42,101,197,0.4);
  }
  
  .updateButton:hover {
    background: #2a65c5 !important;
    color: white !important;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    .orderSummary {
      border-left: none !important;
      border-top: 3px solid #e9ecef;
      padding-left: 0 !important;
      padding-top: 20px;
      margin-top: 20px;
    }
    
    .addressHeader {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
`;
document.head.appendChild(styleSheet);

export default AccountSidebar;