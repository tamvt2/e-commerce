const express = require('express');
const engine = require('express-handlebars');
const morgan = require('morgan');
const path = require('path');
const app = express();
const port = 3001;
const route = require('./routes');
const db = require('./config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const sessionUserMiddleware = require('./middleware/sessionUser');
const helpers = require('./helpers/helpers');

db.connect();

// HTTP logger
app.use(morgan('combined'));

const hbs = engine.create({
	helpers: {
		ifCond: helpers.ifCond,
		formatCurrency: helpers.formatCurrency,
		formatCount: helpers.formatCount,
		totalPrice: helpers.totalPrice,
		formatDate: helpers.formatDate,
		ifEquals: helpers.ifEquals,
		formatAverageRating: helpers.formatAverageRating,
	},
	extname: '.hbs',
});

// Template engine
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	express.urlencoded({
		extended: true,
	})
);
app.use(express.json());

const mongoUrl = db.getConnectionString();

// Cấu hình express-session
app.use(
	session({
		secret: 'your_secret_key',
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({
			mongoUrl: mongoUrl,
			collectionName: 'sessions',
		}),
	})
);

app.use(flash());
app.use(sessionUserMiddleware);
app.use((err, req, res, next) => {
	// Kiểm tra xem có phải lỗi do Multer không
	if (err instanceof multer.MulterError) {
		res.status(400).json({
			success: false,
			message: 'Lỗi khi upload file: ' + err.message,
		});
	} else {
		// Lỗi xảy ra từ các middleware khác hoặc mã nguồn
		res.status(err.status || 500).json({
			success: false,
			message: err.message || 'Lỗi Server nội bộ',
		});
	}
});

route(app);

app.listen(port, () =>
	console.log(`App listening at http://localhost:${port}`)
);
