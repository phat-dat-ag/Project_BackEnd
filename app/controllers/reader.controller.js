const ReaderService = require("../services/reader.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const TransactionService = require("../services/transaction.service");

exports.create = async (req, res, next) => {
    // Phải nhập last_name
    if (!req.body?.last_name) {
        return next(new ApiError(400, "last_name can not be empty"));
    }
    try {
        const readerService = new ReaderService(MongoDB.client);
        // Gọi để lưu đối tượng reader xuống CSDL
        const document = await readerService.create(req.body);
        return res.send(document);
    } catch (error) {
        // Coi lỗi gì
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while creating the reader")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const readerService = new ReaderService(MongoDB.client);
        // Tìm theo tên last_name
        const { last_name } = req.query;
        if (last_name) {
            documents = await readerService.findByLastName(last_name);
        } else {
            documents = await readerService.find({});
        }
    } catch (error) {
        // Coi lỗi gì
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while finding the reader")
        );
    }
    // Trả về danh sách tìm được
    return res.send(documents);
};

// Tìm 1 reader theo id_reader
exports.findOne = async (req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.findByIdReader(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        return res.send(document);
    } catch (error) {
        // Coi lỗi gì
        console.log(error);
        return next(
            new ApiError(500, `Error retrieving reader with id=${req.params.id}`)
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).lenth === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        return res.send({ message: "Reader was updated successfully" });
    } catch (error) {
        // Coi lỗi gì
        console.log(error);
        return next(
            new ApiError(500, `Error updating reader with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        // Ràng buộc dữ liệu
        // Khi xóa reader thì xóa các transaction của reader đó
        const transactionService = new TransactionService(MongoDB.client);
        const result = await transactionService.deleteAll({ reader_id: req.params.id });
        return res.send({ message: `Reader and ${result.deletedCount} transactions were delete successfully` });
    } catch (error) {
        // Coi lỗi gì
        console.log(error);
        return next(
            new ApiError(500, `Could not delete reader with id=${req.params.id}`)
        );
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const deletedCount = await readerService.deleteAll();
        // Ràng buộc dữ liệu
        // Xóa tất cả reader, thì còn độc giả đâu mà đi mượn sách => Xóa hết transaction
        const transactionService = new TransactionService(MongoDB.client);
        // Không truyền mình đã gán default là xóa hết
        await transactionService.deleteAll();
        return res.send({
            message: `${deletedCount} readers were deleted successfully`,
        });
    } catch (error) {
        // Coi lỗi gì
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while removing all readers")
        );
    }
};
