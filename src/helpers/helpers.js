function formatCurrency(price) {
	const priceNumber = parseFloat(price);

	if (isNaN(priceNumber)) {
		return 'Invalid Price';
	}

	return (
		priceNumber.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + ' ₫'
	);
}

function ifCond(v1, v2, options) {
	if (v1 && v2 && v1.toString() === v2.toString()) {
		return options.fn(this);
	}
	return options.inverse(this);
}

function formatCount(count) {
	if (count > 99) {
		return '99+';
	}
	return count;
}

module.exports = { formatCurrency, ifCond, formatCount };
