import { createSlice } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

// Async thunk to create a service
export const createService = createLoadingAsyncThunk(
  "billing/createService",
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/billing/service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
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

// Async thunk to fetch all services
export const fetchServices = createLoadingAsyncThunk(
  "billing/fetchServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/billing/services`, {
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

// Async thunk to update a service
export const updateService = createLoadingAsyncThunk(
  "billing/updateService",
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/billing/service/${serviceData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceData),
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

// Async thunk to delete a service
export const deleteService = createLoadingAsyncThunk(
  "billing/deleteService",
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/billing/service/${serviceId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      return serviceId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

// Async thunk to bulk import services
export const importServices = createLoadingAsyncThunk(
  "billing/importServices",
  async (services, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/billing/services/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ services }),
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

const serviceSlice = createSlice({
  name: "services",
  initialState: {
    services: [],
    servicesStatus: "idle",
    createServiceStatus: "idle",
    updateServiceStatus: "idle",
    deleteServiceStatus: "idle",
    importServicesStatus: "idle",
    importServicesError: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createService.pending, (state) => {
        state.createServiceStatus = "loading";
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.createServiceStatus = "succeeded";
        state.services.push(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.createServiceStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchServices.pending, (state) => {
        state.servicesStatus = "loading";
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.servicesStatus = "succeeded";
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.servicesStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updateService.pending, (state) => {
        state.updateServiceStatus = "loading";
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.updateServiceStatus = "succeeded";
        const index = state.services.findIndex(
          (service) => service._id === action.payload._id
        );
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.updateServiceStatus = "failed";
        state.error = action.payload;
      })
      .addCase(deleteService.pending, (state) => {
        state.deleteServiceStatus = "loading";
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.deleteServiceStatus = "succeeded";
        state.services = state.services.filter(
          (service) => service._id !== action.payload
        );
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.deleteServiceStatus = "failed";
        state.error = action.payload;
      });
  },
});

export default serviceSlice.reducer;
