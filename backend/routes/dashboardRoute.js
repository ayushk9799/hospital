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
    const end = new Date(endDate);
    //
    //
    // Existing payment aggregation
    const paymentStats = await Payment.hospitalAwareAggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
          type: "Income",
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
        },
      },
      {
        $group: {
          _id: {
            date: "$localDate",
            paymentType: "$paymentType",
            paymentMethod: "$paymentMethod",
          },
          count: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalCount: { $sum: "$count" },
          totalRevenue: { $sum: "$revenue" },
          details: {
            $push: {
              paymentType: "$_id.paymentType",
              paymentMethod: "$_id.paymentMethod",
              count: "$count",
              revenue: "$revenue",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: "$totalRevenue",
          count: "$totalCount",
          services: {
            $reduce: {
              input: {
                $filter: {
                  input: "$details",
                  cond: { $eq: ["$$this.paymentType", "Services"] },
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
                        revenue: "$$this.revenue",
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
                  cond: { $eq: ["$$this.paymentType", "Pharmacy"] },
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
                        revenue: "$$this.revenue",
                      },
                    ],
                  ],
                },
              },
            },
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
        count: 0,
        services: { revenue: 0, count: 0, paymentMethod: [] },
        pharmacy: { revenue: 0, count: 0, paymentMethod: [] },
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


router.get('/search/:searchQuery', async (req, res) => {
  try {
    const { searchQuery } = req.params;
    const searchRegex = new RegExp(searchQuery, 'i');

    const patients = await Patient.find({
      $or: [
        { name: searchRegex },
        { contactNumber: searchRegex }
      ],
    }).limit(10);

    res.status(200).json(patients);

  } catch (error) {
    console.error("Patient search route error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
