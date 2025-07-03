import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";

export const fetchTextTemplates = createAsyncThunk(
  "textTemplates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/text-templates`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch text templates");
      }
      return data.templates;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveTextTemplate = createAsyncThunk(
  "textTemplates/save",
  async (
    { templateData, formTemplate, field },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const url = `${Backend_URL}/api/prescription-templates/textTemplates/${formTemplate._id}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          templateData: templateData,
          fieldId: field.id,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to save template");
      }

      dispatch(fetchTextTemplates());
      return result.suggestion;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTextTemplate = createAsyncThunk(
  "textTemplates/delete",
  async ({ templateId, formTemplate, field }, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/prescription-templates/textTemplates/${formTemplate._id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fieldId: field.id,
            templateId: templateId,
          }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to delete template");
      }

      dispatch(fetchTextTemplates());
      return templateId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  templates: [],
  status: "idle",
  error: null,
};

const textTemplatesSlice = createSlice({
  name: "textTemplates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTextTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTextTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = action.payload;
      })
      .addCase(fetchTextTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(saveTextTemplate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveTextTemplate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteTextTemplate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteTextTemplate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default textTemplatesSlice.reducer;
