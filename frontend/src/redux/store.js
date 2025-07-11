import { configureStore } from "@reduxjs/toolkit";
import patientReducer from "./slices/patientSlice";
import staffReducer from "./slices/staffSlice";
import departmentReducer from "./slices/departmentSlice";
import userReducer from "./slices/userSlice";
import roomReducer from "./slices/roomSlice";
import pharmacyReducer from "./slices/pharmacySlice";
import loaderReducer from "./slices/loaderSlice";
import serviceReducer from "./slices/serviceSlice";
import billingReducer from "./slices/BillingSlice";
import hospitalReducer from "./slices/HospitalSlice";
import templatesReducer from "./slices/templatesSlice";
import dashboardReducer from "./slices/dashboardSlice";
import dischargeReducer from "./slices/dischargeSlice";
import expenseReducer from "./slices/expenseSlice";
import babyReducer from "./slices/babySlice";
import paymentReducer from "./slices/paymentSlice";
import labReducer from "./slices/labSlice";
import hospitalSettingsReducer from "./slices/hospitalSettingsSlice";
import consultationFeeReducer from "./slices/consultationFeeSlice";
import prescriptionTemplatesReducer from "./slices/prescriptionTemplateSlice";
import doctorDataReducer from "./slices/doctorDataSlice";
import doctorPrescriptionReducer from "./slices/doctorPrescriptionSlice";
import textTemplatesReducer from "./slices/textTemplatesSlice";

export const store = configureStore({
  reducer: {
    patients: patientReducer,
    staff: staffReducer,
    departments: departmentReducer,
    rooms: roomReducer,
    pharmacy: pharmacyReducer,
    user: userReducer,
    loader: loaderReducer,
    services: serviceReducer,
    bills: billingReducer,
    hospital: hospitalReducer,
    templates: templatesReducer,
    dashboard: dashboardReducer,
    discharge: dischargeReducer,
    expenses: expenseReducer,
    babies: babyReducer,
    payments: paymentReducer,
    lab: labReducer,
    hospitalSettings: hospitalSettingsReducer,
    consultationFees: consultationFeeReducer,
    prescriptionTemplates: prescriptionTemplatesReducer,
    doctorData: doctorDataReducer,
    doctorPrescription: doctorPrescriptionReducer,
    textTemplates: textTemplatesReducer,
  },
});
