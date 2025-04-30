const express = require("express");
const books = require("../controllers/book.controller");
const multer = require("multer")

const router = express.Router();

// Cấu hình multer để lưu file tạm
const upload = multer({ dest: 'uploads/' });

router.route("/")
    .get(books.findAll)
    .post(books.create)
    .delete(books.deleteAll);

router.route("/:id")
    .get(books.findOne)
    .put(books.update)
    .delete(books.delete);

router.route("/find_all_with/pubisher")
    .get(books.findAllBookWithPublisher)

// Route upload ảnh
router.post("/upload/image", upload.single('img'), books.uploadBookImage);

module.exports = router;