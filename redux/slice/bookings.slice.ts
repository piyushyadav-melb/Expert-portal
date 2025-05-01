import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Booking } from "@/service/bookings.service";

interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  currentStatus: "UPCOMING" | "COMPLETED" | "CANCELLED";
  searchText: string;
  pagination: PaginationMeta;
}

const initialState: BookingsState = {
  bookings: [],
  loading: false,
  error: null,
  currentStatus: "UPCOMING",
  searchText: "",
  pagination: {
    total: 0,
    lastPage: 1,
    currentPage: 1,
    perPage: 10,
    prev: null,
    next: null,
  },
};

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.bookings = [];
    },
    setCurrentStatus: (
      state,
      action: PayloadAction<"UPCOMING" | "COMPLETED" | "CANCELLED">
    ) => {
      state.currentStatus = action.payload;
    },
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
    setPagination: (state, action: PayloadAction<PaginationMeta>) => {
      state.pagination = action.payload;
    },
  },
});

export const {
  setBookings,
  setLoading,
  setError,
  setCurrentStatus,
  setSearchText,
  setPagination,
} = bookingsSlice.actions;
export default bookingsSlice.reducer;
