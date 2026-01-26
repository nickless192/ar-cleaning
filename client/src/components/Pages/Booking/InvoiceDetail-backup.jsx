import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table, Spinner } from "react-bootstrap";

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        const data = await res.json();
        setInvoice(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();
  }, [id]);

  if (loading) return <Spinner animation="border" />;

  if (!invoice) return <p>Invoice not found</p>;

  return (
    <div className="container mt-4">
      <h2>Invoice: {invoice.invoiceNumber}</h2>
      <p><strong>Customer:</strong> {invoice.customerName}</p>
      <p><strong>Description:</strong> {invoice.description}</p>
      <p><strong>Total:</strong> ${invoice.totalCost.toFixed(2)}</p>

      <h4>Services</h4>
      <Table bordered hover>
        <thead>
          <tr>
            <th>Service Type</th>
            <th>Description</th>
            <th>Billing</th>
            <th>Value</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.services.map((s, i) => (
            <tr key={i}>
              <td>{s.serviceType}</td>
              <td>{s.description}</td>
              <td>{s.billingType}</td>
              <td>{s.billingType === "hours" ? s.hours : s.quantity}</td>
              <td>${s.price}</td>
              <td>${s.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default InvoiceDetail;