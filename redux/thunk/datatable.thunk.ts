import queryString from "query-string";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { privateClient } from "@/http/http-client";


export const fetchDataThunk = createAsyncThunk(
  "datatable/fetch-data",
  async (payload: any) => {
    try {
      const url = payload.url;
      delete payload.url;  
      const endPoint = url+'?'+queryString.stringify(payload);
      const res = await privateClient.get(endPoint);
      return res.data;
    } catch (error: any) {
      if (error?.response?.data) {
        return error?.response?.data;
      }
      return error;
    }
  }
);
