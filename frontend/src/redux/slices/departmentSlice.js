import { Backend_URL } from "../../assets/Data";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunks
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/departments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.status === 500) {
        throw new Error("Server error: 500 Internal Server Error");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createDepartment = createAsyncThunk(
  "departments/createDepartment",
  async ({ name, staffIds }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, staffIds }),
      });
      if (response.status === 500) {
        throw new Error("Server error: 500 Internal Server Error");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addDoctorToDepartment = createAsyncThunk(
  "departments/addDoctorToDepartment",
  async ({ departmentId, doctorId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/departments/${departmentId}/addDoctor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ doctorId }),
        }
      );
      if (response.status === 500) {
        throw new Error("Server error: 500 Internal Server Error");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeDoctorFromDepartment = createAsyncThunk(
  "departments/removeDoctorFromDepartment",
  async ({ departmentId, doctorId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/departments/${departmentId}/removeDoctor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ doctorId }),
        }
      );
      if (response.status === 500) {
        throw new Error("Server error: 500 Internal Server Error");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "departments/updateDepartment",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/departments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Server error: 500 Internal Server Error");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "departments/deleteDepartment",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/departments/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.status === 500) {
        throw new Error("Server error: 500 Internal Server Error");
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    departments: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.error;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(addDoctorToDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(
          (dep) => dep._id === action.payload._id
        );
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(removeDoctorFromDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(
          (dep) => dep._id === action.payload._id
        );
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(
          (dep) => dep._id === action.payload._id
        );
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(
          (dep) => dep._id !== action.payload
        );
      });
  },
});

export default departmentSlice.reducer;
