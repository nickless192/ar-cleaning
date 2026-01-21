// CustomerList.jsx
import React, { useState } from 'react';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';


const CustomerList = ({ customers, onEdit, onManageRelations, onDelete }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");
  // const [existingNotes, setExistingNotes] = useState("");

  const handleOpenModal = (customer) => {
    setSelectedCustomer(customer);
    fetch(`/api/customers/${customer._id}/notes`)
      .then((response) => response.json())
      // .then((data) => setExistingNotes(data.notes || ""))
      .then((data) => setNotes(data.notes || ""))
      .catch((err) => console.error("Failed to load notes", err));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNotes("");
  };

  const handleSaveNote = () => {
    fetch(`/api/customers/${selectedCustomer._id}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Note saved:", data);
        handleCloseModal();
      })
      .catch((err) => console.error("Failed to save note", err));
  };

  return (
    <>
      <Table responsive bordered hover>
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>User Linked</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No customers found.</td>
            </tr>
          ) : (
            customers.map((cust) => (
              <tr key={cust._id}>
                <td>{cust.firstName} {cust.lastName}</td>
                <td>{cust.email}</td>
                <td>{cust.telephone}</td>
                <td>{cust.user ? cust.user.username : 'None'}</td>
                <td>{cust.notes ? cust.notes : 'None'}</td>
                <td>
                  <Button color="primary" size="sm" className="me-2" onClick={() => onEdit(cust)}>Edit</Button>
                  <Button color="info" size="sm" onClick={() => onManageRelations(cust)}>Manage Links</Button>
                  <Button color="secondary" size="sm" onClick={() => handleOpenModal(cust)}>Add Note</Button>
                  <Button color="danger" size="sm" onClick={() => onDelete(cust._id)}>Delete</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      {/* Modal for Adding Notes */}
      <Modal isOpen={showModal} toggle={handleCloseModal}>
        <ModalHeader toggle={handleCloseModal}>Add Note for {selectedCustomer?.firstName} {selectedCustomer?.lastName}</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="notes">Notes</Label>
            <Input
              type="textarea"
              id="notes"
              value={notes}
              className='text-cleanar-color form-input'
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveNote}>Save Note</Button>
          <Button color="secondary" onClick={handleCloseModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>

  );
};

export default CustomerList;
