import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";

// Async thunk for fetching templates
export const fetchTemplates = createAsyncThunk(
  "templates/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/read`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating diagnosis template
export const updateDiagnosisTemplate = createAsyncThunk(
  "templates/updateDiagnosisTemplate",
  async (diagnosisTemplate, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ diagnosisTemplate }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update diagnosis template");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  labTestsTemplate: [],
  headerTemplate: {},
  diagnosisTemplate: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.labTestsTemplate = action.payload.labTestsTemplate;
        state.headerTemplate = action.payload.headerTemplate;
        state.diagnosisTemplate = action.payload.diagnosisTemplate;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message || "Failed to fetch templates";
      })
      .addCase(updateDiagnosisTemplate.fulfilled, (state, action) => {
        state.diagnosisTemplate = action.payload.diagnosisTemplate;
      });
  },
});

export default templatesSlice.reducer;
