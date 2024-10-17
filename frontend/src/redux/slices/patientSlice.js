import { createSlice, createSelector } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { dischargePatient } from "./dischargeSlice"; // Import the dischargePatient thunk

// Replace the existing fetchPatients thunk with this:
export const fetchPatients = createLoadingAsyncThunk(
  "patients/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/patients/details`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

// Add a new thunk for registering a patient
export const registerPatient = createLoadingAsyncThunk(
  "patients/registerPatient",
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

export const revisitPatient = createLoadingAsyncThunk(
  "patients/revesitPatient",
  async (data, { rejectWithValue }) => {
    try {
      const { submissionData, _id } = data;
      const response = await fetch(
        `${Backend_URL}/api/patients/${_id}/revisit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const savePrescription = createLoadingAsyncThunk(
  "patients/savePrescription",
  async ({
    selectedVisitId,
    vitals,
    prescription,
    selectedPatientType,
    clinicalSummary,
    notes,
    labTests,
    comorbidities,
    conditionOnAdmission,
    conditionOnDischarge,
  }) => {
    const response = await fetch(
      `${Backend_URL}/api/patients/${
        selectedPatientType === "OPD" ? "visit" : "admission"
      }/${selectedVisitId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          vitals,
          prescription,
          labTests,
          clinicalSummary,
          notes,
          comorbidities,
          conditionOnAdmission,
          conditionOnDischarge,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save data");
    }

    const data = await response.json();
    return data;
  },
  { useGlobalLoader: true }
);

// Add this new thunk for fetching patient details
export const fetchPatientDetails = createLoadingAsyncThunk(
  "patients/fetchPatientDetails",
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/patients/${patientId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

export const addLabReport = createLoadingAsyncThunk(
  "patients/addLabReport",
  async ({ visitId, labReport, searchWhere }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/patients/addLabReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          visitId,
          labReport,
          searchWhere,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

const initialState = {
  patientlist: [],
  patientsStatus: "idle",
  selectedPatient: null,
  status: "idle",
  prescriptionUpdateStatus: "idle",
  registerPatientStatus: "idle",
  patientDetails: null,
  patientDetailsStatus: "idle",
  addLabReportStatus: "idle",
  error: null,
};

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload;
    },
    setSelectedPatientForBill: (state, action) => {
      state.selectedPatient = state.patientlist.find(
        (patient) => patient.patient._id === action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.patientlist = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(savePrescription.pending, (state) => {
        state.prescriptionUpdateStatus = "loading";
      })
      .addCase(savePrescription.fulfilled, (state, action) => {
        state.prescriptionUpdateStatus = "succeeded";

        // Update the patient in the patientlist
        const value = action.payload;

        const index = state.patientlist.findIndex(
          (patient) => patient._id === value._id
        );
        if (index !== -1) {
          state.patientlist[index] = { ...state.patientlist[index], ...value };
        }
      })
      .addCase(savePrescription.rejected, (state, action) => {
        state.prescriptionUpdateStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(registerPatient.pending, (state) => {
        state.registerPatientStatus = "loading";
      })
      .addCase(registerPatient.fulfilled, (state, action) => {
        state.registerPatientStatus = "succeeded";
      })
      .addCase(registerPatient.rejected, (state, action) => {
        state.registerPatientStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchPatientDetails.pending, (state) => {
        state.patientDetailsStatus = "loading";
      })
      .addCase(fetchPatientDetails.fulfilled, (state, action) => {
        state.patientDetailsStatus = "succeeded";
        state.patientDetails = action.payload;
      })
      .addCase(fetchPatientDetails.rejected, (state, action) => {
        state.patientDetailsStatus = "failed";
        state.patientDetails = null; // Reset to null on error
      })
      .addCase(addLabReport.pending, (state) => {
        state.addLabReportStatus = "loading";
      })
      .addCase(addLabReport.fulfilled, (state, action) => {
        state.addLabReportStatus = "succeeded";
        // Update the patient in the patientlist with the new lab report
        const updatedPatient = action.payload.visit;
        const {labReports} = updatedPatient;
        const index = state.patientlist.findIndex(
          (patient) => patient._id === updatedPatient._id
        );
        if (index !== -1) {
          state.patientlist[index] = { ...state.patientlist[index], labReports };
        }
        // If the updated patient is the currently selected patient, update it as well
        if (state.selectedPatient && state.selectedPatient._id === updatedPatient._id) {
          state.selectedPatient = { ...state.selectedPatient, ...updatedPatient };
        }
      })
      .addCase(addLabReport.rejected, (state, action) => {
        state.addLabReportStatus = "failed";
        state.error = action.payload;
      })
      .addCase(dischargePatient.fulfilled, (state, action) => {
        const updatedPatient = action.payload;
        const {assignedRoom, assignedBed, department,patient,...rest} = updatedPatient;
        const index = state.patientlist.findIndex(
          (patient) => patient._id === updatedPatient._id
        );
        if (index !== -1) {
          // Update the patient in the patientlist
          state.patientlist[index] = { ...state.patientlist[index], ...rest };
        }
        // If the discharged patient is the currently selected patient, update it as well
        if (state.selectedPatient && state.selectedPatient._id === updatedPatient._id) {
          state.selectedPatient = { ...state.selectedPatient, ...updatedPatient };
        }
      });
  },
});

export const { setSelectedPatient, setSelectedPatientForBill } =
  patientSlice.actions;

export const selectPatientDetails = createSelector(
  [
    (state) => state.patients.selectedPatient,
    (state) => state.patients.patientDetailsStatus,
  ],
  (selectedPatient, status) => ({ patientData: selectedPatient, status })
);
export default patientSlice.reducer;
