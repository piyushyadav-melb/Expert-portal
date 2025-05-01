import { privateClient } from "@/http/http-client";
import { store } from "@/redux/store";
import {
  createMeetingThunk,
  fetchMeetingsThunk,
} from "@/redux/thunk/meetings.thunk";

export interface Meeting {
  id: string;
  room_id: string;
  expert_id: string;
  customer_id: string;
  booking_id: string;
  created_at: string;
  ended_at: string | null;
  status: "active" | "ended";
  expert: {
    id: string;
    name: string;
    email: string;
    profile_picture_url: string | null;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  booking: {
    id: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    meeting_link: string;
    meeting_id: string;
  };
}

export interface MeetingsResponse {
  result: Meeting[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export interface CreateMeetingResponse {
  roomId: string;
  token: string;
  meetingData: Meeting;
}

export interface VerifyMeetingResponse {
  status: boolean;
  message: string;
  data: Meeting;
}

export interface EndMeetingResponse {
  message: string;
  meetingData: Meeting;
}

export const fetchMeetings = async (
  status: string,
  searchText: string = "",
  page: number = 1
) => {
  try {
    const { payload } = await store.dispatch(
      fetchMeetingsThunk({ status, searchText, page })
    );
    return {
      status: payload?.status,
      data: payload?.result,
      meta: payload?.meta,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

export const createMeeting = async (
  bookingId: string
): Promise<CreateMeetingResponse> => {
  try {
    console.log("inside create meeting");

    const response: any = await store.dispatch(createMeetingThunk(bookingId));
    return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

export const verifyMeeting = async (
  meetingId: string
): Promise<VerifyMeetingResponse> => {
  try {
    const response = await privateClient.get(
      `/meetings/verify/expert/${meetingId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to verify meeting"
    );
  }
};

export const endMeeting = async (
  roomId: string,
  expertId: string
): Promise<EndMeetingResponse> => {
  try {
    const response = await privateClient.post("/meetings/end", {
      roomId,
      expertId,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to end meeting");
  }
};
