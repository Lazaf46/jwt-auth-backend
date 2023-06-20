// We handle authentication related logic in this authController

const { promisify } = require('util'); // We use this to promisify jwt.verify()

const jwt = require('jsonwebtoken');

const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  // better to promisify and use the async version
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN, // sets the expiry date
    }
  );
};

// Controller method name is signUp (*Not* createUser) because that is the most meaningful name
// in the context of creating a new user
exports.signup = catchAsync(async (req, res, next) => {
  // Here we do not directly pass req.body to User.create. If we did so,
  // the client will be able to do things like sending the data to make the user an admin etc...
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password, // encryption is handled in the data layer
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  const {name, email} = newUser;

  res.status(201).json({
    status: 'success',
    token, // token is not sent in the data property
    data: {
      user: {
          name, 
          email
      },
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // In this method, we do not create a new user etc... Hence validation is not handled
  // in the data layer.
  // So we have to do validation from scarch.
  // That includes checking things like if the email and password actually exists in the
  // request body

  const { email, password } = req.body;

  // 1. Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2. Check if the user exits && the password is correct

  // We have to explicitly select password since it is not selected by default.
  // we have to use the + sign to explicitly select the password field
  const user = await User.findOne({ email }).select('+password');

  // We delegate the password comparison to the data layer since that is where it should happen

  // Following code will not run if a user does not exist. So we directly include
  // code next to the equal sign directly in the if check
  // const correct = await user.correctPassword(password. user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. Everything okay? Send the Jsonwebtoken
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token, // token is not sent in the data property
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get the token and check if it is there
  let token;

  // Checks if the header exists and if it starts with the term 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    // We also check for the existance of the jwt cookie other than the bearer token
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access', 401)
    );
  }

  // 2. Validate the token (Verification)

  // We promisify the jwt.verify function and await it
  // Two errors can occur while executing the following line of code
  //    1) Data in the token could have been changed
  //    2) The token could have expired
  // Rather than handling the above two errors here directly using
  // try and catch, we delegate it to our global error handling middleware
  await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  next();
});
