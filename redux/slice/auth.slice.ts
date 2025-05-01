import { createSlice } from "@reduxjs/toolkit";
import { loginThunk } from "../thunk/auth.thunk";
import { getCookie } from "@/utils/cookie";


const token = getCookie('token');
const initialState = {
  isLoading: false,
  isLoggedIn: token ? true : false,
  token: token ? token : "",
};

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuth: (state) => {
      state.isLoggedIn = false;
      state.token = "";
    },
    setAuth: (state, action) => {
      state.isLoggedIn = true;
      state.token = action?.payload?.token;
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(loginThunk.pending, (state: any) => {
        state.isLoading = true;
      })
      .addCase(loginThunk.fulfilled, (state: any, action: any) => {
        state.isLoggedIn = true;
        state.token = action?.payload?.token;
        state.isLoading = false;
      })
      .addCase(loginThunk.rejected, (state: any) => {
        state.isLoading = false;
      });
  },
});

export const { setAuth, resetAuth } = auth.actions;

export default auth.reducer;
