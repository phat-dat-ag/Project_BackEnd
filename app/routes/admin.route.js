const express = require("express");
const admins = require("../controllers/admin.controller");

const router = express.Router();

router.route("/")
    .post(admins.create);

router.route("/login/account")
    .post(admins.login)

module.exports = router;