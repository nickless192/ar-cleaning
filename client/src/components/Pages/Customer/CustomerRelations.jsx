// CustomerRelations.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Button, Input, Label } from 'reactstrap';
import { getUsers } from '../../api/userApi';
import { getBookings } from '../../api/bookingApi';
import { linkUser, unlinkUser, linkBooking, unlinkBooking } from '../../api/customerApi';

const CustomerRelations = ({ customer, onClose, onRefresh }) => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setUsers(await getUsers());
      setBookings(await getBookings());
    };
    fetchData();
  }, []);

  const handleLinkUser = async () => {
    await linkUser(customer._id, selectedUserId);
    onRefresh();
  };

  const handleUnlinkUser = async () => {
    await unlinkUser(customer._id);
    onRefresh();
  };

  const handleToggleBooking = async (bookingId, isLinked) => {
    if (isLinked) {
      await unlinkBooking(customer._id, bookingId);
    } else {
      await linkBooking(customer._id, bookingId);
    }
    onRefresh();
  };

  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h5">Manage Relations for {customer.firstName} {customer.lastName}</CardTitle>

        <Row className="mb-3">
          <Col md={6}>
            <Label for="userSelect">Link to User:</Label>
            <Input
              type="select"
              id="userSelect"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.username}</option>
              ))}
            </Input>
            <div className="mt-2">
              <Button color="success" size="sm" onClick={handleLinkUser} disabled={!selectedUserId} className="me-2">
                Link
              </Button>
              <Button color="danger" size="sm" onClick={handleUnlinkUser} disabled={!customer.user}>
                Unlink
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <Label>Bookings:</Label>
            <div className="d-flex flex-wrap gap-2">
              {bookings.map((booking) => {
                const isLinked = customer.bookings?.includes(booking._id);
                return (
                  <div key={booking._id} className="border p-2 rounded shadow-sm">
                    <div><strong>ID:</strong> {booking._id}</div>
                    <div><strong>Date:</strong> {booking.date}</div>
                    {/* customer name, service type */}
                    <div><strong>Customer:</strong> {booking.customerName}</div>
                    <div><strong>Service:</strong> {booking.serviceType}</div>
                    <div><strong>Status:</strong> {booking.status}</div>
                    <div><strong>Linked:</strong> {isLinked ? 'Yes' : 'No'}</div>
                    <div><strong>Price:</strong> ${booking.income.toFixed(2)}</div>
                    <Button
                      size="sm"
                      color={isLinked ? 'danger' : 'primary'}
                      onClick={() => handleToggleBooking(booking._id, isLinked)}
                      className="mt-1"
                    >
                      {isLinked ? 'Unlink' : 'Link'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <Button color="secondary" size="sm" onClick={onClose}>Close</Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default CustomerRelations;
