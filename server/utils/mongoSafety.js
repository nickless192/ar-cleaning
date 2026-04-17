const mongoose = require('mongoose');

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function cloneSanitizedValue(value) {
  if (Array.isArray(value)) {
    return value.map(cloneSanitizedValue);
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (isPlainObject(value)) {
    const output = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        throw new Error('Invalid payload keys');
      }
      output[key] = cloneSanitizedValue(nestedValue);
    }
    return output;
  }

  return value;
}

function hasOperatorKeys(value) {
  if (Array.isArray(value)) {
    return value.some(hasOperatorKeys);
  }

  if (!isPlainObject(value)) return false;

  return Object.entries(value).some(([key, nestedValue]) => {
    if (key.startsWith('$') || key.includes('.')) return true;
    return hasOperatorKeys(nestedValue);
  });
}

function assertNoOperatorKeys(value) {
  if (hasOperatorKeys(value)) {
    throw new Error('Invalid payload keys');
  }
}

function validateObjectId(id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

function pickAllowedFields(source, allowedFields) {
  const output = {};
  if (!source || typeof source !== 'object') return output;

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      output[field] = cloneSanitizedValue(source[field]);
    }
  }

  return output;
}

module.exports = {
  assertNoOperatorKeys,
  pickAllowedFields,
  validateObjectId,
};
