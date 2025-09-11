const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db/db");
require("dotenv").config();
const routes = require("./routes");

const app = express();

const PORT = process.env.PORT || 5010;

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: true,
  optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(cors(corsOptions));
app.use("/public",express.static(path.join(__dirname, "public")));

// routes.map((route) => {  
//   app.use("/api" + route.path, route.handler);
// });

// app.get("/api", async (req, res) => {
//   await connectDB();
//   return res.send("Server is Live");
// });

// ✅ IIFE to connect DB and set up routes
(async () => {
  try {
    await connectDB(); // wait for MongoDB connection

    // Attach routes only after DB is connected
    routes.map((route) => {
      app.use("/api" + route.path, route.handler);
    });

    app.get("/api", (req, res) => {
      return res.send("Server is Live");
    });

    console.log("🚀 MongoDB connected & routes initialized");
  } catch (err) {
    console.error("❌ Failed to connect DB or initialize app:", err.message);
  }
})();

app.listen(PORT,'0.0.0.0', async () => {
  // await connectDB();
  console.log(`⚙️  Server is running on Port ${PORT}`);
});
