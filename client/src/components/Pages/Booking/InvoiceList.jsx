import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

const statusVariant = (status) => {
  if (status === "paid") return "success";
  if (status === "unpaid") return "warning";
  return "secondary";
};

const prettyMethod = (m) => {
  if (!m) return "";
  const map = {
    cash: "Cash",
    credit_card: "Credit Card",
    bank_transfer: "Bank Transfer",
    check: "Check",
    other: "Other",
  };
  return map[m] || m;
};

const InvoiceList = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // store payment methods per invoice
  const [paymentMethods, setPaymentMethods] = useState({});

  // UI state
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | unpaid | paid
  const [sortKey, setSortKey] = useState("createdDesc"); // createdDesc | createdAsc | totalDesc | totalAsc | customerAsc | customerDesc

  const [busyId, setBusyId] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await fetch("/api/invoices");
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error fetching invoices:", e);
        setErr("Failed to load invoices.");
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  const filteredSorted = useMemo(() => {
    const query = q.trim().toLowerCase();

    let rows = invoices.slice();

    if (statusFilter !== "all") {
      rows = rows.filter((inv) => (inv.status || "unpaid") === statusFilter);
    }

    if (query) {
      rows = rows.filter((inv) => {
        const hay = [
          inv.invoiceNumber,
          inv.customerName,
          inv.customerEmail,
          inv.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      });
    }

    const getCreated = (inv) => {
      const d = inv.createdAt ? new Date(inv.createdAt).getTime() : 0;
      return Number.isFinite(d) ? d : 0;
    };

    rows.sort((a, b) => {
      switch (sortKey) {
        case "createdAsc":
          return getCreated(a) - getCreated(b);
        case "totalDesc":
          return (Number(b.totalCost) || 0) - (Number(a.totalCost) || 0);
        case "totalAsc":
          return (Number(a.totalCost) || 0) - (Number(b.totalCost) || 0);
        case "customerAsc":
          return String(a.customerName || "").localeCompare(String(b.customerName || ""));
        case "customerDesc":
          return String(b.customerName || "").localeCompare(String(a.customerName || ""));
        case "createdDesc":
        default:
          return getCreated(b) - getCreated(a);
      }
    });

    return rows;
  }, [invoices, q, statusFilter, sortKey]);

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;

    try {
      setMsg("");
      setErr("");
      setBusyId(id);

      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete invoice");
      }

      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      setMsg("Invoice deleted.");
    } catch (e) {
      console.error("Error deleting invoice:", e);
      setErr(e.message || "Error deleting invoice.");
    } finally {
      setBusyId("");
    }
  };

  const handleMarkAsPaid = (id) => async () => {
    const inv = invoices.find((x) => x._id === id);
    const selectedMethod = paymentMethods[id];

    if (!selectedMethod) {
      alert("Please select a payment method before marking as paid.");
      return;
    }

    try {
      setMsg("");
      setErr("");
      setBusyId(id);

      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          paymentMethod: selectedMethod,
          amount: inv?.totalCost,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to mark invoice as paid");

      setInvoices((prev) => prev.map((x) => (x._id === id ? data : x)));
      setMsg(`Invoice #${data.invoiceNumber} marked as paid ✅`);
    } catch (e) {
      console.error("Error marking invoice as paid:", e);
      setErr(e.message || "Error marking invoice as paid.");
    } finally {
      setBusyId("");
    }
  };

  const handlePaymentMethodChange = (id, value) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <div className="text-muted mt-2">Loading invoices…</div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      {msg ? <Alert variant="success" className="mb-3">{msg}</Alert> : null}
      {err ? <Alert variant="danger" className="mb-3">{err}</Alert> : null}

      {/* Header + filters */}
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row className="align-items-center g-2">
            <Col md={4}>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h4 className="mb-0">Invoices</h4>
                <Badge bg="secondary">{filteredSorted.length}</Badge>
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                Search, filter, and manage payments.
              </div>
            </Col>

            <Col md={8}>
              <Row className="g-2">
                <Col sm={6} lg={5}>
                  <InputGroup>
                    <InputGroup.Text>🔎</InputGroup.Text>
                    <Form.Control
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search invoice #, customer, email, description…"
                    />
                  </InputGroup>
                </Col>

                <Col sm={3} lg={3}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="all">All</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </Form.Select>
                </Col>

                <Col sm={3} lg={4}>
                  <Form.Select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    aria-label="Sort invoices"
                  >
                    <option value="createdDesc">Newest first</option>
                    <option value="createdAsc">Oldest first</option>
                    <option value="totalDesc">Total: high → low</option>
                    <option value="totalAsc">Total: low → high</option>
                    <option value="customerAsc">Customer: A → Z</option>
                    <option value="customerDesc">Customer: Z → A</option>
                  </Form.Select>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Desktop / wide screens: table */}
      <div className="d-none d-lg-block">
        <Card className="shadow-sm">
          <Card.Body>
            <Table hover responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Invoice</th>
                  <th>Customer</th>
                  <th>Description</th>
                  <th style={{ width: 120 }}>Total</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 190 }}>Payment Method</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((inv) => {
                  const isBusy = busyId === inv._id;
                  const isPaid = inv.status === "paid";

                  return (
                    <tr key={inv._id}>
                      <td className="fw-semibold">#{inv.invoiceNumber}</td>
                      <td>
                        <div className="fw-semibold">{inv.customerName}</div>
                        {inv.customerEmail ? (
                          <div className="text-muted" style={{ fontSize: 13 }}>
                            {inv.customerEmail}
                          </div>
                        ) : null}
                      </td>
                      <td>{inv.description || <span className="text-muted">—</span>}</td>
                      <td className="fw-semibold">{money(inv.totalCost)}</td>
                      <td>
                        <Badge
                          bg={statusVariant(inv.status)}
                          text={inv.status === "unpaid" ? "dark" : "white"}
                        >
                          {(inv.status || "unpaid").toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <Form.Select
                          value={paymentMethods[inv._id] || ""}
                          disabled={isPaid || isBusy}
                          onChange={(e) => handlePaymentMethodChange(inv._id, e.target.value)}
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

                        {isPaid && Array.isArray(inv.payment) && inv.payment.length ? (
                          <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                            Last: {prettyMethod(inv.payment[inv.payment.length - 1]?.paymentMethod)}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <ButtonGroup>
                          <Button
                            size="sm"
                            variant="info"
                            disabled={isBusy}
                            onClick={() =>
                              navigate(`/invoices/${inv._id}`, {
                                state: { from: "/admin/booking", activeTab: "invoices" },
                              })
                            }
                          >
                            View
                          </Button>

                          <Button
                            size="sm"
                            variant="success"
                            disabled={isPaid || isBusy}
                            onClick={handleMarkAsPaid(inv._id)}
                          >
                            {isBusy ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Saving…
                              </>
                            ) : (
                              "Mark Paid"
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isBusy}
                            onClick={() => handleDeleteInvoice(inv._id)}
                          >
                            Delete
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}

                {!filteredSorted.length ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No invoices match your filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>

      {/* Mobile / small screens: card list */}
      <div className="d-lg-none">
        <div className="d-grid gap-3">
          {filteredSorted.map((inv) => {
            const isBusy = busyId === inv._id;
            const isPaid = inv.status === "paid";

            return (
              <Card key={inv._id} className="shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="fw-bold">Invoice #{inv.invoiceNumber}</div>
                        <Badge
                          bg={statusVariant(inv.status)}
                          text={inv.status === "unpaid" ? "dark" : "white"}
                        >
                          {(inv.status || "unpaid").toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-1">
                        <div className="fw-semibold">{inv.customerName}</div>
                        {inv.customerEmail ? (
                          <div className="text-muted" style={{ fontSize: 13 }}>
                            {inv.customerEmail}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        Total
                      </div>
                      <div className="fw-bold">{money(inv.totalCost)}</div>
                    </div>
                  </div>

                  {inv.description ? (
                    <div className="text-muted mt-2" style={{ fontSize: 13 }}>
                      {inv.description}
                    </div>
                  ) : null}

                  <div className="mt-3">
                    <Form.Label className="mb-1" style={{ fontSize: 13 }}>
                      Payment Method
                    </Form.Label>
                    <Form.Select
                      value={paymentMethods[inv._id] || ""}
                      disabled={isPaid || isBusy}
                      onChange={(e) => handlePaymentMethodChange(inv._id, e.target.value)}
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
                  </div>

                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    <Button
                      variant="info"
                      className="flex-grow-1"
                      disabled={isBusy}
                      onClick={() =>
                        navigate(`/invoices/${inv._id}`, {
                          state: { from: "/admin/booking", activeTab: "invoices" },
                        })
                      }
                    >
                      View
                    </Button>

                    <Button
                      variant="success"
                      className="flex-grow-1"
                      disabled={isPaid || isBusy}
                      onClick={handleMarkAsPaid(inv._id)}
                    >
                      {isBusy ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving…
                        </>
                      ) : (
                        "Mark Paid"
                      )}
                    </Button>

                    <Button
                      variant="outline-danger"
                      className="flex-grow-1"
                      disabled={isBusy}
                      onClick={() => handleDeleteInvoice(inv._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            );
          })}

          {!filteredSorted.length ? (
            <Card className="shadow-sm">
              <Card.Body className="text-center text-muted">
                No invoices match your filters.
              </Card.Body>
            </Card>
          ) : null}
        </div>
      </div>
    </Container>
  );
};

export default InvoiceList;
