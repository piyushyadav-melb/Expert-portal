import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProfileThunk,
  updateProfileThunk,
  fetchExpertStatsThunk,
} from "../thunk/profile.thunk";

interface Stats {
  bookings: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  meetings: {
    total: number;
    active: number;
    ended: number;
  };
}

interface ProfileState {
  loading: boolean;
  profile: any;
  stats: Stats | null;
  error: string | null;
}

const initialState: ProfileState = {
  loading: false,
  profile: null,
  stats: null,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Existing profile fetch cases
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload?.data;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      })

      // Existing profile update cases
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload?.data;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      })

      // New expert stats cases
      .addCase(fetchExpertStatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpertStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload?.data;
      })
      .addCase(fetchExpertStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default profileSlice.reducer;
