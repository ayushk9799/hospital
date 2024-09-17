import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

const initialState = {
  orders: [],
  suppliers: [],
  selectedSupplier: null,
  items: [],
  ordersStatus: "idle",
  suppliersStatus: "idle",
  supplierDetailsStatus: "idle",
  itemsStatus: "idle",
  createOrderStatus: "idle",
  error: null,
  salesBills: [],
  salesBillsStatus: "idle",
  createSalesBillStatus: "idle",
};

// fetch all orders
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
export const fetchSuppliers = createLoadingAsyncThunk("suppliers/fetchSuppliers", async () => {
  const response = await fetch(`${Backend_URL}/api/orders/suppliers`, {
    headers:{'Content-Type':'application/json'},
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch suppliers');
  }
  const data = await response.json();
  return data;
}, { useGlobalLoader: true });

// New thunk for fetching supplier details
export const fetchSupplierDetails = createLoadingAsyncThunk(
  "suppliers/fetchSupplierDetails",
  async (supplierId) => {
    const response = await fetch(`${Backend_URL}/api/orders/supplier/${supplierId}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch supplier details');
    }
    return response.json();
  },
  { useGlobalLoader: true }
);

// New thunk for fetching items
export const fetchItems = createLoadingAsyncThunk("items/fetchItems", async () => {
  const response = await fetch(`${Backend_URL}/api/orders/items`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
}, { useGlobalLoader: true });

// New thunk for fetching sales bills
export const fetchSalesBills = createLoadingAsyncThunk("pharmacy/fetchSalesBills", async () => {
  const response = await fetch(`${Backend_URL}/api/pharmacy/sales-bills`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch sales bills');
  }
  return response.json();
}, { useGlobalLoader: true });

// New thunk for creating a sales bill
export const createSalesBill = createLoadingAsyncThunk(
  "pharmacy/createSalesBill",
  async (salesBillData) => {
    const response = await fetch(`${Backend_URL}/api/pharmacy/create-sales-bill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(salesBillData),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to create sales bill');
    }
    return response.json();
  },
  { useGlobalLoader: false }
);

const pharmacySlice = createSlice({
  name: "pharmacy",
  initialState,
  reducers: {
    setCreateSalesBillStatus: (state, action) => {
      state.createSalesBillStatus = action.payload;
    },
    setCreateOrderStatus: (state, action) => {
      state.createOrderStatus = action.payload;
    },
    // New reducer to set selectedSupplier to null
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null;
      state.supplierDetailsStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.ordersStatus = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.ordersStatus = "succeeded";
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.ordersStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(createOrder.pending, (state) => {
        state.createOrderStatus = "loading";
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createOrderStatus = "succeeded";
        console.log(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createOrderStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchSuppliers.pending, (state) => {
        state.suppliersStatus = "loading";
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliersStatus = "succeeded";
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.suppliersStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchSupplierDetails.pending, (state) => {
        state.supplierDetailsStatus = "loading";
      })
      .addCase(fetchSupplierDetails.fulfilled, (state, action) => {
        state.supplierDetailsStatus = "succeeded";
        state.selectedSupplier = action.payload;
      })
      .addCase(fetchSupplierDetails.rejected, (state, action) => {
        state.supplierDetailsStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchItems.pending, (state) => {
        state.itemsStatus = "loading";
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.itemsStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.itemsStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchSalesBills.pending, (state) => {
        state.salesBillsStatus = "loading";
      })
      .addCase(fetchSalesBills.fulfilled, (state, action) => {
        state.salesBillsStatus = "succeeded";
        state.salesBills = action.payload;
      })
      .addCase(fetchSalesBills.rejected, (state, action) => {
        state.salesBillsStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(createSalesBill.pending, (state) => {
        state.createSalesBillStatus = "loading";
      })
      .addCase(createSalesBill.fulfilled, (state, action) => {
        state.createSalesBillStatus = "succeeded";
        state.salesBills.push(action.payload);
      })
      .addCase(createSalesBill.rejected, (state, action) => {
        state.createSalesBillStatus = "failed";
        state.error = action.error.message;
      });
  },
});

// Update the exported actions
export const { setCreateSalesBillStatus, setCreateOrderStatus, clearSelectedSupplier } = pharmacySlice.actions;
export default pharmacySlice.reducer;
