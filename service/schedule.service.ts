import { privateClient } from "@/http/http-client";

export const getSchedule = async () => {
  try {
    const response = await privateClient.get("/schedule");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch schedule"
    );
  }
};

export const saveSchedule = async (scheduleData: any) => {
  try {
    const response = await privateClient.post("/schedule/save", scheduleData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to save schedule");
  }
};

export const getUnavailableDates = async () => {
  try {
    const response = await privateClient.get("/schedule/unavailable-dates");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch unavailable dates"
    );
  }
};

export const saveUnavailableDates = async (dates: string[]) => {
  try {
    const response = await privateClient.post("/schedule/unavailable-dates", {
      unavailableDates: dates,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to save unavailable dates"
    );
  }
};
