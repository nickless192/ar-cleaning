const Customer = require('../models/Customer');

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
      const customer = await Customer.findById(req.params.id).populate('user').populate('bookings');
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.status(200).json(customer);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch customer', details: err.message });
    }
  },

  createCustomer: async (req, res) => {
    try {
      const customer = await Customer.create(req.body);
      res.status(201).json(customer);
    } catch (err) {
      res.status(400).json({ error: 'Failed to create customer', details: err.message });
    }
  },

  updateCustomer: async (req, res) => {
    try {
      const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: 'Customer not found' });
      res.status(200).json(updated);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update customer', details: err.message });
    }
  },

  deleteCustomer: async (req, res) => {
    try {
      const deleted = await Customer.findByIdAndDelete(req.params.id);
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
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    res.json({ notes: customer.notes || "" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
},
saveCustomerNotes: async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    customer.notes = req.body.notes;
    await customer.save();

    res.json({ message: "Notes saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save notes" });
  }
}
};
