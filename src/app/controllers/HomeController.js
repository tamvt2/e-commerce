const Cart_Item = require('../models/Cart_Item');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Order_Item = require('../models/Order_Item');
const Review = require('../models/Review');
const { request } = require('express');

class HomeController {
	async countUserOrders(user_id) {
		if (!user_id) {
			return 0;
		}
		const orderCount = await Order.countDocuments({ user_id });
		return orderCount;
	}

	async countUserCarts(user_id) {
		if (!user_id) {
			return 0;
		}
		const cartCount = await Cart_Item.countDocuments({ user_id });
		return cartCount;
	}

	home = async (req, res) => {
		const user_id = req.session.userId;
		const cartCount = await this.countUserCarts(user_id);
		const orderCount = await this.countUserOrders(user_id);
		const products = await Product.find({}).lean();

		for (let product of products) {
			const rating = await Review.aggregate([
				{
					$match: { product_id: product._id },
				},
				{
					$group: {
						_id: '$product_id',
						averageRating: { $avg: '$rating' },
					},
				},
				{
					$project: {
						_id: 0,
						averageRating: 1,
					},
				},
			]);

			product.rating = rating.length > 0 ? rating[0].averageRating : 0;
		}

		res.render('home', {
			products,
			orderCount,
			cartCount,
		});
		// res.json(products);
	};

	search = async (req, res) => {
		const search = req.query.search;
		const user_id = req.session.userId;
		const cartCount = await this.countUserCarts(user_id);
		const orderCount = await this.countUserOrders(user_id);
		const products = await Product.find({
			name: { $regex: new RegExp(search, 'i') },
		}).lean();

		res.render('home', {
			products,
			orderCount,
			cartCount,
		});
	};

	addCart = (req, res) => {
		const productId = req.body.id;
		const userId = req.session.userId;
		if (!userId) {
			return res.json({ error: 'Unauthorized' });
		}
		Product.findById(productId)
			.then(async (product) => {
				let message = '';
				if (!product) {
					message = 'Sản phẩm không tồn tại';
				}

				if (product.stock <= 0) {
					message = 'Sản phẩm đã hết hàng';
				}

				let cartItem = await Cart_Item.findOne({
					user_id: userId,
					product_id: productId,
				});

				if (message == '') {
					if (cartItem) {
						if (cartItem.quantity < product.stock) {
							cartItem.quantity += 1;
							await cartItem.save();
						} else {
							message =
								'Số lượng sản phẩm trong giỏ hàng đã đạt giới hạn';
						}
					} else {
						cartItem = await Cart_Item.create({
							user_id: userId,
							product_id: productId,
							quantity: 1,
						});
					}
				}

				const cartCount = await this.countUserCarts(userId);
				const orderCount = await this.countUserOrders(userId);
				res.json({ cartCount, orderCount, message });
			})
			.catch((err) => {
				console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', err);
				res.status(500).json({
					error:
						err.message ||
						'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng',
				});
			});
	};

	async cart(user_id) {
		try {
			const cart_items = await Cart_Item.find({ user_id }).lean();

			let total = 0;
			for (let cart_item of cart_items) {
				const product = await Product.findById(
					cart_item.product_id
				).lean();
				if (product) {
					cart_item.product = product;
					cart_item.total = cart_item.quantity * product.price;
					total += cart_item.total;
				}
			}

			return { cart_items, total };
		} catch (err) {}
	}

	showCart = async (req, res, next) => {
		const user_id = req.session.userId;
		const cartCount = await this.countUserCarts(user_id);
		const orderCount = await this.countUserOrders(user_id);
		const { cart_items, total } = await this.cart(user_id);
		res.render('cart', {
			cart_items,
			orderCount,
			cartCount,
			total,
		});
		// res.json({ cart_items });
	};

	updateCart = async (req, res) => {
		const { id, quantity } = req.body;
		const user_id = req.session.userId;

		if (!user_id) {
			return res.json({ error: 'Unauthorized' });
		}

		try {
			let message = '';
			const cartItem = await Cart_Item.findOne({
				_id: id,
				user_id,
			});

			const product = await Product.findById(cartItem.product_id);
			if (!product) {
				message = 'Sản phẩm không tồn tại';
			}

			if (quantity > product.stock) {
				message = 'Số lượng sản phẩm trong giỏ hàng đã đạt giới hạn';
			}

			if (message === '') {
				cartItem.quantity = quantity;
				await cartItem.save();
			}
			const { cart_items } = await this.cart(user_id);
			res.json({ cart_items, quantity });
		} catch (err) {
			console.error('Error updating cart:', err);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	};

	deleteCart = async (req, res) => {
		const id = req.params.id;
		const user_id = req.session.userId;

		try {
			let message = '';
			const deletedItem = await Cart_Item.findByIdAndDelete(id);
			if (!deletedItem) {
				return (message = 'Sản phẩm không tồn tại trong giỏ hàng');
			}

			const cartCount = await this.countUserCarts(user_id);
			const orderCount = await this.countUserOrders(user_id);
			const { cart_items } = await this.cart(user_id);

			res.json({ cart_items, cartCount, orderCount });
		} catch (error) {
			console.error('Lỗi khi xóa sản phẩm từ giỏ hàng:', error);
			res.status(500).json({
				error: 'Đã xảy ra lỗi khi xóa sản phẩm từ giỏ hàng',
			});
		}
	};

	checkOut = async (req, res) => {
		const user_id = req.session.userId;

		try {
			const cartItems = await Cart_Item.find({ user_id })
				.populate('product_id')
				.exec();

			if (!cartItems || cartItems.length === 0) {
				return res
					.status(400)
					.json({ error: 'Giỏ hàng của bạn đang trống.' });
			}

			let total = 0;

			for (const cartItem of cartItems) {
				total += cartItem.product_id.price * cartItem.quantity;
			}

			const order = new Order({
				user_id,
				total,
				status: 'Chờ xử lý',
			});

			const savedOrder = await order.save();

			const orderItems = [];
			for (const cartItem of cartItems) {
				const orderItem = new Order_Item({
					order_id: savedOrder._id,
					product_id: cartItem.product_id._id,
					quantity: cartItem.quantity,
					price: cartItem.product_id.price,
				});
				orderItems.push(orderItem.save());
			}

			const orders = await Order.find({ user_id }).lean();

			for (const order of orders) {
				const items = await Order_Item.find({ order_id: order._id })
					.populate('product_id')
					.lean();

				order.order_Item = items;
			}

			for (const item of cartItems) {
				await Product.findByIdAndUpdate(item.product_id._id, {
					$inc: { stock: -item.quantity },
				});
			}

			await Cart_Item.deleteMany({ user_id });
			const cartCount = await this.countUserCarts(user_id);
			const orderCount = await this.countUserOrders(user_id);
			const { cart_items } = await this.cart(user_id);

			res.json({
				success: true,
				message: 'Đặt hàng thành công!',
				cartCount,
				orderCount,
				cart_items,
				orders,
			});
		} catch (error) {
			console.error('Lỗi khi đặt hàng:', error);
			res.status(500).json({ error: 'Đã xảy ra lỗi khi đặt hàng.' });
		}
	};

	showOrder = async (req, res) => {
		const user_id = req.session.userId;
		const cartCount = await this.countUserCarts(user_id);
		const orderCount = await this.countUserOrders(user_id);
		try {
			const orders = await Order.find({ user_id }).lean();

			for (const order of orders) {
				const items = await Order_Item.find({ order_id: order._id })
					.populate('product_id')
					.lean();

				order.order_Item = items;
			}

			res.render('order', { orders, cartCount, orderCount });
		} catch (error) {
			console.error('Lỗi khi tải danh sách đơn hàng:', error);
			res.status(500).send('Đã xảy ra lỗi khi tải danh sách đơn hàng');
		}
	};

	rating = async (req, res) => {
		const { product_id, rating, comment } = req.body;
		const user_id = req.session.userId;

		try {
			const newReview = new Review({
				user_id,
				product_id,
				rating,
				comment,
				created_at: new Date(),
			});
			await newReview.save();

			res.json({ success: true });
		} catch (error) {
			console.error(error);
			res.json({ success: false });
		}
	};
}

module.exports = new HomeController();
