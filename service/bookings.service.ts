import { store } from "@/redux/store";
import { fetchBookingsThunk } from "@/redux/thunk/bookings.thunk";

export interface Booking {
  id: string;
  expert_id: string;
  customer_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: any;
  schedule_status: "UPCOMING" | "CANCELLED" | "COMPLETED";
  meeting_link: string | null;
  meeting_id: string | null;
  meeting_password: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  cancelled_by: string | null;
  completed_at: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BookingsResponse {
  message: string;
  data: Booking[];
}

export const fetchBookings = async (
  status: string,
  searchText: string = ""
) => {
  try {
    const { payload } = await store.dispatch(
      fetchBookingsThunk({ status, searchText })
    );
    return {
      status: payload?.status,
      data: payload?.data,
      message: payload?.message,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};
