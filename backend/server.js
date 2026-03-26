// ======================
// 📦 IMPORTS
// ======================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes"); // ✅ correct path

const app = express();


// ======================
// 🟢 MIDDLEWARE
// ======================
app.use(cors({
  origin: "*", // allow all (you can restrict later)
}));
app.use(express.json());


// ======================
// 🔵 ROUTES
// ======================
app.use("/api/users", userRoutes);


// ======================
// 🟡 ROOT TEST ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("Finance Manager API is running 🚀");
});


// ======================
// 🔴 DATABASE CONNECTION
// ======================
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch((err) => {
  console.error("❌ MongoDB Error:", err);
});


// ======================
// 🚀 START SERVER
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});