const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middleware/auth');

router.post('/login', authController.login);

router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);
router.put('/password', authMiddleware, authController.changePassword);

module.exports = router;