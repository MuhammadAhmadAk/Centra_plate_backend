/**
 * Standard Success Response Handler
 * returns a structured success response
 * 
 * @param {Object} res - Express Response Object
 * @param {number} statusCode - HTTP Status Code (e.g., 200, 201)
 * @param {string} message - Success Message
 * @param {Object|Array|null} data - Data payload (optional)
 * @returns {Object} JSON Response
 */
const sendSuccess = (res, statusCode, message, data = null) => {
    const response = {
        status: true,
        message: message || 'Operation completed successfully.',
    };

    if (data !== null && data !== undefined) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Standard Error Response Handler
 * returns a structured error response and cleans up error messages
 * 
 * @param {Object} res - Express Response Object
 * @param {number} statusCode - HTTP Status Code (e.g., 400, 404, 500)
 * @param {string} message - Error Message
 * @param {Object|string|null} error - Raw error object or details (optional)
 * @returns {Object} JSON Response
 */
const sendError = (res, statusCode, message, error = null) => {
    const response = {
        status: false,
        message: message || 'An error occurred.',
    };

    // If there is specific error details, include them
    // If it's a raw Error object, we might want to extract the message or stack (only in dev)
    if (error) {
        if (error instanceof Error) {
            response.error = error.message; // Just show the message to simple clients

            // Optionally could include stack trace if in development mode
            if (process.env.NODE_ENV === 'development') {
                response.stack = error.stack;
            }
        } else {
            response.error = error;
        }
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    sendSuccess,
    sendError
};
