// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,        // JWT token
  customer: null,     // { username, role, email, ... }
  isAuthenticated: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.customer = action.payload.customer;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.customer = null;
      state.isAuthenticated = false;
    },
    setCustomerDetails: (state, action) => {
      state.customer = action.payload;
    }
  }
});

export const { loginSuccess, logout, setCustomerDetails } = authSlice.actions;
export default authSlice.reducer;
