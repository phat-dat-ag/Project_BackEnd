const { hashPassword } = require("./hashPassword.service");
class AdminService {
    constructor(client) {
        this.Admin = client.db().collection("admin");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    // Xử lý req.body để hỗ trợ cho phương thức create()
    async extractAdminData(payload) {
        const admin = {
            username: payload.username,
        };
        if (payload.password) {
            const hashedPassword = await hashPassword(payload.username + payload.password);
            admin.password = hashedPassword;
        }
        // Xóa các trường không xác định
        Object.keys(admin).forEach(
            (key) => admin[key] === undefined && delete admin[key]
        );
        return admin;
    };
    // Chưa có ràng buộc khi thêm: trùng username
    async create(payload) {
        // Nhận vào req.body từ admin.controller và đem nó đi xử lý
        const admin = await this.extractAdminData(payload);
        const result = await this.Admin.insertOne(admin);
        return result;
    }

    async findByUsername(username) {
        const result = await this.Admin.findOne({ username: username });
        return result;
    }

    // Cho phép lấy password, chỉ dùng trong BE 
    async findAccountToLogin(username) {
        const result = await this.Admin.findOne({ username: username });
        return result;
    }

    // Xử lý username, password được gửi lên: KHÔNG HASH
    async extractAccount(payload) {
        const account = {
            username: payload.username,
            password: payload.password,
        };
        // Xóa các trường không xác định
        Object.keys(account).forEach(
            (key) => account[key] === undefined && delete account[key]
        );
        return account;
    }

    // input là dữ liệu trong body gửi lên từ client qua post
    async login(input) {
        // Lấy thông tin đăng nhập
        const account = await this.extractAccount(input);
        return account;
    }

}

module.exports = AdminService;