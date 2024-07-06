const { checkLoggedIn, checkAdmin } = require('../middleware/authMiddleware');
const express = require('express');
const userRouter = require('./user');
const categoryRouter = require('./category');
const productRouter = require('./product');
const adminRouter = require('./admin');
const HomeController = require('../app/controllers/HomeController');

function route(app) {
	app.use('/admin/category', checkLoggedIn, checkAdmin, categoryRouter);
	app.use('/admin/product', checkLoggedIn, checkAdmin, productRouter);
	app.use('/admin', checkLoggedIn, checkAdmin, adminRouter);

	app.get('/admin', checkLoggedIn, checkAdmin, (req, res) => {
		res.render('admin/index', {
			showAdmin: true,
		});
	});

	app.use('/uploads', express.static('uploads'));
	app.use('/', userRouter);

	app.get('/', HomeController.home);
	app.get('/search', HomeController.search);
	app.post('/addCart', checkLoggedIn, HomeController.addCart);
	app.get('/cart', HomeController.showCart);
	app.post('/updateCart', checkLoggedIn, HomeController.updateCart);
	app.delete('/deleteCart/:id', checkLoggedIn, HomeController.deleteCart);
	app.post('/checkout', checkLoggedIn, HomeController.checkOut);
	app.get('/order', HomeController.showOrder);
	app.post('/rating', checkLoggedIn, HomeController.rating);
}

module.exports = route;
