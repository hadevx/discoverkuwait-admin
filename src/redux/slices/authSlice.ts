import { createSlice } from "@reduxjs/toolkit";

const savedData = localStorage.getItem("adminUserInfo");
const initialState = {
  adminUserInfo: savedData ? JSON.parse(savedData) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.adminUserInfo = action.payload;
      localStorage.setItem("adminUserInfo", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.adminUserInfo = null;
      localStorage.removeItem("adminUserInfo");
    },
  },
});

export const { setUserInfo, logout } = authSlice.actions;
export default authSlice.reducer;
