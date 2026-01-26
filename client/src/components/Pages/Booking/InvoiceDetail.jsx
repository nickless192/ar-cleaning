import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
  Table,
  Form
} from "react-bootstrap";

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

const InvoiceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");


  const goToBookingTab = () => {
    navigate("/admin/booking", {
      state: { activeTab: "booking-dashboard-main" },
    });
  };

  const goToInvoicesTab = () => {
    navigate("/admin/booking", {
      state: { activeTab: "invoices" },
    });
  };

  // Actions state
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const servicesTotal = useMemo(() => {
    if (!invoice?.services?.length) return 0;
    return invoice.services.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  }, [invoice]);

  const fetchInvoice = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) throw new Error("Invoice not found");
      const data = await res.json();
      setInvoice(data);
      // If invoice already has payment history, prefill last method (optional)
const lastPayment = Array.isArray(data.payment) && data.payment.length
  ? data.payment[data.payment.length - 1]
  : null;

setPaymentMethod(lastPayment?.paymentMethod || "");

    } catch (e) {
      setErr(e.message || "Failed to load invoice.");
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      setMsg("");
      setErr("");
      setDownloading(true);

      // simplest UX: open in a new tab (server returns application/pdf)
      window.open(`/api/invoices/${id}/pdf`, "_blank", "noopener,noreferrer");
      setMsg("Opening PDF…");
    } catch (e) {
      setErr(e.message || "Failed to open PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handleSendToCustomer = async () => {
    if (!invoice) return;

    try {
      setMsg("");
      setErr("");
      setSending(true);

      // You can include options (cc admin, custom message, etc.) later
      const res = await fetch(`/api/invoices/${id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // optional: if your invoice doc doesn’t store email, your backend can read from booking/customer
          // customerEmail: invoice.customerEmail,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to send invoice email.");

      setMsg(data.message || "Invoice email sent ✅");
      await fetchInvoice(); // refresh to reflect sentAt / flags
    } catch (e) {
      setErr(e.message || "Failed to send invoice email.");
    } finally {
      setSending(false);
    }
  };

  const handleSetStatus = async (nextStatus) => {
    try {
      setMsg("");
      setErr("");
      setUpdatingStatus(true);

      const res = await fetch(`/api/invoices/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update status.");

      setMsg(`Invoice marked as ${nextStatus.toUpperCase()} ✅`);
      await fetchInvoice();
    } catch (e) {
      setErr(e.message || "Failed to update invoice status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <div className="text-muted mt-2">Loading invoice…</div>
      </Container>
    );
  }

  if (!invoice) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="mb-3">
          {err || "Invoice not found."}
        </Alert>
        <Button variant="outline-secondary" onClick={() => window.history.back()}>
          Go back
        </Button>
      </Container>
    );
  }

  const handleMarkPaid = async () => {
  if (!invoice) return;

  if (!paymentMethod) {
    setErr("Please select a payment method before marking as paid.");
    return;
  }

  try {
    setMsg("");
    setErr("");
    setUpdatingStatus(true);

    const amount = Number(invoice.totalCost ?? servicesTotal) || 0;

    // matches what InvoiceList does today
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "paid",
        paymentMethod,
        amount,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Failed to mark invoice as paid.");

    setMsg(`Invoice marked as PAID ✅`);
    await fetchInvoice();
  } catch (e) {
    setErr(e.message || "Failed to mark invoice as paid.");
  } finally {
    setUpdatingStatus(false);
  }
};


  const statusVariant = invoice.status === "paid" ? "success" : "warning";

  // Optional: if you add these fields later
  const sentAt = invoice.sentAt || invoice.invoiceSentAt || null;
  const createdAt = invoice.createdAt ? new Date(invoice.createdAt) : null;

  return (
    <Container className="py-4">
      {/* Top feedback */}
      {msg ? <Alert variant="success">{msg}</Alert> : null}
      {err ? <Alert variant="danger">{err}</Alert> : null}
      <div className="d-flex gap-2 flex-wrap mb-3">
        <Row className="align-items-start g-3">
          <Col md={7}>
            <Button variant="outline-secondary" onClick={goToBookingTab}>
              Back to Booking
            </Button>
          </Col>
          <Col md={7} className="text-md-end">

            <Button variant="outline-primary" onClick={goToInvoicesTab}>
              Back to Invoices
            </Button>
          </Col>
        </Row>
      </div>


      {/* Header + actions */}
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row className="align-items-start g-3">
            <Col md={7}>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h3 className="mb-0">Invoice</h3>
                <Badge bg="dark">#{invoice.invoiceNumber}</Badge>
                <Badge bg={statusVariant} text={statusVariant === "warning" ? "dark" : "white"}>
                  {invoice.status?.toUpperCase() || "UNPAID"}
                </Badge>
              </div>

              <div className="text-muted mt-2">
                {createdAt ? (
                  <div>
                    Created: <strong>{createdAt.toLocaleString()}</strong>
                  </div>
                ) : null}

                <div className="mt-1">
                  Customer: <strong>{invoice.customerName}</strong>
                </div>
                <div className="mt-1">
                  Email: <strong>{invoice.customerEmail}</strong>
                </div>

                {invoice.description ? (
                  <div className="mt-1">
                    Description: <span>{invoice.description}</span>
                  </div>
                ) : null}

                {invoice.bookingId ? (
                  <div className="mt-1">
                    Booking:{" "}
                    <Link
                      to={`/admin/booking`}
                      state={{
                        highlightBookingId: typeof invoice.bookingId === "string" ? invoice.bookingId : invoice.bookingId?._id,
                        reopenBookingModal: true,
                      }}
                    >
                      Open booking
                    </Link>
                  </div>
                ) : null}
              </div>
            </Col>

            <Col md={5}>
              <Card className="bg-light border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Subtotal</span>
                    <strong>{money(servicesTotal)}</strong>
                  </div>

                  {/* If later you add tax/discount to invoice, show them here */}
                  {/* <div className="d-flex justify-content-between">
                    <span className="text-muted">Tax</span>
                    <strong>{money(invoice.tax)}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Discount</span>
                    <strong>-{money(invoice.discount)}</strong>
                  </div> */}

                  <hr className="my-2" />

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Total</span>
                    <h4 className="mb-0">{money(invoice.totalCost ?? servicesTotal)}</h4>
                  </div>
                  <Form.Group className="mt-3">
  <Form.Label className="mb-1">Payment Method</Form.Label>
  <Form.Select
    value={paymentMethod}
    disabled={invoice.status === "paid"}
    onChange={(e) => setPaymentMethod(e.target.value)}
    aria-label="Select payment method"
  >
    <option value="" disabled>
      Select Method
    </option>
    <option value="cash">Cash</option>
    <option value="credit_card">Credit Card</option>
    <option value="bank_transfer">Bank Transfer</option>
    <option value="check">Check</option>
    <option value="other">Other</option>
  </Form.Select>
</Form.Group>
<div className="mt-3 d-flex gap-2 flex-wrap">
  <Button
    variant="primary"
    onClick={handleSendToCustomer}
    disabled={sending}
  >
    {sending ? (
      <>
        <Spinner animation="border" size="sm" className="me-2" />
        Sending…
      </>
    ) : (
      "Send to Customer"
    )}
  </Button>

  <Button
    variant="outline-dark"
    onClick={handleDownloadPdf}
    disabled={downloading}
  >
    {downloading ? (
      <>
        <Spinner animation="border" size="sm" className="me-2" />
        Opening…
      </>
    ) : (
      "View / Download PDF"
    )}
  </Button>

  {invoice.status !== "paid" ? (
    <Button
      variant="outline-success"
      onClick={handleMarkPaid}
      disabled={updatingStatus}
    >
      Mark Paid
    </Button>
  ) : (
    <Button
      variant="outline-secondary"
      onClick={() => handleSetStatus("unpaid")}
      disabled={updatingStatus}
    >
      Mark Unpaid
    </Button>
  )}
</div>


                  {/* <div className="mt-3 d-flex gap-2 flex-wrap">
                    <Button
                      variant="primary"
                      onClick={handleSendToCustomer}
                      disabled={sending}
                    >
                      {sending ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Sending…
                        </>
                      ) : (
                        "Send to Customer"
                      )}
                    </Button>

                    <Button
                      variant="outline-dark"
                      onClick={handleDownloadPdf}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Opening…
                        </>
                      ) : (
                        "View / Download PDF"
                      )}
                    </Button>
                    

                    {invoice.status !== "paid" ? (
                      <>
                      <Button
                        variant="outline-success"
                        onClick={handleMarkPaid}
                        disabled={updatingStatus}
                      >
                        Mark Paid
                      </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline-secondary"
                        onClick={() => handleSetStatus("unpaid")}
                        disabled={updatingStatus}
                      >
                        Mark Unpaid
                      </Button>
                    )}
                  </div> */}

                  <div className="mt-3">
                    {sentAt ? (
                      <div className="text-success">
                        <strong>Sent:</strong> {new Date(sentAt).toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-muted">
                        <strong>Sent:</strong> Not sent yet
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Services */}
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <h5 className="mb-0">Line Items</h5>
            <div className="text-muted" style={{ fontSize: 13 }}>
              {invoice.services?.length || 0} item(s)
            </div>
          </div>

          <Table bordered hover responsive className="mb-0 align-middle">
            <thead>
              <tr>
                <th style={{ width: "18%" }}>Service</th>
                <th>Description</th>
                <th style={{ width: "12%" }}>Billing</th>
                <th style={{ width: "10%" }}>Value</th>
                <th style={{ width: "12%" }}>Price</th>
                <th style={{ width: "12%" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.services || []).map((s, i) => (
                <tr key={i}>
                  <td className="fw-semibold">{s.serviceType}</td>
                  <td>{s.description || <span className="text-muted">—</span>}</td>
                  <td>
                    <Badge bg="secondary">{s.billingType}</Badge>
                  </td>
                  <td>
                    {s.billingType === "hours" ? (s.hours ?? 0) : (s.quantity ?? 0)}
                  </td>
                  <td>{money(s.price)}</td>
                  <td className="fw-semibold">{money(s.amount)}</td>
                </tr>
              ))}

              {!invoice.services?.length ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No services found on this invoice.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <div className="text-muted mt-3" style={{ fontSize: 12 }}>
        Tip: Use “View / Download PDF” to confirm branding & layout before sending to the customer.
      </div>
    </Container>
  );
};

export default InvoiceDetail;
