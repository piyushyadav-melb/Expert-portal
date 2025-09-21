import { handleGeneralNotification } from "@/redux/slice/notification.slice";
import NotificationService from "@/service/notification.service";
import { getCookie } from "@/utils/cookie";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

let globalSocket: Socket | null = null;

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current && !globalSocket) {
      const token = getCookie("token"); // Get your JWT token

      if (!token) {
        console.log("No token found, skipping socket connection");
        return;
      }

      globalSocket = io(
        "https://expert-customer-backend.onrender.com",
        {
          withCredentials: true,
          autoConnect: true,
          transports: ["websocket", "polling"],
          auth: {
            token, // Pass the token in auth
          },
          extraHeaders: {
            Authorization: `Bearer ${token}`, // Also include in headers
          },
        }
      );

      // Handle connection events
      globalSocket.on("connect", () => {
        console.log("Socket connected, initializing notification service");

        // Initialize notification service AFTER socket is connected
        const notificationService = NotificationService.getInstance();
        notificationService.initializeSocket(globalSocket);
        notificationService.requestNotificationPermission();
      });

      globalSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      globalSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      globalSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      // Remove duplicate notification handlers - let the notification service handle these
      globalSocket.on("notification", (data) => {
      });

      globalSocket.on("bookingNotification", (data) => {
      });

      globalSocket.on("meetingNotification", (data) => {
      });

      // Handle unread count updates
      globalSocket.on("unreadCountUpdated", (data) => {
        // This will be handled by the chat sidebar
      });

      // Handle chat unread count updates
      globalSocket.on("chatUnreadCountUpdated", (data) => {
        // This will be handled by the chat sidebar
      });

      // Handle all chat unread counts response
      globalSocket.on("allChatUnreadCountsResponse", (data) => {
        // This will be handled by the chat sidebar
      });

      // Handle messages read events
      globalSocket.on("messagesRead", (data) => {
        // This will be handled by the chat sidebar
      });

      // Handle new messages
      globalSocket.on("newMessage", (data) => {
        // This will be handled by the chat sidebar
      });

      socketRef.current = globalSocket;
    } else if (globalSocket) {
      socketRef.current = globalSocket;
    }

    // Cleanup on unmount - only if this is the last component using the socket
    return () => {
      globalSocket?.off('unreadCountUpdated');
      globalSocket?.off('unreadCountResponse');
      globalSocket?.off('unreadCountError');
      globalSocket?.off('userStatusChanged');
      globalSocket?.off('messagesRead');
    };
  }, []);

  return socketRef.current;
};

export const disconnectSocket = () => {
  if (globalSocket) {
    const notificationService = NotificationService.getInstance();
    notificationService.cleanup();
    globalSocket.disconnect();
    globalSocket = null;
  }
};