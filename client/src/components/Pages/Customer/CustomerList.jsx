// CustomerList.jsx
import React from 'react';
import { Table, Button } from 'reactstrap';

const CustomerList = ({ customers, onEdit, onManageRelations }) => {
  return (
    <Table responsive bordered hover>
      <thead className="table-dark">
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>User Linked</th>
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
              <td>
                <Button color="primary" size="sm" className="me-2" onClick={() => onEdit(cust)}>Edit</Button>
                <Button color="info" size="sm" onClick={() => onManageRelations(cust)}>Manage Links</Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export default CustomerList;
