const mongoose = require('mongoose');

async function connect() {
	try {
		mongoose.connect('mongodb://localhost:27017/e-commerce');
		console.log('Connect successfully!!!');
	} catch (error) {
		console.log('Connect failure!!!');
	}
}

module.exports = { connect };
