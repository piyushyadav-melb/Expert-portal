import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Meeting } from "@/service/meetings.service";

interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

export interface MeetingsState {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  currentStatus: "active" | "ended";
  searchText: string;
  pagination: PaginationMeta;
  createdMeeting: Meeting | null;
}

const initialState: MeetingsState = {
  meetings: [],
  loading: false,
  error: null,
  currentStatus: "active",
  searchText: "",
  pagination: {
    total: 0,
    lastPage: 1,
    currentPage: 1,
    perPage: 10,
    prev: null,
    next: null,
  },
  createdMeeting: null,
};

const meetingsSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    setMeetings: (state, action: PayloadAction<Meeting[]>) => {
      state.meetings = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.meetings = [];
    },
    setCurrentStatus: (state, action: PayloadAction<"active" | "ended">) => {
      state.currentStatus = action.payload;
    },
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
    setPagination: (state, action: PayloadAction<PaginationMeta>) => {
      state.pagination = action.payload;
    },
    setCreatedMeeting: (state, action: PayloadAction<Meeting>) => {
      state.createdMeeting = action.payload;
    },
  },
});

export const {
  setMeetings,
  setLoading,
  setError,
  setCurrentStatus,
  setSearchText,
  setPagination,
  setCreatedMeeting,
} = meetingsSlice.actions;
export default meetingsSlice.reducer;
