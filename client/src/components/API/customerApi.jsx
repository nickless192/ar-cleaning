export const getCustomers = async () => {
  const res = await fetch('/api/customers');
  return res.json();
};
export const getCustomerById = async (id) => {
  const res = await fetch(`/api/customers/${id}`);
  if (!res.ok) throw new Error('Customer not found');
  return res.json();
};

export const createCustomer = async (data) => {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteCustomer = async (id) => {
  const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete customer');
  return res.json();
};

export const updateCustomer = async (id, data) => {
  const res = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const linkUser = async (customerId, userId) => {
  return updateCustomer(customerId, { user: userId });
};

export const unlinkUser = async (customerId) => {
  return updateCustomer(customerId, { user: null });
};

export const linkBooking = async (customerId, bookingId) => {
  return updateCustomer(customerId, { $push: { bookings: bookingId } });
};

export const unlinkBooking = async (customerId, bookingId) => {
  return updateCustomer(customerId, { $pull: { bookings: bookingId } });
};
