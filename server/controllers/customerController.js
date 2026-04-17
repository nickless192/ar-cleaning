const Customer = require('../models/Customer');
const {
  assertNoOperatorKeys,
  pickAllowedFields,
  validateObjectId,
} = require('../utils/mongoSafety');

const CUSTOMER_FIELDS = [
  'user',
  'firstName',
  'lastName',
  'telephone',
  'notes',
  'email',
  'address',
  'city',
  'province',
  'postalcode',
  'companyName',
  'bookings',
  'type',
  'defaultService',
  'defaultServiceDescription',
  'status',
];

module.exports = {
  getAllCustomers: async (req, res) => {
    try {
      const customers = await Customer.find().populate('user').populate('bookings');
      res.status(200).json(customers);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch customers', details: err.message });
    }
  },

  getCustomerById: async (req, res) => {
    try {
      if (!validateObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      const customerId = String(req.params.id);
      const customer = await Customer.findById(customerId).populate('user').populate('bookings');
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.status(200).json(customer);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch customer', details: err.message });
    }
  },

  createCustomer: async (req, res) => {
    try {
      assertNoOperatorKeys(req.body);
      const createData = pickAllowedFields(req.body, CUSTOMER_FIELDS);
      // console.log("Creating customer with data:", req.body);
      const customer = await Customer.create(createData);
      res.status(201).json(customer);
    } catch (err) {
      res.status(400).json({ error: 'Failed to create customer', details: err.message });
    }
  },

  updateCustomer: async (req, res) => {
    try {
      if (!validateObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      const customerId = String(req.params.id);
      assertNoOperatorKeys(req.body);
      const updateData = pickAllowedFields(req.body, CUSTOMER_FIELDS);
      console.log("Updating customer with data:", req.body);
      const updated = await Customer.findByIdAndUpdate(customerId, updateData, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ error: 'Customer not found' });
      res.status(200).json(updated);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update customer', details: err.message });
    }
  },

  deleteCustomer: async (req, res) => {
    try {
      if (!validateObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      const customerId = String(req.params.id);
      const deleted = await Customer.findByIdAndDelete(customerId);
      if (!deleted) return res.status(404).json({ error: 'Customer not found' });
      res.status(200).json({ message: 'Customer deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete customer', details: err.message });
    }
  },
  getCustomerStats: async (req, res) => {
    try {
      const stats = await Customer.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$type", ""] }, // Ensure $ifNull and field reference with $
            count: { $sum: 1 }               // Add missing $ before sum
          }
        }
      ]);
      res.json(stats);
    } catch (err) {
      console.error(err);
      console.error("Aggregation error:", err.message, err.stack);
      res.status(500).json({ error: err });
    }
  },
  getCustomerNotes: async (req, res) => {
    try {
      if (!validateObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      const customerId = String(req.params.id);
      const customer = await Customer.findById(customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      res.json({ notes: customer.notes || "" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  },
  saveCustomerNotes: async (req, res) => {
    try {
      if (!validateObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      const customerId = String(req.params.id);
      const customer = await Customer.findById(customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      customer.notes = req.body.notes;
      await customer.save();

      res.json({ message: "Notes saved successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save notes" });
    }
  },
  assignUserToCustomer: async (req, res) => {
    try {
      if (!validateObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      if (!validateObjectId(req.body.userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      const customerId = String(req.params.id);
      const customer = await Customer.findById(customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      customer.user = req.body.userId;
      await customer.save();

      res.json({ message: "User assigned to customer successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to assign user to customer" });
    }
  },
  getCustomerBookings: async (req, res) => {
    try {
      if (!validateObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      const customerId = String(req.params.id);
      const customer = await Customer.findById(customerId).populate('bookings');
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      res.json({ bookings: customer.bookings });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch customer bookings" });
    }
  },
  removeCustomerBooking: async (req, res) => {
    try {
      const { id, bookingId } = req.params;
      if (!validateObjectId(id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      if (!validateObjectId(bookingId)) {
        return res.status(400).json({ error: 'Invalid booking ID' });
      }
      console.log("Removing booking:", bookingId, "from customer:", id);
      const customer = await Customer.findById(id);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      customer.bookings.pull(bookingId);
      await customer.save();

      res.json({ message: "Booking removed from customer successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to remove booking from customer" });
    }
  }
};
