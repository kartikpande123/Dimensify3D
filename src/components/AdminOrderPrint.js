// AdminOrderPrint.js
import React, { useEffect, useState, useMemo } from "react";
import { Button, Container, Table, Spinner, Row, Col, Form, InputGroup, Card } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import API_BASE_URL from "./apiConfig";

const AdminOrderPrint = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(40);

  // Fetch user + order data
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

  // Process and filter orders
  const processedOrders = useMemo(() => {
    let allOrders = [];
    
    // Flatten all orders from all users
    users.forEach((user, userIdx) => {
      if (user.orders) {
        Object.values(user.orders).forEach((order, orderIdx) => {
          // Handle multiple files or single file
          let fileName = "3D Print File";
          let fileCount = 1;
          
          if (order.files && Array.isArray(order.files)) {
            fileCount = order.files.length;
            fileName = fileCount > 1 
              ? `${fileCount} files (${order.files.map(f => f.originalName).join(', ')})` 
              : order.files[0]?.originalName || "3D Print File";
          } else {
            fileName = order.stlFileUrl?.split("/").pop() || order.stlFile?.name || "3D Print File";
          }
          
          const finalAmount = order.totalPrice || 0;
          const orderDate = order.orderTimestamp ? new Date(order.orderTimestamp) : new Date();
          
          allOrders.push({
            ...order,
            user,
            userIdx,
            orderIdx,
            fileName,
            fileCount,
            finalAmount,
            orderDate,
            searchableText: `${user.name} ${order.orderId} ${fileName}`.toLowerCase()
          });
        });
      }
    });

    // Apply search filter
    if (searchTerm) {
      allOrders = allOrders.filter(order => 
        order.searchableText.includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateRange.from || dateRange.to) {
      allOrders = allOrders.filter(order => {
        const orderDate = order.orderDate;
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to + 'T23:59:59') : null;
        
        return (!fromDate || orderDate >= fromDate) && (!toDate || orderDate <= toDate);
      });
    }

    // Apply sorting
    allOrders.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.orderDate) - new Date(a.orderDate);
        case "oldest":
          return new Date(a.orderDate) - new Date(b.orderDate);
        default:
          return 0;
      }
    });

    return allOrders;
  }, [users, searchTerm, sortOption, dateRange]);

  // Pagination
  const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
  const currentOrders = processedOrders.slice(0, currentPage * itemsPerPage);
  const hasMoreOrders = currentPage < totalPages;

  // Load more orders
  const loadMoreOrders = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption, dateRange]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSortOption("newest");
    setDateRange({ from: "", to: "" });
    setCurrentPage(1);
  };

  // Generate Professional PDF Invoice
  const generateInvoice = (user, order) => {
    const doc = new jsPDF();
    
    // Header - Company branding
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("DIMENSIFY3D", 14, 25);
    
    // Invoice title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text("Tax Invoice/Bill of Supply/Cash Memo", 120, 20);
    doc.setFontSize(12);
    doc.text("(Original for Recipient)", 135, 28);

    // Header underline - full width
    doc.line(14, 32, 196, 32);

    // Sold By section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Sold By :", 14, 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("DIMENSIFY3D", 14, 52);
    doc.text("Gulganjikoppa, Shivalli Plot,", 14, 58);
    doc.text("Raj Nagar, Dharwad, Karnataka 580008", 14, 64);
    doc.text("IN", 14, 70);

    // Billing Address section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Billing Address :", 120, 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${order.address?.name || user.name || "Customer"}`, 120, 52);
    doc.text(`${order.address?.addressLine1 || ""}`, 120, 58);
    doc.text(`${order.address?.city || ""}, ${order.address?.state || ""}`, 120, 64);
    doc.text(`${order.address?.pincode || ""}`, 120, 70);
    doc.text("IN", 120, 76);
    doc.text(`State/UT Code: ${order.address?.stateCode || "29"}`, 120, 82);

    // Shipping Address section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Shipping Address :", 120, 95);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${order.address?.name || user.name || "Customer"}`, 120, 102);
    doc.text(`${order.address?.addressLine1 || ""}`, 120, 108);
    doc.text(`${order.address?.city || ""}, ${order.address?.state || ""}`, 120, 114);
    doc.text(`${order.address?.pincode || ""}`, 120, 120);
    doc.text("IN", 120, 126);
    doc.text(`State/UT Code: ${order.address?.stateCode || "29"}`, 120, 132);

    // Order details section
    doc.setFontSize(10);
    doc.text(`Place of supply: ${order.address?.state || "KARNATAKA"}`, 120, 142);
    doc.text(`Place of delivery: ${order.address?.state || "KARNATAKA"}`, 120, 148);

    doc.text(`Order Number: ${order.orderId}`, 14, 105);
    doc.text(`Order Date: ${order.orderTimestamp ? new Date(order.orderTimestamp).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}`, 14, 111);
    
    doc.text(`Invoice Number: ${order.orderId}-INV`, 120, 158);
    doc.text(`Invoice Details: KA-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 120, 164);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-GB')}`, 120, 170);

    // Calculate amounts using actual order data structure
    const orderSubtotal = order.subtotal || 0; // Subtotal of all files
    const deliveryCharges = order.deliveryCharge || 40;
    const finalTotal = order.totalPrice || (orderSubtotal + deliveryCharges); // Final amount customer pays

    // Build table data for all files in the order
    const tableData = [];
    
    // Check if order has multiple files
    if (order.files && Array.isArray(order.files)) {
      // Multiple files - add each file as a row
      order.files.forEach((file, index) => {
        const fileName = file.originalName || "3D Print File";
        const unitPrice = file.unitPrice || 0;
        const quantity = file.quantity || 1;
        const totalPrice = file.totalPrice || (unitPrice * quantity);
        
        tableData.push([
          (index + 1).toString(),
          fileName,
          unitPrice.toFixed(2),
          quantity.toString(),
          totalPrice.toFixed(2)
        ]);
      });
    } else {
      // Single file (backward compatibility)
      const fileName = order.stlFileUrl?.split("/").pop() || order.stlFile?.name || "3D Print File";
      const unitPrice = order.unitPrice || 0;
      const quantity = order.quantity || 1;
      const totalPrice = order.subtotal || orderSubtotal;
      
      tableData.push([
        "1",
        fileName,
        unitPrice.toFixed(2),
        quantity.toString(),
        totalPrice.toFixed(2)
      ]);
    }
    
    // Add delivery charges row
    tableData.push([
      "",
      "Delivery Charges",
      deliveryCharges.toFixed(2),
      "1",
      deliveryCharges.toFixed(2)
    ]);

    // Create professional table with simplified structure
    autoTable(doc, {
      startY: 180,
      head: [["Sl. No.", "Description", "Unit Price", "Qty", "Total Amount"]],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: 9,
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });

    const finalY = doc.lastAutoTable.finalY || 220;

    // Total section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${finalTotal.toFixed(2)} INR`, 140, finalY + 10);

    // Amount in words
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Amount in Words:", 14, finalY + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(`${convertNumberToWords(finalTotal)} INR Only`, 14, finalY + 28);

    // Signature section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("For DIMENSIFY3D:", 140, finalY + 45);
    
    // Add signature line
    doc.line(140, finalY + 65, 190, finalY + 65);
    doc.setFont('helvetica', 'normal');
    doc.text("Authorized Signatory", 145, finalY + 70);

    // Tax note
    doc.setFontSize(8);
    doc.text("Whether tax is payable under reverse charge - No", 14, finalY + 50);

    // Footer note
    doc.setFontSize(7);
    doc.text("*ASSAM: Goods/Services Provided, BIHAR: Goods/Service Billed State/UT Code: 10, any other Damage/Defect shall only be Entertained if Raised within service tax are inclusive", 14, finalY + 85);
    doc.text("Customer Service e-inquiry: Any Issue on your order will be responded in 24 hrs and resolution will be provider via Online replacement subject for original Bill.", 14, finalY + 90);

    // Page number
    doc.text("Page 1 of 1", 180, finalY + 100);

    // Save PDF with professional naming
    doc.save(`Invoice_${order.orderId}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`);
  };

  // Enhanced Number to words conversion
  const convertNumberToWords = (num) => {
    const ones = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
      "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    if (num === 0) return "Zero";
    
    let words = "";
    
    if (num >= 10000000) {
      words += convertNumberToWords(Math.floor(num / 10000000)) + " Crore ";
      num %= 10000000;
    }
    
    if (num >= 100000) {
      words += convertNumberToWords(Math.floor(num / 100000)) + " Lakh ";
      num %= 100000;
    }
    
    if (num >= 1000) {
      words += convertNumberToWords(Math.floor(num / 1000)) + " Thousand ";
      num %= 1000;
    }
    
    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    
    if (num >= 20) {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += " " + ones[num % 10];
      }
    } else if (num > 0) {
      words += ones[num];
    }
    
    return words.trim();
  };

  return (
    <Container className="mt-4">
      {/* Header Section */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-gradient" style={{ 
          backgroundColor: 'linear-gradient(316deg, rgb(42, 101, 197) 0%, rgb(10, 80, 177) 100%)',
          border: '2px solid #0a50b1',
          borderRadius: '8px 8px 0 0'
        }}>
          <div className="d-flex justify-content-between align-items-center text-black">
            <h3 className="mb-0 fw-bold">
              <i className="fas fa-clipboard-list me-2"></i>
              Admin Orders Bill
            </h3>
            <div className="text-end">
              <div className="fs-6">Total Orders: <span className="fw-bold">{processedOrders.length}</span></div>
              <div className="fs-6 opacity-75">Showing: {currentOrders.length} of {processedOrders.length}</div>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body style={{ backgroundColor: '#ffffff', border: '2px solid #e9ecef' }}>
          {/* Filter Controls */}
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Label className="fw-semibold text-dark mb-1">
                <i className="fas fa-search me-1"></i>Search Orders
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by user name, order ID, or file name..."
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
                <i className="fas fa-sort me-1"></i>Sort By
              </Form.Label>
              <Form.Select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="border-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
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
            
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="outline-danger" 
                onClick={clearFilters}
                className="w-100"
                disabled={!searchTerm && sortOption === 'newest' && !dateRange.from && !dateRange.to}
              >
                <i className="fas fa-eraser me-1"></i>Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {loading ? (
        <Card className="text-center py-5">
          <Card.Body>
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 fs-5 text-muted">Loading orders...</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="shadow-sm border-0">
            <Table striped bordered hover responsive className="mb-0">
              <thead style={{ 
                background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)',
                border: '2px solid #495057'
              }}>
                <tr className="text-white">
                  <th className="border-end border-light">Sr. No.</th>
                  <th className="border-end border-light">User Name</th>
                  <th className="border-end border-light">Order ID</th>
                  <th className="border-end border-light">File Name</th>
                  <th className="border-end border-light">Order Date</th>
                  <th className="border-end border-light">Quantity</th>
                  <th className="border-end border-light">Unit Price</th>
                  <th className="border-end border-light">Final Amount</th>
                  <th className="border-end border-light">Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#f8f9fa' }}>
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center text-muted py-5">
                      <i className="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                      <div className="fs-5">No orders found</div>
                      <small>Try adjusting your filters</small>
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order, index) => (
                    <tr key={`${order.userIdx}-${order.orderIdx}`} className="align-middle">
                      <td className="text-center fw-semibold">{index + 1}</td>
                      <td className="fw-semibold text-primary">{order.user.name}</td>
                      <td><code className="bg-light p-1 rounded">{order.orderId}</code></td>
                      <td title={order.fileName} className="text-truncate" style={{maxWidth: '200px'}}>
                        <i className="fas fa-cube me-1 text-info"></i>
                        {order.fileCount > 1 ? (
                          <span>
                            <span className="badge bg-info me-1">{order.fileCount} files</span>
                            {order.files[0]?.originalName || "Multiple files"}
                          </span>
                        ) : (
                          order.fileName.length > 20 ? order.fileName.substring(0, 20) + "..." : order.fileName
                        )}
                      </td>
                      <td className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        {order.orderDate.toLocaleDateString('en-GB')}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary rounded-pill">
                          {order.fileCount > 1 ? `${order.fileCount} items` : (order.quantity || 1)}
                        </span>
                      </td>
                      <td className="text-end">
                        <span className="fw-bold text-info">
                          {order.fileCount > 1 ? 'Multiple' : `₹${order.unitPrice || 0}`}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="fw-bold text-success">₹{order.finalAmount}</div>
                        <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>
                          (₹{order.subtotal || 0} + ₹{order.deliveryCharge || 40} delivery)
                        </small>
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill ${
                          order.status === 'completed' ? 'bg-success' :
                          order.status === 'pending' ? 'bg-warning text-dark' : 
                          order.status === 'processing' ? 'bg-info' :
                          'bg-secondary'
                        }`}>
                          {order.status || 'N/A'}
                        </span>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => generateInvoice(order.user, order)}
                          className="d-flex align-items-center gap-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className="fas fa-download"></i>
                          Invoice
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
          
          {/* Load More Button */}
          {hasMoreOrders && (
            <div className="text-center mt-4">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={loadMoreOrders}
                className="px-5"
              >
                <i className="fas fa-plus-circle me-2"></i>
                Load More Orders ({itemsPerPage} more)
              </Button>
              <div className="mt-2 text-muted small">
                Showing {currentOrders.length} of {processedOrders.length} total orders
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="mt-4 text-center text-muted">
        <small>
          <i className="fas fa-info-circle me-1"></i>
          Click on "Invoice" button to download professional PDF invoice
        </small>
      </div>
    </Container>
  );
};

export default AdminOrderPrint;