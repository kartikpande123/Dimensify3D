import React, { useEffect, useState } from "react";
import { Card, Button, Badge, Spinner, Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import PI_BASE_URL from "./apiConfig"
import API_BASE_URL from "./apiConfig";

function HelpRequests() {
  const [requests, setRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch all help requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/help-request`);
      setRequests(res.data.data || {});
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update status
  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);
      await axios.put(`${API_BASE_URL}/api/help-request/${id}`, { status });
      await fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Sort and filter requests
  const getSortedRequests = () => {
    const requestsArray = Object.values(requests);
    
    // Filter by status
    const filteredRequests = requestsArray.filter(req => {
      if (filter === "all") return true;
      return req.status === filter;
    });

    // Filter by search term
    const searchFiltered = filteredRequests.filter(req => 
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.concern.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by status priority and date
    return searchFiltered.sort((a, b) => {
      // Priority: pending first, then resolved/rejected by latest date
      const statusPriority = { pending: 1, resolved: 2, rejected: 2 };
      const aPriority = statusPriority[a.status] || 3;
      const bPriority = statusPriority[b.status] || 3;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Within same priority, sort by date (latest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const getStatusBadgeProps = (status) => {
    switch (status) {
      case "pending":
        return { bg: "warning", text: "dark" };
      case "resolved":
        return { bg: "success" };
      case "rejected":
        return { bg: "danger" };
      default:
        return { bg: "secondary" };
    }
  };

  const getStatusCount = (status) => {
    return Object.values(requests).filter(req => req.status === status).length;
  };

  return (
    <div style={styles.body}>
      <Container fluid style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <i className="fas fa-headset" style={styles.icon}></i>
            Help Requests Management
          </h1>
          <p style={styles.subtitle}>Manage and resolve customer support requests</p>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} sm={6} className="mb-3">
            <Card style={styles.statsCard}>
              <Card.Body className="text-center">
                <div style={{...styles.statsNumber, color: '#ff9800'}}>{getStatusCount('pending')}</div>
                <div style={styles.statsLabel}>Pending</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card style={styles.statsCard}>
              <Card.Body className="text-center">
                <div style={{...styles.statsNumber, color: '#4caf50'}}>{getStatusCount('resolved')}</div>
                <div style={styles.statsLabel}>Resolved</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card style={styles.statsCard}>
              <Card.Body className="text-center">
                <div style={{...styles.statsNumber, color: '#f44336'}}>{getStatusCount('rejected')}</div>
                <div style={styles.statsLabel}>Rejected</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card style={styles.statsCard}>
              <Card.Body className="text-center">
                <div style={{...styles.statsNumber, color: '#2196f3'}}>{Object.keys(requests).length}</div>
                <div style={styles.statsLabel}>Total</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={styles.filterCard} className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={styles.filterLabel}>Search Requests</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={styles.inputGroupText}>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, email, ID, or concern..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={styles.searchInput}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={styles.filterLabel}>Filter by Status</Form.Label>
                  <Form.Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Requests List - Full Width Layout */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <Spinner animation="border" variant="primary" size="lg" />
            <p style={styles.loadingText}>Loading requests...</p>
          </div>
        ) : (
          <div style={styles.requestsContainer}>
            {getSortedRequests().length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Body className="text-center">
                  <i className="fas fa-inbox" style={styles.emptyIcon}></i>
                  <h4 style={styles.emptyTitle}>No requests found</h4>
                  <p style={styles.emptyText}>
                    {searchTerm || filter !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "No help requests have been submitted yet."}
                  </p>
                </Card.Body>
              </Card>
            ) : (
              getSortedRequests().map((req) => (
                <Card 
                  key={req.requestId} 
                  style={{
                    ...styles.requestCard,
                    ...(req.status === 'pending' ? styles.pendingCard : {})
                  }}
                  className="mb-4"
                >
                  <Card.Header style={styles.cardHeader}>
                    <div style={styles.cardHeaderContent}>
                      <div>
                        <strong style={styles.requestId}>#{req.requestId}</strong>
                        <Badge 
                          {...getStatusBadgeProps(req.status)} 
                          style={styles.statusBadge}
                        >
                          {req.status.toUpperCase()}
                        </Badge>
                      </div>
                      <small style={styles.dateText}>
                        {new Date(req.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </div>
                  </Card.Header>
                  <Card.Body style={styles.cardBody}>
                    <div style={styles.userInfo}>
                      <div style={styles.userAvatar}>
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.userDetails}>
                        <h5 style={styles.userName}>{req.name}</h5>
                        <div style={styles.contactInfo}>
                          <span style={styles.contactItem}>
                            <i className="fas fa-phone" style={styles.contactIcon}></i>
                            {req.phone}
                          </span>
                          <span style={styles.contactItem}>
                            <i className="fas fa-envelope" style={styles.contactIcon}></i>
                            {req.email || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.concernSection}>
                      <h6 style={styles.concernTitle}>Concern Details:</h6>
                      <p style={styles.concernText}>{req.concern}</p>
                    </div>

                    {req.screenshotUrl && (
                      <div style={styles.attachmentSection}>
                        <a
                          href={req.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.attachmentLink}
                        >
                          <i className="fas fa-image" style={styles.attachmentIcon}></i>
                          View Screenshot
                        </a>
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <div style={styles.actionButtons}>
                        <Button
                          variant="success"
                          disabled={updating === req.requestId}
                          onClick={() => updateStatus(req.requestId, "resolved")}
                          style={styles.actionButton}
                        >
                          {updating === req.requestId ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check" style={styles.buttonIcon}></i>
                              Resolve
                            </>
                          )}
                        </Button>
                        <Button
                          variant="danger"
                          disabled={updating === req.requestId}
                          onClick={() => updateStatus(req.requestId, "rejected")}
                          style={styles.actionButton}
                        >
                          {updating === req.requestId ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-times" style={styles.buttonIcon}></i>
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

const styles = {
  body: {
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  container: {
    padding: '2rem',
    maxWidth: '1400px'
  },
  header: {
    background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
    color: 'white',
    padding: '2rem',
    borderRadius: '15px',
    marginBottom: '2rem',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '600',
    margin: '0',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  icon: {
    marginRight: '1rem'
  },
  subtitle: {
    fontSize: '1.1rem',
    margin: '0.5rem 0 0 0',
    opacity: '0.9'
  },
  statsCard: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  statsNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0'
  },
  statsLabel: {
    fontSize: '0.9rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '500'
  },
  filterCard: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  filterLabel: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.5rem'
  },
  inputGroupText: {
    background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
    color: 'white',
    border: 'none'
  },
  searchInput: {
    border: '1px solid #e0e0e0',
    borderLeft: 'none'
  },
  filterSelect: {
    border: '1px solid #e0e0e0'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '4rem',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '15px',
    backdropFilter: 'blur(10px)'
  },
  loadingText: {
    marginTop: '1rem',
    color: '#666',
    fontSize: '1.1rem'
  },
  requestsContainer: {
    width: '100%'
  },
  emptyCard: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  emptyIcon: {
    fontSize: '4rem',
    color: '#ccc',
    marginBottom: '1rem'
  },
  emptyTitle: {
    color: '#666',
    marginBottom: '1rem'
  },
  emptyText: {
    color: '#888',
    fontSize: '1rem'
  },
  requestCard: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden',
    width: '100%'
  },
  pendingCard: {
    borderLeft: '4px solid #ff9800',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.12)'
  },
  cardHeader: {
    background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
    color: 'white',
    border: 'none',
    padding: '1rem 1.5rem'
  },
  cardHeaderContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  requestId: {
    fontSize: '1.1rem',
    marginRight: '1rem'
  },
  statusBadge: {
    fontSize: '0.75rem',
    padding: '0.4rem 0.8rem',
    fontWeight: '600'
  },
  dateText: {
    opacity: '0.9'
  },
  cardBody: {
    padding: '1.5rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginRight: '1rem'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.3rem',
    color: '#333'
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  contactItem: {
    fontSize: '0.9rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center'
  },
  contactIcon: {
    marginRight: '0.5rem',
    width: '14px'
  },
  concernSection: {
    marginBottom: '1.5rem'
  },
  concernTitle: {
    color: '#333',
    marginBottom: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600'
  },
  concernText: {
    color: '#555',
    lineHeight: '1.6',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    margin: '0'
  },
  attachmentSection: {
    marginBottom: '1.5rem'
  },
  attachmentLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#2196f3',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    background: 'rgba(33, 150, 243, 0.1)',
    borderRadius: '8px',
    transition: 'background 0.2s ease'
  },
  attachmentIcon: {
    marginRight: '0.5rem'
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  actionButton: {
    borderRadius: '8px',
    padding: '0.6rem 1.5rem',
    fontWeight: '600',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },
  buttonIcon: {
    marginRight: '0.5rem'
  }
};

export default HelpRequests;