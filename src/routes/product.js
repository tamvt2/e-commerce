const express = require('express');
const router = express.Router();
const productController = require('../app/controllers/ProductController');
const upload = require('../config/upload');

router.get('/add', productController.create);
router.post('/upload-image', upload.single('image'), (req, res) => {
	if (req.file) {
		res.json({
			success: true,
			message: 'Upload thành công',
			imageUrl: `/uploads/${req.file.filename}`,
		});
	} else {
		res.status(400).json({
			success: false,
			message: 'Upload thất bại',
		});
	}
});
router.post('/add', productController.store);
router.get('/list', productController.index);
router.get('/edit/:id', productController.show);
router.post('/edit/:id', productController.update);
router.delete('/destroy/:id', productController.destroy);

module.exports = router;
