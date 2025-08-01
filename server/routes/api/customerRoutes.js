const router = require('express').Router();
const { getAllCustomers, getCustomerById, createCustomer, deleteCustomer, updateCustomer, getCustomerStats, saveCustomerNotes, getCustomerNotes   } = require('../../controllers/customerController');

// POST /customers
router.post('/', createCustomer); // Add a new customer
router.get("/stats", getCustomerStats);

// GET /customers/:id
router.get('/:id/notes', getCustomerNotes);
router.post('/:id/notes', saveCustomerNotes);
router.get('/:id', getCustomerById); // Get a customer by ID
// GET /customers
router.get('/', getAllCustomers); // Get all customers

// DELETE /customers/:id
router.delete('/:id', deleteCustomer); // Delete a customer by ID

// PUT /customers/:id
router.put('/:id', updateCustomer); // Update a customer by ID


module.exports = router;