class AppError extends Error {
    constructor(message, statusCode) {
        super(message); // Have to call the super constructor with message
        
        this.statusCode = statusCode;
        // Following line we set the status code by converting the statusCode to a String
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // Since all the errors we create using this class are operational errors,
        // we set this.isOperational to true so that we can check for this property and
        // only send error messages back to the client for the operational errors.
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
