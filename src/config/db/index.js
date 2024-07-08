const mongoose = require('mongoose');

let url =
	'mongodb+srv://tamvt02gcode:lN4gBBiPjTjWnOl5@e-commerce.s1djp08.mongodb.net/?retryWrites=true&w=majority&appName=e-commerce';

async function connect() {
	try {
		mongoose.connect(url);
		console.log('Connect successfully!!!');
	} catch (error) {
		console.log('Connect failure!!!');
	}
}

const getConnectionString = () => {
	if (!url) {
		throw new Error('MongoDB is not connected');
	}
	return url;
};

module.exports = { connect, getConnectionString };
