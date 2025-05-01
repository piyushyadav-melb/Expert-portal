import { store } from "@/redux/store";
import {
  loginThunk,
  registerThunk,
  verifyEmailThunk,
} from "@/redux/thunk/auth.thunk";
import { setAuth } from "@/redux/slice/auth.slice";
import { setCookie, removeCookie } from "@/utils/cookie";
import { publicClient } from "@/http/http-client";

//Function to login admin user
export const login = async (loginPayload: any) => {
  try {
    const { payload } = await store.dispatch(loginThunk(loginPayload));
    console.log("payload", payload);

    if (payload?.status !== true) {
      return {
        status: payload?.status,
        statusCode: payload?.statusCode,
        message: payload?.message,
      };
    }
    const authObj = {
      isLoggedIn: true,
      token: payload?.data?.access_token,
    };
    store.dispatch(setAuth(authObj));
    setCookie("token", authObj.token);
    return {
      status: payload?.status,
      statusCode: payload?.statusCode,
      message: payload?.message,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

export const logout = () => {
  try {
    removeCookie("token");
    return { status: true, statusCode: 200, message: "Logout Successfully." };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to register user
export const register = async (registerPayload: any) => {
  try {
    const { payload } = await store.dispatch(registerThunk(registerPayload));

    if (payload?.status !== true) {
      return {
        status: payload?.status,
        statusCode: payload?.statusCode,
        message: payload?.message,
      };
    }

    const authObj = {
      isLoggedIn: true,
      token: payload?.data?.access_token,
    };
    store.dispatch(setAuth(authObj));
    setCookie("token", authObj.token);
    return {
      status: payload?.status,
      statusCode: payload?.statusCode,
      message: payload?.message,
      data: payload?.data,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to verify email
export const verifyEmail = async (token: any) => {
  try {
    const { payload } = await store.dispatch(verifyEmailThunk(token));
    if (payload?.status !== true) {
      return {
        status: payload?.status,
        message: payload?.message,
      };
    }
    return {
      status: payload?.status,
      message: payload?.message,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to forgot password
export const forgotPassword = async (email: string) => {
  try {
    const response = await publicClient.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to send reset instructions"
    );
  }
};

//Function to verify reset token
export const verifyResetToken = async (token: string) => {
  try {
    const response = await publicClient.get(`/auth/reset-password/${token}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to verify reset token"
    );
  }
};

//Function to reset password
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await publicClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to reset password"
    );
  }
};
