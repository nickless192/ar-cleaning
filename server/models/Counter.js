const { Schema, model } = require("mongoose");

const CounterSchema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "invoiceNumber"
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model("Counter", CounterSchema);
