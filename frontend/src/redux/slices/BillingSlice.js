import { createSlice } from '@reduxjs/toolkit';
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from '../../assets/Data';

// Async thunk to create a bill
export const createBill = createLoadingAsyncThunk(
  'billing/createBill',
  async (billData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/billing/create-bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
        credentials: 'include'
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
  'billing/fetchBills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/billing/get-bills`, {
        credentials: 'include'
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

const billSlice = createSlice({
  name: 'bills',
  initialState: {
    bills: [],
    billsStatus: "idle",
    createBillStatus: "idle",
    error: null,
  },
  reducers: {
    setCreateBillStatusIdle: (state) => {
      state.createBillStatus = "idle";
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
        state.bills.push(action.payload);
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
      });
  },
});

export const { 
  setCreateBillStatusIdle 
} = billSlice.actions;

export default billSlice.reducer;
