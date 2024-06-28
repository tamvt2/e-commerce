const express = require('express');
const { engine } = require('express-handlebars');
const morgan = require('morgan');
const path = require('path');
const app = express();
const port = 3001;
const route = require('./routes');
const db = require('./config/db');
const session = require('express-session');
const flash = require('connect-flash');

db.connect();

// HTTP logger
app.use(morgan('combined'));

// Template engine
app.engine('hbs', engine({ extname: '.hbs' }));
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

route(app);

app.listen(port, () =>
	console.log(`App listening at http://localhost:${port}`)
);
