import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

// Async thunk for fetching payments
export const fetchPayments = createLoadingAsyncThunk(
  "payments/fetchPayments",
  async ({ startDate, endDate }, { rejectWithValue }) => {
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

// Async thunk for deleting a payment
export const deletePayment = createLoadingAsyncThunk(
  "payments/deletePayment",
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/payments/${paymentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete payment");
      }

      const data = await response.json(); // Contains { message: '...', deletedPaymentId: '...' }
      return data.deletedPaymentId; // Return the ID of the deleted payment
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    useGlobalLoader: true, // Or false, depending on desired UX
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
        state.error = action.payload;
      })
      // Handle fetchPaymentStats
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Handle deletePayment
      .addCase(deletePayment.pending, (state) => {
        state.status = "deleting";
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove the deleted payment from the state
        state.payments = state.payments.filter(
          (payment) => payment._id !== action.payload
        );

        // Update payment statistics if they exist
        if (state.stats && state.payments.length > 0) {
          // Recalculate totals
          const income = state.payments
            .filter((p) => p.type === "Income")
            .reduce((sum, p) => sum + (p.amount || 0), 0);

          const expense = state.payments
            .filter((p) => p.type === "Expense")
            .reduce((sum, p) => sum + (p.amount || 0), 0);

          state.stats = {
            income,
            expense,
            net: income - expense,
          };
        }

        state.error = null;
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default paymentSlice.reducer;
