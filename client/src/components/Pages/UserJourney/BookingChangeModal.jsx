import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const BookingChangeModal = ({ show, handleClose, handleSubmit, initialDate, initialServiceType }) => {
  const { t } = useTranslation();
  const [newDate, setNewDate] = useState(initialDate || "");
  const [comment, setComment] = useState("");
  const [serviceType, setServiceType] = useState(initialServiceType || "");

  const onSubmit = () => {
    if (!newDate || !serviceType) {
      alert("Please enter the new date and service type.");
      return;
    }
    if (newDate === new Date(initialDate).toISOString().split("T")[0] && serviceType === initialServiceType && comment.trim() === "") {
      alert("No changes made.");
      return;
    }
    // assign new values if they differ from initial values
    const updatedValues = {};
    if (newDate !== new Date(initialDate).toISOString().split("T")[0]) updatedValues.newDate = newDate;
    else updatedValues.newDate = null; // to indicate no change
    updatedValues.comment = comment;
    if (serviceType !== initialServiceType) updatedValues.serviceType = serviceType;
    else updatedValues.serviceType = null; // to indicate no change

    handleSubmit(updatedValues);
    setNewDate("");
    setComment("");
    setServiceType("");
    handleClose();
  };

  // Update state when initialDate changes
  useEffect(() => {
    if (initialDate && initialServiceType) {
      // convert to yyyy-mm-dd if initialDate is a Date object or ISO string
      const dateStr = new Date(initialDate).toISOString().split("T")[0];
      setNewDate(dateStr);
      setServiceType(initialServiceType);
    }
  }, [initialDate, initialServiceType]);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t("bookingChangeModal.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formServiceType" className="mb-3">
            <Form.Label>{t("bookingChangeModal.fields.serviceType")}</Form.Label>
            <Form.Control
              type="text"
              value={serviceType}
              className="form-input text-cleanar-color"
              placeholder={t("bookingChangeModal.fields.serviceType_placeholder")}
              onChange={(e) => setServiceType(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formNewDate" className="mb-3">
            <Form.Label>{t("bookingChangeModal.fields.date")}</Form.Label>
            <Form.Control
              type="date"
              value={newDate}
              className="form-input text-cleanar-color"
              onChange={(e) => setNewDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formComment" className="mb-3">
            <Form.Label>{t("bookingChangeModal.fields.comment")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="form-input text-cleanar-color"
              placeholder={t("bookingChangeModal.fields.comment_placeholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("bookingChangeModal.buttons.cancel")}
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          {t("bookingChangeModal.buttons.submit")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingChangeModal;
