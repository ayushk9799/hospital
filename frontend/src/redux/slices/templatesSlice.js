import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Backend_URL } from '../../assets/Data';

// Async thunk for fetching templates
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/hospitals/template/read`, {
        method: 'GET',
        headers: {'Content-Type':'application/json'},
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  labTestsTemplate: [],
  headerTemplate: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.labTestsTemplate = action.payload.labTestsTemplate;
        state.headerTemplate = action.payload.headerTemplate;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.message || 'Failed to fetch templates';
      });
  },
});

export default templatesSlice.reducer;