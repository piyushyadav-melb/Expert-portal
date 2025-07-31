import { privateClient } from "@/http/http-client";

export interface ChatRoom {
  id: string;
  customerId: string;
  expertId: string;
  customer?: {
    id: string;
    name: string;
    profile_picture_url: string;
  };
  expert?: {
    id: string;
    name: string;
    profile_picture_url: string;
  };
  messages?: Message[];
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderType: "CUSTOMER" | "EXPERT";
  content: string;
  is_read: boolean;
  timestamp: string;
}

export const createOrGetChatRoom = async (customerId: string) => {
  const response = await privateClient.post("/chat/room-by-expert", {
    customerId,
  });
  return response.data.data;
};

export const getChatRooms = async () => {
  const response = await privateClient.get("/chat/rooms");
  return response.data.data;
};

export const getChatHistory = async (roomId: string, page = 1, limit = 200) => {
  const response = await privateClient.get(`/chat/room/${roomId}/expert/messages`, {
    params: { page, limit },
  });
  return response.data.data;
};

export const sendMessage = async (roomId: string, content: string) => {
  const response = await privateClient.post(`/chat/room/${roomId}/messages`, {
    content,
  });
  return response.data.data;
};

export const markMessagesAsRead = async (roomId: string) => {
  const response = await privateClient.post(`/chat/room/${roomId}/mark-read`);
  return response.data;
};

export const getUnreadMessageCount = async () => {
  const response = await privateClient.get("/chat/unread-count");
  return response.data.data.unreadCount;
};

export const getChattedCustomers = async () => {
  const response = await privateClient.get("/chat/customers");
  return response.data.data;
};
