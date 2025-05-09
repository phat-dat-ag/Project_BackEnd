const { ObjectId, ReturnDocument } = require("mongodb");
const { hashPassword } = require("./hashPassword.service");

class ReaderService {
    constructor(client) {
        this.Reader = client.db().collection("readers");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    // Hỗ trợ cho phương thức create() và cả update()
    async extractReaderData(payload) {
        const reader = {
            first_name: payload.first_name,
            last_name: payload.last_name,
            username: payload.username,
            birthday: payload.birthday,
            sex: payload.sex,
            address: payload.address,
            phone: payload.phone,
        };
        // Những lần cập nhật: không đổi/ có password thì khỏi hash lại
        if (payload.password) {
            // Gộp usernaem và password để xác định password là duy nhất, không bị trùng
            const hashedPassword = await hashPassword(payload.password + payload.username);
            reader.password = hashedPassword;
        }
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

    // Lấy toàn bộ thông tin ngoại trừ password
    // Không cho đem password ra khỏi CSDL
    getInfor(reader) {
        const { password, ...newReader } = reader;
        return newReader;
    }

    async find(filter) {
        const cursor = await this.Reader.find(filter);
        const readerList = await cursor.toArray();
        let readers = [];
        readerList.forEach((reader) => {
            const newReader = this.getInfor(reader);
            readers.push(newReader);
        });
        return readers;
    }

    async findByLastName(last_name) {
        const reader = await this.find({
            // Không cần đúng chính xác last_name tìm kiếm
            last_name: { $regex: new RegExp(new RegExp(last_name)), $options: "i" },
        });
        // Không tìm thấy => null => trả về null
        if (!reader)
            return reader;
        const newReader = this.getInfor(reader);
        return newReader;
    }

    async findByIdReader(id) {
        const reader = await this.Reader.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        // Không tìm thấy => null => trả về null
        if (!reader)
            return reader;
        const newReader = this.getInfor(reader);
        return newReader;
    }

    // Cho phép lấy password, dùng trong BE
    async findAccountToLogin(username) {
        const result = await this.Reader.findOne({ username: username });
        // Trả về 1 đối tượng reader
        return result;
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = await this.extractReaderData(payload);
        const result = await this.Reader.findOneAndUpdate(
            filter,
            // Chỉ cập nhật những trường trong đối tượng update
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
    // Xóa tất cả theo thuộc tính được lọc, mặc định là xóa hết
    async deleteAll(query = {}) {
        const result = await this.Reader.deleteMany(query);
        return result.deletedCount;
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