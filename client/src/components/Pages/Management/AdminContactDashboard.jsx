import React, { useEffect, useState } from "react";
import {
    Table,
    Container,
    Badge,
    Spinner,
    Row,
    Col,
    Form,
    Pagination,
    Card,
    Button,
    InputGroup,
} from "react-bootstrap";

import MessageCell from "./MessageCell";

import CustomerStatsCard from './CustomerStatsCard';

const PAGE_SIZE = 5;

const AdminContactDashboard = () => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const fetchContacts = async (status = "") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/contactForm${status ? `?status=${status}` : ""}`);
            const data = await res.json();
            setContacts(data);
            setFilteredContacts(data);
            setCurrentPage(1);
        } catch (err) {
            console.error("Failed to load contact forms", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts(selectedStatus);
    }, [selectedStatus]);

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/contactForm/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchContacts(selectedStatus);
            }
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const archiveForm = async (id) => {
        if (!window.confirm("Are you sure you want to archive this resolved entry?")) return;

        try {
            const res = await fetch(`/api/contactForm/${id}/archive`, {
                method: "PATCH",
            });

            if (res.ok) {
                fetchContacts(selectedStatus);
            } else {
                console.error("Failed to archive");
            }
        } catch (err) {
            console.error("Archiving error", err);
        }
    };


    const paginatedData = filteredContacts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE);

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => setCurrentPage(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }

        return <Pagination>{items}</Pagination>;
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">📨 Contact Form Submissions</h2>

            <Row className="align-items-center mb-3">
                <Col xs="auto">
                    <Form.Label>Status Filter</Form.Label>
                </Col>
                <Col xs="auto">
                    <Form.Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </Form.Select>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                </div>
            ) : contacts.length === 0 ? (
                <p>No contact form submissions found.</p>
            ) : (
                <>
                    <Card className="shadow-sm">
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Subject</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Message</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((c) => (
                                        <tr key={c._id}>
                                            <td>{c.name}</td>
                                            <td>{c.email}</td>
                                            <td>{c.subject}</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        {
                                                            new: "secondary",
                                                            "in-progress": "warning",
                                                            resolved: "success",
                                                        }[c.status]
                                                    }
                                                >
                                                    {c.status}
                                                </Badge>
                                            </td>
                                            <td>{new Date(c.createdAt).toLocaleString()}</td>
                                            {/* <td style={{ maxWidth: "250px" }}>{c.message}</td> */}
                                            <td>
                                                <MessageCell message={c.message} />
                                            </td>
                                            <td>
                                                <InputGroup size="sm">
                                                    <Form.Select
                                                        value={c.status}
                                                        onChange={(e) => updateStatus(c._id, e.target.value)}
                                                    >
                                                        <option value="new">New</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="resolved">Resolved</option>
                                                    </Form.Select>

                                                    <Button
                                                        variant="outline-danger"
                                                        onClick={() => archiveForm(c._id)}
                                                    >
                                                        Archive
                                                    </Button>
                                                </InputGroup>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-center mt-4">
                        {renderPagination()}
                    </div>
                </>
            )}

            <Row>
                <Col md={12}>
                    <CustomerStatsCard />
                </Col>
            </Row>

        </Container>
    );
};

export default AdminContactDashboard;
