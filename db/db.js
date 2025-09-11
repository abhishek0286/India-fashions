const mongoose = require("mongoose");
require("dotenv").config();

const userName = process.env.MONGO_USERNAME;
const password = process.env.MONGODB_PASSWORD;

const connectDB = async () => {
  try {
    const instance = await mongoose.connect(process.env.DB_URL);
    const host = instance.connection.host;
    console.log(`MongoDB connected to`, host);
  } catch (error) {
    console.log("Mongo Error", error);
    process.exit(1);
  }
};

module.exports = connectDB;
