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
        console.log("General notification received:", data);
      });

      globalSocket.on("bookingNotification", (data) => {
        console.log("Booking notification received:", data);
      });

      globalSocket.on("meetingNotification", (data) => {
        console.log("Meeting notification received:", data);
      });

      socketRef.current = globalSocket;
    } else if (globalSocket) {
      socketRef.current = globalSocket;
    }

    // Cleanup on unmount - only if this is the last component using the socket
    return () => {
      // Don't disconnect here as other components might be using it
      // The disconnection should be handled at app level or on logout
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