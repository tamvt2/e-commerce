const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		cb(
			null,
			file.fieldname + '-' + Date.now() + path.extname(file.originalname)
		);
	},
});

const fileFilter = (req, file, cb) => {
	const filetypes = /jpeg|jpg|png/;
	const extname = filetypes.test(
		path.extname(file.originalname).toLowerCase()
	);
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) {
		cb(null, true);
	} else {
		cb(
			new Error(
				`File ${file.originalname} không được phép tải lên. Chỉ được phép tải lên file jpeg, jpg hoặc png`
			)
		);
	}
};

// Cấu hình file upload
const upload = multer({ storage, fileFilter });

module.exports = upload;
