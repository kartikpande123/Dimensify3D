import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Table, 
  Button, 
  Badge, 
  Spinner, 
  Alert, 
  Row, 
  Col,
  Form,
  InputGroup,
  Dropdown,
  ButtonGroup,
  Modal,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import { 
  Package, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Edit3,
  Save,
  X,
  Check,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Phone,
  FileText
} from 'lucide-react';
import API_BASE_URL from './apiConfig';

const OrderUpdate = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(20);

  // Status dropdown filter
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Status options for 3D printing workflow
  const statusOptions = [
    { value: 'pending', label: 'Pending', variant: 'warning' },
    { value: 'processing', label: 'Processing', variant: 'info' },
    { value: 'printing', label: 'Printing', variant: 'primary' },
    { value: 'quality_check', label: 'Quality Check', variant: 'secondary' },
    { value: 'packaging', label: 'Packaging', variant: 'dark' },
    { value: 'shipped', label: 'Shipped', variant: 'info' },
    { value: 'delivered', label: 'Delivered', variant: 'success' },
    { value: 'cancelled', label: 'Cancelled', variant: 'danger' },
    { value: 'refunded', label: 'Refunded', variant: 'warning' }
  ];

  // Status dropdown options
  const statusDropdownOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending Orders' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled_refunded', label: 'Cancelled/Refunded' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, searchBy, statusFilter, dateFrom, dateTo, sortOrder, selectedStatus]);

  useEffect(() => {
    paginateOrders();
  }, [filteredOrders, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`);
      const result = await response.json();

      if (result.success) {
        // Extract all orders from all users with user info
        const allOrders = [];
        result.data.forEach(user => {
          if (user.orders) {
            // Use the userKey (Firebase key) for API calls
            const actualUserId = user.userKey || user.userId;
            Object.keys(user.orders).forEach(orderKey => {
              allOrders.push({
                ...user.orders[orderKey],
                orderKey, // Add the Firebase order key for API calls
                userId: actualUserId, // This will be the Firebase key like "1757862423766_f8swxrxjo"
                userName: user.name || 'N/A',
                userEmail: user.email || 'N/A',
                userPhone: user.phone || user.orders[orderKey].phone || 'N/A',
                // Set default status if not present
                status: user.orders[orderKey].status || 'pending'
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

    // Apply status dropdown filter
    if (selectedStatus !== 'all') {
      switch (selectedStatus) {
        case 'pending':
          filtered = filtered.filter(order => order.status === 'pending');
          break;
        case 'in_progress':
          filtered = filtered.filter(order => 
            ['processing', 'printing', 'quality_check', 'packaging'].includes(order.status)
          );
          break;
        case 'completed':
          filtered = filtered.filter(order => 
            ['shipped', 'delivered'].includes(order.status)
          );
          break;
        case 'cancelled_refunded':
          filtered = filtered.filter(order => 
            ['cancelled', 'refunded'].includes(order.status)
          );
          break;
        default:
          break;
      }
    }

    // Apply search filter
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
          case 'fileName':
            // Check all files in the order
            if (order.files && order.files.length > 0) {
              return order.files.some(file => 
                file.originalName?.toLowerCase().includes(searchLower)
              );
            }
            return false;
          case 'all':
          default:
            return (
              order.orderId?.toLowerCase().includes(searchLower) ||
              order.userName?.toLowerCase().includes(searchLower) ||
              order.userPhone?.toLowerCase().includes(searchLower) ||
              (order.files && order.files.some(file => 
                file.originalName?.toLowerCase().includes(searchLower)
              ))
            );
        }
      });
    }

    // Apply status filter (from the existing filter)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply date filter
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

    // Apply sorting
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
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortOrder('newest');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  // Fixed updateOrderStatus function
  const updateOrderStatus = async (orderKey, userId, newStatus) => {
    try {
      setUpdatingOrders(prev => new Set(prev).add(orderKey));

      // Use orderKey instead of orderId in the API call
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/orders/${orderKey}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state using orderKey
        setOrders(prev => prev.map(order => 
          order.orderKey === orderKey 
            ? { ...order, status: newStatus, updatedAt: result.data.updatedAt }
            : order
        ));

        showNotification(`Order ${result.data.orderId} status updated to ${newStatus}`, 'success');
      } else {
        showNotification(result.message || 'Failed to update order status', 'danger');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Error updating order status: ' + error.message, 'danger');
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderKey);
        return newSet;
      });
    }
  };

  const showNotification = (message, variant) => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    const variant = statusOption ? statusOption.variant : 'secondary';
    
    return (
      <Badge 
        bg={variant}
        style={{
          padding: '8px 12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {statusOption ? statusOption.label : (status || 'N/A')}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color="#ffc107" />;
      case 'processing':
      case 'printing':
        return <RefreshCw size={16} color="#17a2b8" />;
      case 'quality_check':
        return <AlertCircle size={16} color="#6c757d" />;
      case 'packaging':
        return <Package size={16} color="#343a40" />;
      case 'shipped':
        return <RefreshCw size={16} color="#17a2b8" />;
      case 'delivered':
        return <Check size={16} color="#28a745" />;
      case 'cancelled':
      case 'refunded':
        return <X size={16} color="#dc3545" />;
      default:
        return <AlertCircle size={16} color="#6c757d" />;
    }
  };

  // Function to render file names for an order
  const renderFileNames = (order) => {
    if (!order.files || order.files.length === 0) {
      return 'No files';
    }

    return (
      <div>
        {order.files.map((file, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '0.85rem'
            }}>
              <FileText size={12} style={{ color: '#6c757d', flexShrink: 0 }} />
              <span style={{ 
                color: '#495057', 
                fontWeight: '500',
                wordBreak: 'break-word'
              }}>
                {file.originalName || `File ${index + 1}`}
              </span>
            </div>
            {index < order.files.length - 1 && (
              <div style={{ 
                height: '1px', 
                backgroundColor: '#e9ecef', 
                margin: '4px 0',
                marginLeft: '18px'
              }} />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: `linear-gradient(135deg,
          #f5f5f5 0%,  
          #e9edf2 25%,  
          #dce2e8 50%,   
          #cfd6dd 75%,  
          #e9edf2 100%)`
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
            Loading orders...
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
        background: `linear-gradient(135deg,
          #f5f5f5 0%,  
          #e9edf2 25%,  
          #dce2e8 50%,   
          #cfd6dd 75%,  
          #e9edf2 100%)`
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
      background: `linear-gradient(135deg,
        #f5f5f5 0%,  
        #e9edf2 25%,  
        #dce2e8 50%,   
        #cfd6dd 75%,  
        #e9edf2 100%)`
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
                Order Status Management
              </h1>
              <p style={{ 
                color: 'rgba(255,255,255,0.9)', 
                margin: '8px 0 0 0', 
                fontSize: '1.1rem',
                fontWeight: '400'
              }}>
                Update and track order statuses
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

        {/* Status Dropdown Filter */}
        <Card style={{ 
          borderRadius: '0',
          border: 'none',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
          marginBottom: '0'
        }}>
          <Card.Body style={{ padding: '20px 30px' }}>
            <Row className="align-items-center">
              <Col md={4}>
                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                  Filter by Status
                </Form.Label>
                <Form.Select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: '500'
                  }}
                >
                  {statusDropdownOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={8} className="text-end">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px',
                  color: '#6c757d',
                  fontSize: '0.95rem',
                  justifyContent: 'flex-end'
                }}>
                  <span>
                    Showing <strong>{displayedOrders.length}</strong> of <strong>{filteredOrders.length}</strong> orders
                    {filteredOrders.length !== orders.length && ` (filtered from ${orders.length} total)`}
                  </span>
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
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Filters and Search */}
        <Card style={{ 
          borderRadius: '0 0 20px 20px',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <Card.Body style={{ padding: '30px' }}>
            <Row className="g-3">
              {/* Search */}
              <Col lg={3}>
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

              {/* Search By */}
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
                  <option value="fileName">File Name</option>
                </Form.Select>
              </Col>

              {/* Status Filter */}
              <Col lg={2}>
                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                  Status Filter
                </Form.Label>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Select>
              </Col>

              {/* Date From */}
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

              {/* Date To */}
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

              {/* Sort */}
              <Col lg={1}>
                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                  Sort
                </Form.Label>
                <ButtonGroup style={{ width: '100%' }}>
                  <Button
                    variant={sortOrder === 'newest' ? 'primary' : 'outline-primary'}
                    onClick={() => setSortOrder('newest')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px 0 0 8px',
                      fontWeight: '600',
                      border: '2px solid #007bff',
                      fontSize: '0.8rem',
                      padding: '12px 8px'
                    }}
                    title="Newest First"
                  >
                    <SortDesc size={14} />
                  </Button>
                  <Button
                    variant={sortOrder === 'oldest' ? 'primary' : 'outline-primary'}
                    onClick={() => setSortOrder('oldest')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '0 8px 8px 0',
                      fontWeight: '600',
                      border: '2px solid #007bff',
                      borderLeft: 'none',
                      fontSize: '0.8rem',
                      padding: '12px 8px'
                    }}
                    title="Oldest First"
                  >
                    <SortAsc size={14} />
                  </Button>
                </ButtonGroup>
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
              <Package size={64} style={{ color: '#dee2e6', marginBottom: '20px' }} />
              <h4 style={{ color: '#6c757d', marginBottom: '10px' }}>No orders found</h4>
              <p style={{ color: '#adb5bd', margin: 0 }}>
                {filteredOrders.length === 0 && orders.length > 0 
                  ? 'Try adjusting your search filters'
                  : 'No orders have been placed yet'
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
                    <th style={{ 
                      padding: '20px 24px', 
                      fontWeight: '700', 
                      fontSize: '0.95rem',
                      borderBottom: 'none',
                      letterSpacing: '0.5px'
                    }}>
                      Order Details
                    </th>
                    <th style={{ 
                      padding: '20px 24px', 
                      fontWeight: '700', 
                      fontSize: '0.95rem',
                      borderBottom: 'none',
                      letterSpacing: '0.5px'
                    }}>
                      Customer
                    </th>
                    <th style={{ 
                      padding: '20px 24px', 
                      fontWeight: '700', 
                      fontSize: '0.95rem',
                      borderBottom: 'none',
                      letterSpacing: '0.5px'
                    }}>
                      Files
                    </th>
                    <th style={{ 
                      padding: '20px 24px', 
                      fontWeight: '700', 
                      fontSize: '0.95rem',
                      borderBottom: 'none',
                      letterSpacing: '0.5px'
                    }}>
                      Current Status
                    </th>
                    <th style={{ 
                      padding: '20px 24px', 
                      fontWeight: '700', 
                      fontSize: '0.95rem',
                      borderBottom: 'none',
                      letterSpacing: '0.5px',
                      textAlign: 'center'
                    }}>
                      Update Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((order, index) => (
                    <tr 
                      key={order.orderKey || index} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#343a40', fontSize: '1rem', marginBottom: '4px' }}>
                            {order.orderId || 'N/A'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6c757d', fontSize: '0.85rem' }}>
                            <Calendar size={12} />
                            {order.orderTimestamp ? new Date(order.orderTimestamp).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </td>
                      
                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                            <div style={{ fontWeight: '600', color: '#343a40', fontSize: '0.95rem' }}>
                              {order.userName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6c757d', fontSize: '0.8rem' }}>
                              <Phone size={12} />
                              {order.userPhone}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        {renderFileNames(order)}
                      </td>

                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </td>

                      <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="outline-primary"
                              disabled={updatingOrders.has(order.orderKey)}
                              style={{
                                borderRadius: '8px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                border: '2px solid #007bff'
                              }}
                            >
                              {updatingOrders.has(order.orderKey) ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <Edit3 size={14} />
                              )}
                              Update
                            </Dropdown.Toggle>

                            <Dropdown.Menu style={{ minWidth: '200px' }}>
                              {statusOptions.map(option => (
                                <Dropdown.Item
                                  key={option.value}
                                  onClick={() => updateOrderStatus(order.orderKey, order.userId, option.value)}
                                  disabled={order.status === option.value}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px'
                                  }}
                                >
                                  {getStatusIcon(option.value)}
                                  <Badge bg={option.variant} style={{ fontSize: '0.7rem' }}>
                                    {option.label}
                                  </Badge>
                                  {order.status === option.value && (
                                    <Check size={14} color="#28a745" style={{ marginLeft: 'auto' }} />
                                  )}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Load More Button */}
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
                      background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(42, 101, 197, 0.3)',
                      transform: 'translateY(0)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(42, 101, 197, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(42, 101, 197, 0.3)';
                    }}
                  >
                    Load More Orders ({filteredOrders.length - displayedOrders.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </Container>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto" style={{ color: toastVariant === 'success' ? '#155724' : '#721c24' }}>
              {toastVariant === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body style={{ color: 'white' }}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default OrderUpdate;