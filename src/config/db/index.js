const mongoose = require('mongoose');

async function connect() {
	try {
		mongoose.connect(
			'mongodb+srv://tamvt02gcode:lN4gBBiPjTjWnOl5@e-commerce.s1djp08.mongodb.net/?retryWrites=true&w=majority&appName=e-commerce'
		);
		console.log('Connect successfully!!!');
	} catch (error) {
		console.log('Connect failure!!!');
	}
}

module.exports = { connect };
