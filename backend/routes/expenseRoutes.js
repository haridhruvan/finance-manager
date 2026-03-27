const express = require("express");
const Expense = require("../models/expense");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    if (!title || amount === undefined || amount === null || Number.isNaN(Number(amount))) {
      return res.status(400).json({ message: "Title and a valid amount are required" });
    }

    const expense = new Expense({
      userId: req.user.id,
      title,
      amount: Number(amount),
      category,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({ message: "Failed to add expense" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error("Load expenses error:", error);
    res.status(500).json({ message: "Failed to load expenses" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.amount !== undefined) {
      if (Number.isNaN(Number(updates.amount))) {
        return res.status(400).json({ message: "Amount must be a number" });
      }

      updates.amount = Number(updates.amount);
    }

    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({ message: "Failed to update expense" });
  }
});

module.exports = router;
