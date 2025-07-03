import express from 'express';
import mongoose from 'mongoose';
import { Visit } from '../models/Visits.js';
import { ServicesBill } from '../models/ServicesBill.js';
import { Payment } from '../models/Payment.js';
import { Patient } from '../models/Patient.js';
import { checkPermission, verifyToken } from '../middleware/authMiddleware.js';
import { RegistrationNumber } from '../models/RegistrationNumber.js';
import { LabRegistration } from '../models/LabRegistration.js';
import { IPDAdmission } from '../models/IPDAdmission.js';
import { OPDProcedure } from '../models/OPDProcedure.js';
import { BillCounter } from '../models/BillCounter.js';

const router = express.Router();

router.post('/delete-opd-records-by-date', verifyToken, checkPermission('delete_patients'), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            throw new Error('Start date and end date are required.');
        }

        const sDate = new Date(startDate);
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);

        const visitsToDelete = await Visit.find({
            bookingDate: {
                $gte: sDate,
                $lte: eDate,
            },
        }).session(session);

        if (visitsToDelete.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({ message: 'No OPD records found in the specified date range.' });
        }

        const visitIds = visitsToDelete.map(v => v._id);
        const patientIds = [...new Set(visitsToDelete.map(v => v.patient.toString()))];
        
        let serviceBillIds = [];
        visitsToDelete.forEach(visit => {
            if (visit.bills?.services) {
                serviceBillIds.push(...visit.bills.services);
            }
        });
        serviceBillIds = [...new Set(serviceBillIds.map(id => id.toString()))];

        const paymentIds = new Set();
        if (serviceBillIds.length > 0) {
            const serviceBills = await ServicesBill.find({ _id: { $in: serviceBillIds } }).session(session);
            for (const bill of serviceBills) {
                if (bill.payments?.length > 0) {
                    bill.payments.forEach(pid => paymentIds.add(pid.toString()));
                }
            }
        }
        
        const paymentIdArray = Array.from(paymentIds);
        if (paymentIdArray.length > 0) {
            await Payment.deleteMany({ _id: { $in: paymentIdArray } }).session(session);
        }

        if (serviceBillIds.length > 0) {
            await ServicesBill.deleteMany({ _id: { $in: serviceBillIds } }).session(session);
        }

        await Patient.updateMany(
            { _id: { $in: patientIds } },
            { $pull: { visits: { $in: visitIds } } },
            { timestamps: false }
        ).session(session);

        const patientsToCheck = await Patient.find({ _id: { $in: patientIds } }).session(session);
        const patientsToDelete = [];

        for (const patient of patientsToCheck) {
            const hasNoOtherVisits = patient.visits.length === 0;
            const hasNoAdmissions = patient.admissionDetails.length === 0;

            if (hasNoOtherVisits && hasNoAdmissions) {
                patientsToDelete.push(patient._id);
            }
        }
        
        let patientDeleteResult = { deletedCount: 0 };
        if (patientsToDelete.length > 0) {
            patientDeleteResult = await Patient.deleteMany({ _id: { $in: patientsToDelete } }).session(session);
        }

        const visitDeleteResult = await Visit.deleteMany({ _id: { $in: visitIds } }).session(session);

        await session.commitTransaction();
        res.json({
            message: `Deleted ${visitDeleteResult.deletedCount} OPD records and ${patientDeleteResult.deletedCount} associated patient records successfully.`,
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
});

router.post('/resequence-registration-numbers', verifyToken, checkPermission('delete_patients'), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { year } = req.body;
        const hospitalId = req.hospital;

        if (!year) {
            return res.status(400).json({ error: "Year is required." });
        }
        
        const yearInt = parseInt(year, 10);
        const startDate = new Date(yearInt, 0, 1);
        const endDate = new Date(yearInt, 11, 31, 23, 59, 59, 999);

        // Step 1: Fetch all necessary data
        const patients = await Patient.find({
            hospital: hospitalId,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: 1 }).session(session);

        if (patients.length === 0) {
            await session.abortTransaction();
            return res.json({ message: `No patients found to re-sequence for the year ${year}.` });
        }

        const registrationConfig = await RegistrationNumber.findOne({ hospital: hospitalId, year: yearInt }).session(session);
        const prefix = registrationConfig?.prefix || 'OPD';
        const useYearSuffix = registrationConfig?.useYearSuffix ?? true;
        const yearSuffix = year.toString().slice(-2);
        
        // Step 2: Prepare all database updates in memory
        let sequence = 0;
        const registrationNumberMap = new Map();
        const patientBulkOps = [];

        for (const patient of patients) {
            const oldRegNumber = patient.registrationNumber;
            sequence++;

            const prefixPart = prefix ? `${prefix}/` : '';
            const yearPart = useYearSuffix ? `${yearSuffix}/` : '';
            const newRegNumber = `${prefixPart}${yearPart}${sequence}`;
            
            if (oldRegNumber !== newRegNumber) {
                patientBulkOps.push({
                    updateOne: {
                        filter: { _id: patient._id },
                        update: { $set: { registrationNumber: newRegNumber } }
                    }
                });
                if (oldRegNumber) {
                    registrationNumberMap.set(oldRegNumber, newRegNumber);
                }
            }
        }
        
        // Step 3: Execute all updates in a few parallel, bulk operations
        const modelsToUpdate = [Visit, LabRegistration, IPDAdmission, OPDProcedure];
        const updatePromises = [];

        if (patientBulkOps.length > 0) {
            updatePromises.push(Patient.collection.bulkWrite(patientBulkOps, { session }));
        }

        modelsToUpdate.forEach(Model => {
            const bulkOps = [];
            for (const [oldNumber, newNumber] of registrationNumberMap.entries()) {
                bulkOps.push({
                    updateMany: {
                        filter: { hospital: hospitalId, registrationNumber: oldNumber },
                        update: { $set: { registrationNumber: newNumber } }
                    }
                });
            }
            if (bulkOps.length > 0) {
                updatePromises.push(Model.collection.bulkWrite(bulkOps, { session }));
            }
        });
        const servicesBillBulkOps = [];
        for (const [oldNumber, newNumber] of registrationNumberMap.entries()) {
            servicesBillBulkOps.push({
                updateMany: {
                    filter: { hospital: hospitalId, 'patientInfo.registrationNumber': oldNumber },
                    update: { $set: { 'patientInfo.registrationNumber': newNumber } }
                }
            });
        }
        if (servicesBillBulkOps.length > 0) {
            updatePromises.push(ServicesBill.collection.bulkWrite(servicesBillBulkOps, { session }));
        }
        await Promise.all(updatePromises);
        
        // Step 4: Update the master sequence counter for the year.
        await RegistrationNumber.updateOne(
            { hospital: hospitalId, year: yearInt },
            { 
                $set: { sequence: sequence },
                $setOnInsert: {
                    department: 'OPD',
                    prefix: prefix,
                    useYearSuffix: useYearSuffix
                }
            },
            { upsert: true, session }
        );

        await session.commitTransaction();
        res.json({ message: `Successfully re-sequenced registration numbers for ${patients.length} patients in ${year}.` });

    } catch (error) {
        await session.abortTransaction();
        console.error('Resequencing failed:', error);
        res.status(500).json({ error: `Resequencing failed: ${error.message}` });
    } finally {
        session.endSession();
    }
});

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.post('/selective-delete-opd', verifyToken, checkPermission('delete_patients'), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { startDate, endDate, minRecords, maxRecords } = req.body;

        if (!startDate || !endDate || !minRecords || !maxRecords) {
            throw new Error('Start date, end date, and record range are required.');
        }

        const sDate = new Date(startDate);
        const eDate = new Date(endDate);
        
        let allVisitsToDeleteIds = [];
        let allAffectedPatientIds = new Set();
        let totalVisitsDeleted = 0;

        for (let day = new Date(sDate); day <= eDate; day.setDate(day.getDate() + 1)) {
            const startOfDay = new Date(day);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(day);
            endOfDay.setHours(23, 59, 59, 999);

            const dailyVisits = await Visit.find({
                bookingDate: { $gte: startOfDay, $lte: endOfDay }
            }).sort({ bookingNumber: 1 }).session(session);

            const recordsToKeep = getRandomInt(parseInt(minRecords, 10), parseInt(maxRecords, 10));
            
            if (dailyVisits.length > recordsToKeep) {
                const visitsToDeleteForDay = dailyVisits.slice(recordsToKeep);
                const visitIdsToDelete = visitsToDeleteForDay.map(v => v._id);
                
                totalVisitsDeleted += visitsToDeleteForDay.length;
                allVisitsToDeleteIds.push(...visitIdsToDelete);
                visitsToDeleteForDay.forEach(v => allAffectedPatientIds.add(v.patient.toString()));
            }
        }

        if (allVisitsToDeleteIds.length === 0) {
            await session.abortTransaction();
            return res.status(200).json({ message: 'No records needed to be deleted based on the criteria.' });
        }

        const visitsToDelete = await Visit.find({ _id: { $in: allVisitsToDeleteIds } }).session(session);

        let serviceBillIds = [];
        visitsToDelete.forEach(visit => {
            if (visit.bills?.services) {
                serviceBillIds.push(...visit.bills.services);
            }
        });
        serviceBillIds = [...new Set(serviceBillIds.map(id => id.toString()))];

        const paymentIds = new Set();
        if (serviceBillIds.length > 0) {
            const serviceBills = await ServicesBill.find({ _id: { $in: serviceBillIds } }).session(session);
            for (const bill of serviceBills) {
                if (bill.payments?.length > 0) {
                    bill.payments.forEach(pid => paymentIds.add(pid.toString()));
                }
            }
        }
        
        const paymentIdArray = Array.from(paymentIds);
        if (paymentIdArray.length > 0) {
            await Payment.deleteMany({ _id: { $in: paymentIdArray } }).session(session);
        }

        if (serviceBillIds.length > 0) {
            await ServicesBill.deleteMany({ _id: { $in: serviceBillIds } }).session(session);
        }

        await Patient.updateMany(
            { _id: { $in: Array.from(allAffectedPatientIds) } },
            { $pull: { visits: { $in: allVisitsToDeleteIds } } },
            { timestamps: false }
        ).session(session);
        
        await Visit.deleteMany({ _id: { $in: allVisitsToDeleteIds } }).session(session);
        
        const patientsToCheck = await Patient.find({ _id: { $in: Array.from(allAffectedPatientIds) } }).session(session);
        const patientsToDeleteIds = [];

        for (const patient of patientsToCheck) {
            const hasNoOtherVisits = patient.visits.length === 0;
            const hasNoAdmissions = patient.admissionDetails.length === 0;

            if (hasNoOtherVisits && hasNoAdmissions) {
                patientsToDeleteIds.push(patient._id);
            }
        }
        
        let patientDeleteResult = { deletedCount: 0 };
        if (patientsToDeleteIds.length > 0) {
            patientDeleteResult = await Patient.deleteMany({ _id: { $in: patientsToDeleteIds } }).session(session);
        }

        await session.commitTransaction();
        res.json({
            message: `Deleted ${totalVisitsDeleted} OPD records and ${patientDeleteResult.deletedCount} associated patient records successfully.`,
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
});

router.post('/resequence-service-bill-invoice-numbers', verifyToken, checkPermission('delete_patients'), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { year } = req.body;
        const hospitalId = req.hospital;

        if (!year) {
            return res.status(400).json({ error: "Year is required." });
        }
        
        const yearInt = parseInt(year, 10);
        const startDate = new Date(yearInt, 0, 1);
        const endDate = new Date(yearInt, 11, 31, 23, 59, 59, 999);

        // Step 1: Fetch all service bills
        const serviceBills = await ServicesBill.find({
            hospital: hospitalId,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: 1 }).session(session);

        if (serviceBills.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.json({ message: `No service bills found to re-sequence for the year ${year}.` });
        }

        const billCounterConfig = await BillCounter.findOne({ hospital: hospitalId, year: yearInt }).session(session);
        const prefix = billCounterConfig?.prefix || 'INV';
        
        // Step 2: Prepare all database updates in memory
        let sequence = 0;
        const serviceBillBulkOps = [];
        const invoiceNumberMap = new Map();

        for (const bill of serviceBills) {
            const oldInvoiceNumber = bill.invoiceNumber;
            sequence++;
            const newInvoiceNumber = `${prefix}/${yearInt}/${sequence}`;
            
            if (bill.invoiceNumber !== newInvoiceNumber) {
                serviceBillBulkOps.push({
                    updateOne: {
                        filter: { _id: bill._id },
                        update: { $set: { invoiceNumber: newInvoiceNumber } }
                    }
                });
                if (oldInvoiceNumber) {
                    invoiceNumberMap.set(oldInvoiceNumber, newInvoiceNumber);
                }
            }
        }
        
        // Step 3: Execute all updates for ServiceBills and Payments
        const updatePromises = [];
        if (serviceBillBulkOps.length > 0) {
            updatePromises.push(ServicesBill.collection.bulkWrite(serviceBillBulkOps, { session }));
        }

        const paymentBulkOps = [];
        for (const [oldNumber, newNumber] of invoiceNumberMap.entries()) {
            paymentBulkOps.push({
                updateMany: {
                    filter: { hospital: hospitalId, associatedInvoiceOrId: oldNumber },
                    update: { $set: { associatedInvoiceOrId: newNumber } }
                }
            });
        }
        if (paymentBulkOps.length > 0) {
            updatePromises.push(Payment.collection.bulkWrite(paymentBulkOps, { session }));
        }
        
        await Promise.all(updatePromises);
        
        // Step 4: Update the master sequence counter for the year.
        await BillCounter.updateOne(
            { hospital: hospitalId, year: yearInt },
            { 
                $set: { lastNumber: sequence },
                $setOnInsert: {
                    prefix: prefix
                }
            },
            { upsert: true, session }
        );

        await session.commitTransaction();
        session.endSession();
        res.json({ message: `Successfully re-sequenced invoice numbers for ${serviceBills.length} service bills in ${year}.` });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Resequencing failed:', error);
        res.status(500).json({ error: `Resequencing failed: ${error.message}` });
    }
});

export default router;