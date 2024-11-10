const express = require("express");
const cors = require("cors");

const ApiError = require("./app/api-error");

// Khai báo các router
const readersRouter = require("./app/routes/reader.route");
const staffRouter = require("./app/routes/staff.route");
const publisheRouter = require("./app/routes/publisher.route");
const bookRouter = require("./app/routes/book.route");
const transactionRouter = require("./app/routes/transaction.route");
const adminService = require("./app/routes/admin.route");

// Đảm bảo biến môi trường được tải khi ứng dụng khởi chạy
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to contact book application." });
});

// Sử dụng các router
app.use("/api/readers", readersRouter);
app.use("/api/staffs", staffRouter);
app.use("/api/publishers", publisheRouter);
app.use("/api/books", bookRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/admins", adminService);

// handle 404 response
app.use((req, res, next) => {
    // Code ở đây sẽ chạy khi không có route được định nghĩa nào khớp với yêu cầu. Gọi next() để chuyển sang middleware để xử lý lỗi
    return next(new ApiError(404, "Resource not found"));
});

// define error-handling middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
    // Middleware xử lý lỗi tập trung. Trong các đoạn code xử lý ở các route, gọi next(error) sẽ chuyển về middleware xử lý lỗi này
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;