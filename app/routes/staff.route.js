const express = require("express");
const staffs = require("../controllers/staff.controller");

const router = express.Router();

router.route("/")
    .get(staffs.findAll)
    .post(staffs.create)
    .delete(staffs.deleteAll);

router.route("/:id")
    .get(staffs.findOne)
    .put(staffs.update)
    .delete(staffs.delete);

router.route("/check/:username")
    .get(staffs.isExistingUsername);

router.route("/login")
    .post(staffs.login);
module.exports = router;