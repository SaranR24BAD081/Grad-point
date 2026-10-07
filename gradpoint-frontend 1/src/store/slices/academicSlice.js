import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const message = (err, fallback) =>
  (err && err.response && err.response.data && err.response.data.message) || fallback;

// Passing a studentId loads only that student's records.
const scoped = (path, studentId) => (studentId ? `${path}/student/${studentId}` : path);

export const fetchSubjects = createAsyncThunk('academic/fetchSubjects', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/subjects')).data;
  } catch (err) {
    return rejectWithValue(message(err, 'Failed to load subjects.'));
  }
});

export const fetchMarks = createAsyncThunk('academic/fetchMarks', async (studentId, { rejectWithValue }) => {
  try {
    return (await api.get(scoped('/marks', studentId))).data;
  } catch (err) {
    return rejectWithValue(message(err, 'Failed to load marks.'));
  }
});

export const fetchAttendance = createAsyncThunk('academic/fetchAttendance', async (studentId, { rejectWithValue }) => {
  try {
    return (await api.get(scoped('/attendance', studentId))).data;
  } catch (err) {
    return rejectWithValue(message(err, 'Failed to load attendance.'));
  }
});

export const fetchPredictions = createAsyncThunk('academic/fetchPredictions', async (studentId, { rejectWithValue }) => {
  try {
    return (await api.get(scoped('/predictions', studentId))).data;
  } catch (err) {
    return rejectWithValue(message(err, 'Failed to load predictions.'));
  }
});

export const fetchStudents = createAsyncThunk('academic/fetchStudents', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/students')).data;
  } catch (err) {
    return rejectWithValue(message(err, 'Failed to load students.'));
  }
});

const initialState = {
  subjects: [],
  marks: [],
  attendance: [],
  predictions: [],
  students: [],
  loading: false,
  error: null,
};

const targets = {
  [fetchSubjects.typePrefix]: ['subjects', fetchSubjects],
  [fetchMarks.typePrefix]: ['marks', fetchMarks],
  [fetchAttendance.typePrefix]: ['attendance', fetchAttendance],
  [fetchPredictions.typePrefix]: ['predictions', fetchPredictions],
  [fetchStudents.typePrefix]: ['students', fetchStudents],
};

const academicSlice = createSlice({
  name: 'academic',
  initialState,
  reducers: {
    setSubjects: (state, action) => { state.subjects = action.payload; },
    setMarks: (state, action) => { state.marks = action.payload; },
    setAttendance: (state, action) => { state.attendance = action.payload; },
    setPredictions: (state, action) => { state.predictions = action.payload; },
    clearAcademicError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    Object.values(targets).forEach(([key, thunk]) => {
      builder
        .addCase(thunk.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state[key] = Array.isArray(action.payload) ? action.payload : [];
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Something went wrong.';
        });
    });
  },
});

export const { setSubjects, setMarks, setAttendance, setPredictions, clearAcademicError } = academicSlice.actions;
export default academicSlice.reducer;
