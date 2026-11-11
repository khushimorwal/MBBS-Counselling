const mongoose = require("mongoose");

if (process.env.NODE_ENV === "production" && !process.env.MONGO_URI) {
  throw new Error("MONGO_URI is required in production");
}

const connectDB = mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/mbbs?replicaSet=rs0"
  )
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  });

module.exports = connectDB;