let express = require("express");
const app = express(".");
let userRouter = require("./user");
let bookRouter = require("./book");

app.use("/user/",userRouter);
app.use("/book/",bookRouter);

module.exports = app;