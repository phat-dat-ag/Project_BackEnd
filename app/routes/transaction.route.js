const express = require("express");
const transactions = require("../controllers/transaction.controller");

const router = express.Router();

router.route("/")
    .get(transactions.findAll)
    .post(transactions.create)
    .delete(transactions.deleteAll);

router.route("/:id")
    .get(transactions.findOne)
    .put(transactions.update)
    .delete(transactions.delete);

router.route("/find_all_with/information")
    .get(transactions.findAllTransactionWithFullInformation);

router.route("/find_all/by_id")
    .get(transactions.findAllTransactionWithFullInformationById);

module.exports = router;