const { ObjectId } = require("mongodb");

class BookService {
    constructor(client) {
        this.Book = client.db().collection("books");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    // Xử lý req.body để hỗ trợ cho phương thức create()
    extractBookData(payload) {
        const book = {
            name: payload.name,
            price: payload.price,
            quantity: payload.quantity,
            publication_year: payload.publication_year,
            publisher_id: payload.publisher_id,
            author: payload.author,
        };
        // Xóa các trường không xác định
        Object.keys(book).forEach(
            (key) => book[key] === undefined && delete book[key]
        );
        return book;
    };

    async create(payload) {
        // Nhận vào req.body từ book.controller và đem nó đi xử lý
        const book = this.extractBookData(payload);
        const result = await this.Book.insertOne(book);
        return result;
    }

    // Được dùng trong findAll
    async find(filter) {
        const cursor = await this.Book.find(filter);
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
    async findByIdBook(id) {
        return await this.Book.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        // Lấy dữ liệu từ req.body 
        const update = this.extractBookData(payload);
        const result = await this.Book.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        // Khi dùng findOneAndUpdate sẽ trả về đối tượng bị xóa
        const result = await this.Book.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        // result mà null thì không tìm thấy nên không xóa được
        return result;
    }

    async deleteAll() {
        // result chứa 2 trường: acknowledged (có xóa được hay không) và deletedCount (số lượng đã xóa)
        const result = await this.Book.deleteMany({});
        return result;
    }
}

module.exports = BookService;