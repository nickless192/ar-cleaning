const router = require('express').Router();
const { getAllCustomers, getCustomerById, createCustomer, deleteCustomer, updateCustomer } = require('../../controllers/customerController');

// POST /customers
router.post('/', createCustomer); // Add a new customer

// GET /customers/:id
router.get('/:id', getCustomerById); // Get a customer by ID
// GET /customers
router.get('/', getAllCustomers); // Get all customers

// DELETE /customers/:id
router.delete('/:id', deleteCustomer); // Delete a customer by ID

// PUT /customers/:id
router.put('/:id', updateCustomer); // Update a customer by ID

module.exports = router;