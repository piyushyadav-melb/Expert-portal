import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  setBookings,
  setError,
  setLoading,
  setPagination,
} from "../slice/bookings.slice";
import { privateClient } from "@/http/http-client";
interface FetchBookingsParams {
  status: string;
  searchText: string;
  page?: number;
}

export const fetchBookingsThunk = createAsyncThunk(
  "bookings/fetchBookings",
  async (
    { status, searchText, page = 1 }: FetchBookingsParams,
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await privateClient.get(
        `/bookings/expert?status=${status}&searchText=${searchText}&page=${page}`
      );
      dispatch(setBookings(response.data.result));
      dispatch(setPagination(response.data.meta));
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch bookings";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
