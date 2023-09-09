const express = require("express");
const app = express();
require("dotenv/config");
const api = process.env.API_URL;
const connection = process.env.CONNECTION_STRING;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
app.use(express.urlencoded({ extended: true }));
const authjwt = require("./helpers/jwt");



//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));

//routers
const productsRouter = require("./routers/products");
const orderRouter = require("./routers/order");
const categoryRouter = require("./routers/category");
const userRouter = require("./routers/user");
app.use(`${api}/products`, productsRouter);
app.use(`${api}/orders`, orderRouter);
app.use(`${api}/category`, categoryRouter);
app.use(`${api}/users`, userRouter);
app.use('/puplic/uploads', express.static(__dirname + '/puplic/uploads'));
app.use(authjwt());


const conn = mongoose.connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database Connected");

}).catch((err) => {
    console.log(err);
});

app.listen(3000, () => {
    console.log(api);
    console.log("Server Started");
});