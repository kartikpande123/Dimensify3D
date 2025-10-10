import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import API_BASE_URL from './apiConfig';

const AdminTransaction = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data);
        calculateGrandTotal(result.data);
      } else {
        setError('Failed to fetch users data');
      }
    } catch (err) {
      setError('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrandTotal = (usersData) => {
    let total = 0;
    
    usersData.forEach(user => {
      if (user.orders) {
        Object.values(user.orders).forEach(order => {
          total += order.totalPrice || 0;
        });
      }
      
      if (user.onlinestoreorders) {
        Object.values(user.onlinestoreorders).forEach(order => {
          total += order.totalPrice || 0;
        });
      }
    });
    
    setGrandTotal(total);
  };

  const getAllOrders = () => {
    const allOrders = [];
    let serialNumber = 1;

    users.forEach(user => {
      // Process custom orders
      if (user.orders) {
        Object.entries(user.orders).forEach(([orderId, order]) => {
          const itemNames = order.files?.map(file => 
            `${file.originalName} (Qty: ${file.quantity || 1})`
          ).join(', ') || 'No items';
          const quantity = order.files?.reduce((sum, file) => sum + (file.quantity || 1), 0) || 0;
          
          allOrders.push({
            serialNumber: serialNumber++,
            type: 'Custom Order',
            itemNames,
            quantity,
            discountPrice: order.discountAmount ? `-₹${order.discountAmount}` : '-',
            deliveryCharges: order.deliveryCharge || 0,
            totalPrice: order.totalPrice || 0,
            orderId: order.orderId,
            userName: user.name,
            userPhone: user.phone,
            status: order.status || 'pending'
          });
        });
      }

      // Process online store orders
      if (user.onlinestoreorders) {
        Object.entries(user.onlinestoreorders).forEach(([orderId, order]) => {
          const itemNames = order.items?.map(item => 
            `${item.name} (Qty: ${item.quantity || 1})${item.customization ? ' 🔧 Custom' : ''}`
          ).join(', ') || 'No items';
          const quantity = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
          
          allOrders.push({
            serialNumber: serialNumber++,
            type: 'Online Store',
            itemNames,
            quantity,
            discountPrice: '-', // Always show '-' for online store orders
            deliveryCharges: order.deliveryCharge || 0,
            totalPrice: order.totalPrice || 0,
            orderId: order.orderId,
            userName: user.name,
            userPhone: user.phone,
            status: order.status || 'paid'
          });
        });
      }
    });

    return allOrders;
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)'
      }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Loading transactions...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)'
      }}>
        <Alert variant="danger" className="mt-4">
          <strong>Error:</strong> {error}
        </Alert>
      </Container>
    );
  }

  const orders = getAllOrders();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)',
      minHeight: '100vh',
      padding: '20px 0'
    }}>
      <Container fluid className="px-4">
        {/* Header with Grand Total */}
        <Card className="mb-4 shadow-lg border-0" style={{
          background: 'linear-gradient(316deg, rgb(42 101 197) 0%, rgb(10 80 177) 100%)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          <Card.Body className="text-white p-4">
            <Row className="align-items-center">
              <Col>
                <h2 className="mb-2 fw-bold">Transaction Dashboard</h2>
                <p className="mb-0 opacity-75">Complete overview of all customer orders and transactions</p>
              </Col>
              <Col xs="auto">
                <div className="text-center bg-white bg-opacity-20 rounded-3 p-3">
                  <h6 className="mb-1 opacity-90">Grand Total</h6>
                  <h2 className="mb-0 fw-bold text-warning">₹{grandTotal.toFixed(2)}</h2>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Summary Cards */}
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
              <Card.Body className="text-center">
                <h3 className="text-primary fw-bold">{orders.length}</h3>
                <p className="text-muted mb-0">Total Orders</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
              <Card.Body className="text-center">
                <h3 className="text-info fw-bold">
                  {orders.filter(order => order.type === 'Custom Order').length}
                </h3>
                <p className="text-muted mb-0">Custom Orders</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
              <Card.Body className="text-center">
                <h3 className="text-success fw-bold">
                  {orders.filter(order => order.type === 'Online Store').length}
                </h3>
                <p className="text-muted mb-0">Online Orders</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
              <Card.Body className="text-center">
                <h3 className="text-danger fw-bold">
                  {orders.filter(order => order.status === 'pending').length}
                </h3>
                <p className="text-muted mb-0">Pending Orders</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Orders Table */}
        <Card className="shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <Card.Header style={{ 
            background: 'linear-gradient(316deg, rgb(42 101 197) 0%, rgb(10 80 177) 100%)',
            border: 'none',
            padding: '1.5rem'
          }}>
            <Row className="align-items-center">
              <Col>
                <h4 className="mb-0 text-white fw-bold">
                  <i className="bi bi-list-check me-2"></i>
                  Order Details
                </h4>
              </Col>
              <Col xs="auto">
                <Badge bg="light" text="dark" className="fs-6">
                  {orders.length} Records
                </Badge>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            <div style={{ overflowX: 'auto' }}>
              <Table responsive hover className="mb-0">
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ 
                      padding: '20px 16px', 
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      borderBottom: '2px solid #e2e8f0'
                    }}>#</th>
                    <th style={{ 
                      padding: '20px 16px', 
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      borderBottom: '2px solid #e2e8f0'
                    }}>Order ID</th>
                    <th style={{ 
                      padding: '20px 16px', 
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      borderBottom: '2px solid #e2e8f0'
                    }}>Type</th>
                    <th style={{ 
                      padding: '20px 16px', 
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      borderBottom: '2px solid #e2e8f0'
                    }}>Items & Files</th>
                    <th style={{ 
                      padding: '20px 16px', 
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      borderBottom: '2px solid #e2e8f0',
                      textAlign: 'center'
                    }}>Qty</th>
                    <th style={{ 
                      padding: '20px 16px', 
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      borderBottom: '2px solid #e2e8f0',
                      textAlign: 'center'
                    }}>Discount</th>
                    <th style={{ 
                      padding: '20px 16px', 
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      borderBottom: '2px solid #e2e8f0',
                      textAlign: 'center'
                    }}>Delivery</th>
                    <th style={{ 
                      padding: '20px 16px', 
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      borderBottom: '2px solid #e2e8f0',
                      textAlign: 'right'
                    }}>Total</th>
                    <th style={{ 
                      padding: '20px 16px', 
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      borderBottom: '2px solid #e2e8f0'
                    }}>Customer</th>
                    <th style={{ 
                      padding: '20px 16px', 
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      borderBottom: '2px solid #e2e8f0'
                    }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-5" style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <div className="text-muted">
                          <i className="bi bi-inbox display-4 d-block mb-3"></i>
                          <h5>No orders found</h5>
                          <p>There are no transactions to display at the moment.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.serialNumber} style={{ 
                        fontSize: '0.85rem',
                        borderBottom: '1px solid #f1f5f9',
                        height: '80px'
                      }}>
                        <td style={{ 
                          padding: '20px 16px', 
                          verticalAlign: 'middle',
                          fontWeight: '600',
                          color: '#4a5568',
                          borderLeft: '4px solid transparent',
                          borderLeftColor: order.type === 'Custom Order' ? '#0dcaf0' : '#198754'
                        }}>
                          {order.serialNumber}
                        </td>
                        <td style={{ 
                          padding: '20px 16px', 
                          verticalAlign: 'middle',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem'
                        }}>
                          <div style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px'
                          }}>
                            {order.orderId}
                          </div>
                        </td>
                        <td style={{ padding: '20px 16px', verticalAlign: 'middle' }}>
                          <Badge 
                            bg={order.type === 'Custom Order' ? 'info' : 'success'}
                            className="px-3 py-2"
                            style={{ fontSize: '0.75rem', borderRadius: '10px' }}
                          >
                            {order.type}
                          </Badge>
                        </td>
                        <td style={{ 
                          padding: '20px 16px', 
                          verticalAlign: 'middle',
                          maxWidth: '300px'
                        }}>
                          <div style={{ 
                            lineHeight: '1.4',
                            maxHeight: '60px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {order.itemNames}
                          </div>
                        </td>
                        <td style={{ 
                          padding: '20px 16px', 
                          verticalAlign: 'middle', 
                          textAlign: 'center',
                          fontWeight: '600',
                          color: '#2d3748'
                        }}>
                          <span className="bg-light rounded-pill px-3 py-1">
                            {order.quantity}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '20px 16px', 
                          verticalAlign: 'middle', 
                          textAlign: 'center',
                          color: order.discountPrice !== '-' ? '#dc3545' : '#6c757d',
                          fontWeight: order.discountPrice !== '-' ? '600' : 'normal'
                        }}>
                          {order.discountPrice}
                        </td>
                        <td style={{ 
                          padding: '20px 16px', 
                          verticalAlign: 'middle', 
                          textAlign: 'center',
                          fontWeight: '500',
                          color: '#2d3748'
                        }}>
                          ₹{order.deliveryCharges}
                        </td>
                        <td style={{ 
                          padding: '20px 16px', 
                          verticalAlign: 'middle', 
                          textAlign: 'right',
                          fontWeight: '700',
                          color: '#059669',
                          fontSize: '0.9rem'
                        }}>
                          ₹{order.totalPrice}
                        </td>
                        <td style={{ 
                          padding: '20px 16px', 
                          verticalAlign: 'middle'
                        }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#2d3748' }}>
                              {order.userName}
                            </div>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {order.userPhone}
                            </small>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '20px 16px', 
                          verticalAlign: 'middle'
                        }}>
                          <Badge 
                            bg={getStatusVariant(order.status)}
                            className="px-3 py-2"
                            style={{ fontSize: '0.75rem', borderRadius: '10px' }}
                          >
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Footer Summary */}
        {orders.length > 0 && (
          <Card className="mt-4 shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <Row className="text-center">
                <Col>
                  <small className="text-muted d-block">Total Revenue</small>
                  <h4 className="mb-0 text-success fw-bold">₹{grandTotal.toFixed(2)}</h4>
                </Col>
                <Col>
                  <small className="text-muted d-block">Custom Orders Revenue</small>
                  <h5 className="mb-0 text-info">
                    ₹{orders
                      .filter(order => order.type === 'Custom Order')
                      .reduce((sum, order) => sum + order.totalPrice, 0)
                      .toFixed(2)}
                  </h5>
                </Col>
                <Col>
                  <small className="text-muted d-block">Online Store Revenue</small>
                  <h5 className="mb-0 text-success">
                    ₹{orders
                      .filter(order => order.type === 'Online Store')
                      .reduce((sum, order) => sum + order.totalPrice, 0)
                      .toFixed(2)}
                  </h5>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default AdminTransaction;