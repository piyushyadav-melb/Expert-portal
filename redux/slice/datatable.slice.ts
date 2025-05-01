import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchDataThunk } from "../thunk/datatable.thunk";
import { tableConfig } from "@/config/table.config";
import { sortColumn } from "@/service/datatable.service";

interface Meta {
  currentPage: number;
  lastPage: number;
  next: number | null;
  perPage: number;
  prev: number | null;
  total: number;
}

const initialState = {
  isLoading: false,
  refresh: false,
  data: [],
  isFilterEnable: false,
  filters: {
    searchText: "",
    is_active: "",
    sortColumn: "id",
    sortBy: "desc",
  },
  pagination: {
    currentPage: tableConfig.currentPage,
    lastPage: tableConfig.lastPage,
    next: null,
    perPage: tableConfig.perPage,
    prev: null,
    total: tableConfig.total,
  },
  error: {},
};

export const datatable = createSlice({
  name: "datatable",
  initialState,
  reducers: {
    resetData: (state) => {
      state.data = [];
      state.pagination = initialState.pagination;
    },
    setSearchText: (state, action: PayloadAction<any>) => {
      state.filters = {
        ...state.filters,
        searchText: action.payload
      }
      state.pagination.currentPage = 1;
      state.isFilterEnable = true;
    },
    setStatus: (state, action: PayloadAction<any>) => {
      state.filters = {
        ...state.filters,
        is_active: action.payload
      }
      state.pagination.currentPage = 1;
      if(action.payload) {
        state.isFilterEnable = true;
      }
    },
    setSorting: (state, action: PayloadAction<any>) => {
      state.filters = {
        ...state.filters,
        sortBy: action.payload?.sortBy,
        sortColumn: action.payload?.sortColumn
      }
      state.pagination.currentPage = 1;
      state.isFilterEnable = true;
    },
    resetFilter: (state) => {
      state.refresh = !state.refresh;
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
      state.isFilterEnable = initialState.isFilterEnable;
    },
    refreshData: (state) => {
      state.refresh = !state.refresh;
    },
    setPagination: (state, action: PayloadAction<any>) => {
      state.pagination = action.payload?.pagination;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.perPage = action.payload;
      state.pagination.currentPage = 1; // Reset to the first page when page size changes
    },
    nextPage: (state) => {
      if (state.pagination.next !== null) {
        state.pagination.currentPage = state.pagination.next;
      }
    },
    previousPage: (state) => {
      if (state.pagination.prev !== null) {
        state.pagination.currentPage = state.pagination.prev;
      }
    },
    setPageIndex: (state, action: PayloadAction<number>) => {
      if (action.payload >= 1 && action.payload <= state.pagination.lastPage) {
        state.pagination.currentPage = action.payload;
      }
    },
    resetPagination: (state) => {
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(fetchDataThunk.pending, (state: any) => {
        state.isLoading = true;
      })
      .addCase(fetchDataThunk.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.data = action?.payload?.data?.result || [];
        state.pagination = action?.payload?.data?.meta;
      })
      .addCase(fetchDataThunk.rejected, (state: any) => {
        state.isLoading = false;
      });
  },
});

export const {
  resetData,
  setSearchText,
  setStatus,
  setSorting,
  resetFilter,
  refreshData,
  setPagination,
  setPageSize,
  nextPage,
  previousPage,
  setPageIndex,
  resetPagination,
} = datatable.actions;

export default datatable.reducer;
