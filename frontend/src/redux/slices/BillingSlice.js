import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

// Async thunk to create a bill
export const createBill = createLoadingAsyncThunk(
  "billing/createBill",
  async (billData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/billing/create-bill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billData),
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

// Async thunk to fetch all bills
export const fetchBills = createLoadingAsyncThunk(
  "billing/fetchBills",
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (!filters.dateRange?.startDate && !filters.dateRange?.endDate) {
        return rejectWithValue("Please select a date range");
      }
      // Add date range filters if present
      if (filters.dateRange?.startDate) {
        const startDate = new Date(filters.dateRange.startDate + "T00:00:00");
        queryParams.append("startDate", startDate);
      }
      if (filters.dateRange?.endDate) {
        const endDate = new Date(filters.dateRange.endDate + "T23:59:59");
        queryParams.append("endDate", endDate);
      }

      const url = `${Backend_URL}/api/billing/get-bills${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, {
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

// New async thunk to update a bill
export const updateBill = createLoadingAsyncThunk(
  "billing/updateBill",
  async ({ billId, billData }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/billing/update-bill/${billId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(billData),
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
  },
  { useGlobalLoader: true }
);

// New async thunk to delete a bill
export const deleteBill = createLoadingAsyncThunk(
  "billing/deleteBill",
  async (billId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/billing/delete-bill/${billId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      return billId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

export const addPayment = createLoadingAsyncThunk(
  "bills/addPayment",
  async ({ billId, payment }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/billing/${billId}/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payment),
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
  },
  { useGlobalLoader: true }
);

// Add this new async thunk after the other thunks and before the slice definition
export const createOPDProcedureBill = createLoadingAsyncThunk(
  "billing/createOPDProcedureBill",
  async (billData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/billing/create-opd-procedure-bill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(billData),
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
  },
  { useGlobalLoader: true }
);

// Add this new async thunk after the other thunks
export const fetchBillById = createLoadingAsyncThunk(
  "billing/fetchBillById",
  async (billId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/billing/get-bill/${billId}`,
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
  },
  { useGlobalLoader: true }
);

// Add this new thunk after other thunks
export const searchBillByInvoice = createLoadingAsyncThunk(
  "billing/searchBillByInvoice",
  async (invoiceNumber, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/billing/search-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoiceNumber: invoiceNumber }),
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
  },
  { useGlobalLoader: true }
);

// Add this new thunk after other thunks
export const deletePayment = createLoadingAsyncThunk(
  "bills/deletePayment",
  async ({ billId, paymentId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/billing/${billId}/payments/${paymentId}`,
        {
          method: "DELETE",
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
  },
  { useGlobalLoader: true }
);

const billingSlice = createSlice({
  name: "bills",
  initialState: {
    bills: [],
    billsStatus: "idle",
    createBillStatus: "idle",
    updateBillStatus: "idle",
    error: null,
    createOPDProcedureBillStatus: "idle",
    currentBill: null,
    currentBillStatus: "idle",
  },
  reducers: {
    setCreateBillStatusIdle: (state) => {
      state.createBillStatus = "idle";
      state.updateBillStatus = "idle";
    },
    updateBillAfterPayment: (state, action) => {
      const updatedBill = action.payload;
      state.bills = state.bills.map((bill) =>
        bill._id === updatedBill._id ? updatedBill : bill
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBill.pending, (state) => {
        state.createBillStatus = "loading";
        state.error = null;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.createBillStatus = "succeeded";
        state.bills.unshift(action.payload);
      })
      .addCase(createBill.rejected, (state, action) => {
        state.createBillStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchBills.pending, (state) => {
        state.billsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.billsStatus = "succeeded";
        state.bills = action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.billsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updateBill.pending, (state) => {
        state.updateBillStatus = "loading";
        state.error = null;
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.updateBillStatus = "succeeded";
        const index = state.bills.findIndex(
          (bill) => bill._id === action.payload._id
        );
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.updateBillStatus = "failed";
        state.error = action.payload;
      })
      .addCase(deleteBill.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.bills = state.bills.filter((bill) => bill._id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        const index = state.bills.findIndex(
          (bill) => bill._id === action.payload._id
        );
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      .addCase(createOPDProcedureBill.pending, (state) => {
        state.createOPDProcedureBillStatus = "loading";
        state.error = null;
      })
      .addCase(createOPDProcedureBill.fulfilled, (state, action) => {
        state.createOPDProcedureBillStatus = "succeeded";
        state.bills.unshift(action.payload);
      })
      .addCase(createOPDProcedureBill.rejected, (state, action) => {
        state.createOPDProcedureBillStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchBillById.pending, (state) => {
        state.currentBillStatus = "loading";
        state.error = null;
      })
      .addCase(fetchBillById.fulfilled, (state, action) => {
        state.currentBillStatus = "succeeded";
        state.currentBill = action.payload;
      })
      .addCase(fetchBillById.rejected, (state, action) => {
        state.currentBillStatus = "failed";
        state.error = action.payload;
      })
      .addCase(searchBillByInvoice.fulfilled, (state, action) => {
        state.billsStatus = "succeeded";
      })
      .addCase(searchBillByInvoice.rejected, (state, action) => {
        state.billsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        const index = state.bills.findIndex(
          (bill) => bill._id === action.payload._id
        );
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setCreateBillStatusIdle, updateBillAfterPayment } =
  billingSlice.actions;

export default billingSlice.reducer;
