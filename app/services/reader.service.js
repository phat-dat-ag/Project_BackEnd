const { ObjectId, ReturnDocument } = require("mongodb");

class ReaderService {
    constructor(client) {
        this.Reader = client.db().collection("readers");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    // Hỗ trợ cho phương thức create()
    extractReaderData(payload) {
        const reader = {
            first_name: payload.first_name,
            last_name: payload.last_name,
            birthday: payload.birthday,
            sex: payload.sex,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        };
        // Xóa các trường không xác định
        Object.keys(reader).forEach(
            (key) => reader[key] === undefined && delete reader[key]
        );
        return reader;
    };

    async create(payload) {
        const reader = this.extractReaderData(payload);
        const result = await this.Reader.findOneAndUpdate(
            reader,
            { $set: { favorite: reader.favorite === true } },
            { returnDocument: "after", upsert: true }
        );
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
        const update = this.extractReaderData(payload);
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

    async findFavorite() {
        return await this.find({ favorite: true });
    }

    async deleteAll() {
        const result = await this.Reader.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ReaderService;