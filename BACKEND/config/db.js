const mongoose = require("mongoose");

const connectDB = mongoose
  .connect("mongodb://127.0.0.1:27017/mbbs?replicaSet=rs0")
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  });

module.exports = connectDB;