const userRouter = require('./user');

function route(app) {
	app.use('/', userRouter);
	app.get('/admin', (req, res) => {
		res.render('admin/index', {
			showAdmin: true,
		});
	});
}

module.exports = route;
