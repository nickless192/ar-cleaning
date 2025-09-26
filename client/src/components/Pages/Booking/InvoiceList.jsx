import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, ButtonGroup } from "react-bootstrap";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch("/api/invoices");
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  if (loading) return <Spinner animation="border" />;

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvoices(invoices.filter((inv) => inv._id !== id));
      } else {
        console.error("Failed to delete invoice");
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
    }
  };

  const handleMarkAsPaid = (id) => async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'paid', paymentMethod: 'cash', amount: invoices.find(inv => inv._id === id).totalCost }),
      });
      if (res.ok) {
        const updatedInvoice = await res.json();
        setInvoices(invoices.map(inv => inv._id === id ? updatedInvoice : inv));
      } else {
        console.error("Failed to mark invoice as paid");
      }
    } catch (err) {
      console.error("Error marking invoice as paid:", err);
    }
  }

  return (
    <div className="container mt-4">
      <h2>Invoices</h2>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Description</th>
            <th>Total</th>
            <th>Payment Method</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id}>
              <td>{inv.invoiceNumber}</td>
              <td>{inv.customerName}</td>
              <td>{inv.description}</td>
              <td>${inv.totalCost.toFixed(2)}</td>
              <td>
                {/* ['cash', 'credit card', 'bank transfer', 'check', 'other'] */}
                <select className="form-select" defaultValue="">
                  <option value="" disabled>
                    Select Method
                  </option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </td>
              <td>
                <ButtonGroup>

                <Button
                  size="sm"
                  variant="info"
                  onClick={() => window.open(`/invoices/${inv._id}`, "_blank")}
                >
                  View
                </Button>
                {/* add button to mark as paid */}
                <Button
                  size="sm"
                  variant="success"
                  onClick={handleMarkAsPaid(inv._id)}
                >
                  Mark as Paid
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteInvoice(inv._id)}
                >
                  Delete
                </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default InvoiceList;