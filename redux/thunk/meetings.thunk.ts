import { createAsyncThunk } from "@reduxjs/toolkit";
import { privateClient } from "@/http/http-client";
import {
  setMeetings,
  setError,
  setLoading,
  setPagination,
} from "../slice/meetings.slice";
import { CreateMeetingResponse } from "@/service/meetings.service";

interface FetchMeetingsParams {
  status: string;
  searchText: string;
  page?: number;
}

export const fetchMeetingsThunk = createAsyncThunk(
  "meetings/fetchMeetings",
  async (
    { status, searchText, page = 1 }: FetchMeetingsParams,
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await privateClient.get(
        `/meetings/expert/details?status=${status}&searchText=${searchText}&page=${page}`
      );
      dispatch(setMeetings(response.data.result));
      dispatch(setPagination(response.data.meta));
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch meetings";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createMeetingThunk = createAsyncThunk(
  "meetings/createMeeting",
  async (bookingId: string, { dispatch }) => {
    try {
      const response = await privateClient.post("/meetings/create", {
        booking_id: bookingId,
      });

      console.log("RESPONSE IN THUNK:", response.data);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        return error?.response?.data;
      }
      return error;
    }
  }
);
