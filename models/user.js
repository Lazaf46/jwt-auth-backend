const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, // not a validator. Converts the email to lowercase
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // Works only on create and save
      validator(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  }
});

userSchema.pre('save', async function (next) {
  // 1. Only run the function if the password has been modifield

  // this.isModified('fieldName') checks if the given field is modified.
  // That is, if it has been changed than the previous time
  if (!this.isModified('password')) next();

  // 2. Hash the password with a cost of 12

  // 10 is okay, but with computers getting better and better 12 will do
  this.password = await bcrypt.hash(this.password, 12);

  // 3. Delete the passwordConfirm field

  // Setting a field to undefined deletes the field. passwordConfirm
  // is only needed for checking if the two passwords are equal
  // This works even though passwordConfirm has been marked as required. But
  // this actually mean that it is a required input no need to be persisted to the
  // database
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  // this.isNew checks if a document is new
  if(!this.isModified('password') || this.isNew) return next();

  // In the resetPassword controller we are updating the password and
  // issuing a new token. These events happen closely. But in the protect
  // middleware, we check if the passwordUpdatedAt < JWTTimestamp
  // Saving to the databse can be a slow operation. As a result, the JWT
  // could have been issued before the password is updated. This Results
  // in passwordUpdatedAt > JWTTimestamp. Hence we have to substract 1000
  // milliseconds
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Create an instance method that is available in all documents to compare the passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // this refer to the current document. Since password is set to select false,
  // this.password does not work. So we pass the userPassword as an argument to the
  // function
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // We can get the token issued time from the JWTTimestamp

  // A value for the passwordChangedAt field is only added if the user changes the password.
  // So we have to first check if that property exists before using it.
  if (this.passwordChangedAt) {
    // getTime() gives the time in milliseconds.
    // then we divide it by 1000 to get the time in seconds for comparison
    // parseInt parses everything to an integer
    // 10 is the base
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
