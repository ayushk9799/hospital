import express from "express";
import mongoose from "mongoose";
import { Patient } from "../models/Patient.js";
import { Visit } from "../models/Visits.js";
import { IPDAdmission } from "../models/IPDAdmission.js";
import { Payment } from "../models/Payment.js";

const router = express.Router();

// Updated route to get daily stats for the entire hospital using MongoDB session
router.get("/daily-stats", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Both startDate and endDate are required" });
    }

    const start = new Date(startDate);
    let end = new Date(endDate);

    // Check if startDate and endDate are the same
    if (start.getTime() === end.getTime()) {
      end.setDate(end.getDate() + 1);
    }

    //
    //
    // Existing payment aggregation
    const paymentStats = await Payment.hospitalAwareAggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start),
            $lte: new Date(end),
          },
        },
      },
      {
        $project: {
          localDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
          paymentType: "$paymentType.name",
          paymentMethod: 1,
          amount: 1,
          type: 1,
        },
      },
      {
        $group: {
          _id: {
            date: "$localDate",
            paymentType: "$paymentType",
            paymentMethod: "$paymentMethod",
            type: "$type",
          },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalCount: { $sum: "$count" },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$_id.type", "Income"] },
                "$amount",
                0
              ]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ["$_id.type", "Expense"] },
                "$amount",
                0
              ]
            }
          },
          details: {
            $push: {
              paymentType: "$_id.paymentType",
              paymentMethod: "$_id.paymentMethod",
              type: "$_id.type",
              count: "$count",
              amount: "$amount",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: "$totalRevenue",
          expense: "$totalExpense",
          count: "$totalCount",
          
          ipd: {
            $reduce: {
              input: {
                $filter: {
                  input: "$details",
                  cond: { $eq: ["$$this.paymentType", "IPD"] },
                },
              },
              initialValue: { revenue: 0, count: 0, paymentMethod: [] },
              in: {
                revenue: { $add: ["$$value.revenue", "$$this.revenue"] },
                count: { $add: ["$$value.count", "$$this.count"] },
                paymentMethod: {
                  $concatArrays: [
                    "$$value.paymentMethod",
                    [
                      {
                        method: "$$this.paymentMethod",
                        count: "$$this.count",
                        revenue: "$$this.amount",
                      },
                    ],
                  ],
                },
              },
            },
          },
          opd: {
            $reduce: {
              input: {
                $filter: {
                  input: "$details",
                  cond: { $eq: ["$$this.paymentType", "OPD"] },
                },
              },
              initialValue: { revenue: 0, count: 0, paymentMethod: [] },
              in: {
                revenue: { $add: ["$$value.revenue", "$$this.amount"] },
                count: { $add: ["$$value.count", "$$this.count"] },
                paymentMethod: {
                  $concatArrays: [
                    "$$value.paymentMethod",
                    [
                      {
                        method: "$$this.paymentMethod",
                        count: "$$this.count",
                        revenue: "$$this.amount",
                      },
                    ],
                  ],
                },
              },
            },
          },
          opdProcedures: {
            $reduce: {
              input: {
                $filter: {
                  input: "$details",
                  cond: { $eq: ["$$this.paymentType", "OPDProcedure"] },
                },
              },
              initialValue: { revenue: 0, count: 0, paymentMethod: [] },
              in: {
                revenue: { $add: ["$$value.revenue", "$$this.amount"] },
                count: { $add: ["$$value.count", "$$this.count"] },
                paymentMethod: {
                  $concatArrays: [
                    "$$value.paymentMethod",
                    [
                      {
                        method: "$$this.paymentMethod",
                        count: "$$this.count",
                        revenue: "$$this.amount",
                      },
                    ],
                  ],
                },
              },
            },
          },
          laboratory: {
            $reduce: {
              input: {
                $filter: {
                  input: "$details",
                  cond: { $eq: ["$$this.paymentType", "Laboratory"] },
                },
              },
              initialValue: { revenue: 0, count: 0, paymentMethod: [] },
              in: {
                revenue: { $add: ["$$value.revenue", "$$this.amount"] },
                count: { $add: ["$$value.count", "$$this.count"] },
                paymentMethod: {
                  $concatArrays: [
                    "$$value.paymentMethod",
                    [
                      {
                        method: "$$this.paymentMethod",
                        count: "$$this.count",
                        revenue: "$$this.amount",
                      },
                    ],
                  ],
                },
              },
            },
          },
          pharmacy: {
            $reduce: {
              input: {
                $filter: {
                  input: "$details",
                  cond: { $eq: ["$$this.type", "Pharmacy"] },
                },
              },
              initialValue: { revenue: 0, count: 0, paymentMethod: [] },
              in: {
                revenue: { $add: ["$$value.revenue", "$$this.amount"] },
                count: { $add: ["$$value.count", "$$this.count"] },
                paymentMethod: {
                  $concatArrays: [
                    "$$value.paymentMethod",
                    [
                      {
                        method: "$$this.paymentMethod",
                        count: "$$this.count",
                        revenue: "$$this.amount",
                      },
                    ],
                  ],
                },
              },
            },
          },
          expenseTypeWise: {
            $reduce: {
              input: {
                $filter: {
                  input: "$details",
                  cond: { $eq: ["$$this.type", "Expense"] }
                },
              },
              initialValue: {
                cash: { total: 0, count: 0 },
                upi: { total: 0, count: 0 },
                card: { total: 0, count: 0 },
                cheque: { total: 0, count: 0 },
                bankTransfer: { total: 0, count: 0 },
                other: { total: 0, count: 0 },
                due: { total: 0, count: 0 }
              },
              in: {
                cash: {
                  $cond: [
                    { $eq: ["$$this.paymentMethod", "Cash"] },
                    {
                      total: { $add: ["$$value.cash.total", "$$this.amount"] },
                      count: { $add: ["$$value.cash.count", "$$this.count"] }
                    },
                    "$$value.cash"
                  ]
                },
                upi: {
                  $cond: [
                    { $eq: ["$$this.paymentMethod", "UPI"] },
                    {
                      total: { $add: ["$$value.upi.total", "$$this.amount"] },
                      count: { $add: ["$$value.upi.count", "$$this.count"] }
                    },
                    "$$value.upi"
                  ]
                },
                card: {
                  $cond: [
                    { $eq: ["$$this.paymentMethod", "Card"] },
                    {
                      total: { $add: ["$$value.card.total", "$$this.amount"] },
                      count: { $add: ["$$value.card.count", "$$this.count"] }
                    },
                    "$$value.card"
                  ]
                },
                cheque: {
                  $cond: [
                    { $eq: ["$$this.paymentMethod", "Cheque"] },
                    {
                      total: { $add: ["$$value.cheque.total", "$$this.amount"] },
                      count: { $add: ["$$value.cheque.count", "$$this.count"] }
                    },
                    "$$value.cheque"
                  ]
                },
                bankTransfer: {
                  $cond: [
                    { $eq: ["$$this.paymentMethod", "Bank Transfer"] },
                    {
                      total: { $add: ["$$value.bankTransfer.total", "$$this.amount"] },
                      count: { $add: ["$$value.bankTransfer.count", "$$this.count"] }
                    },
                    "$$value.bankTransfer"
                  ]
                },
                other: {
                  $cond: [
                    { $eq: ["$$this.paymentMethod", "Other"] },
                    {
                      total: { $add: ["$$value.other.total", "$$this.amount"] },
                      count: { $add: ["$$value.other.count", "$$this.count"] }
                    },
                    "$$value.other"
                  ]
                },
                due: {
                  $cond: [
                    { $eq: ["$$this.paymentMethod", "Due"] },
                    {
                      total: { $add: ["$$value.due.total", "$$this.amount"] },
                      count: { $add: ["$$value.due.count", "$$this.count"] }
                    },
                    "$$value.due"
                  ]
                }
              }
            }
          },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]).session(session);

    // New aggregation for appointment counts and patient count
    const [visitStats, ipdStats] = await Promise.all([
      Visit.hospitalAwareAggregate([
        {
          $match: {
            bookingDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$bookingDate",
                timezone: "Asia/Kolkata",
              },
            },
            visitCount: { $sum: 1 },
            uniquePatients: { $addToSet: "$patient" },
          },
        },
      ]).session(session),
      IPDAdmission.hospitalAwareAggregate([
        {
          $match: {
            bookingDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$bookingDate",
                timezone: "Asia/Kolkata",
              },
            },
            ipdCount: { $sum: 1 },
            uniquePatients: { $addToSet: "$patient" },
          },
        },
      ]).session(session),
    ]);

    const mergedAppointmentStats = [...visitStats, ...ipdStats].reduce(
      (acc, curr) => {
        const existingEntry = acc.find((entry) => entry._id === curr._id);
        if (existingEntry) {
          existingEntry.visitCount =
            (existingEntry.visitCount || 0) + (curr.visitCount || 0);
          existingEntry.ipdCount =
            (existingEntry.ipdCount || 0) + (curr.ipdCount || 0);
          existingEntry.uniquePatients = [
            ...new Set([
              ...existingEntry.uniquePatients,
              ...curr.uniquePatients,
            ]),
          ];
        } else {
          acc.push({
            _id: curr._id,
            visitCount: curr.visitCount || 0,
            ipdCount: curr.ipdCount || 0,
            uniquePatients: curr.uniquePatients,
          });
        }
        return acc;
      },
      []
    );

    // Create a set of all unique dates
    const allDates = new Set([
      ...paymentStats.map((stat) => stat.date),
      ...mergedAppointmentStats.map((stat) => stat._id),
    ]);

    // Create the final stats array
    const finalStats = Array.from(allDates).map((date) => {
      const payStat = paymentStats.find((stat) => stat.date === date) || {
        date,
        revenue: 0,
        expense: 0,
        count: 0,
        ipd: { revenue: 0, count: 0, paymentMethod: [] },
        opd: { revenue: 0, count: 0, paymentMethod: [] },
        opdProcedures: { revenue: 0, count: 0, paymentMethod: [] },
        laboratory: { revenue: 0, count: 0, paymentMethod: [] },
        pharmacy: { revenue: 0, count: 0, paymentMethod: [] },
        expenseTypeWise: {
          cash: { total: 0, count: 0 },
          upi: { total: 0, count: 0 },
          card: { total: 0, count: 0 },
          cheque: { total: 0, count: 0 },
          bankTransfer: { total: 0, count: 0 },
          other: { total: 0, count: 0 },
          due: { total: 0, count: 0 }
        }
      };
      const appStat = mergedAppointmentStats.find(
        (stat) => stat._id === date
      ) || {
        visitCount: 0,
        ipdCount: 0,
        uniquePatients: [],
      };

      return {
        ...payStat,
        visitCount: appStat.visitCount || 0,
        ipdCount: appStat.ipdCount || 0,
        totalAppointments: (appStat.visitCount || 0) + (appStat.ipdCount || 0),
        uniquePatientCount: appStat.uniquePatients
          ? appStat.uniquePatients.length
          : 0,
      };
    });

    // Sort the finalStats array by date

    const formattedStats = finalStats.reduce((acc, stat) => {
      acc[stat.date] = stat;
      return acc;
    }, {});

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(formattedStats);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Daily stats route error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    const patients = await Patient.find({
      $or: [
        { name: { $regex: `^${q}`, $options: "i" } },
        { contactNumber: q },
        { registrationNumber: { $regex: `^${q}$`, $options: "i" } },
      ],
    })
      .populate("visits", "bookingDate guardianName relation")
      .populate("admissionDetails", "bookingDate guardianName relation")
      .limit(10);

    res.status(200).json(patients);
  } catch (error) {
    console.error("Patient search route error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/patient-data-next-visit/:UHID", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { UHID } = req.params;
    const patient = await Patient.findOne({ registrationNumber: UHID })
      .populate("visits", "bookingDate guardianName relation bills createdAt")
      .populate(
        "admissionDetails",
        "bookingDate guardianName relation bills createdAt"
      )
      .session(session);

    if (!patient) {
      throw Error("Patient not found");
    }

    // Combine both visits and admissions and sort by date
    const allVisits = [
      ...(patient.visits || []).map((visit) => ({
        ...visit.toObject(),
        type: "OPD",
        date: visit.bookingDate,
      })),
      ...(patient.admissionDetails || []).map((admission) => ({
        ...admission.toObject(),
        type: "IPD",
        date: admission.bookingDate,
      })),
    ].sort((a, b) => b.date - a.date);

    // Get the most recent visit
    const lastVisit = allVisits[0] || null;

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ lastVisit });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
});

export default router;
