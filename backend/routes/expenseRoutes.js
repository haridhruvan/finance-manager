const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const auth = require("../middleware/auth");

// ADD EXPENSE
router.post("/", auth, async (req, res) => {
  const { title, amount, category } = req.body;

  const expense = new Expense({
    userId: req.user.id,
    title,
    amount,
    category,
  });

  await expense.save();
  res.json(expense);
});

// GET ALL EXPENSES
router.get("/", auth, async (req, res) => {
  const expenses = await Expense.find({ userId: req.user.id });
  res.json(expenses);
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  const updated = await Expense.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

module.exports = router;