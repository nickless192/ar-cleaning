import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";

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
            <th>Booking ID</th>
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
              <td>{inv.bookingId || "-"}</td>
              <td>
                <Button
                  size="sm"
                  variant="info"
                  onClick={() => window.open(`/invoices/${inv._id}`, "_blank")}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default InvoiceList;