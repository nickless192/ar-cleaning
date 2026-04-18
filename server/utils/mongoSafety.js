const mongoose = require('mongoose');

function isValidObjectId(id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function sanitizeMongoValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMongoValue(item));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const sanitized = {};
  for (const [key, val] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitizeMongoValue(val);
  }
  return sanitized;
}

function sanitizeMongoUpdate(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }
  return sanitizeMongoValue(payload);
}

module.exports = {
  isValidObjectId,
  sanitizeMongoUpdate,
};
