import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import academicReducer from './slices/academicSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    academic: academicReducer,
  },
});

export default store;
