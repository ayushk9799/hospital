import { createSlice, createSelector } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { dischargePatient } from "./dischargeSlice"; // Import the dischargePatient thunk

// Replace the existing fetchPatients thunk with this:
export const fetchPatients = createLoadingAsyncThunk(
  "patients/fetchPatients",
  async (dateRange, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/patients/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          startDate: dateRange?.startDate || null,
          endDate: dateRange?.endDate || null,
        }),
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

// Add this new thunk for patient readmission
export const readmitPatient = createLoadingAsyncThunk(
  "patients/readmitPatient",
  async ({ patientId, admission }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/patients/${patientId}/readmission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(admission),
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
  },
  { useGlobalLoader: true }
);

// Add this new thunk for fetching visit details
export const fetchVisitDetails = createLoadingAsyncThunk(
  "patients/fetchVisitDetails",
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/patients/visit-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id, type }),
        }
      );

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

// Add this new thunk after the other thunks
export const searchPatients = createLoadingAsyncThunk(
  "patients/searchPatients",
  async (searchQuery, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/dashboard/search?q=${searchQuery}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      return { results: data, searchQuery };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

// Add this new thunk for OPD revisit
export const opdRevisit = createLoadingAsyncThunk(
  "patients/opdRevisit",
  async ({ patientId, visit }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/patients/${patientId}/revisit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(visit),
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
  },
  { useGlobalLoader: true }
);

// Add this new thunk for fetching registration details
export const fetchRegistrationDetails = createLoadingAsyncThunk(
  "patients/fetchRegistrationDetails",
  async ({ registrationNumber, type }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/patients/registration-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ registrationNumber, type }),
        }
      );

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

// Add this new thunk
export const fetchAdmittedPatients = createLoadingAsyncThunk(
  "patients/fetchAdmittedPatients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/patients/admittedpatients`,
        {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add these new thunks after the other thunks
export const fetchRegistrationAndIPDNumbers = createLoadingAsyncThunk(
  "patients/fetchRegistrationAndIPDNumbers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/patients/registration-ipd-numbers`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
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
  visitDetails: null,
  visitDetailsStatus: "idle",
  searchResults: [],
  searchQuery: "",
  searchStatus: "idle",
  registrationDetails: null,
  registrationDetailsStatus: "idle",
  admittedPatients: [],
  admittedPatientsStatus: "idle",
  registrationNumber: null,
  ipdNumber: null,
  numbersStatus: "idle",
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
        const { labReports } = updatedPatient;
        const index = state.patientlist.findIndex(
          (patient) => patient._id === updatedPatient._id
        );
        if (index !== -1) {
          state.patientlist[index] = {
            ...state.patientlist[index],
            labReports,
          };
        }
        // If the updated patient is the currently selected patient, update it as well
        if (
          state.selectedPatient &&
          state.selectedPatient._id === updatedPatient._id
        ) {
          state.selectedPatient = {
            ...state.selectedPatient,
            ...updatedPatient,
          };
        }
      })
      .addCase(addLabReport.rejected, (state, action) => {
        state.addLabReportStatus = "failed";
        state.error = action.payload;
      })
      .addCase(dischargePatient.fulfilled, (state, action) => {
        const updatedPatient = action.payload;
        const { assignedRoom, assignedBed, department, patient, ...rest } =
          updatedPatient;
        const index = state.patientlist.findIndex(
          (patient) => patient._id === updatedPatient._id
        );
        if (index !== -1) {
          // Update the patient in the patientlist
          state.patientlist[index] = { ...state.patientlist[index], ...rest };
        }
        // If the discharged patient is the currently selected patient, update it as well
        if (
          state.selectedPatient &&
          state.selectedPatient._id === updatedPatient._id
        ) {
          state.selectedPatient = {
            ...state.selectedPatient,
            ...updatedPatient,
          };
        }
      })
      .addCase(readmitPatient.pending, (state) => {
        state.status = "loading";
      })
      .addCase(readmitPatient.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update the patient in the patientlist
        const updatedPatient = action.payload.patient;
        const index = state.patientlist.findIndex(
          (patient) => patient._id === updatedPatient._id
        );
        if (index !== -1) {
          state.patientlist[index] = updatedPatient;
        }
        // If the readmitted patient is the currently selected patient, update it as well
        if (
          state.selectedPatient &&
          state.selectedPatient._id === updatedPatient._id
        ) {
          state.selectedPatient = updatedPatient;
        }
      })
      .addCase(readmitPatient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchVisitDetails.pending, (state) => {
        state.visitDetailsStatus = "loading";
        state.visitDetails = null;
      })
      .addCase(fetchVisitDetails.fulfilled, (state, action) => {
        state.visitDetailsStatus = "succeeded";
        state.visitDetails = action.payload;
      })
      .addCase(fetchVisitDetails.rejected, (state, action) => {
        state.visitDetailsStatus = "failed";
        state.visitDetails = null;
        state.error = action.payload;
      })
      .addCase(searchPatients.pending, (state) => {
        state.searchStatus = "loading";
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.searchResults = action.payload.results;
        state.searchQuery = action.payload.searchQuery;
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.error = action.payload;
      })
      .addCase(opdRevisit.pending, (state) => {
        state.status = "loading";
      })
      .addCase(opdRevisit.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update the patient in the patientlist
        const updatedPatient = action.payload.patient;
        const index = state.patientlist.findIndex(
          (patient) => patient._id === updatedPatient._id
        );
        if (index !== -1) {
          state.patientlist[index] = updatedPatient;
        }
        // If the updated patient is the currently selected patient, update it as well
        if (
          state.selectedPatient &&
          state.selectedPatient._id === updatedPatient._id
        ) {
          state.selectedPatient = updatedPatient;
        }
      })
      .addCase(opdRevisit.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchRegistrationDetails.pending, (state) => {
        state.registrationDetailsStatus = "loading";
        state.registrationDetails = null;
      })
      .addCase(fetchRegistrationDetails.fulfilled, (state, action) => {
        state.registrationDetailsStatus = "succeeded";
        state.registrationDetails = action.payload;
      })
      .addCase(fetchRegistrationDetails.rejected, (state, action) => {
        state.registrationDetailsStatus = "failed";
        state.registrationDetails = null;
        state.error = action.payload;
      })
      .addCase(fetchAdmittedPatients.pending, (state) => {
        state.admittedPatientsStatus = "loading";
      })
      .addCase(fetchAdmittedPatients.fulfilled, (state, action) => {
        state.admittedPatientsStatus = "succeeded";
        state.admittedPatients = action.payload;
      })
      .addCase(fetchAdmittedPatients.rejected, (state, action) => {
        state.admittedPatientsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchRegistrationAndIPDNumbers.pending, (state) => {
        state.numbersStatus = "loading";
      })
      .addCase(fetchRegistrationAndIPDNumbers.fulfilled, (state, action) => {
        state.numbersStatus = "succeeded";
        state.registrationNumber = action.payload.registrationNumber;
        state.ipdNumber = action.payload.ipdNumber;
      })
      .addCase(fetchRegistrationAndIPDNumbers.rejected, (state, action) => {
        state.numbersStatus = "failed";
        state.error = action.payload;
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

// Add a selector for visit details
export const selectVisitDetails = createSelector(
  [
    (state) => state.patients.visitDetails,
    (state) => state.patients.visitDetailsStatus,
  ],
  (visitDetails, status) => ({ visitDetails, status })
);

export const selectRegistrationDetails = createSelector(
  [
    (state) => state.patients.registrationDetails,
    (state) => state.patients.registrationDetailsStatus,
  ],
  (registrationDetails, status) => ({ registrationDetails, status })
);

export default patientSlice.reducer;
