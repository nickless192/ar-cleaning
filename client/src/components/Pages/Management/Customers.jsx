// Customers.jsx
import React, { useEffect, useState } from 'react';
import { Container, Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import CustomerList from '/src/components/Pages/Customer/CustomerList';
import CustomerForm from '/src/components/Pages/Customer/CustomerForm';
import CustomerRelations from '/src/components/Pages/Customer/CustomerRelations';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '/src/components/API/customerApi';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [managingCustomer, setManagingCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddNew = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleEdit = (cust) => {
    setEditingCustomer(cust);
    setModalOpen(true);
  };

  const handleSave = async (e,data) => {
    e.preventDefault();
    if (data._id) await updateCustomer(data._id, data);
    else await createCustomer(data);
    setModalOpen(false);
    fetchCustomers();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        // await fetch(`/api/customers/${id}`, { method: 'DELETE' });
        fetchCustomers();
      } catch (error) {
        console.error('Failed to delete customer:', error);
        alert('Failed to delete customer. Please try again.');
      }
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Customer Management</h2>
        <Button color="success" onClick={handleAddNew}>+ Add Customer</Button>
      </div>

      <CustomerList
        customers={customers}
        onEdit={handleEdit}
        onManageRelations={(cust) => setManagingCustomer(cust)}
        onDelete={handleDelete}
      />

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          {editingCustomer ? 'Edit Customer' : 'Add Customer'}
        </ModalHeader>
        <ModalBody>
          <CustomerForm
            initialData={editingCustomer}
            onSubmit={handleSave}
            onCancel={() => setModalOpen(false)}
          />
        </ModalBody>
      </Modal>

      {managingCustomer && (
        <CustomerRelations
          customer={managingCustomer}
          onClose={() => setManagingCustomer(null)}
          onRefresh={fetchCustomers}
        />
      )}
    </Container>
  );
};

export default Customers;