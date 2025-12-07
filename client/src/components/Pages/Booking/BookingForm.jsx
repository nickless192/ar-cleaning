// src/components/BookingForm.jsx
import React, { useState, useEffect } from "react";
import {
    Form, FormGroup, Label, Input, Button, Spinner, Alert,
    Table
} from "reactstrap";
import Auth from "/src/utils/auth";

const BookingForm = ({
    customers, prefillDate, setShowAddModal, fetchBookings
}) => {

    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        customerEmail: '',
        serviceType: '',
        date: prefillDate || '',
        scheduleConfirmation: false,
        confirmationDate: '',
        reminderScheduled: false,
        disableConfirmation: false,
        // income: 0
    });
    const [services, setServices] = useState([
        {
            serviceType: "",
            description: "",
            billingType: "quantity", // "hours" | "quantity"
            hours: 0,
            quantity: 1,
            price: 0,
            amount: 0,
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');

    const handleChange = e => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({
            ...prev,
            [e.target.name]: value
        }));
    };

    const handleServiceChange = (index, field, value) => {
        const updated = [...services];
        updated[index][field] = value;

        // Recalculate amount based on billing type
        if (
            field === "hours" ||
            field === "quantity" ||
            field === "price" ||
            field === "billingType"
        ) {
            const svc = updated[index];
            if (svc.billingType === "hours") {
                svc.amount = (svc.hours || 0) * (svc.price || 0);
            } else {
                svc.amount = (svc.quantity || 0) * (svc.price || 0);
            }
        }

        setServices(updated);
    };

    const addServiceRow = () => {
        setServices((prev) => [
            ...prev,
            {
                serviceType: "",
                description: "",
                billingType: "quantity",
                hours: 0,
                quantity: 1,
                price: 0,
                amount: 0,
            },
        ]);
    };

    const removeServiceRow = (index) => {
        setServices((prev) => prev.filter((_, i) => i !== index));
    };

    const totalIncome = services.reduce(
        (sum, s) => sum + (s.amount || 0),
        0
    );


    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        // console.log(formData);
        if (!formData.customerName || !formData.customerEmail || !formData.serviceType || !formData.date) {
            setMessage({ type: 'danger', text: 'Please fill in all required fields.' });
            setLoading(false);
            return;
        }
        const hasAtLeastOneService = services.some(
            (s) => s.serviceType && (s.amount || 0) >= 0
        );

        if (!hasAtLeastOneService) {
            setMessage({
                type: "danger",
                text: "Please add at least one service.",
            });
            setLoading(false);
            return;
        }
        // Validate date
        // if (formData.income < 0) {
        if (totalIncome < 0) {
            setMessage({ type: 'danger', text: 'Income cannot be negative.' });
            setLoading(false);
            return;
        }
        try {
            // const body = {
            //     ...formData,
            //     userId: Auth.getProfile().data._id // Assuming you have user authentication
            // };
            const body = {
                ...formData,
                // sync summary serviceType & income with first row / total
                serviceType:
                    services[0]?.serviceType || formData.serviceType || "Service(s)",
                income: totalIncome,
                services,
                userId: Auth.getProfile().data._id,
            };
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Failed to submit booking');

            setMessage({ type: 'success', text: 'Booking submitted successfully!' });
            setFormData({
                customerName: '',
                customerEmail: '',
                serviceType: '',
                date: '',
                scheduleConfirmation: false,
                confirmationDate: '',
                reminderScheduled: false,
                disableConfirmation: false,
                income: 0
            });
            setServices([
        {
          serviceType: "",
          description: "",
          billingType: "quantity",
          hours: 0,
          quantity: 1,
          price: 0,
          amount: 0,
        },
      ]);
            setSelectedCustomerId('');
            setShowAddModal(false); // Close modal after submission
            fetchBookings();

        } catch (err) {
            setMessage({ type: 'danger', text: 'Error submitting booking.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {message && (
                <Alert color={message.type}>
                    {message.text}
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="customerSelect">Select Saved Customer</Label>
                    <Input
                        type="select"
                        id="customerSelect"
                        value={selectedCustomerId}
                        onChange={e => {
                            const selectedId = e.target.value;
                            setSelectedCustomerId(selectedId);
                            const selectedCustomer = customers.find(c => c._id === selectedId);
                            if (selectedCustomer) {
                                setFormData(prev => ({
                                    ...prev,
                                    customerId: selectedCustomer._id,
                                    customerName: selectedCustomer.firstName + ' ' + selectedCustomer.lastName,
                                    customerEmail: selectedCustomer.email,
                                    serviceType: selectedCustomer.defaultService
                                }));
                                 // Pre-fill first service row with defaultService
                setServices((prev) => {
                  const base =
                    prev.length > 0 ? prev : [
                      {
                        serviceType: "",
                        description: "",
                        billingType: "quantity",
                        hours: 0,
                        quantity: 1,
                        price: 0,
                        amount: 0,
                      },
                    ];

                  const updated = [...base];
                  updated[0] = {
                    ...updated[0],
                    serviceType: selectedCustomer.defaultService || "",
                    description: selectedCustomer.defaultService || "",
                  };
                  return updated;
                });
                            } else {
                                // If cleared selection
                                setFormData(prev => ({
                                    ...prev,
                                    customerId: '',
                                    customerName: '',
                                    customerEmail: '',
                                    serviceType: ''
                                }));
                                setServices([
                  {
                    serviceType: "",
                    description: "",
                    billingType: "quantity",
                    hours: 0,
                    quantity: 1,
                    price: 0,
                    amount: 0,
                  },
                ]);
                            }
                        }}
                    >
                        <option value="">-- Select a customer --</option>
                        {customers.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.firstName} {c.lastName} ({c.email})
                            </option>
                        ))}
                    </Input>
                </FormGroup>

                <FormGroup>
                    <Label for="customerName">Customer Name</Label>
                    <Input
                        type="text"
                        name="customerName"
                        className="text-cleanar-color text-bold form-input"
                        id="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                        readOnly={!!formData.customerId}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="customerEmail">Customer Email</Label>
                    <Input
                        type="email"
                        name="customerEmail"
                        className="text-cleanar-color text-bold form-input"
                        id="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        required
                        readOnly={!!formData.customerId}
                    />
                </FormGroup>
                {formData.customerId && (
                    <FormGroup>
                        <Label for="customerId">Customer ID</Label>
                        <Input
                            type="text"
                            id="customerId"
                            className="text-cleanar-color text-bold form-input"
                            value={formData.customerId}
                            readOnly
                        />
                    </FormGroup>
                )}

                {/* <FormGroup>
                    <Label for="serviceType">Service Type</Label>
                    <Input
                        type="text"
                        name="serviceType"
                        className="text-cleanar-color text-bold form-input"
                        id="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                    />
                </FormGroup> */}
                 {/* Services section (array) */}
        <FormGroup>
          <Label>Services</Label>
          <Table bordered size="sm">
            <thead>
              <tr>
                <th>Service Type</th>
                <th>Description</th>
                <th>Billing</th>
                <th>Value</th>
                <th>Price</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, index) => (
                <tr key={index}>
                  <td>
                    <Input
                      value={s.serviceType}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "serviceType",
                          e.target.value
                        )
                      }
                      required={index === 0} // at least first one required
                    />
                  </td>
                  <td>
                    <Input
                      value={s.description}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <Input
                      type="select"
                      value={s.billingType}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "billingType",
                          e.target.value
                        )
                      }
                    >
                      <option value="hours">Hours</option>
                      <option value="quantity">Quantity</option>
                    </Input>
                  </td>
                  <td>
                    {s.billingType === "hours" ? (
                      <Input
                        type="number"
                        value={s.hours}
                        className="text-cleanar-color text-bold form-input"
                        onChange={(e) =>
                          handleServiceChange(
                            index,
                            "hours",
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <Input
                        type="number"
                        value={s.quantity}
                        className="text-cleanar-color text-bold form-input"
                        onChange={(e) =>
                          handleServiceChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                      />
                    )}
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={s.price}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "price",
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td>{s.amount.toFixed(2)}</td>
                  <td>
                    {index > 0 && (
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => removeServiceRow(index)}
                      >
                        X
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button color="secondary" size="sm" onClick={addServiceRow}>
            + Add Service
          </Button>
        </FormGroup>


                <FormGroup>
                    <Label for="date">Service Date</Label>
                    <Input
                        type="datetime-local"
                        name="date"
                        id="date"
                        className="text-cleanar-color text-bold form-input"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>
                {/* <FormGroup>
                    <Label for="income">Approximate Income (CAD)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        name="income"
                        className="text-cleanar-color text-bold form-input"
                        id="income"
                        value={formData.income || ''}
                        onChange={handleChange}
                    />
                </FormGroup> */}
                <FormGroup>
  <Label>Total (CAD)</Label>
  <Input
    type="number"
    readOnly
    className="text-cleanar-color text-bold form-input"
    value={totalIncome.toFixed(2)}
  />
</FormGroup>
                <Button type="submit" color="primary" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Submit Booking'}
                </Button>
            </Form>
        </>
    );
};

export default BookingForm;
