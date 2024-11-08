const { ObjectId, ReturnDocument } = require("mongodb");
const { hashPassword } = require("./hashPassword.service");

class ReaderService {
    constructor(client) {
        this.Reader = client.db().collection("readers");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    // Hỗ trợ cho phương thức create()
    async extractReaderData(payload) {
        // Gộp usernaem và password để xác định password là duy nhất, không bị trùng
        const hashedPassword = await hashPassword(payload.password + payload.username);
        const reader = {
            first_name: payload.first_name,
            last_name: payload.last_name,
            username: payload.username,
            password: hashedPassword,
            birthday: payload.birthday,
            sex: payload.sex,
            address: payload.address,
            phone: payload.phone,
        };
        // Xóa các trường không xác định
        Object.keys(reader).forEach(
            (key) => reader[key] === undefined && delete reader[key]
        );
        return reader;
    };

    async create(payload) {
        const reader = await this.extractReaderData(payload);
        const result = await this.Reader.insertOne(reader);
        return result;
    }

    async find(filter) {
        const cursor = await this.Reader.find(filter);
        return await cursor.toArray();
    }

    async findByLastName(last_name) {
        return await this.find({
            // name là thiếu, last_name mới đúng
            last_name: { $regex: new RegExp(new RegExp(last_name)), $options: "i" },
        });
    }

    async findByIdReader(id) {
        return await this.Reader.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = await this.extractReaderData(payload);
        const result = await this.Reader.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const result = await this.Reader.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async deleteAll() {
        const result = await this.Reader.deleteMany({});
        return result.deletedCount;
    }

    async findByUsername(username) {
        const result = await this.Reader.findOne({ username: username });
        // Trả về 1 đối tượng reader
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

module.exports = ReaderService;