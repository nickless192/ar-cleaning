import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col,
  Form, FormGroup, Label, Input,
  Button, Alert, Spinner,
  Table
} from 'reactstrap';
import moment from 'moment';

const BookingTable = ({bookings}) => {
  return (
    <div>
      <h4 className="mb-3">All Bookings</h4>
          {bookings.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer Name and Email</th>
                  <th>Service</th>
                  <th>Income</th>
                  <th>Service Date</th>
                  <th>Confirmation/Reminder Scheduled</th>
                  <th>Booking By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, index) => (
                  <tr key={b._id}>
                    <td className="align-top">
                      <div className="d-flex flex-column align-items-start">
                        <div>{index + 1}</div>
                      </div>
                    </td>

                    <td>
                      <div className="fw-bold">{b.customerName}</div>
                      <div className="text-muted small">{b.customerEmail}</div>
                    </td>

                    <td>{b.serviceType}</td>
                    <td>{b.income ? `$${parseFloat(b.income).toFixed(2)}` : 'N/A'}</td>
                    <td>{moment(b.date).format('YYYY-MM-DD HH:mm')}</td>
                    <td>
                      <div className="mb-1">
                        <strong>Confirmation:</strong>{' '}
                        {b.disableConfirmation
                          ? 'Disabled'
                          : b.confirmationSent
                            ? '✅ Sent'
                            : b.scheduleConfirmation
                              ? 'Scheduled'
                              : 'Not Scheduled'}
                        {b.confirmationDate && (
                          <div className="text-muted small">
                            @ {moment(b.confirmationDate).format('MM-DD HH:mm')}
                          </div>
                        )}
                      </div>

                      <div>
                        <strong>Reminder:</strong>{' '}
                        {b.reminderScheduled ? '✅ Scheduled' : '❌ Not Scheduled'}
                        {b.reminderDate && (
                          <div className="text-muted small">
                            @ {moment(b.reminderDate).format('MM-DD HH:mm')}
                          </div>
                        )}
                        <div className="text-muted small">
                          {b.reminderScheduled && (b.reminderSent ? 'Sent' : 'Send Pending')}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="fw-bold mb-1">
                        {b.createdBy ? `${b.createdBy.firstName} ${b.createdBy.lastName}` : 'N/A'}
                      </div>
                      <div className="fw-bold">
                        {moment(b.createdAt).format('YYYY-MM-DD')} @ {moment(b.createdAt).format('HH:mm')}
                      </div>
                      <div className="small">
                        <div className="fw-semibold">Last Updated By:</div>
                        {b.updatedBy?.firstName ? (
                          <>
                            <div>{b.updatedBy.firstName} {b.updatedBy.lastName}</div>
                            <div className="text-muted">{b.updatedBy.email}</div>
                          </>
                        ) : (
                          <div className="text-muted">Unknown</div>
                        )}
                      </div>
                    </td>

                    <td>{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No bookings yet.</p>
          )}
    </div>
  );
};

export default BookingTable;
