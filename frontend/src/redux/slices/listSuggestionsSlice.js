import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";
import { updateTemplateFieldSuggestions } from "./doctorPrescriptionSlice";

// Save a new list suggestion (string) for a specific field within a prescription template
export const saveListSuggestion = createAsyncThunk(
  "listSuggestions/save",
  async (
    { suggestion, formTemplate, field },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/prescription-templates/listSuggestions/${formTemplate._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ suggestion, fieldId: field.id }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to save suggestion");
      }

      // Update the template field suggestions in doctorPrescriptionSlice
      const currentSuggestions = field.suggestions || [];
      const newSuggestions = [...currentSuggestions];
      if (!newSuggestions.includes(suggestion)) {
        newSuggestions.push(suggestion);
      }

      dispatch(
        updateTemplateFieldSuggestions({
          templateId: formTemplate._id,
          fieldId: field.id,
          newSuggestions: newSuggestions,
        })
      );

      return result.suggestion; // return the saved suggestion string
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a suggestion string from a field
export const deleteListSuggestion = createAsyncThunk(
  "listSuggestions/delete",
  async (
    { suggestion, formTemplate, field },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/prescription-templates/listSuggestions/${formTemplate._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ fieldId: field.id, suggestion }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to delete suggestion");
      }

      // Update the template field suggestions in doctorPrescriptionSlice
      const currentSuggestions = field.suggestions || [];
      const newSuggestions = currentSuggestions.filter((s) => s !== suggestion);

      dispatch(
        updateTemplateFieldSuggestions({
          templateId: formTemplate._id,
          fieldId: field.id,
          newSuggestions: newSuggestions,
        })
      );

      return suggestion;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Save multiple list suggestions in one request
export const saveListSuggestions = createAsyncThunk(
  "listSuggestions/saveMany",
  async (
    { suggestions, formTemplate, field },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/prescription-templates/listSuggestions/${formTemplate._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ suggestions, fieldId: field.id }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to save suggestions");
      }

      // Update the template field suggestions in doctorPrescriptionSlice
      const currentSuggestions = field.suggestions || [];
      const suggArray = Array.isArray(suggestions)
        ? suggestions
        : [suggestions];
      const newSuggestions = [...currentSuggestions];

      suggArray.forEach((sug) => {
        if (sug && !newSuggestions.includes(sug)) {
          newSuggestions.push(sug);
        }
      });

      dispatch(
        updateTemplateFieldSuggestions({
          templateId: formTemplate._id,
          fieldId: field.id,
          newSuggestions: newSuggestions,
        })
      );

      return result.suggestions; // return array of saved suggestions
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  suggestions: [],
  status: "idle",
  error: null,
};

const listSuggestionsSlice = createSlice({
  name: "listSuggestions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveListSuggestion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveListSuggestion.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.suggestions.push(action.payload);
      })
      .addCase(saveListSuggestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteListSuggestion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteListSuggestion.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.suggestions = state.suggestions.filter(
          (sug) => sug !== action.payload
        );
      })
      .addCase(deleteListSuggestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(saveListSuggestions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveListSuggestions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.suggestions.push(...action.payload);
      })
      .addCase(saveListSuggestions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default listSuggestionsSlice.reducer;
