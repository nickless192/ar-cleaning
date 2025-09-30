import React, { useState } from 'react';
import {
    Button, ButtonGroup, ButtonToolbar,
    Modal, Form, Spinner
} from "react-bootstrap";
import {
    FaClock,
    FaTimesCircle,
    FaCheckCircle,
    FaEyeSlash,
    FaFileInvoice,
    FaTrash,
    FaCheck
} from "react-icons/fa";

const BookingActions = ({
    selectedBooking,
    setSelectedBooking,
    setLoading,
    onPend,
    cancelBooking,
    completeBooking,
    hideBooking,
    deleteBooking,
    setShowInvoiceModal,
    handleSubmit,
    handleChange,
    loading
}) => {
    if (!selectedBooking) return null;
    const { _id, status } = selectedBooking;
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const resetSelection = () => {
        setSelectedBooking(null);
        setLoading(false);
    };

    return (
        <div className="d-flex flex-column align-items-center gap-2">
            {/* Current Status Step */}
            <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-uppercase small text-muted">
                    Current Status:
                </span>
                <Button
                    variant={status === "pending" ? "warning" : "outline-warning"}
                    size="sm"
                    disabled
                >
                    <FaClock className="me-1" /> {status}
                </Button>
            </div>

            {/* Available Actions */}
            <ButtonToolbar className="justify-content-center">
                <ButtonGroup size="sm" className="gap-1">
                    {/* Only show relevant actions based on current status */}
                    {status === "pending" && (
                        <>
                            <Button
                                variant="info"
                                onClick={() => {
                                    setShowConfirmModal(true); // open modal
                                }}

                            >
                                <FaCheck className="me-1" /> Confirm
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => {
                                    completeBooking(_id, status);
                                    resetSelection();
                                }}
                            >
                                <FaCheckCircle className="me-1" /> Complete
                            </Button>

                            <Button
                                variant="danger"
                                onClick={() => {
                                    cancelBooking(_id, status);
                                    resetSelection();
                                }}
                            >
                                <FaTimesCircle className="me-1" /> Cancel
                            </Button>
                        </>
                    )}

                    {status === "confirmed" && (
                        <>
                            {/* back to pending */}
                            <Button
                                variant="warning"
                                onClick={() => {
                                    onPend(selectedBooking._id, selectedBooking.status);
                                    resetSelection();
                                }}
                            >
                                <FaClock className="me-1" /> Back to Pending
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => {
                                    completeBooking(selectedBooking._id, selectedBooking.status);
                                    resetSelection();
                                }}
                            >
                                <FaCheck className="me-1" /> Complete
                            </Button>
                        </>
                    )}

                    {status === "cancelled" && (
                        <> <Button
                                variant="warning"
                                onClick={() => {
                                    onPend(selectedBooking._id, selectedBooking.status);
                                    resetSelection();
                                }}
                            >
                                <FaClock className="me-1" /> Back to Pending
                            </Button>
                        </>
                    )}

                    {status === "completed" && (
                        <>

                            <Button
                                variant="dark"
                                onClick={() => setShowInvoiceModal(true)}
                            >
                                <FaFileInvoice className="me-1" /> Generate Invoice
                            </Button>

                        </>
                    )}
                </ButtonGroup>
            </ButtonToolbar>
            <Modal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Booking</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p className="text-muted mb-3">
                        A confirmation email will be sent upon saving unless you override it below.
                    </p>

                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(e); // existing function from BookingCalendar
                            setShowConfirmModal(false);
                        }}
                    >
                        <Form.Check
                            type="checkbox"
                            name="scheduleConfirmation"
                            id="scheduleConfirmation"
                            label="Schedule Confirmation Email"
                            className="mb-3"
                            checked={selectedBooking.scheduleConfirmation}
                            onChange={handleChange}
                        />

                        <Form.Group className="mb-3" controlId="confirmationDate">
                            <Form.Label>Confirmation Email Date (optional)</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="confirmationDate"
                                className="text-cleanar-color text-bold form-input"
                                value={selectedBooking.confirmationDate || ""}
                                onChange={handleChange}
                                disabled={!selectedBooking.scheduleConfirmation}
                            />
                        </Form.Group>

                        <Form.Check
                            type="checkbox"
                            name="disableConfirmation"
                            id="disableConfirmation"
                            label="Disable Confirmation Email"
                            className="mb-3"
                            checked={selectedBooking.disableConfirmation}
                            onChange={handleChange}
                        />

                        <Form.Check
                            type="checkbox"
                            name="reminderScheduled"
                            id="reminderScheduled"
                            label="Send 24-hour reminder email"
                            className="mb-4 "
                            checked={selectedBooking.reminderScheduled}
                            onChange={handleChange}
                        />

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? <Spinner size="sm" /> : "Confirm Booking"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

        </div>
    );
}

export default BookingActions;