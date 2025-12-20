import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Input,
  InputGroup,
  InputGroupText,
  Table,
  Button,
  ButtonGroup,
    Pagination,
  PaginationItem,
  PaginationLink
} from 'reactstrap';
import { FaSearch } from 'react-icons/fa';
import Auth from "/src/utils/auth";

const QuickQuoteDashboard = () => {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotes = quotes.filter((q) =>
    q.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.phonenumber?.includes(searchTerm) ||
    q.postalcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

    // Paginated quotes
  const totalPages = Math.ceil(filteredQuotes.length / pageSize);
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

    const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleBook = () => {
    if (!selectedQuote) return;
    const bookingUrl = `/booking-dashboard?name=${encodeURIComponent(selectedQuote.name)}&email=${encodeURIComponent(selectedQuote.email || '')}&serviceType=${encodeURIComponent(selectedQuote.services[0]?.type || '')}&service=${encodeURIComponent(selectedQuote.services[0]?.service || '')}`;
    window.location.href = bookingUrl;
  };

  const handleAcknowledge = async () => {
    if (!selectedQuote) return;
    try {
      console.log(Auth.getProfile().data);
      const response = await fetch(`/api/quotes/quickquote/${selectedQuote._id}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedByUser: true, userId: Auth.getProfile().data._id }),
      });
      if (!response.ok) throw new Error('Failed to acknowledge quote');

      // Update local state to reflect acknowledgment
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) =>
          q._id === selectedQuote._id ? { ...q, acknowledgedByUser: true } : q
        )
      );
      alert('Quote acknowledged successfully!');
    } catch (err) {
      console.error('Error acknowledging quote:', err);
    }
  };

  const handleDeleteQuote = async () => {
    if (!selectedQuote) return;

    const confirmed = window.confirm('Are you sure you want to delete this quote?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/quotes/quickquote/${selectedQuote._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete quote');
      setQuotes(quotes.filter((q) => q._id !== selectedQuote._id));
      setSelectedQuote(null);
    } catch (err) {
      console.error('Error deleting quote:', err);
    }
  };

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch(`/api/quotes/quickquote?page=1&limit=${pageSize}`);
        if (!response.ok) throw new Error('Failed to fetch quotes');
        const data = await response.json();
        setQuotes(data.quotes || []);
      } catch (err) {
        console.error('Error fetching quotes:', err);
      }
    };

    fetchQuotes();
  }, [pageSize]);

  return (
    <Container fluid className="mt-3">
      <Row style={{ height: 'calc(100vh - 100px)' }}>
        {/* Left side: Quotes List */}
        <Col md={6} className="d-flex flex-column">
          <h5 className="mb-3">Submitted Quotes</h5>
          <InputGroup className="mb-3">
            <InputGroupText>
              <FaSearch />
            </InputGroupText>
            <Input
              placeholder="Search by name, phone, or postal code"
              value={searchTerm}
                         onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </InputGroup>

          <div className="flex-grow-1 overflow-auto">
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Postal Code</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              {/* <tbody>
                {filteredQuotes.map((quote) => (
                  <tr
                    key={quote._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedQuote(quote)}
                  >
                    <td>{quote.name}</td>
                    <td>{quote.phonenumber}</td>
                    <td>{quote.postalcode}</td>
                    <td>{new Date(quote.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {!filteredQuotes.length && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      No quotes found.
                    </td>
                  </tr>
                )}
              </tbody> */}
              <tbody>
                {paginatedQuotes.map((quote) => (
                  <tr
                    key={quote._id}
                    className={quote.acknowledgedByUser ? 'table-success' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedQuote(quote)}
                  >
                    <td>
                      {quote.name} {quote.acknowledgedByUser && <span className="text-success ms-2">✓</span>}
                    </td>
                    <td>{quote.phonenumber}</td>
                    <td>{quote.postalcode}</td>
                    <td>{new Date(quote.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {!paginatedQuotes.length && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      No quotes found.
                    </td>
                  </tr>
                )}
              </tbody>

            </Table>
          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-3">
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index} active={index + 1 === currentPage}>
                  <PaginationLink onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </Pagination>
          )}
          </div>
          {/* Pagination */}

        </Col>

        {/* Right side: Selected Quote Details */}
        <Col md={6} className="d-flex flex-column">
          {selectedQuote ? (
            <Card className="flex-grow-1">
              <CardHeader>
                <h6 className="mb-0">Quote Details</h6>
              </CardHeader>
              <CardBody className="d-flex flex-column">
                <p><strong>Name:</strong> {selectedQuote.name}</p>
                <p><strong>Email:</strong> {selectedQuote.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedQuote.phonenumber}</p>
                <p><strong>Company:</strong> {selectedQuote.companyName || 'N/A'}</p>
                <p><strong>Postal Code:</strong> {selectedQuote.postalcode}</p>
                <p><strong>Promo Code:</strong> {selectedQuote.promoCode || 'N/A'}</p>
                <p><strong>Submitted:</strong> {new Date(selectedQuote.createdAt).toLocaleString()}</p>
                {selectedQuote.acknowledgedByUser && (
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className="badge bg-success">Acknowledged</span>
                  </p>
                )}


                <hr />

                {/* Services */}
                <div>
                  <h6><strong>Services Requested:</strong></h6>
                  {selectedQuote.services?.length ? (
                    selectedQuote.services.map((service, index) => (
                      <div key={index} className="ms-3 mt-2">
                        <strong>• {service.type}: {service.service}</strong>
                        {service.customOptions && Object.keys(service.customOptions).length > 0 && (
                          <div className="ms-3 mt-1">
                            <em>Custom Options:</em>
                            {Object.values(service.customOptions).map((option, i) => (
                              <p key={i} className="mb-1">
                                {option.label ? `${option.label}: ` : ''}
                                {typeof option.service === 'boolean'
                                  ? option.service ? 'Yes' : 'No'
                                  : (option.service?.toString() || 'N/A')}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="ms-3">No services listed.</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3">
                  <ButtonGroup vertical className="w-100">
                    <Button color="primary" onClick={handleBook}>
                      Book This Job
                    </Button>
                    <Button
                      color="success"
                      onClick={handleAcknowledge}
                      disabled={selectedQuote?.acknowledgedByUser}
                    >
                      {selectedQuote?.acknowledgedByUser ? 'Already Acknowledged' : 'Acknowledge Quote'}
                    </Button>
                    <Button color="danger" onClick={handleDeleteQuote}>
                      Delete This Job
                    </Button>
                  </ButtonGroup>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="flex-grow-1 text-center text-muted d-flex align-items-center justify-content-center">
              <CardBody>Select a quote to view details</CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default QuickQuoteDashboard;
