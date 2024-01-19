require("dotenv").config();
const cors = require("cors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Import your routes
var indexRouter = require("./routes/api/index");

// Create an Express application
var app = express();

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Enable CORS for all routes
app.use(cors());

// Routes
app.use("/", indexRouter);

//catch when request match no route
app.use((req, res, next) => {
  const exception = new Error(`Path not found!!!`);
  exception.statusCode = 404;
  next(exception);
});

//customize express error handling middleware
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).send(err.message);
});

module.exports = app;
