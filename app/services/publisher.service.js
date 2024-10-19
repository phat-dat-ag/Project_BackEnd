const { ObjectId } = require("mongodb");

class PublisherService {
    constructor(client) {
        this.Publisher = client.db().collection("publishers");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    // Xử lý req.body để hỗ trợ cho phương thức create()
    extractPublisherData(payload) {
        const publisher = {
            name: payload.name,
            address: payload.address,
        };
        // Xóa các trường không xác định
        Object.keys(publisher).forEach(
            (key) => publisher[key] === undefined && delete publisher[key]
        );
        return publisher;
    };

    async create(payload) {
        // Nhận vào req.body từ publisher.controller và đem nó đi xử lý
        const publisher = this.extractPublisherData(payload);
        const result = await this.Publisher.insertOne(publisher);
        return result;
    }

    // Được dùng trong findAll
    async find(filter) {
        const cursor = await this.Publisher.find(filter);
        return await cursor.toArray();
    }

    // Được dùng trong findAll
    async findByName(name) {
        // gọi hàm find ở trên, mà hàm ở trên đã cài để trả về mảng toArray rồi
        return await this.find({
            name: { $regex: new RegExp(new RegExp(name)), $options: "i" },
        });
    }

    // Được dùng cho findOne
    async findByIdPublisher(id) {
        return await this.Publisher.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        // Lấy dữ liệu từ req.body 
        const update = this.extractPublisherData(payload);
        const result = await this.Publisher.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        // Khi dùng findOneAndUpdate sẽ trả về đối tượng bị xóa
        const result = await this.Publisher.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        // result mà null thì không tìm thấy nên không xóa được
        return result;
    }

    async deleteAll() {
        // result chứa 2 trường: acknowledged (có xóa được hay không) và deletedCount (số lượng đã xóa)
        const result = await this.Publisher.deleteMany({});
        return result;
    }
}

module.exports = PublisherService;