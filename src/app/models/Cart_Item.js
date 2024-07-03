const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cart_Item = new Schema({
	cart_id: Schema.Types.ObjectId,
	product_id: Schema.Types.ObjectId,
	quantity: Number,
});

module.exports = mongoose.model('Cart_Item', Cart_Item);
