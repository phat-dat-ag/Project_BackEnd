const bcrypt = require("bcrypt");

const saltRounds = 10;

// Hash password để lưu vào cơ sở dữ liệu

// combainedPassword là sự kết hợp của username và password để mật khẩu không bị trùng
async function hashPassword(combainedPassword) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(combainedPassword, salt);
    return hashedPassword;
}

// combainedPassword là sự kết hợp của username và password để mật khẩu không bị trùng
async function checkPassword(combainedPassword, accountDBPassword) {
    const isSuccessed = await bcrypt.compare(combainedPassword, accountDBPassword);
    return isSuccessed;
}

module.exports = { hashPassword, checkPassword };