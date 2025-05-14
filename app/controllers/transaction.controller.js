const TransactionService = require("../services/transaction.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { ObjectId } = require("mongodb");

// Thêm 1 đối tượng transaction vào csdl
exports.create = async (req, res, next) => {
    try {
        const transactionService = new TransactionService(MongoDB.client);
        // Thông tin transaction từ req.body
        const document = await transactionService.create(req.body);
        // document này chức 2 trường: acknowledged (thêm thành công hay không) và insertedId (ID của đối tượng được thêm)
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while creating the transaction"));
    }
}

// Tìm tất cả theo borrow_date của transaction
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const { borrow_date } = req.query;
        const transactionService = new TransactionService(MongoDB.client);
        if (borrow_date) {
            documents = await transactionService.findByBorrowDate(borrow_date);
        } else {
            documents = await transactionService.find({});
        }
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while finding the transaction"))
    }
    return res.send(documents);
};

exports.findAllTransactionWithFullInformation = async (req, res, next) => {
    let documents = [];
    try {
        const transactionService = new TransactionService(MongoDB.client);
        documents = await transactionService.getAllTransactionWithFullInformation();
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while finding all transaction with full information"));
    }
    return res.send(documents);
}

// Tìm theo reader_id hoặc staff_id: CHỈ 1 TRONG 2
exports.findAllTransactionWithFullInformationById = async (req, res, next) => {
    let documents = [];
    // Tạo bộ lọc id
    let filter = {};
    const { reader_id, staff_id } = req.query;
    if (reader_id && ObjectId.isValid(reader_id))
        filter.reader_id = new ObjectId(reader_id);
    else if (staff_id && ObjectId.isValid(staff_id))
        filter.staff_id = new ObjectId(staff_id);
    else
        return res.send(documents);
    // Tiến hành lọc và trả kết quả
    try {
        const transactionService = new TransactionService(MongoDB.client);
        documents = await transactionService.getAllTransactionWithFullInformation(filter);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while finding all transaction with full information by staff_id or reader_id"));
    }
    return res.send(documents);
}

exports.findOne = async (req, res, next) => {
    try {
        const transactionService = new TransactionService(MongoDB.client);
        // Lấy id từ truyền params /transactions/:id
        const document = await transactionService.findByIdTransaction(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Transaction not found"));
        }
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error retrieving transaction with id=${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    // Lấy 1 mảng các key của đối tượng (req.body từ client gửi lên), sau đó lấy độ dài mảng 
    // => Kiểm tra có đưa dữ liệu để cập nhật không
    if (Object.keys(req.body).lenth === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const transactionService = new TransactionService(MongoDB.client);
        const document = await transactionService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Transaction not found"));
        }
        return res.send({ message: "Transaction was updated successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error updating transaction with id=${req.params.id}`))
    }
};

exports.delete = async (req, res, next) => {
    try {
        const transactionService = new TransactionService(MongoDB.client);
        const document = await transactionService.delete(req.params.id);
        // Nếu null tức là không tìm thấy nên không xóa được
        if (!document) {
            return next(new ApiError(400, "Transaction not found"));
        }
        return res.send({ message: "Transaction was deleted successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Could not delete transaction with id=${req.params.id}`))
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const transactionService = new TransactionService(MongoDB.client);
        const result = await transactionService.deleteAll();
        return res.send({ message: `${result.deletedCount} transaction was (transactions were) deleted successfully` })
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while removing all transactions"));
    }
};

