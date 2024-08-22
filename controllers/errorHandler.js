const AppError = require("../utils/appError");

const handleCastError = (error) => {
  const message = `Invalid ${error.path}:${error.value}`;
  return new AppError(message, 400);
};
const handleDublicateKeyError = (error) => {
  const message = `Dublicate field value:${error.keyValue.name}, Plz use another value`;
  return new AppError(message, 400);
};
const handleValidationError = (error) => {
  const values = Object.values(error.errors).map((err) => {
    return err.message;
  });
  const message = `Invalid input data:${values}`;
  return new AppError(message, 400);
};
const handleTokenExpiredError = () =>
  new AppError("You Token has been expired! plz logIn Again", 401);
const handleJsonWebTokenError = (error) =>
  new AppError("Invalid Token,plz logIn Again", 401);
const sendErrorDev = function (err, res) {
  const statusCode = err.statusCode || 500;
  const status = err.status || "fail";
  res.status(statusCode).json({
    status: status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProd = function (err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //programming or another unknown error,dont want to leak details to client
    // 1)log error
    console.error("Error 💣", err);
    // 2)send res
    return res
      .status(500)
      .json({ status: "fail", message: "something went very wrong" });
  }
};
module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let errorObj = { ...err, message: err.message };
    if (err.name === "CastError") errorObj = handleCastError(errorObj);
    else if (err.code === 11000) errorObj = handleDublicateKeyError(errorObj);
    else if (err.name === "ValidationError")
      errorObj = handleValidationError(errorObj);
    else if (err.name === "JsonWebTokenError")
      errorObj = handleJsonWebTokenError();
    else if (err.name === "TokenExpiredError")
      errorObj = handleTokenExpiredError();
    sendErrorProd(errorObj, res);
  }
};
