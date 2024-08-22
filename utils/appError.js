class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    //some programming error does not have isOperational property
    this.isOperational = true;

    //when a new object is created and constructor function is call,then that function call is not gonna appear in stackTrace
    // Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
