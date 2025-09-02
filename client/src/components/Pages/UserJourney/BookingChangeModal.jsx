import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const BookingChangeModal = ({ show, handleClose, handleSubmit, initialDate }) => {
  const [newDate, setNewDate] = useState(initialDate || "");
  const [comment, setComment] = useState("");

  const onSubmit = () => {
    if (!newDate) {
      alert("Please select a date.");
      return;
    }
    handleSubmit({ newDate, comment });
    setNewDate("");
    setComment("");
    handleClose();
  };

    // Update state when initialDate changes
  useEffect(() => {
    if (initialDate) {
      // convert to yyyy-mm-dd if initialDate is a Date object or ISO string
      const dateStr = new Date(initialDate).toISOString().split("T")[0];
      setNewDate(dateStr);
    }
  }, [initialDate]);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Request Service Change</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formNewDate" className="mb-3">
            <Form.Label>New Date</Form.Label>
            <Form.Control
              type="date"
              value={newDate}
              className="form-input text-cleanar-color"
              onChange={(e) => setNewDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formComment" className="mb-3">
            <Form.Label>Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="form-input text-cleanar-color"
              placeholder="Add details about the requested change..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          Submit Request
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingChangeModal;
