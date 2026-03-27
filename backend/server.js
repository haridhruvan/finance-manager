const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/", (req, res) => {
  res.send("Finance Manager API is running");
});

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || MONGO_URI === "your_mongodb_connection_string") {
  console.error("MONGO_URI is missing or still using the placeholder in backend/.env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
