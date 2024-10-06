import { createSlice } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

const initialState = {
  dashboardData: [],
  dashboardDataStatus: "idle",
  dashboardRange: "idle",
  error: null,
};

// New thunk for fetching dashboard data
export const fetchDashboardData = createLoadingAsyncThunk(
  "dashboard/fetchData",
  async ({ startDate, endDate, range }, { getState }) => {
    const state = getState();
    if (range === state.dashboard.dashboardRange) {
      return state.dashboard.dashboardData;
    }

    const params = new URLSearchParams({ startDate, endDate });
    const response = await fetch(
      `${Backend_URL}/api/dashboard/daily-stats?${params}`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    const data = await response.json();

    return data;
  },
  { useGlobalLoader: true }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardDataStatusIdle: (state) => {
      state.dashboardDataStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.dashboardDataStatus = "loading";
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.dashboardDataStatus = "succeeded";
        state.dashboardData = action.payload; // Set the data as is, without Array.isArray check
        state.dashboardRange = action.meta.arg.range; // Update the dashboardRange
        // Log the data being set in state
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.dashboardDataStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setDashboardDataStatusIdle } = dashboardSlice.actions;
export default dashboardSlice.reducer;
