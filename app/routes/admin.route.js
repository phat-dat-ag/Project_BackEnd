const express = require("express");
const admins = require("../controllers/admin.controller");

const router = express.Router();

router.route("/")
    .post(admins.create);

router.route("/check/:username")
    .get(admins.isExistingUsername);

router.route("/login/account")
    .post(admins.login)

router.route("/login/profile")
    .get(admins.getProfile);

module.exports = router;