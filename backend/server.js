const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors());

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// =======================
// MONGODB CONNECTION
// =======================
mongoose.connect("mongodb://127.0.0.1:27017/financeDB")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));


// =======================
// USER MODEL
// =======================
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);


// =======================
// EXPENSE MODEL
// =======================
const expenseSchema = new mongoose.Schema({
  userId: String,
  name: String,
  amount: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

const Expense = mongoose.model("Expense", expenseSchema);


// =======================
// REGISTER
// =======================
app.post("/api/users/register", async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  res.json(user);
});


// =======================
// LOGIN
// =======================
app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({ message: "Invalid password" });
  }

  const token = jwt.sign({ id: user._id }, "SECRET_KEY");

  res.json({ token, userId: user._id });
});


// =======================
// ADD EXPENSE
// =======================
app.post("/api/expenses", async (req, res) => {
  const { userId, name, amount } = req.body;

  const expense = await Expense.create({
    userId,
    name,
    amount
  });

  res.json(expense);
});


// =======================
// GET ALL EXPENSES
// =======================
app.get("/api/expenses/:userId", async (req, res) => {
  const expenses = await Expense.find({
    userId: req.params.userId
  });

  res.json(expenses);
});


// =======================
// UPDATE EXPENSE
// =======================
app.put("/api/expenses/:id", async (req, res) => {
  const { name, amount } = req.body;

  const updated = await Expense.findByIdAndUpdate(
    req.params.id,
    { name, amount },
    { new: true }
  );

  res.json(updated);
});


// =======================
// DELETE EXPENSE
// =======================
app.delete("/api/expenses/:id", async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted successfully" });
});


// =======================
// SERVER START
// =======================
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});