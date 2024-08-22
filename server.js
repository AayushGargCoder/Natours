const dotenv = require("dotenv");
const mongoose = require("mongoose");
process.on("uncaughtException", (err) => {
  console.log("UNHANDLE EXCEPTION", err.name, err.message, err);
  process.exit(1);
});
dotenv.config({ path: "./config.env" });
const app = require("./index");

const PORT = process.env.PORT || 3000;

const dbString = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(dbString)
  .then((conn) => console.log("DB Connection Successfull"));

const server = app.listen(PORT, () =>
  console.log(
    `server start listening on port ${PORT} in ${process.env.NODE_ENV} MODE`
  )
);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLE REJECTION", err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
