const express = require('express');

const { signup, login, protect } = require('../../controllers/authController');
const { getSecretData } = require('../../controllers/secretController');

const router = express.Router();

router.post('/auth/signup', signup);
router.post('/auth/login', login);

router.get('/secretData', protect, getSecretData);

module.exports = router;
