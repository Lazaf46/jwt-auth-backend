const express = require('express');
const bodyParser = require('body-parser');

const apiRouter = require('./routes/api/apiRoutes');
const globalErrorHandler = require('./middleware/globalErrorHandler');


const app = express();

app.use(bodyParser.json());

app.use('/api/v1', apiRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can not find ${req.originalUrl} on the server`, '404'))
});

app.use(globalErrorHandler);

module.exports = app;
