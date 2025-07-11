const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/UserController');

router.get('/login', userController.showLogin);
router.get('/register', userController.showRegister);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.post('/update', userController.update);
router.get('/users', userController.index);

module.exports = router;
