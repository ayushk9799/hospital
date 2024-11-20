import { createSlice } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

// Create OPD Procedure
export const createOPDProcedure = createLoadingAsyncThunk(
  "opdProcedure/create",
  async (procedureData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/opd-procedures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(procedureData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch OPD Procedures
export const fetchOPDProcedures = createLoadingAsyncThunk(
  "opdProcedure/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/opd-procedures`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update payment status
export const updatePaymentStatus = createLoadingAsyncThunk(
  "opdProcedure/updatePayment",
  async (procedureId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/opd-procedures/${procedureId}/payment`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const opdProcedureSlice = createSlice({
  name: "opdProcedure",
  initialState: {
    procedures: [],
    status: "idle",
    error: null,
    createStatus: "idle",
    updateStatus: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOPDProcedure.pending, (state) => {
        state.createStatus = "loading";
      })
      .addCase(createOPDProcedure.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.procedures.unshift(action.payload);
      })
      .addCase(createOPDProcedure.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchOPDProcedures.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOPDProcedures.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.procedures = action.payload;
      })
      .addCase(fetchOPDProcedures.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updatePaymentStatus.pending, (state) => {
        state.updateStatus = "loading";
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const index = state.procedures.findIndex(
          (proc) => proc._id === action.payload._id
        );
        if (index !== -1) {
          state.procedures[index] = action.payload;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload;
      });
  },
});

export default opdProcedureSlice.reducer;
