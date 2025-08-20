// src/components/BookingForm.jsx
import React, { useState, useEffect } from "react";
import {
    Form, FormGroup, Label, Input, Button, Spinner, Alert
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
        income: 0
    });
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
        // Validate date
        if (formData.income < 0) {
            setMessage({ type: 'danger', text: 'Income cannot be negative.' });
            setLoading(false);
            return;
        }
        try {
            const body = {
                ...formData,
                userId: Auth.getProfile().data._id // Assuming you have user authentication
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
                                customerEmail: selectedCustomer.email
                            }));
                        } else {
                            // If cleared selection
                            setFormData(prev => ({
                                ...prev,
                                customerId: '',
                                customerName: '',
                                customerEmail: ''
                            }));
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

            <FormGroup>
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
            <FormGroup>
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
            </FormGroup>
            <Button type="submit" color="primary" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Submit Booking'}
            </Button>
        </Form>
        </>
    );
};

export default BookingForm;
