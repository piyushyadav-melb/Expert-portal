import { getCookie } from "@/utils/cookie";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

let GlobalSocket: Socket | null = null;

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      const token = getCookie("token"); // Get your JWT token

      GlobalSocket = io(
        `https://expert-customer-backend.onrender.com`, // Add /chat namespace
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
      GlobalSocket.on("connect", () => {
        console.log("Socket connected");
      });

      GlobalSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      GlobalSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      GlobalSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      // Handle notification events
      // socketRef.current.on("messageNotification", (data) => {
      //   console.log("Message notification received:", data);
      // });

      GlobalSocket.on("notification", (data) => {
        console.log("General notification received:", data);
      });

      GlobalSocket.on("bookingNotification", (data) => {
        console.log("Booking notification received:", data);
      });

      GlobalSocket.on("meetingNotification", (data) => {
        console.log("Meeting notification received:", data);
      });
    }

    socketRef.current = GlobalSocket;

    // Cleanup on unmount
    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current.disconnect();
    //     socketRef.current = null;
    //   }
    // };
  }, []);

  return socketRef.current;
};

export const disconnectSocket = () => {
  if (GlobalSocket) {
    GlobalSocket.disconnect();
    GlobalSocket = null;
  }
};