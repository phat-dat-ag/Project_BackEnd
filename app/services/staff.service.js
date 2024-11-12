const { ObjectId } = require("mongodb");
const { hashPassword } = require("./hashPassword.service");

class StaffService {
    constructor(client) {
        this.Staff = client.db().collection("staffs");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    // Xử lý req.body để hỗ trợ cho phương thức create()
    async extractStaffData(payload) {
        // Gộp usernaem và password để xác định password là duy nhất, không bị trùng
        const hashedPassword = await hashPassword(payload.password + payload.username);
        const staff = {
            fullname: payload.fullname,
            username: payload.username,
            password: hashedPassword,
            title: payload.title,
            address: payload.address,
            phone: payload.phone,
        };
        // Xóa các trường không xác định
        Object.keys(staff).forEach(
            (key) => staff[key] === undefined && delete staff[key]
        );
        return staff;
    };

    async create(payload) {
        // Nhận vào req.body từ staff.controller và đem nó đi xử lý
        const staff = await this.extractStaffData(payload);
        const result = await this.Staff.insertOne(staff);
        return result;
    }

    // Lấy toàn bộ thông tin ngoại trừ password
    // Không cho đem password ra khỏi CSDL
    getInfor(staff) {
        const { password, ...newStaff } = staff;
        return newStaff;
    }

    // Được dùng trong findAll
    async find(filter) {
        const cursor = await this.Staff.find(filter);
        const staffList = await cursor.toArray();
        let staffs = [];
        staffList.forEach((staff) => {
            const newStaff = this.getInfor(staff);
            staffs.push(newStaff);
        });
        return staffs;
    }

    // Được dùng trong findAll
    async findByFullName(fullname) {
        // gọi hàm find ở trên, mà hàm ở trên đã cài để trả về mảng toArray rồi
        const staff = await this.find({
            // Không cần đúng chính xác fullname tìm kiếm
            fullname: { $regex: new RegExp(new RegExp(fullname)), $options: "i" },
        });
        // Không tìm thấy => null => trả về null
        if (!staff)
            return staff;
        const newStaff = this.getInfor(staff);
        return newStaff;
    }

    // Được dùng cho findOne
    async findByIdStaff(id) {
        const staff = await this.Staff.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        // Không tìm thấy => null => trả về null
        if (!staff)
            return staff;
        const newStaff = this.getInfor(staff);
        return newStaff;
    }

    // Cho phép lấy password, chỉ dùng trong BE 
    async findAccountToLogin(username) {
        const result = await this.Staff.findOne({ username: username });
        return result;
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        // Lấy dữ liệu từ req.body 
        const update = await this.extractStaffData(payload);
        const result = await this.Staff.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        // Khi dùng findOneAndUpdate sẽ trả về đối tượng bị xóa
        const result = await this.Staff.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        // result mà null thì không tìm thấy nên không xóa được
        return result;
    }

    async deleteAll() {
        // result chứa 2 trường: acknowledged (có xóa được hay không) và deletedCount (số lượng đã xóa)
        const result = await this.Staff.deleteMany({});
        return result;
    }

    // Xử lý username, password được gửi lên
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

module.exports = StaffService;