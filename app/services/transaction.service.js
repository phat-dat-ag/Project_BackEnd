const { ObjectId } = require("mongodb");

class TransactionService {
    constructor(client) {
        this.Transaction = client.db().collection("transactions");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API

    // Xử lý req.body để hỗ trợ cho phương thức create()
    extractTransactionData(payload) {
        const transaction = {
            book_id: new ObjectId(payload.book_id),
            reader_id: new ObjectId(payload.reader_id),
            staff_id: new ObjectId(payload.staff_id),
            borrow_date: payload.borrow_date,
            return_date: payload.return_date,
            status: payload.status,
        };
        // Xóa các trường không xác định
        Object.keys(transaction).forEach(
            (key) => transaction[key] === undefined && delete transaction[key]
        );
        return transaction;
    };

    async create(payload) {
        // Nhận vào req.body từ transaction.controller và đem nó đi xử lý
        const transaction = this.extractTransactionData(payload);
        const result = await this.Transaction.insertOne(transaction);
        return result;
    }

    // Được dùng trong findAll
    async find(filter) {
        const cursor = await this.Transaction.find(filter);
        return await cursor.toArray();
    }

    // Được dùng trong findAll
    async findByBorrowDate(borrow_date) {
        // gọi hàm find ở trên, mà hàm ở trên đã cài để trả về mảng toArray rồi
        return await this.find({
            borrow_date: { $regex: new RegExp(new RegExp(borrow_date)), $options: "i" },
        });
    }

    async getAllTransactionWithFullInformation() {
        return this.Transaction.aggregate([
            {
                $lookup: {
                    from: "books",
                    localField: "book_id",
                    foreignField: "_id",
                    as: "book",
                }
            },
            { $unwind: "$book" },
            // Thông qua book
            {
                $lookup: {
                    from: "publishers",
                    // Thông qua book
                    localField: "book.publisher_id",
                    foreignField: "_id",
                    as: "publisher",
                }
            },
            { $unwind: "$publisher" },
            {
                $lookup: {
                    from: "readers",
                    localField: "reader_id",
                    foreignField: "_id",
                    as: "reader",
                }
            },
            { $unwind: "$reader" },
            {
                $lookup: {
                    from: "staffs",
                    localField: "staff_id",
                    foreignField: "_id",
                    as: "staff",
                }
            },
            { $unwind: "$staff" },
            // Thêm các trường cần hiển thị từ book, publisher, staff,reader, làm phẳng object
            {
                $addFields: {
                    book_name: "$book.name",
                    publisher_id: "$publisher._id",
                    publisher_name: "$publisher.name",
                    reader_fullname: {
                        // Hàm nối chuỗi: reader_fullname vẫn là String
                        $concat: ["$reader.first_name", " ", "$reader.last_name"]
                    },
                    staff_fullname: "$staff.fullname",
                }
            },
            // Ẩn đi các object
            {
                $project: {
                    book: 0, publisher: 0, reader: 0, staff: 0
                }
            }
        ]).toArray();
    }

    // Được dùng cho findOne
    async findByIdTransaction(id) {
        return await this.Transaction.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        // Lấy dữ liệu từ req.body 
        const update = this.extractTransactionData(payload);
        const result = await this.Transaction.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        // Khi dùng findOneAndUpdate sẽ trả về đối tượng bị xóa
        const result = await this.Transaction.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        // result mà null thì không tìm thấy nên không xóa được
        return result;
    }
    // Xóa tất cả transaction hoặc chỉ xóa các transaction có chứa các trường: book_id, reader_id, staff_id thỏa điều kiện
    // Mặc định sẽ là xóa tất cả
    async deleteAll(query = {}) {
        // result chứa 2 trường: acknowledged (có xóa được hay không) và deletedCount (số lượng đã xóa)
        const result = await this.Transaction.deleteMany(query);
        return result;
    }
}

module.exports = TransactionService;