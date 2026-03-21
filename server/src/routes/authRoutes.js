const express = require('express');
const router  = express.Router();
const {
  signup, login, getMe, logout,
  updateProfile, changePassword,
} = require('../controllers/authController');

router.post('/signup',   signup);
router.post('/login',    login);
router.get ('/me',       getMe);
router.post('/logout',   logout);
router.put ('/profile',  updateProfile);
router.put ('/password', changePassword);

module.exports = router;