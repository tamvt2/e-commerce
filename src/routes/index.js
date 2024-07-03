const { checkLoggedIn, checkAdmin } = require('../middleware/authMiddleware');
const express = require('express');
const userRouter = require('./user');
const categoryRouter = require('./category');
const productRouter = require('./product');
const HomeController = require('../app/controllers/HomeController');

function route(app) {
	app.use('/admin/category', categoryRouter);
	app.use('/admin/product', productRouter);

	app.get('/admin', checkLoggedIn, checkAdmin, (req, res) => {
		res.render('admin/index', {
			showAdmin: true,
		});
	});

	app.use('/uploads', express.static('uploads'));
	app.use('/', userRouter);

	app.get('/', HomeController.home);
}

module.exports = route;
