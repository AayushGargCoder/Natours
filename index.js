const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const app = express();
const globalErrorHandler = require("./controllers/errorHandler");
const tourRouter = require("./routes/tourRoute");
const reviewRouter = require("./routes/reviewRoute");
const userRouter = require("./routes/userRoute");
const AppError = require("./utils/appError");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  //allow 100 request from same IPin 1 hr
  max: 100,
  windowMs: 60 * 60 * 1000,
  //if more request then error message
  message: "Too many request from same IP,plz try again later",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ["duration"] }));
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.all("*", function (req, res, next) {
  next(new AppError(`cant find ${req.originalUrl} on the server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
