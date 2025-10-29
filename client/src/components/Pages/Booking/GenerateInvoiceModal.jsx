import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const GenerateInvoiceModal = ({ show, onHide, booking }) => {
    const [customerName, setCustomerName] = useState("");
    const [description, setDescription] = useState("");
    const [services, setServices] = useState([]);

    useEffect(() => {
        if (booking) {
            setCustomerName(booking.customerName || "");
            setDescription(booking.serviceType || "");
            setServices([
                {
                    serviceType: booking.serviceType || "",
                    description: booking.description || "",
                    billingType: "quantity", // default
                    hours: booking.hours || 0,
                    quantity: booking.quantity || 1,
                    price: booking.income || 0,
                    amount: (booking.quantity || 1) * (booking.income || 0),
                    bookingId: booking._id
                },
            ]);
        }
    }, [booking]);

    const handleServiceChange = (index, field, value) => {
        const updated = [...services];
        updated[index][field] = value;

        // Recalculate amount based on billingType
        if (field === "hours" || field === "quantity" || field === "price" || field === "billingType") {
            if (updated[index].billingType === "hours") {
                updated[index].amount = (updated[index].hours || 0) * (updated[index].price || 0);
            } else {
                updated[index].amount = (updated[index].quantity || 0) * (updated[index].price || 0);
            }
        }

        setServices(updated);
    };

    const addServiceRow = () => {
        setServices([...services, {
            serviceType: "",
            description: "",
            billingType: "quantity",
            hours: 0,
            quantity: 1,
            price: 0, amount: 0
        }]);
    };

    const removeServiceRow = (index) => {
        const updated = services.filter((_, i) => i !== index);
        setServices(updated);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch("/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoiceNumber: `INV-${Date.now()}`, // you can replace with real generator
                    customerName,
                    description,
                    services,
                    bookingId: booking ? booking._id : null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error creating invoice:", errorData);
                return;
            }

            // const createdInvoice = await response.json();
            // console.log("Invoice created:", createdInvoice);
            onHide();
        } catch (err) {
            console.error("Network error creating invoice:", err);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Generate Invoice</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Customer Name</Form.Label>
                        <Form.Control value={customerName} className="text-cleanar-color text-bold form-input" onChange={(e) => setCustomerName(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Invoice Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            value={description}
                            className="text-cleanar-color text-bold form-input"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>

                    <Table bordered>
                        <thead>
                            <tr>
                                <th>Service Type</th>
                                <th>Description</th>
                                <th>Billing</th>
                                <th>{/* Hours/Quantity header updates dynamically */}Value</th>
                                <th>Price</th>
                                <th>Amount</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((s, index) => (
                                <tr key={index}>
                                    <td>
                                        <Form.Control
                                            value={s.serviceType}
                                            className="text-cleanar-color text-bold form-input"
                                            onChange={(e) => handleServiceChange(index, "serviceType", e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            value={s.description}
                                            className="text-cleanar-color text-bold form-input"
                                            onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <Form.Select
                                            value={s.billingType}
                                            className="text-cleanar-color text-bold form-input"
                                            onChange={(e) =>
                                                handleServiceChange(index, "billingType", e.target.value)
                                            }
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
                                                onChange={(e) =>
                                                    handleServiceChange(index, "hours", Number(e.target.value))
                                                }
                                            />
                                        ) : (
                                            <Form.Control
                                                type="number"
                                                value={s.quantity}
                                                className="text-cleanar-color text-bold form-input"
                                                onChange={(e) =>
                                                    handleServiceChange(index, "quantity", Number(e.target.value))
                                                }
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            value={s.price}
                                            className="text-cleanar-color text-bold form-input"
                                            onChange={(e) => handleServiceChange(index, "price", Number(e.target.value))}
                                        />
                                    </td>
                                    <td>{s.amount.toFixed(2)}</td>
                                    <td>
                                        {index > 0 && (
                                            <Button variant="danger" size="sm" onClick={() => removeServiceRow(index)}>
                                                X
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Button variant="secondary" onClick={addServiceRow}>
                        + Add Service
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Generate Invoice
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default GenerateInvoiceModal;
