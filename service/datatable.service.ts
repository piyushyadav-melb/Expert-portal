import {
  refreshData,
  resetFilter,
  setPageIndex,
  setPageSize,
  setSearchText,
  setSorting,
  setStatus,
} from "@/redux/slice/datatable.slice";
import { store } from "@/redux/store";
import { fetchDataThunk } from "@/redux/thunk/datatable.thunk";

//Function to fetch table data
export const fetchTableData = async (tablePayload: any) => {
  try {
    const { payload } = await store.dispatch(fetchDataThunk(tablePayload));
    if (payload?.status !== true) {
      return {
        status: payload?.status,
        statusCode: payload?.statusCode,
        message: payload?.message,
      };
    }
    return {
      status: payload?.status,
      statusCode: payload?.statusCode,
      message: payload?.message,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to set page size
export const setPage = async (value: number) => {
  try {
    store.dispatch(setPageSize(value));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to manage next and previous page
export const navigatePage = async (value: number) => {
  try {
    store.dispatch(setPageIndex(value));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to filter search text
export const filterSearchText = async (value: string) => {
  try {
    store.dispatch(setSearchText(value));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function filter status
export const filterStatus = async (value: String[]) => {
  try {
    store.dispatch(setStatus(value.toString()));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to sort column
export const sortColumn = async (sortColumn: string, sortBy: string) => {
  try {
    store.dispatch(setSorting({ sortColumn, sortBy }));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to reset filter
export const clearFilter = async () => {
  try {
    store.dispatch(resetFilter());
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to reset filter
export const refresh = async () => {
  try {
    store.dispatch(refreshData());
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};
