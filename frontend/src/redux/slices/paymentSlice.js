import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

// Async thunk for fetching payments
export const fetchPayments = createLoadingAsyncThunk(
  "payments/fetchPayments",
  async ({  startDate, endDate }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetch(
        `${Backend_URL}/api/payments/filter?${queryParams}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    useGlobalLoader: true,
  }
);

// Async thunk for fetching payment statistics
export const fetchPaymentStats = createLoadingAsyncThunk(
  "payments/fetchPaymentStats",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetch(
        `${Backend_URL}/api/payments/statistics?${queryParams}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payment statistics");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    useGlobalLoader: true,
  }
);

const paymentSlice = createSlice({
  name: "payments",
  initialState: {
    payments: [],
    stats: {
      income: 0,
      expense: 0,
      net: 0,
    },
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchPayments
      .addCase(fetchPayments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Handle fetchPaymentStats
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export default paymentSlice.reducer;
