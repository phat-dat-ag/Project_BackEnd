const express = require("express");
const cors = require("cors");

const readersRouter = require("./app/routes/reader.route");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to contact book application." });
});

app.use("/api/readers", readersRouter);

module.exports = app;