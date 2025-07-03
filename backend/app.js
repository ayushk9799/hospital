import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import orderRoutes from "./routes/orderRoutes.js";
import prescriptionTemplateRoutes from "./routes/prescriptionTemplateRoutes.js";
import doctorDataRoutes from "./routes/doctorData.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: true }));

app.use("/api/orders", orderRoutes);

// ... other middleware and routes ...

export default app;
