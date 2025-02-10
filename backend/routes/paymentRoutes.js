import express from "express";
import { Payment } from "../models/Payment.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get filtered payments
router.get("/filter", verifyToken, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const query = {
      hospitalId: req.user.hospitalId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    // Add type filter if not "all"
    if (type && type !== "all") {
      query.type = type;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment statistics
router.get("/statistics", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      hospitalId: req.user.hospitalId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const [income, expense] = await Promise.all([
      Payment.aggregate([
        { $match: { ...query, type: "Income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { ...query, type: "Expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    res.json({
      income: income[0]?.total || 0,
      expense: expense[0]?.total || 0,
      net: (income[0]?.total || 0) - (expense[0]?.total || 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
