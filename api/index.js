import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import dbConnect from "./config/db.js";
//import authRoutes from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
//import inventory from "./routes/inventoryRoute.js";
import appointment from "./routes/appoimentRouts.js";
import feedback from "./routes/feedbackRoute.js";
import Package from "./routes/PackageRoute.js";
import Service from "./routes/Service_Route.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

//app.use("/api/v1/auth", authRoutes); 
app.use("/api/v1/appoiment", appointment); 
app.use("/api/v1/feedback", feedback); 
app.use("/api/v1/Package",Package);
app.use("/api/v1/Service",Service);
  
const PORT = 7002;

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1); // Stop the app if DB fails to connect
  });

  