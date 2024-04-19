const express = require("express");
const app = express();
const port = 8000;
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000", // Đặt URL frontend của bạn ở đây
    credentials: true, // Cho phép chấp nhận cookies
  })
);

//
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

// routes
const authRoute = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");

dbConnect();

// Tăng giới hạn dung lượng cho request body lên 50mb
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/user", authRoute);
app.use("/api/product", productRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
