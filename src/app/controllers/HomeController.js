class HomeController {
	home(req, res) {
		res.render('home', {
			messages: req.flash(),
			orderCount: 500,
			cartCount: 993,
		});
	}
}

module.exports = new HomeController();
