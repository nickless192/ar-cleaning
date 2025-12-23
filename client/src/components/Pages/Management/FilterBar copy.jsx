import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Card, Collapse } from 'react-bootstrap';
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FilterBar = ({ 
  logs,
  pages, 
  selectedPage, 
  onPageChange, 
  dateRange, 
  onDateChange,
  deviceFilter,
  setDeviceFilter,
  browserFilter,
  setBrowserFilter,
  countryFilter,
  setCountryFilter,
  visitorTypeFilter,
  setVisitorTypeFilter
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uniqueBrowsers, setUniqueBrowsers] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);

  // Extract unique values when logs change
  useEffect(() => {
    if (logs && logs.length > 0) {
      // Get unique browsers
      const browsers = [...new Set(logs.map(log => log.browser).filter(Boolean))].sort();
      setUniqueBrowsers(browsers);
      
      // Get unique countries
      const countries = [...new Set(logs.map(log => log.geo?.country).filter(Boolean))].sort();
      setUniqueCountries(countries);
    }
  }, [logs]);

  const handlePageChange = (e) => {
    onPageChange(e.target.value);
  };

  const handleDateChange = (e) => {
    onDateChange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };
  
  const resetFilters = () => {
    onPageChange('');
    onDateChange({ start: '', end: '' });
    setDeviceFilter('');
    setBrowserFilter('');
    setCountryFilter('');
    setVisitorTypeFilter('');
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Filter Visitor Logs</h5>
          <div>
            <Button 
              variant="link" 
              className="text-decoration-none" 
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? (
                <>Advanced Filters <FaChevronUp size={14} /></>
              ) : (
                <>Advanced Filters <FaChevronDown size={14} /></>
              )}
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={resetFilters} className="ms-2">
              Reset Filters
            </Button>
          </div>
        </div>
        
        {/* Basic filters */}
        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Page</Form.Label>
              <Form.Select value={selectedPage} onChange={handlePageChange}>
                <option value="">All Pages</option>
                {pages.map((page, idx) => (
                  <option key={idx} value={page}>
                    {page}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
              />
            </Form.Group>
          </Col>
        </Row>
        
        {/* Advanced filters */}
        <Collapse in={showAdvanced}>
          <div>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Device Type</Form.Label>
                  <Form.Select 
                    value={deviceFilter} 
                    onChange={(e) => setDeviceFilter(e.target.value)}
                  >
                    <option value="">All Devices</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Browser</Form.Label>
                  <Form.Select 
                    value={browserFilter} 
                    onChange={(e) => setBrowserFilter(e.target.value)}
                  >
                    <option value="">All Browsers</option>
                    {uniqueBrowsers.map((browser, idx) => (
                      <option key={idx} value={browser}>
                        {browser}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Select 
                    value={countryFilter} 
                    onChange={(e) => setCountryFilter(e.target.value)}
                  >
                    <option value="">All Countries</option>
                    {uniqueCountries.map((country, idx) => (
                      <option key={idx} value={country}>
                        {country}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Visitor Type</Form.Label>
                  <Form.Select 
                    value={visitorTypeFilter} 
                    onChange={(e) => setVisitorTypeFilter(e.target.value)}
                  >
                    <option value="">All Visitors</option>
                    <option value="new">New Visitors</option>
                    <option value="returning">Returning Visitors</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

export default FilterBar;