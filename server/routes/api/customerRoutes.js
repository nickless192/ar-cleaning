const router = require('express').Router();
const { getAllCustomers, getCustomerById, createCustomer, deleteCustomer, updateCustomer, getCustomerStats, saveCustomerNotes, getCustomerNotes, assignUserToCustomer, getCustomerBookings, removeCustomerBooking   } = require('../../controllers/customerController');

// POST /customers
router.post('/', createCustomer); // Add a new customer
router.get("/stats", getCustomerStats);

// GET /customers/:id
router.put('/:id/assign-user', assignUserToCustomer);
router.get('/:id/bookings', getCustomerBookings);
router.get('/:id/notes', getCustomerNotes);
router.post('/:id/notes', saveCustomerNotes);
router.get('/:id', getCustomerById); // Get a customer by ID
// GET /customers
router.get('/', getAllCustomers); // Get all customers

// DELETE /customers/:id
router.delete('/:id', deleteCustomer); // Delete a customer by ID

// DELETE /customers/:id/bookings/:bookingId
router.put('/:id/bookings/:bookingId', removeCustomerBooking);
// PUT /customers/:id    
router.put('/:id', updateCustomer); // Update a customer by ID

module.exports = router;