const fs = require("fs");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const { deleteOne, updateOne, getOne, getAll } = require("./handlerFactory");
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev_data/data/tours_simple.json`, "utf-8")
);

const filterObj = (obj, ...fieldAllowedUpdate) => {
  const filterObj = {};
  Object.keys(obj).forEach((el) => {
    if (fieldAllowedUpdate.includes(el)) filterObj[el] = obj[el];
  });

  return filterObj;
};

exports.createUser = (req, res) => {
  const lastId = tours[tours.length - 1].id + 1;
  const tour = Object.assign({ id: lastId }, req.body);
  tours.push(tour);
  fs.writeFile(
    `${__dirname}/dev_data/data/tours_simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201),
        json({
          status: "created",
          data: {
            tour,
          },
        });
    }
  );
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route is not form password updates. Plz use /updatePassword",
        400
      )
    );

  const filteredBody = filterObj(req.body, "name", "email");
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { user } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  //fake create so that use getOne function
  req.params.id = req.user._id;
  next();
};

exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
exports.getUser = getOne(User);
exports.getAllUsers = getAll(User);
