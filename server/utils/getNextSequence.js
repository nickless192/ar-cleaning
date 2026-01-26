const Counter = require("../models/Counter");

async function getNextSequence(key, startAt = 1) {
  // Ensures doc exists with seq initialized to startAt-1
  await Counter.updateOne(
    { key },
    { $setOnInsert: { seq: startAt - 1 } },
    { upsert: true }
  );

  // Atomic increment
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true }
  );

  return doc.seq;
}

module.exports = getNextSequence;
