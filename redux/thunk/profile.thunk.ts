import { createAsyncThunk } from "@reduxjs/toolkit";
import { privateClient } from "@/http/http-client";
import { UpdateProfileData } from "@/service/profile.service";

export const fetchProfileThunk = createAsyncThunk(
  "profile/fetch-profile",
  async () => {
    try {
      const res = await privateClient.get("/expert/profile");
      return res.data;
    } catch (error: any) {
      if (error?.response?.data) {
        return error?.response?.data;
      }
      return error;
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "profile/update-profile",
  async (data: UpdateProfileData) => {
    try {
      const res = await privateClient.patch("/expert/profile", data);
      return res.data;
    } catch (error: any) {
      if (error?.response?.data) {
        return error?.response?.data;
      }
      return error;
    }
  }
);

export const fetchExpertStatsThunk = createAsyncThunk(
  "profile/fetchExpertStats",
  async () => {
    try {
      const response = await privateClient.get("/expert/stats");
      return response;
    } catch (error: any) {
      return {
        status: false,
        message:
          error.response?.data?.message || "Failed to fetch expert stats",
        data: null,
      };
    }
  }
);
