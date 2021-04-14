var express = require("express");
const app = express();
var userRouter = require("./user");
var bookRouter = require("./book");

app.use("/user/",userRouter);
app.use("/book/",bookRouter);

module.exports = app;