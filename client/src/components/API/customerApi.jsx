import { authFetch } from '/src/utils/authFetch';

export const getCustomers = async () => {
  const res = await authFetch('/api/customers');
  return res.json();
};
export const getCustomerById = async (id) => {
  const res = await authFetch(`/api/customers/${id}`);
  if (!res.ok) throw new Error('Customer not found');
  return res.json();
};

export const createCustomer = async (data) => {
  const res = await authFetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
};

export const deleteCustomer = async (id) => {
  const res = await authFetch(`/api/customers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete customer');
  return res.json();
};

export const updateCustomer = async (id, data) => {
  const res = await authFetch(`/api/customers/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update customer');
  return res.json();
};

export const linkBooking = async (customerId, bookingId) => {
  return updateCustomer(customerId, { $push: { bookings: bookingId } });
};

export const unlinkBooking = async (customerId, bookingId) => {
  return updateCustomer(customerId, { $pull: { bookings: bookingId } });
};
