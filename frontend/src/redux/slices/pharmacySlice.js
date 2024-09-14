import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";

const initialState = {
  orders: [],
  suppliers: [],
  selectedSupplier: null,
  status: "idle",
  error: null,
};

export const fetchOrders = createAsyncThunk("orders/fetchOrders", async () => {
  const response = await fetch(`${Backend_URL}/api/orders`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
});

// create order with supplier and items creation
export const createOrder = createAsyncThunk("orders/createOrder", async (orderData) => {
  const response = await fetch(`${Backend_URL}/api/orders/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to create order');
  }
  return response.json();
});

// fetch all suppliers
export const fetchSuppliers = createAsyncThunk("suppliers/fetchSuppliers", async () => {
  const response = await fetch(`${Backend_URL}/api/orders/suppliers`, {
    headers:{'Content-Type':'application/json'},
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch suppliers');
  }
  const data = await response.json();
  console.log('data',data)
  return data;
});

// New thunk for fetching supplier details
export const fetchSupplierDetails = createAsyncThunk(
  "suppliers/fetchSupplierDetails",
  async (supplierId) => {
    const response = await fetch(`${Backend_URL}/api/orders/supplier/${supplierId}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch supplier details');
    }
    return response.json();
  }
);

const pharmacySlice = createSlice({
  name: "pharmacy",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        // state.orders.push(action.payload);
        console.log(action.payload)
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = "failed";
          state.error = action.error.message;
        })
      .addCase(fetchSuppliers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchSupplierDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSupplierDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedSupplier = action.payload;
      })
      .addCase(fetchSupplierDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default pharmacySlice.reducer;
