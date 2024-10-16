const config = {
    app: {
        port: process.env.PORT || 3000,
    },
    db: {
        // Tên của database: BookManagerApplication
        uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/BookManagerApplication"
    }
};

module.exports = config;