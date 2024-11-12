const StaffService = require("../services/staff.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const TransactionService = require("../services/transaction.service");
const { checkPassword } = require("../services/hashPassword.service");
const jwt = require("jsonwebtoken");


// fullname, username, password, title, address

// Thêm 1 đối tượng staff vào csdl
exports.create = async (req, res, next) => {
    // Không được bỏ trống username
    if (!req.body?.username) {
        return next(new ApiError(400, "username can not be empty"))
    }
    try {
        const staffService = new StaffService(MongoDB.client);
        // Thông tin staff từ req.body
        const document = await staffService.create(req.body);
        // document này chức 2 trường: acknowledged (thêm thành công hay không) và insertedId (ID của đối tượng được thêm)
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while creating the staff"));
    }
}

// Tìm tất cả theo fullname của staff
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const { fullname } = req.query;
        const staffService = new StaffService(MongoDB.client);
        if (fullname) {
            documents = await staffService.findByFullName(fullname);
        } else {
            documents = await staffService.find({});
        }
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while finding the staff"))
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const staffService = new StaffService(MongoDB.client);
        // Lấy id từ truyền params /staffs/:id
        const document = await staffService.findByIdStaff(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Staff not found"));
        }
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error retrieving staff with id=${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    // Lấy 1 mảng các key của đối tượng (req.body từ client gửi lên), sau đó lấy độ dài mảng 
    // => Kiểm tra có đưa dữ liệu để cập nhật không
    if (Object.keys(req.body).lenth === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const staffService = new StaffService(MongoDB.client);
        const document = await staffService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Staff not found"));
        }
        return res.send({ message: "Staff was updated successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error updating staff with id=${req.params.id}`))
    }
};

exports.delete = async (req, res, next) => {
    try {
        const staffService = new StaffService(MongoDB.client);
        const document = await staffService.delete(req.params.id);
        // Nếu null tức là không tìm thấy nên không xóa được
        if (!document) {
            return next(new ApiError(400, "Staff not found"));
        }
        // Ràng buộc dữ liệu
        // Đi xóa những transaction có staff_id trùng với id của staff đã bị xóa
        const transactionService = new TransactionService(MongoDB.client);
        const result = await transactionService.deleteAll({ staff_id: req.params.id });
        return res.send({ message: `Staff and ${result.deletedCount} transactions were deleted successfully` });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Could not delete staff with id=${req.params.id}`))
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const staffService = new StaffService(MongoDB.client);
        const result = await staffService.deleteAll();
        // Ràng buộc dữ liệu
        // Xóa tất cả staff, thì còn cho mượn/ theo dõi mượn sách đâu => Xóa hết transaction
        const transactionService = new TransactionService(MongoDB.client);
        // Không truyền mình đã gán default là xóa hết
        await transactionService.deleteAll();
        return res.send({ message: `${result.deletedCount} staff was (staffs were) deleted successfully` })
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while removing all staffs"));
    }
};

exports.isExistingUsername = async (req, res, next) => {
    try {
        const staffService = new StaffService(MongoDB.client);
        const result = await staffService.findByUsername(req.params.username);
        // Nếu chỉ 1 dấu bằng thì so sánh cả null và underfined
        const isExisting = result !== null;
        return res.send(isExisting);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while checking username"));
    }
}

exports.login = async (req, res, next) => {
    // Yêu cầu có cả username và password
    if (!req.body?.username || !req.body?.password)
        return next(new ApiError(400, "username and password can not be empty"));
    try {
        const staffService = new StaffService(MongoDB.client);
        // Lấy thông tin đăng nhập
        const account = await staffService.login(req.body);
        // Lấy thông tin trong CSDL
        const accountDB = await staffService.findAccountToLogin(account.username);
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

exports.getProfile = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return next(new ApiError(401, "No token provided"));
    }
    // giải mã token, lấy thông tin
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // Lấy staff qua id vừa giải mã
    const staffService = new StaffService(MongoDB.client);
    const staff = await staffService.findByIdStaff(decoded.id);
    // Kiểm tra có lấy được staff không
    if (!staff)
        return res.send(false);
    return res.send(staff);
}