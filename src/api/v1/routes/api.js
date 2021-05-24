const express = require("express");

const app = express(".");
const userRouter = require("./user");
const bookRouter = require("./book");

app.use("/user/",userRouter);
app.use("/book/",bookRouter);

module.exports = app;