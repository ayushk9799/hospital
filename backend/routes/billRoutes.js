import { BillCounter } from "../models/BillCounter.js";
const router = express.Router();

// In your bill creation route handler
router.post('/', async (req, res) => {
  try {
    const hospitalId = req.hospital; // Assuming you have hospital ID in request
    
    // Generate next bill number
    const invoiceNumber = await BillCounter.getNextBillNumber();
    
    // Create new bill with generated invoice number
    const newBill = new ServicesBill({
      invoiceNumber,
      // ... other bill details from request
      hospital: hospitalId
    });

    await newBill.save();
    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
