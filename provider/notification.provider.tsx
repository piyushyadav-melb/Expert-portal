"use client";
import React, { useEffect } from "react";
import { useSocket } from "@/config/use-socket";
import NotificationService from "@/service/notification.service";
import NotificationManager from "@/components/notifications/notification-manager";

interface NotificationProviderProps {
    children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            // Initialize notification service with socket
            const notificationService = NotificationService.getInstance();
            notificationService.initializeSocket(socket);

            // Request notification permission
            notificationService.requestNotificationPermission();

            // Cleanup on unmount
            return () => {
                notificationService.cleanup();
            };
        }
    }, [socket]);

    return (
        <>
            {children}
            <NotificationManager />
        </>
    );
};

export default NotificationProvider;
