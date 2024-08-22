const { promisify } = require("util");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/emails");
const crypto = require("crypto");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  return res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("please provide email or password", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));

  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return next(new AppError("You are not logged in, Plz log in first", 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currUser = await User.findById(decoded.id);
  if (!currUser)
    return next(
      new AppError("The user belonging to token does not exist", 401)
    );

  if (currUser.checkPasswordChangedAfter(decoded.iat))
    return next(
      new AppError("User Recentyly changed password! Plz log in again", 401)
    );
  req.user = currUser;
  next();
});

exports.restrictTo = function (...roles) {
  //closure
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You do not have permission to preform this action", 403)
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Plz provide email", 400));

  const currUser = await User.findOne({ email });
  if (!currUser)
    return next(new AppError("There is no user with email address", 404));

  const resetToken = currUser.forgotPasswordResetToken();
  await currUser.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}//${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password!Please make a patch request with your new password and password confirm to ${resetUrl}`;

  try {
    await sendEmail({
      email,
      subject: "Your password reset Token(valid for 10 min)",
      message,
    });
    res
      .status(200)
      .json({ status: "success", message: "Token sent to the mail" });
  } catch (err) {
    currUser.passwordResetToken = undefined;
    currUser.passwordResetTokenExpires = undefined;
    await currUser.save({ validateBeforeSave: false });
    next(new AppError("Error sending email!plz try again later", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token is invalid or expired", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save();

  createAndSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError("Your current password is wrong..", 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  createAndSendToken(user, 200, res);
});
