// Utility function to send consistent responses
const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).send({ data: data });
};

// Utility function to throw consistent exceptions/errors
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validate schema
const validateSchema = (schema, keyParams) => (req, res, next) => {
  const { error } = schema.validate(req[keyParams]);

  if (error) {
    next(createError(400, error));
  }

  next();
};

module.exports = { sendResponse, createError, validateSchema };
