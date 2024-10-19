const StaffService = require("../services/staff.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");


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
        return res.send({ message: "Staff was deleted successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Could not delete staff with id=${req.params.id}`))
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const staffService = new StaffService(MongoDB.client);
        const result = await staffService.deleteAll();
        return res.send({ message: `${result.deletedCount} staff was (staffs were) deleted successfully` })
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while removing all staffs"));
    }
};

