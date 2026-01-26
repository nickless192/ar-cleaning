import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Table, Alert, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const GenerateInvoiceModal = ({ show, onHide, booking }) => {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState([]);

  // Existing invoice UI state
  const [existingInvoice, setExistingInvoice] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Submit feedback state
  const [submitting, setSubmitting] = useState(false);
  const [uiError, setUiError] = useState("");
  const [uiMsg, setUiMsg] = useState("");

  const bookingId = booking?._id || "";

  const hasServices = useMemo(() => Array.isArray(services) && services.length > 0, [services]);

  // Prefill fields from booking + safe default service lines
  useEffect(() => {
    if (!booking || !show) return;

    setUiError("");
    setUiMsg("");

    setCustomerName(booking.customerName || "");
    setCustomerEmail(booking.customerEmail || "");
    setDescription(booking.serviceType || "");

    const bookingServices = Array.isArray(booking.services) ? booking.services : [];

    if (bookingServices.length > 0) {
      setServices(
        bookingServices.map((s) => {
          const billingType = s.billingType === "hours" ? "hours" : "quantity";
          const hours = Number(s.hours) || 0;
          const quantity = Number(s.quantity) || 0;
          const price = Number(s.price) || 0;
          const amount = billingType === "hours" ? hours * price : quantity * price;

          return {
            serviceType: s.serviceType || "",
            description: s.description || "",
            billingType,
            hours,
            quantity,
            price,
            amount,
          };
        })
      );
    } else {
      // Legacy fallback if booking has no services[]
      const price = Number(booking.income) || 0;
      setServices([
        {
          serviceType: booking.serviceType || "",
          description: booking.serviceType || "",
          billingType: "quantity",
          hours: 0,
          quantity: 1,
          price,
          amount: 1 * price,
        },
      ]);
    }
  }, [booking, show]);

  // Check if an invoice already exists for the booking
  useEffect(() => {
    const checkExistingInvoice = async () => {
      setExistingInvoice(null);
      setUiError("");
      setUiMsg("");

      if (!show || !bookingId) return;

      setCheckingExisting(true);
      try {
        const res = await fetch(`/api/invoices/by-booking/${bookingId}`);
        if (!res.ok) {
          setExistingInvoice(null);
          return;
        }
        const data = await res.json();
        setExistingInvoice(data || null);
      } catch (e) {
        // don’t block the modal if lookup fails
        setExistingInvoice(null);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingInvoice();
  }, [bookingId, show]);

  const handleServiceChange = (index, field, rawValue) => {
    setServices((prev) => {
      const updated = [...prev];
      const svc = { ...updated[index] };

      let value = rawValue;
      if (field === "hours" || field === "quantity" || field === "price") {
        value = Number(rawValue) || 0;
      }

      svc[field] = value;

      // Normalize billing type
      const billingType =
        field === "billingType"
          ? (rawValue === "hours" ? "hours" : "quantity")
          : (svc.billingType === "hours" ? "hours" : "quantity");

      svc.billingType = billingType;

      const hours = Number(svc.hours) || 0;
      const quantity = Number(svc.quantity) || 0;
      const price = Number(svc.price) || 0;

      if (field === "hours" || field === "quantity" || field === "price" || field === "billingType") {
        svc.amount = billingType === "hours" ? hours * price : quantity * price;
      }

      updated[index] = svc;
      return updated;
    });
  };

  const addServiceRow = () => {
    setServices((prev) => [
      ...prev,
      { serviceType: "", description: "", billingType: "quantity", hours: 0, quantity: 1, price: 0, amount: 0 },
    ]);
  };

  const removeServiceRow = (index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!bookingId) {
      setUiError("Missing bookingId. Please close and re-open the modal.");
      return;
    }

    setSubmitting(true);
    setUiError("");
    setUiMsg("");

    try {
      // Keep current behavior: attempt create, backend will reject duplicates.
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        //   invoiceNumber: `INV-${Date.now()}`,
          customerName,
          customerEmail,
          description,
          services,
          bookingId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Show backend error clearly
        setUiError(data.message || data.error || "Error creating invoice.");
        return;
      }

      setUiMsg("Invoice created ✅");

      // After creating, refresh “existing invoice” banner + optionally navigate
      // If your API returns the created invoice object, you can navigate right away:
      // navigate(`/admin/invoices/${data._id || data.invoice?._id}`);
      // Otherwise, re-check by booking:
      try {
        const res2 = await fetch(`/api/invoices/by-booking/${bookingId}`);
        if (res2.ok) {
          const inv = await res2.json();
          setExistingInvoice(inv || null);
        }
      } catch {}

      onHide();
    } catch (err) {
      console.error("Network error creating invoice:", err);
      setUiError("Network error creating invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  const openExistingInvoice = () => {
    if (!existingInvoice?._id) return;
    onHide();
    navigate(`/invoices/${existingInvoice._id}`);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Generate Invoice</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Existing invoice warning (non-blocking) */}
        {checkingExisting ? (
          <div className="d-flex align-items-center gap-2 mb-3 text-muted">
            <Spinner animation="border" size="sm" />
            Checking existing invoices…
          </div>
        ) : existingInvoice ? (
          <Alert variant="warning" className="mb-3 d-flex justify-content-between align-items-start gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <strong>Invoice already exists for this booking.</strong>
                <Badge bg="dark">#{existingInvoice.invoiceNumber}</Badge>
              </div>
              <div className="mt-1" style={{ fontSize: 13 }}>
                For now, only <strong>one invoice per booking</strong> is allowed. (We’ll support multiple later.)
              </div>
            </div>

            <Button variant="outline-dark" size="sm" onClick={openExistingInvoice}>
              Open Invoice
            </Button>
          </Alert>
        ) : null}

        {/* submit feedback */}
        {uiMsg ? <Alert variant="success">{uiMsg}</Alert> : null}
        {uiError ? <Alert variant="danger">{uiError}</Alert> : null}

        <Form>
          {/* Booking info */}
          <Form.Group className="mb-3">
            <Form.Label>Booking ID</Form.Label>
            <Form.Control
              value={bookingId}
              readOnly
              className="text-cleanar-color text-bold form-input"
            />
            <div className="text-muted mt-1" style={{ fontSize: 12 }}>
              Read-only reference for linking invoice to the service booking.
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Customer Name</Form.Label>
            <Form.Control
              value={customerName}
              className="text-cleanar-color text-bold form-input"
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Customer Email</Form.Label>
            <Form.Control
              value={customerEmail}
              className="text-cleanar-color text-bold form-input"
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Invoice Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              className="text-cleanar-color text-bold form-input"
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Table bordered responsive>
            <thead>
              <tr>
                <th>Service Type / Description</th>
                <th>Billing</th>
                <th>Value</th>
                <th>Price</th>
                <th>Amount</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control
                      value={s.serviceType}
                      placeholder="Service"
                      className="text-cleanar-color text-bold form-input mb-2"
                      onChange={(e) => handleServiceChange(index, "serviceType", e.target.value)}
                    />
                    <Form.Control
                      value={s.description}
                      placeholder="Description"
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                    />
                  </td>

                  <td>
                    <Form.Select
                      value={s.billingType}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) => handleServiceChange(index, "billingType", e.target.value)}
                    >
                      <option value="hours">Hours</option>
                      <option value="quantity">Quantity</option>
                    </Form.Select>
                  </td>

                  <td>
                    {s.billingType === "hours" ? (
                      <Form.Control
                        type="number"
                        value={s.hours}
                        className="text-cleanar-color text-bold form-input"
                        onChange={(e) => handleServiceChange(index, "hours", e.target.value)}
                      />
                    ) : (
                      <Form.Control
                        type="number"
                        value={s.quantity}
                        className="text-cleanar-color text-bold form-input"
                        onChange={(e) => handleServiceChange(index, "quantity", e.target.value)}
                      />
                    )}
                  </td>

                  <td>
                    <Form.Control
                      type="number"
                      value={s.price}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                    />
                  </td>

                  <td className="fw-bold">{(Number(s.amount) || 0).toFixed(2)}</td>

                  <td>
                    {index > 0 && (
                      <Button variant="danger" size="sm" onClick={() => removeServiceRow(index)}>
                        X
                      </Button>
                    )}
                  </td>
                </tr>
              ))}

              {!hasServices ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No services added.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </Table>

          <Button variant="secondary" onClick={addServiceRow}>
            + Add Service
          </Button>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Cancel
        </Button>

        {/* Keep behavior: allow click even if invoice exists (backend will block),
            but make it visually clear */}
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Generating…" : "Generate Invoice"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GenerateInvoiceModal;
