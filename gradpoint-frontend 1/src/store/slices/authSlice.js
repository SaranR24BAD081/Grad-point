import { createSlice } from '@reduxjs/toolkit';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch (e) {
    return null;
  }
};

const storedUser = readUser();

const initialState = {
  user: storedUser,
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || (storedUser && storedUser.role) || null,
  email: (storedUser && storedUser.email) || null,
  fullName: (storedUser && storedUser.fullName) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, user = {}, role } = action.payload;
      const resolvedRole = role || user.role || null;
      state.loading = false;
      state.isAuthenticated = true;
      state.error = null;
      state.token = token;
      state.user = user;
      state.role = resolvedRole;
      state.email = user.email || null;
      state.fullName = user.fullName || null;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', resolvedRole);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.email = null;
      state.fullName = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
