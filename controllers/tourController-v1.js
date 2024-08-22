const fs = require("fs");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev_data/data/tours_simple.json`, "utf-8")
);

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
  }
  next();
};
exports.checkId = (req, res, next, val) => {
  console.log(`id of tour is ${val}`);
  if (val * 1 >= tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
  next();
};
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours,
    },
  });
};
exports.createTour = (req, res) => {
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

  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  const updatedTour = Object.assign(tour, req.body);

  fs.writeFile(
    `${__dirname}/dev_data/data/tours_simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: "created",
        data: {
          tour,
        },
      });
    }
  );
};
exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const deletedTour = tours.splice(
    tours.findIndex((el) => el.id === id),
    1
  );

  fs.writeFile(
    `${__dirname}/dev_data/data/tours_simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );
};
