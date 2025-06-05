import { createSlice } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";

// Create an async thunk for fetching hospital data
export const fetchHospitalInfo = createLoadingAsyncThunk(
  "hospital/fetchHospitalInfo",
  async () => {
    const response = await fetch(`${Backend_URL}/api/hospitals/getHospital`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch hospital data");
    }
    const hospitalData = await response.json();

    // Handle logo1
    if (hospitalData.logo) {
      try {
        const imageResponse = await fetch(hospitalData.logo);
        const blob = await imageResponse.blob();
        hospitalData.hospitalLogoBlob = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Failed to fetch hospital logo:", error);
        hospitalData.hospitalLogoBlob = null;
      }
    }

    // Handle logo2
    if (hospitalData.logo2) {
      try {
        const imageResponse = await fetch(hospitalData.logo2);
        const blob = await imageResponse.blob();
        hospitalData.hospitalLogo2Blob = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Failed to fetch hospital logo2:", error);
        hospitalData.hospitalLogo2Blob = null;
      }
    }

    // Handle morelogos array
    if (hospitalData.morelogos && hospitalData.morelogos.length > 0) {
      hospitalData.moreLogosBlobs = [];
      for (const logoUrl of hospitalData.morelogos) {
        try {
          const imageResponse = await fetch(logoUrl);
          const blob = await imageResponse.blob();
          hospitalData.moreLogosBlobs.push(URL.createObjectURL(blob));
        } catch (error) {
          console.error("Failed to fetch additional logo:", error);
          hospitalData.moreLogosBlobs.push(null);
        }
      }
    }

    // Handle serviceDiscontinuedDate
    if (hospitalData.serviceDiscontinuedDate) {
      const disDate = new Date(hospitalData.serviceDiscontinuedDate);
      const today = new Date();
      disDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      hospitalData.serviceDiscontinuedDate = disDate;
      const daysLeft = Math.ceil((disDate - today) / (1000 * 60 * 60 * 24));
      hospitalData.discontinuedDaysLeft = daysLeft;
    }

    return hospitalData;
  },
  { useGlobalLoading: true }
);

// New async thunk for updating hospital info  ///need to check
export const updateHospitalInfo = createLoadingAsyncThunk(
  "hospital/updateHospitalInfo",
  async (hospitalData) => {
    const response = await fetch(
      `${Backend_URL}/api/hospitals/${hospitalData.hospitalId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hospitalData),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update hospital data");
    }
    const updatedData = await response.json();

    // Fetch the new image if URL exists
    if (updatedData.logo) {
      try {
        const imageResponse = await fetch(updatedData.logo);
        const blob = await imageResponse.blob();
        updatedData.hospitalLogoBlob = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Failed to fetch updated hospital logo:", error);
        updatedData.hospitalLogoBlob = null;
      }
    }

    // Handle logo2
    if (updatedData.logo2) {
      try {
        const imageResponse = await fetch(updatedData.logo2);
        const blob = await imageResponse.blob();
        updatedData.hospitalLogo2Blob = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Failed to fetch updated hospital logo2:", error);
        updatedData.hospitalLogo2Blob = null;
      }
    }

    // Handle morelogos array
    if (updatedData.morelogos && updatedData.morelogos.length > 0) {
      updatedData.moreLogosBlobs = [];
      for (const logoUrl of updatedData.morelogos) {
        try {
          const imageResponse = await fetch(logoUrl);
          const blob = await imageResponse.blob();
          updatedData.moreLogosBlobs.push(URL.createObjectURL(blob));
        } catch (error) {
          console.error("Failed to fetch updated additional logo:", error);
          updatedData.moreLogosBlobs.push(null);
        }
      }
    }

    return updatedData;
  },
  { useGlobalLoading: true }
);

const hospitalSlice = createSlice({
  name: "hospital",
  initialState: {
    hospitalInfo: null,
    hospitalLogoBlob: null,
    hospitalLogo2Blob: null, // Added for second logo
    moreLogosBlobs: [], // Added for additional logos
    hospitalInfoStatus: "idle",
    updateStatus: "idle",
    error: null,
  },
  reducers: {
    cleanupLogoBlob: (state) => {
      if (state.hospitalLogoBlob) {
        URL.revokeObjectURL(state.hospitalLogoBlob);
        state.hospitalLogoBlob = null;
      }
      if (state.hospitalLogo2Blob) {
        URL.revokeObjectURL(state.hospitalLogo2Blob);
        state.hospitalLogo2Blob = null;
      }
      // Cleanup moreLogosBlobs
      if (state.moreLogosBlobs && state.moreLogosBlobs.length > 0) {
        state.moreLogosBlobs.forEach((blob) => {
          if (blob) URL.revokeObjectURL(blob);
        });
        state.moreLogosBlobs = [];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitalInfo.pending, (state) => {
        state.hospitalInfoStatus = "loading";
        // Cleanup previous blob URLs if they exist
        if (state.hospitalLogoBlob) {
          URL.revokeObjectURL(state.hospitalLogoBlob);
        }
        if (state.hospitalLogo2Blob) {
          URL.revokeObjectURL(state.hospitalLogo2Blob);
        }
        // Cleanup moreLogosBlobs
        if (state.moreLogosBlobs && state.moreLogosBlobs.length > 0) {
          state.moreLogosBlobs.forEach((blob) => {
            if (blob) URL.revokeObjectURL(blob);
          });
          state.moreLogosBlobs = [];
        }
      })
      .addCase(fetchHospitalInfo.fulfilled, (state, action) => {
        state.hospitalInfoStatus = "succeeded";
        state.hospitalInfo = action.payload;
        state.hospitalLogoBlob = action.payload.hospitalLogoBlob;
        state.hospitalLogo2Blob = action.payload.hospitalLogo2Blob;
        state.moreLogosBlobs = action.payload.moreLogosBlobs || [];
      })
      .addCase(fetchHospitalInfo.rejected, (state, action) => {
        state.hospitalInfoStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(updateHospitalInfo.pending, (state) => {
        state.updateStatus = "loading";
        // Cleanup previous blob URLs if they exist
        if (state.hospitalLogoBlob) {
          URL.revokeObjectURL(state.hospitalLogoBlob);
        }
        if (state.hospitalLogo2Blob) {
          URL.revokeObjectURL(state.hospitalLogo2Blob);
        }
        // Cleanup moreLogosBlobs
        if (state.moreLogosBlobs && state.moreLogosBlobs.length > 0) {
          state.moreLogosBlobs.forEach((blob) => {
            if (blob) URL.revokeObjectURL(blob);
          });
          state.moreLogosBlobs = [];
        }
      })
      .addCase(updateHospitalInfo.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.hospitalInfo = action.payload.hospital;
        state.hospitalLogoBlob = action.payload.hospital.hospitalLogoBlob;
        state.hospitalLogo2Blob = action.payload.hospital.hospitalLogo2Blob;
        state.moreLogosBlobs = action.payload.hospital.moreLogosBlobs || [];
      })
      .addCase(updateHospitalInfo.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const { cleanupLogoBlob } = hospitalSlice.actions;
export const selectHospitalLogoBlob = (state) =>
  state.hospital.hospitalLogoBlob;
export const selectHospitalLogo2Blob = (state) =>
  state.hospital.hospitalLogo2Blob; // New selector for logo2
export const selectMoreLogosBlobs = (state) => state.hospital.moreLogosBlobs; // New selector for moreLogos blobs

export default hospitalSlice.reducer;
