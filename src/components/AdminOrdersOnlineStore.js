import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Table, 
  Button, 
  Badge, 
  Spinner, 
  Alert, 
  Modal, 
  Row, 
  Col,
  Form,
  InputGroup,
  ButtonGroup,
  Accordion
} from 'react-bootstrap';
import { 
  Phone, 
  Calendar, 
  Package, 
  DollarSign, 
  FileText, 
  Eye,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  ShoppingCart,
  Tag,
  Percent
} from 'lucide-react';
import API_BASE_URL from './apiConfig';

const AdminOrdersOnlineStore = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(20);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, searchBy, dateFrom, dateTo, sortOrder]);

  useEffect(() => {
    paginateOrders();
  }, [filteredOrders, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`);
      const result = await response.json();

      if (result.success) {
        const allOrders = [];
        result.data.forEach(user => {
          if (user.onlinestoreorders) {
            Object.keys(user.onlinestoreorders).forEach(orderId => {
              allOrders.push({
                ...user.onlinestoreorders[orderId],
                userName: user.name || 'N/A',
                userEmail: user.email || 'N/A',
                userPhone: user.phone || user.onlinestoreorders[orderId].userPhone || 'N/A'
              });
            });
          }
        });

        setOrders(allOrders);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        switch (searchBy) {
          case 'orderId':
            return order.orderId?.toLowerCase().includes(searchLower);
          case 'userName':
            return order.userName?.toLowerCase().includes(searchLower);
          case 'userPhone':
            return order.userPhone?.toLowerCase().includes(searchLower);
          case 'productName':
            return order.items?.some(item => 
              item.name?.toLowerCase().includes(searchLower)
            );
          case 'all':
          default:
            return (
              order.orderId?.toLowerCase().includes(searchLower) ||
              order.userName?.toLowerCase().includes(searchLower) ||
              order.userPhone?.toLowerCase().includes(searchLower) ||
              order.items?.some(item => 
                item.name?.toLowerCase().includes(searchLower)
              )
            );
        }
      });
    }

    if (dateFrom || dateTo) {
      filtered = filtered.filter(order => {
        if (!order.orderTimestamp) return false;
        const orderDate = new Date(order.orderTimestamp);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;
        
        if (fromDate && orderDate < fromDate) return false;
        if (toDate && orderDate > toDate) return false;
        return true;
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.orderTimestamp || 0);
      const dateB = new Date(b.orderTimestamp || 0);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const paginateOrders = () => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    setDisplayedOrders(filteredOrders.slice(0, endIndex));
  };

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSearchBy('all');
    setDateFrom('');
    setDateTo('');
    setSortOrder('newest');
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusVariants = {
      'pending': 'warning',
      'processing': 'info',
      'paid': 'success',
      'completed': 'success',
      'cancelled': 'danger',
      'delivered': 'primary'
    };

    return (
      <Badge 
        bg={statusVariants[status] || 'secondary'}
        style={{
          padding: '8px 12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {status || 'N/A'}
      </Badge>
    );
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p style={{ marginTop: '20px', color: '#495057', fontSize: '1.1rem', fontWeight: '500' }}>
            Loading online store orders...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)'
      }}>
        <Container>
          <Alert variant="danger" style={{
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 5px 15px rgba(220, 53, 69, 0.3)'
          }}>
            {error}
          </Alert>
        </Container>
      </div>
    );
  }

  const hasMoreOrders = displayedOrders.length < filteredOrders.length;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)'
    }}>
      <Container fluid style={{ padding: '30px' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
          borderRadius: '20px 20px 0 0',
          padding: '30px',
          marginBottom: '0',
          boxShadow: '0 5px 20px rgba(42, 101, 197, 0.3)'
        }}>
          <Row className="align-items-center">
            <Col>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700', 
                margin: 0, 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Online Store Orders
              </h1>
              <p style={{ 
                color: 'rgba(255,255,255,0.9)', 
                margin: '8px 0 0 0', 
                fontSize: '1.1rem',
                fontWeight: '400'
              }}>
                Manage ready-made product orders
              </p>
            </Col>
            <Col xs="auto">
              <Button
                variant="light"
                onClick={fetchOrders}
                disabled={loading}
                style={{
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                }}
              >
                <RefreshCw size={16} />
                Refresh
              </Button>
            </Col>
          </Row>
        </div>

        {/* Filters and Search */}
        <Card style={{ 
          borderRadius: '0 0 20px 20px',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <Card.Body style={{ padding: '30px' }}>
            <Row className="g-3">
              <Col lg={4}>
                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                  Search Orders
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{
                    backgroundColor: '#f8f9fa',
                    border: '2px solid #e9ecef',
                    borderRight: 'none'
                  }}>
                    <Search size={16} color="#6c757d" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      border: '2px solid #e9ecef',
                      borderLeft: 'none',
                      borderRadius: '0 8px 8px 0',
                      padding: '12px'
                    }}
                  />
                </InputGroup>
              </Col>

              <Col lg={2}>
                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                  Search By
                </Form.Label>
                <Form.Select 
                  value={searchBy} 
                  onChange={(e) => setSearchBy(e.target.value)}
                  style={{
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                >
                  <option value="all">All Fields</option>
                  <option value="orderId">Order ID</option>
                  <option value="userName">Customer Name</option>
                  <option value="userPhone">Phone Number</option>
                  <option value="productName">Product Name</option>
                </Form.Select>
              </Col>

              <Col lg={2}>
                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                  Date From
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
              </Col>

              <Col lg={2}>
                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                  Date To
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
              </Col>

              <Col lg={2}>
                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                  Sort By
                </Form.Label>
                <ButtonGroup style={{ width: '100%' }}>
                  <Button
                    variant={sortOrder === 'newest' ? 'primary' : 'outline-primary'}
                    onClick={() => setSortOrder('newest')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      borderRadius: '8px 0 0 8px',
                      fontWeight: '600',
                      border: '2px solid #007bff'
                    }}
                  >
                    <SortDesc size={14} />
                    Newest
                  </Button>
                  <Button
                    variant={sortOrder === 'oldest' ? 'primary' : 'outline-primary'}
                    onClick={() => setSortOrder('oldest')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      borderRadius: '0 8px 8px 0',
                      fontWeight: '600',
                      border: '2px solid #007bff',
                      borderLeft: 'none'
                    }}
                  >
                    <SortAsc size={14} />
                    Oldest
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>

            <Row className="align-items-center mt-3">
              <Col>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px',
                  color: '#6c757d',
                  fontSize: '0.95rem'
                }}>
                  <span>
                    Showing <strong>{displayedOrders.length}</strong> of <strong>{filteredOrders.length}</strong> orders
                    {filteredOrders.length !== orders.length && ` (filtered from ${orders.length} total)`}
                  </span>
                </div>
              </Col>
              <Col xs="auto">
                <Button
                  variant="outline-secondary"
                  onClick={resetFilters}
                  style={{
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Filter size={14} />
                  Reset Filters
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Orders Table */}
        <Card style={{ 
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {displayedOrders.length === 0 ? (
            <Card.Body style={{ padding: '80px 20px', textAlign: 'center' }}>
              <ShoppingCart size={64} style={{ color: '#dee2e6', marginBottom: '20px' }} />
              <h4 style={{ color: '#6c757d', marginBottom: '10px' }}>No orders found</h4>
              <p style={{ color: '#adb5bd', margin: 0 }}>
                {filteredOrders.length === 0 && orders.length > 0 
                  ? 'Try adjusting your search filters'
                  : 'No online store orders have been placed yet'
                }
              </p>
            </Card.Body>
          ) : (
            <>
              <Table hover responsive style={{ margin: 0 }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
                    color: 'white'
                  }}>
                    <th style={{ padding: '20px 24px', fontWeight: '700', fontSize: '0.95rem', borderBottom: 'none', letterSpacing: '0.5px' }}>
                      Customer
                    </th>
                    <th style={{ padding: '20px 24px', fontWeight: '700', fontSize: '0.95rem', borderBottom: 'none', letterSpacing: '0.5px' }}>
                      Contact
                    </th>
                    <th style={{ padding: '20px 24px', fontWeight: '700', fontSize: '0.95rem', borderBottom: 'none', letterSpacing: '0.5px' }}>
                      Items
                    </th>
                    <th style={{ padding: '20px 24px', fontWeight: '700', fontSize: '0.95rem', borderBottom: 'none', letterSpacing: '0.5px' }}>
                      Order Date
                    </th>
                    <th style={{ padding: '20px 24px', fontWeight: '700', fontSize: '0.95rem', borderBottom: 'none', letterSpacing: '0.5px' }}>
                      Status
                    </th>
                    <th style={{ padding: '20px 24px', fontWeight: '700', fontSize: '0.95rem', borderBottom: 'none', letterSpacing: '0.5px', textAlign: 'center' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((order, index) => (
                    <tr 
                      key={order.orderId || index} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '1.1rem'
                          }}>
                            {order.userName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#343a40', fontSize: '1rem' }}>
                              {order.userName}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                              ID: {order.orderId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Phone size={14} style={{ color: '#6c757d' }} />
                            <span style={{ color: '#495057', fontSize: '0.9rem' }}>{order.userPhone}</span>
                          </div>
                          <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                            {order.userEmail}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShoppingCart size={16} style={{ color: '#6c757d' }} />
                          <div>
                            <div style={{ color: '#495057', fontSize: '0.9rem', fontWeight: '500' }}>
                              {order.itemCount || order.items?.length || 0} item{(order.itemCount || order.items?.length) !== 1 ? 's' : ''}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                              Total: ₹{order.totalPrice || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} style={{ color: '#6c757d' }} />
                          <div>
                            <div style={{ color: '#495057', fontSize: '0.9rem', fontWeight: '500' }}>
                              {order.orderTimestamp ? new Date(order.orderTimestamp).toLocaleDateString() : 'N/A'}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                              {order.orderTimestamp ? new Date(order.orderTimestamp).toLocaleTimeString() : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        {getStatusBadge(order.status)}
                      </td>
                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowDetails(order)}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              borderRadius: '8px',
                              fontWeight: '600',
                              padding: '8px 12px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Eye size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {hasMoreOrders && (
                <div style={{ 
                  padding: '30px', 
                  textAlign: 'center', 
                  borderTop: '1px solid #e9ecef',
                  backgroundColor: '#f8f9fa'
                }}>
                  <Button
                    variant="primary"
                    onClick={loadMore}
                    style={{
                      borderRadius: '12px',
                      padding: '12px 30px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      background: 'linear-gradient(316deg, rgb(219, 39, 119) 0%, rgb(190, 24, 93) 100%)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(219, 39, 119, 0.3)'
                    }}
                  >
                    Load More Orders ({filteredOrders.length - displayedOrders.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Order Details Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
          <Modal.Header 
            closeButton 
            style={{ 
              background: 'linear-gradient(316deg, rgb(219, 39, 119) 0%, rgb(190, 24, 93) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '15px 15px 0 0'
            }}
          >
            <Modal.Title style={{ 
              color: 'white', 
              fontWeight: '700',
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <ShoppingCart size={24} />
              Order Details - {selectedOrder?.userName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ 
            maxHeight: '70vh', 
            overflowY: 'auto', 
            padding: '30px',
            backgroundColor: '#f8f9fa'
          }}>
            {selectedOrder && (
              <Row className="g-4">
                {/* Order Information */}
                <Col md={6}>
                  <Card style={{ 
                    height: '100%',
                    border: 'none',
                    borderRadius: '15px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)'
                  }}>
                    <Card.Header style={{ 
                      background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px 15px 0 0',
                      padding: '16px 20px'
                    }}>
                      <h6 style={{ 
                        margin: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontWeight: '700',
                        gap: '8px'
                      }}>
                        <Package size={16} />
                        Order Information
                      </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: '20px' }}>
                      <div style={{ fontSize: '0.9rem', lineHeight: '2' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#495057' }}>Order ID:</strong> 
                          <span style={{ color: '#6c757d', marginLeft: '8px' }}>{selectedOrder.orderId || 'N/A'}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#495057' }}>Payment ID:</strong> 
                          <span style={{ color: '#6c757d', marginLeft: '8px' }}>{selectedOrder.paymentId || 'N/A'}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#495057' }}>Total Items:</strong> 
                          <span style={{ color: '#6c757d', marginLeft: '8px' }}>{selectedOrder.itemCount || selectedOrder.items?.length || 0}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#495057' }}>Email:</strong> 
                          <span style={{ color: '#6c757d', marginLeft: '8px' }}>{selectedOrder.userEmail}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#495057' }}>Phone:</strong> 
                          <span style={{ color: '#6c757d', marginLeft: '8px' }}>{selectedOrder.userPhone}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#495057' }}>Status:</strong> 
                          <span style={{ marginLeft: '8px' }}>{getStatusBadge(selectedOrder.status)}</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Pricing Summary */}
                <Col md={6}>
                  <Card style={{ 
                    height: '100%',
                    border: 'none',
                    borderRadius: '15px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)'
                  }}>
                    <Card.Header style={{ 
                      background: 'linear-gradient(135deg, #e12bf5ff 0%, #f5576c 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px 15px 0 0',
                      padding: '16px 20px'
                    }}>
                      <h6 style={{ 
                        margin: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontWeight: '700',
                        gap: '8px'
                      }}>
                        <DollarSign size={16} />
                        Pricing Summary
                      </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: '20px' }}>
                      <div style={{ fontSize: '0.9rem', lineHeight: '2' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#495057' }}>Subtotal:</strong> 
                          <span style={{ color: '#6c757d', marginLeft: '8px' }}>₹{selectedOrder.subtotal || 'N/A'}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#495057' }}>Customization:</strong> 
                          <span style={{ color: '#6c757d', marginLeft: '8px' }}>₹{selectedOrder.customizationCost || 0}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#495057' }}>Delivery Charge:</strong> 
                          <span style={{ color: '#6c757d', marginLeft: '8px' }}>₹{selectedOrder.deliveryCharge || 0}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#495057' }}>Savings:</strong> 
                          <span style={{ color: '#28a745', marginLeft: '8px' }}>₹{selectedOrder.savings || 0}</span>
                        </div>
                        <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '2px solid #e9ecef' }}>
                          <strong style={{ color: '#495057', fontSize: '1.1rem' }}>Total Paid:</strong> 
                          <span style={{ color: '#28a745', marginLeft: '8px', fontSize: '1.1rem', fontWeight: '700' }}>₹{selectedOrder.totalPrice || 'N/A'}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                          Order placed on {selectedOrder.orderTimestamp ? new Date(selectedOrder.orderTimestamp).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Delivery Address */}
                {selectedOrder.address && (
                  <Col md={12}>
                    <Card style={{ 
                      border: 'none',
                      borderRadius: '15px',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)'
                    }}>
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '15px 15px 0 0',
                        padding: '16px 20px'
                      }}>
                        <h6 style={{ 
                          margin: 0, 
                          display: 'flex', 
                          alignItems: 'center', 
                          fontWeight: '700',
                          gap: '8px'
                        }}>
                          <FileText size={16} />
                          Delivery Address
                        </h6>
                      </Card.Header>
                      <Card.Body style={{ padding: '20px' }}>
                        {typeof selectedOrder.address === 'object' ? (
                          <div style={{ lineHeight: '1.8' }}>
                            {selectedOrder.address.name && (
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', color: '#495057' }}>Name:</span> 
                                <span style={{ marginLeft: '8px', color: '#6c757d' }}>{selectedOrder.address.name}</span>
                              </div>
                            )}
                            {selectedOrder.address.addressLine1 && (
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', color: '#495057' }}>Address Line 1:</span> 
                                <span style={{ marginLeft: '8px', color: '#6c757d' }}>{selectedOrder.address.addressLine1}</span>
                              </div>
                            )}
                            {selectedOrder.address.addressLine2 && (
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', color: '#495057' }}>Address Line 2:</span> 
                                <span style={{ marginLeft: '8px', color: '#6c757d' }}>{selectedOrder.address.addressLine2}</span>
                              </div>
                            )}
                            {selectedOrder.address.city && (
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', color: '#495057' }}>City:</span> 
                                <span style={{ marginLeft: '8px', color: '#6c757d' }}>{selectedOrder.address.city}</span>
                              </div>
                            )}
                            {selectedOrder.address.state && (
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', color: '#495057' }}>State:</span> 
                                <span style={{ marginLeft: '8px', color: '#6c757d' }}>{selectedOrder.address.state}</span>
                              </div>
                            )}
                            {selectedOrder.address.pincode && (
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', color: '#495057' }}>Pincode:</span> 
                                <span style={{ marginLeft: '8px', color: '#6c757d' }}>{selectedOrder.address.pincode}</span>
                              </div>
                            )}
                            {selectedOrder.address.landmark && (
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', color: '#495057' }}>Landmark:</span> 
                                <span style={{ marginLeft: '8px', color: '#6c757d' }}>{selectedOrder.address.landmark}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#6c757d' }}>{selectedOrder.address}</span>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                )}

                {/* Items Section */}
                <Col md={12}>
                  <Card style={{ 
                    border: 'none',
                    borderRadius: '15px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)'
                  }}>
                    <Card.Header style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px 15px 0 0',
                      padding: '16px 20px'
                    }}>
                      <h6 style={{ 
                        margin: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontWeight: '700',
                        gap: '8px'
                      }}>
                        <ShoppingCart size={16} />
                        Ordered Items ({selectedOrder.items?.length || 0})
                      </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: '0' }}>
                      <Accordion>
                        {selectedOrder.items?.map((item, index) => (
                          <Accordion.Item eventKey={index.toString()} key={index}>
                            <Accordion.Header>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  {item.image && (
                                    <img 
                                      src={item.image} 
                                      alt={item.name} 
                                      style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        objectFit: 'cover', 
                                        borderRadius: '8px',
                                        border: '2px solid #e9ecef'
                                      }} 
                                    />
                                  )}
                                  <div>
                                    <div style={{ fontWeight: '600', color: '#343a40' }}>
                                      {item.name || `Item ${index + 1}`}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                      Qty: {item.quantity} × ₹{item.price || 0} = ₹{item.totalItemPrice || 0}
                                    </div>
                                  </div>
                                </div>
                                {item.off > 0 && (
                                  <Badge bg="success" style={{ padding: '6px 10px', borderRadius: '8px' }}>
                                    {item.off}% OFF
                                  </Badge>
                                )}
                              </div>
                            </Accordion.Header>
                            <Accordion.Body style={{ backgroundColor: '#f8f9fa' }}>
                              <Row className="g-3">
                                {/* Product Details */}
                                <Col md={6}>
                                  <Card style={{ border: '1px solid #e9ecef', borderRadius: '10px', height: '100%' }}>
                                    <Card.Body>
                                      <h6 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#495057', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Tag size={14} />
                                        Product Details
                                      </h6>
                                      <div style={{ fontSize: '0.85rem', lineHeight: '1.8' }}>
                                        <div><strong>Category:</strong> {item.category || 'N/A'}</div>
                                        <div><strong>Description:</strong> {item.description || 'N/A'}</div>
                                        {item.originalPrice > 0 && (
                                          <>
                                            <div><strong>Original Price:</strong> ₹{item.originalPrice}</div>
                                            <div><strong>Discount:</strong> {item.off}%</div>
                                          </>
                                        )}
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>

                                {/* Customization Details */}
                                {item.customization && (
                                  <Col md={6}>
                                    <Card style={{ border: '1px solid #e9ecef', borderRadius: '10px', height: '100%' }}>
                                      <Card.Body>
                                        <h6 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#495057', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <Percent size={14} />
                                          Customization
                                        </h6>
                                        <div style={{ fontSize: '0.85rem', lineHeight: '1.8' }}>
                                          {item.customization.bigText && (
                                            <div><strong>Big Text:</strong> {item.customization.bigText} ({item.customization.bigTextChars} chars)</div>
                                          )}
                                          {item.customization.mediumText && (
                                            <div><strong>Medium Text:</strong> {item.customization.mediumText} ({item.customization.mediumTextChars} chars)</div>
                                          )}
                                          {item.customization.smallText && (
                                            <div><strong>Small Text:</strong> {item.customization.smallText} ({item.customization.smallTextChars} chars)</div>
                                          )}
                                          {item.customization.specialInstructions && (
                                            <div><strong>Special Instructions:</strong> {item.customization.specialInstructions}</div>
                                          )}
                                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #dee2e6' }}>
                                            <strong>Customization Cost:</strong> ₹{item.customization.totalCustomizationCost || 0}
                                          </div>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                )}
                              </Row>
                            </Accordion.Body>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer style={{ 
            backgroundColor: '#f8f9fa', 
            borderTop: '1px solid #dee2e6',
            borderRadius: '0 0 15px 15px',
            padding: '20px 30px'
          }}>
            <Button 
              variant="secondary" 
              onClick={handleCloseModal}
              style={{
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: '600'
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminOrdersOnlineStore;