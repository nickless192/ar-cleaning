// CustomerRelations.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Button, Input, Label } from 'reactstrap';
import { getUsers } from '/src/components/API/userApi';
import { getBookings } from '/src/components/API/bookingApi';
import { linkUser, unlinkUser, linkBooking, unlinkBooking } from '/src/components/API/customerApi';

const CustomerRelations = ({ customer, onClose, onRefresh }) => {
  console.log(customer);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  // const [customerBookings, setCustomerBookings] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setUsers(await getUsers());
      setBookings(await getBookings()); // update to get bookings without a user
      // setCustomerBookings(await getCustomerBookings());
    };
    fetchData();
  }, []);

  const handleLinkUser = async () => {
    // await linkUser(customer._id, selectedUserId);
    const data = { userId: selectedUserId };
    const res = await fetch(`/api/customers/${customer._id}/assign-user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    onRefresh();
    setSelectedUserId('');
    onClose();
  };

  const handleUnlinkUser = async () => {
    const data = { userId: null };
    const res = await fetch(`/api/customers/${customer._id}/assign-user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    onRefresh();
    setSelectedUserId('');
    onClose();
  };

  // const getCustomerBookings = async () => {
  //   const res = await fetch(`/api/customers/${customer._id}/bookings`);
  //   return res.json();
  // };

  const handleUnlinkBooking = async (bookingId,) => {
    const res = await fetch(`/api/customers/${customer._id}/bookings/${bookingId}`, {
      method: 'PUT'
    });
    if (!res.ok) {
      console.error('Failed to unlink booking');
      return;
    }

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
        <CardTitle tag="h5">Manage Relations for {customer.firstName} {customer.lastName} - {customer.email}</CardTitle>
        {customer.user && (
          <p>Linked User: {customer.user.firstName} {customer.user.lastName} - {customer.user.email}</p>
        )}

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
                <option key={user._id} value={user._id}>{user.username} - {user.email}</option>
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
              {customer.bookings.map((booking) => {
                // const isLinked = bookings.map(b => b._id).includes(booking._id);
                return (
                  <div key={booking._id} className="border p-2 rounded shadow-sm">
                    <div><strong>ID:</strong> {booking._id}</div>
                    <div><strong>Date:</strong> {booking.date}</div>
                    {/* customer name, service type */}
                    <div><strong>Customer:</strong> {booking.customerName}</div>
                    <div><strong>Service:</strong> {booking.serviceType}</div>
                    <div><strong>Status:</strong> {booking.status}</div>
                    {/* <div><strong>Linked:</strong> {isLinked ? 'Yes' : 'No'}</div> */}
                    <div><strong>Price:</strong> ${booking.income.toFixed(2)}</div>
                    <Button
                      size="sm"
                      color='danger'
                      onClick={() => handleUnlinkBooking(booking._id)}
                      className="mt-1"
                    >
                      Unlink
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
