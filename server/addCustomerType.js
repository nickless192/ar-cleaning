// scripts/addCustomerType.js
require('dotenv').config();
const mongoose = require("mongoose");
const Customer = require('./models/Customer');

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ar-cleaning-local';
async function addTypeToCustomers() {
  try {
     await mongoose.connect(process.env.MONGODB_URI) ;

    // Update all customers missing the 'type' field
    const result = await Customer.updateMany(
      { type: { $exists: false } }, // only those without 'type'
      { $set: { type: "one-time" } } // default value
    );

    console.log(`Matched ${result.matchedCount}, Modified ${result.modifiedCount} customers.`);
  } catch (err) {
    console.error("Error updating customers:", err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

addTypeToCustomers();
