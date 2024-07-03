const express = require('express');
const engine = require('express-handlebars');
const morgan = require('morgan');
const path = require('path');
const app = express();
const port = 3001;
const route = require('./routes');
const db = require('./config/db');
const session = require('express-session');
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

// Cấu hình express-session
app.use(
	session({
		secret: 'your_secret_key', // Chuỗi bảo mật để ký session ID cookie
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }, // Thiết lập cookie
	})
);

app.use(flash());
app.use(sessionUserMiddleware);

route(app);

app.listen(port, () =>
	console.log(`App listening at http://localhost:${port}`)
);
