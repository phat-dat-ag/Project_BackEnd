const PublisherService = require("../services/publisher.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// name, address

// Thêm 1 đối tượng publisher vào csdl
exports.create = async (req, res, next) => {
    // Không được bỏ trống name
    if (!req.body?.name) {
        return next(new ApiError(400, "name can not be empty"))
    }
    try {
        const publisherService = new PublisherService(MongoDB.client);
        // Thông tin publisher từ req.body
        const document = await publisherService.create(req.body);
        // document này chức 2 trường: acknowledged (thêm thành công hay không) và insertedId (ID của đối tượng được thêm)
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while creating the publisher"));
    }
}

// Tìm tất cả theo name của publisher
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const { name } = req.query;
        const publisherService = new PublisherService(MongoDB.client);
        if (name) {
            documents = await publisherService.findByName(name);
        } else {
            documents = await publisherService.find({});
        }
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while finding the publisher"))
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const publisherService = new PublisherService(MongoDB.client);
        // Lấy id từ truyền params /publishers/:id
        const document = await publisherService.findByIdPublisher(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Publisher not found"));
        }
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error retrieving publisher with id=${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    // Lấy 1 mảng các key của đối tượng (req.body từ client gửi lên), sau đó lấy độ dài mảng 
    // => Kiểm tra có đưa dữ liệu để cập nhật không
    if (Object.keys(req.body).lenth === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const publisherService = new PublisherService(MongoDB.client);
        const document = await publisherService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Publisher not found"));
        }
        return res.send({ message: "Publisher was updated successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error updating publisher with id=${req.params.id}`))
    }
};

exports.delete = async (req, res, next) => {
    try {
        const publisherService = new PublisherService(MongoDB.client);
        const document = await publisherService.delete(req.params.id);
        // Nếu null tức là không tìm thấy nên không xóa được
        if (!document) {
            return next(new ApiError(400, "Publisher not found"));
        }
        return res.send({ message: "Publisher was deleted successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Could not delete publisher with id=${req.params.id}`))
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const publisherService = new PublisherService(MongoDB.client);
        const result = await publisherService.deleteAll();
        return res.send({ message: `${result.deletedCount} publisher was (publishers were) deleted successfully` })
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while removing all publishers"));
    }
};

