import { getCookie } from "@/utils/cookie";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      const token = getCookie("token"); // Get your JWT token

      socketRef.current = io(
        `http://localhost:7000`, // Add /chat namespace
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
      socketRef.current.on("connect", () => {
        console.log("Socket connected");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      socketRef.current.on("error", (error) => {
        console.error("Socket error:", error);
      });

      // Handle notification events
      socketRef.current.on("messageNotification", (data) => {
        console.log("Message notification received:", data);
      });

      socketRef.current.on("notification", (data) => {
        console.log("General notification received:", data);
      });

      socketRef.current.on("bookingNotification", (data) => {
        console.log("Booking notification received:", data);
      });

      socketRef.current.on("meetingNotification", (data) => {
        console.log("Meeting notification received:", data);
      });
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return socketRef.current;
};
