const mongoose = require('mongoose');

class DB {
  static async connectDB() {
    const DB = process.env.DB_CONNECTION_STRING
      .replace('PASSWORD', process.env.DB_PASSWORD)
      .replace('DB_NAME', process.env.DB_NAME)
      .replace('DB_USER', process.env.DB_USER);

    mongoose
      .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('Connected to the database successfully!');
      })
      .catch((error) => {
        console.error('Failed to connect to the database:', error);
      });
  }
}

module.exports = DB;
