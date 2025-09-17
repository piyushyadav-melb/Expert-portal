"use client";
import React, { useEffect } from "react";
import { useSocket } from "@/config/use-socket";
import NotificationManager from "@/components/notifications/notification-manager";

interface NotificationProviderProps {
    children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const socket = useSocket();

    useEffect(() => {
        // The notification service initialization is now handled in useSocket
        // when the socket connects, so we don't need to do anything here
        console.log("NotificationProvider mounted, socket:", socket?.connected);
    }, [socket]);

    return (
        <>
            {children}
            <NotificationManager />
        </>
    );
};

export default NotificationProvider;