const express = require("express");
const fs = require("fs");
const app = express();
const morgan = require("morgan");
app.use(express.json());
app.use(morgan("dev"));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev_data/data/tours_simple.json`, "utf-8")
);

app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours,
    },
  });
});

app.post("/api/v1/tours", (req, res) => {
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
});

app.get("/api/v1/tours/:id", (req, res) => {
  const id = req.params.id * 1;
  if (id >= tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

app.patch("/api/v1/tours/:id", (req, res) => {
  const id = req.params.id * 1;
  if (id >= tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
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
});

app.delete("/api/v1/tours/:id", (req, res) => {
  const id = req.params.id * 1;
  if (id >= tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
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
});

app.listen(8000, () => console.log("server start listening on port 8000"));
