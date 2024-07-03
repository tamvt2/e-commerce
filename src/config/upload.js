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

// Cấu hình file upload
const upload = multer({ storage: storage });

module.exports = upload;
