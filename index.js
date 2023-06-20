const dotenv = require('dotenv');
const mongoose = require('mongoose');

const DB = require('./utils/DB');

const app = require('./app');

process.on('uncaughtException', (err) => {
    console.log('Unhandled Exception. Shutting Down...');
    console.log(err);

    process.exit(1);
});

dotenv.config({ path: './config.env' });

DB.connectDB();

const port = process.env.PORT || 8000;

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection. Shutting Down...');
    console.log(err);

    server.close(() => {
        process.exit(1);
    });
});

module.exports = server;
