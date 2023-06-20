const path = require('path');

const dotenv = require('dotenv');
const mongoose = require("mongoose")
const supertest = require('supertest');

const app = require("../app")
const DB = require('../utils/DB');

beforeEach(async () => {
  dotenv.config({path: path.join(__dirname, 'config.env')});

  await DB.connectDB();
})

afterEach(async () => {
	await mongoose.connection.db.dropDatabase(() => mongoose.connection.close());
})

test('POST /api/v1/auth/signup', async () => {
  const data = {
      name: 'Test User 1',
      email: 'test1@gmail.com',
      password: 'passs@1234!',
      passwordConfirm: 'passs@1234!'
  };

  const response = await supertest(app)
      .post('/api/v1/auth/signup')
      .send(data)
      .expect(201);

  expect(response.body.status).toBe('success');
}, 120000);
