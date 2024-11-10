const AdminService = require("../services/admin.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { checkPassword } = require("../services/hashPassword.service");
const jwt = require("jsonwebtoken");

// Chưa có ràng buộc khi thêm: trùng username
exports.create = async (req, res, next) => {
    if (!req.body?.username || !req.body?.password) {
        return next(new ApiError(400, "username and password can not be empty"));
    }
    try {
        const adminService = new AdminService(MongoDB.client);
        const document = await adminService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while creating the admin account"))
    }
}


exports.login = async (req, res, next) => {
    // Yêu cầu có cả username và password
    if (!req.body?.username || !req.body?.password)
        return next(new ApiError(400, "username and password can not be empty"));
    try {
        const adminService = new AdminService(MongoDB.client);
        // Lấy thông tin đăng nhập
        const account = await adminService.login(req.body);
        // Lấy thông tin trong CSDL
        const accountDB = await adminService.findByUsername(account.username);
        // Khi tìm không thấy username
        if (!accountDB) {
            // return next(new ApiError(400, "username does not exist"))
            return res.send(false);
        }
        // Khi tìm thấy username
        const isSucceed = await checkPassword(account.username + account.password, accountDB.password);
        // Thất bại: sai password
        if (!isSucceed) {
            return res.send(false);
        }
        // Thành công, tiến hành tạo token
        const payload = {
            id: accountDB._id,
            username: accountDB.username
        };
        const options = {
            expiresIn: "1h",
        };
        const token = jwt.sign(payload, process.env.SECRET_KEY, options);
        return res.send({ success: true, token });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while checking username"));
    }
}