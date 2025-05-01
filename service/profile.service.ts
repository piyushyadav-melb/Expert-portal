import { store } from "@/redux/store";
import {
  fetchProfileThunk,
  updateProfileThunk,
  fetchExpertStatsThunk,
} from "@/redux/thunk/profile.thunk";

export interface UpdateProfileData {
  name: string;
  email: string;
  username: string;
  whatsapp_number: string;
}

//Function to fetch profile
export const fetchProfile = async () => {
  try {
    const { payload } = await store.dispatch(fetchProfileThunk());
    return {
      status: payload?.status,
      data: payload?.data,
      message: payload?.message,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to update profile
export const updateProfile = async (data: any) => {
  try {
    const { payload } = await store.dispatch(updateProfileThunk(data));
    return {
      status: payload?.status,
      data: payload?.data,
      message: payload?.message,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

export const getExpertStats = async () => {
  try {
    const { payload }: any = await store.dispatch(fetchExpertStatsThunk());
    return {
      status: payload?.data?.status,
      data: payload?.data?.data,
      message: payload?.data?.message,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};
