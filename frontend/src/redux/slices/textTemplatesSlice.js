import { createSlice } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

export const saveTextTemplate = createLoadingAsyncThunk(
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

      return result.suggestion;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

export const deleteTextTemplate = createLoadingAsyncThunk(
  "textTemplates/delete",
  async (
    { templateId, formTemplate, field },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/prescription-templates/textTemplates/delete/${formTemplate._id}`,
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

      return templateId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
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
