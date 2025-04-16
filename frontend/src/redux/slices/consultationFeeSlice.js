import { createSlice } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

// Async thunks
export const fetchConsultationFees = createLoadingAsyncThunk(
  "consultationFees/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/consultation-fees`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
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

export const updateConsultationFee = createLoadingAsyncThunk(
  "consultationFees/update",
  async (feeData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/consultation-fees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(feeData),
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

export const updateConsultationTypes = createLoadingAsyncThunk(
  "consultationFees/updateTypes",
  async (types, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/consultation-fees/types`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ types }),
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

const consultationFeeSlice = createSlice({
  name: "consultationFees",
  initialState: {
    doctorWiseFee: [],
    consultationTypes: [],
    masterFollowup: -1,
    masterConsultationFeesDoctor: {},
    masterConsultationFeesType: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch consultation fees
      .addCase(fetchConsultationFees.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConsultationFees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.doctorWiseFee = action.payload.doctorWiseFee || [];

        // Calculate master consultation fees for each type
        const masterFees = {};
        if (
          action.payload.consultationTypes &&
          action.payload.doctorWiseFee.length > 0
        ) {
          action.payload.consultationTypes.forEach((type) => {
            const feesForType = action.payload.doctorWiseFee
              .map((doctor) => doctor.consultationType[type])
              .filter((fee) => fee !== undefined);

            // If all doctors have the same fee for this type, use it as master value
            const allSameFee =
              feesForType.length > 0 &&
              feesForType.every((fee) => fee === feesForType[0]);

            masterFees[type] = allSameFee ? feesForType[0] : -1;
          });
        }
        state.masterConsultationFeesType = masterFees;

        // Calculate master consultation fees for each doctor
        const masterDoctorFees = {};
        if (action.payload.doctorWiseFee.length > 0) {
          action.payload.doctorWiseFee.forEach((doctor) => {
            const doctorFees = Object.values(doctor.consultationType);
            // Check if all consultation types for this doctor have the same fee
            const allSameFee =
              doctorFees.length > 0 &&
              doctorFees.every((fee) => fee === doctorFees[0]);

            masterDoctorFees[doctor.doctor._id] = allSameFee ? doctorFees[0] : -1;
          });
        }
        state.masterConsultationFeesDoctor = masterDoctorFees;

        // Check if all followUpWithinDate values are the same
        const followUpDates = action.payload.doctorWiseFee.map(
          (fee) => fee.followUpDateWithin
        );
        const allSameFollowUp =
          followUpDates.length > 0 &&
          followUpDates.every((date) => date === followUpDates[0]);
        // Add masterFollowup property
        state.masterFollowup = allSameFollowUp ? followUpDates[0] : -1;
        state.consultationTypes = action.payload.consultationTypes || [];
        state.error = null;
      })
      .addCase(fetchConsultationFees.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message || "Failed to fetch consultation fees";
      })
      // Update consultation fee
      .addCase(updateConsultationFee.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateConsultationFee.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.doctorWiseFee = action.payload.doctorWiseFee;
        state.consultationTypes = action.payload.consultationTypes;
        state.error = null;
      })
      .addCase(updateConsultationFee.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message || "Failed to update consultation fee";
      })
      // Update consultation types
      .addCase(updateConsultationTypes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateConsultationTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.doctorWiseFee = action.payload.doctorWiseFee;
        state.consultationTypes = action.payload.consultationTypes;
        state.error = null;
      })
      .addCase(updateConsultationTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message || "Failed to update consultation types";
      });
  },
});

export default consultationFeeSlice.reducer;
