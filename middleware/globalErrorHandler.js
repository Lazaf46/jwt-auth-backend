const sendErrorDev = (err, req, res) => {
        let errorObj;

        if(err.message.includes('E11000 duplicate key error collection')) {
            errorObj = {
                status: 400,
                message: 'User already exists. Try again with a different email'
            };
        }  else if(err.message.includes("Cannot read property 'jwt' of undefined")) {
            errorObj = {
                status: 401,
                message: 'JWT token is not present'
            };
        } else if(err.message.includes('jwt malformed')) {
            errorObj = {
                status: 401,
                message: 'Invalid JWT token'
            };
        }
        else {
            errorObj = {
                status: err.statusCode,
                message: err.message,
                error: err,
                stack: err.stack
            };
        }

        return res.status(errorObj.status).json(errorObj);
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    sendErrorDev(err, req, res);
};