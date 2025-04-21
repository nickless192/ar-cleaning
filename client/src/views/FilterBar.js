import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';

const FilterBar = ({ pages, selectedPage, onPageChange, dateRange, onDateChange }) => {
  const handlePageChange = (e) => {
    onPageChange(e.target.value);
  };

  const handleDateChange = (e) => {
    onDateChange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  return (
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
            className="mb-3 bg-light text-dark"
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
            className="mb-3 bg-light text-dark"
            onChange={handleDateChange}
          />
        </Form.Group>
      </Col>
    </Row>
  );
};

export default FilterBar;
