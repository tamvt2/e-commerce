const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let alert = require('alert');

class UserController {
	async index(req, res) {
		try {
			const users = await User.find({});
			res.json(users);
		} catch (error) {
			res.status(400).json({ err: 'ERROR!!!' });
		}
	}
}

module.exports = new UserController();
