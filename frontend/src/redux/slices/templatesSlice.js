import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

// Async thunk for fetching templates
export const fetchTemplates = createLoadingAsyncThunk(
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
  },
  { useGlobalLoader: true }
);

// Update the existing updateDiagnosisTemplate to handle both diagnosis and lab test templates
export const updateTemplate = createLoadingAsyncThunk(
  "templates/updateTemplate",
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(templateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update template");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New async thunk for bulk template upload
export const bulkUploadTemplates = createLoadingAsyncThunk(
  "templates/bulkUpload",
  async (templatesData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/bulk-upload`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(templatesData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to bulk upload templates");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating service bill collections
export const updateServiceBillCollections = createAsyncThunk(
  "templates/updateServiceBillCollections",
  async (serviceBillCollections, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/service_collections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(serviceBillCollections),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update service bill collections");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add new async thunks
export const editTemplate = createLoadingAsyncThunk(
  "templates/editTemplate",
  async ({ field, index, newValue }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/edit`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            field,
            index,
            newValue,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update template");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTemplate = createLoadingAsyncThunk(
  "templates/deleteTemplate",
  async ({ field, index }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            field,
            index,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to delete template");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  birthCertificateTemplate: "",
  labTestsTemplate: [],
  headerTemplateArray: [],
  diagnosisTemplate: [],
  mergeTemplate: "",
  dischargeSummaryTemplateArray: [],
  dischargeFormTemplateArray: [],
  opdPrescriptionTemplateArray: [],
  opdRxTemplateArray: [],
  consentFormTemplateArray: [],
  status: "idle",
  error: null,
  serviceBillCollections: [],
  dischargeFormTemplates: null,
  updateTempleteStatus: "idle",
  labBillingTemplate: "",
  opdBillTokenTemplate: "",
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
        state.headerTemplateArray = action.payload.headerTemplateArray || [];
        state.headerTemplate = action.payload.headerTemplate || "";
        state.dischargeSummaryTemplate =
          action.payload.dischargeSummaryTemplate || "";
        state.diagnosisTemplate = action.payload.diagnosisTemplate;
        state.dischargeSummaryTemplateArray =
          action.payload.dischargeSummaryTemplateArray || [];
        state.dischargeFormTemplateArray =
          action.payload.dischargeFormTemplateArray || [];
        state.opdPrescriptionTemplateArray =
          action.payload.opdPrescriptionTemplateArray || [];
        state.opdRxTemplateArray = action.payload.opdRxTemplateArray || [];
        state.comorbidities = action.payload.comorbidities;
        state.medicinelist = action.payload.medicinelist;
        state.mergeTemplate = action.payload.mergeTemplate;
        state.serviceBillCollections = action.payload.service_collections;
        state.dischargeFormTemplates = action.payload.dischargeFormTemplates;
        state.consentFormTemplateArray = action.payload.consentFormArray;
        state.birthCertificateTemplate =
          action.payload.birthCertificateTemplate;
        state.labReportUiTemplate = action.payload.labReportUiTemplate;
        state.labBillingTemplate = action.payload.labBillingTemplate || "";
        state.opdBillTokenTemplate = action.payload.opdBillTokenTemplate || "";
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message || "Failed to fetch templates";
      })
      .addCase(updateTemplate.pending, (state) => {
        state.updateTempleteStatus = "loading";
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.updateTempleteStatus = "succeeded";
        if (action.payload.diagnosisTemplate) {
          state.diagnosisTemplate = action.payload.diagnosisTemplate;
        }
        if (action.payload.medicinelist) {
          state.medicinelist = action.payload.medicinelist;
        }
        if (action.payload.comorbidities) {
          state.comorbidities = action.payload.comorbidities;
        }
        if (action.payload.labTestsTemplate) {
          state.labTestsTemplate = action.payload.labTestsTemplate;
        }
        if (action.payload.headerTemplateArray) {
          state.headerTemplateArray = action.payload.headerTemplateArray || [];
        }
        if (action.payload.dischargeSummaryTemplateArray) {
          state.dischargeSummaryTemplateArray =
            action.payload.dischargeSummaryTemplateArray || [];
        }
        if (action.payload.dischargeFormTemplateArray) {
          state.dischargeFormTemplateArray =
            action.payload.dischargeFormTemplateArray || [];
        }
        if (action.payload.opdPrescriptionTemplateArray) {
          state.opdPrescriptionTemplateArray =
            action.payload.opdPrescriptionTemplateArray || [];
        }
        if (action.payload.opdRxTemplateArray) {
          state.opdRxTemplateArray = action.payload.opdRxTemplateArray || [];
        }
        if (action.payload.opdBillTokenTemplate) {
          state.opdBillTokenTemplate = action.payload.opdBillTokenTemplate;
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.updateTempleteStatus = "failed";
        state.error = action.payload.message || "Failed to update template";
      })
      .addCase(updateServiceBillCollections.fulfilled, (state, action) => {
        state.serviceBillCollections = action.payload;
      })
      .addCase(editTemplate.pending, (state) => {
        state.updateTempleteStatus = "loading";
      })
      .addCase(editTemplate.fulfilled, (state, action) => {
        state.updateTempleteStatus = "succeeded";
        state.labTestsTemplate = action.payload.labTestsTemplate;
        state.headerTemplateArray = action.payload.headerTemplateArray || [];
        state.dischargeSummaryTemplateArray =
          action.payload.dischargeSummaryTemplateArray || [];
        state.dischargeFormTemplateArray =
          action.payload.dischargeFormTemplateArray || [];
        state.opdPrescriptionTemplateArray =
          action.payload.opdPrescriptionTemplateArray || [];
        state.opdRxTemplateArray = action.payload.opdRxTemplateArray || [];
        state.consentFormTemplateArray = action.payload.consentFormArray;
      })
      .addCase(editTemplate.rejected, (state, action) => {
        state.updateTempleteStatus = "failed";
        state.error = action.payload.message || "Failed to update template";
      })
      .addCase(deleteTemplate.pending, (state) => {
        state.updateTempleteStatus = "loading";
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.updateTempleteStatus = "succeeded";
        state.labTestsTemplate = action.payload.labTestsTemplate;
        state.headerTemplateArray = action.payload.headerTemplateArray || [];
        state.dischargeSummaryTemplateArray =
          action.payload.dischargeSummaryTemplateArray || [];
        state.dischargeFormTemplateArray =
          action.payload.dischargeFormTemplateArray || [];
        state.opdPrescriptionTemplateArray =
          action.payload.opdPrescriptionTemplateArray || [];
        state.opdRxTemplateArray = action.payload.opdRxTemplateArray || [];
        state.consentFormTemplateArray = action.payload.consentFormArray;
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.updateTempleteStatus = "failed";
        state.error = action.payload.message || "Failed to delete template";
      })
      .addCase(bulkUploadTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(bulkUploadTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload.labTestsTemplate) {
          state.labTestsTemplate = action.payload.labTestsTemplate;
        }
      })
      .addCase(bulkUploadTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default templatesSlice.reducer;
