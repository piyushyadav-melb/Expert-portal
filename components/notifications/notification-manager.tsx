"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { markAsRead, removeNotification } from "@/redux/slice/notification.slice";
import PopupNotification from "./popup-notification";

interface NotificationManagerProps {
    maxPopups?: number;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({
    maxPopups = 3
}) => {
    const dispatch = useAppDispatch();
    const { notifications } = useAppSelector((state) => state.notification);
    const [activePopups, setActivePopups] = useState<any[]>([]);
    const [processedNotifications, setProcessedNotifications] = useState<Set<string>>(new Set());
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        // Create audio element for notification sound
        audioRef.current = new Audio();
        audioRef.current.preload = 'auto';

        // You can replace this with your own notification sound file
        // For now, we'll use a simple beep sound generated programmatically
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        const playNotificationSound = () => {
            try {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (error) {
                console.log('Could not play notification sound:', error);
            }
        };

        // Store the function globally so we can call it
        (window as any).playNotificationSound = playNotificationSound;
    }, []);

    // Handle new notifications from Redux store
    // useEffect(() => {
    //     const unreadNotifications = notifications.filter(
    //         (notification) => !notification.read && !processedNotifications.has(notification.id)
    //     );

    //     if (unreadNotifications.length > 0) {
    //         const latestNotification = unreadNotifications[0];

    //         // Play notification sound
    //         if ((window as any).playNotificationSound) {
    //             (window as any).playNotificationSound();
    //         }

    //         // Add to active popups if we haven't reached the limit
    //         if (activePopups.length < maxPopups) {
    //             setActivePopups(prev => [...prev, latestNotification]);
    //             setProcessedNotifications(prev => new Set([...prev, latestNotification.id]));
    //         }
    //     }
    // }, [notifications, processedNotifications, activePopups.length, maxPopups]);

    // Handle popup events from notification service
    useEffect(() => {
        const handlePopupEvent = (event: CustomEvent) => {
            const notification = event.detail;

            // Get current user ID for filtering
            const getCurrentUserId = () => {
                try {
                    const token = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('token='))
                        ?.split('=')[1];

                    if (!token) return null;

                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return payload.userId || payload.sub || null;
                } catch (error) {
                    console.error("Error extracting user ID:", error);
                    return null;
                }
            };

            const currentUserId = getCurrentUserId();
            // Only show popup if notification is for current user
            if (notification.data?.recipientId && notification.data.recipientId !== currentUserId) {
                return;
            }

            // Play notification sound
            if ((window as any).playNotificationSound) {
                (window as any).playNotificationSound();
            }

            // Add to active popups if we haven't reached the limit
            if (activePopups.length < maxPopups) {
                setActivePopups(prev => [...prev, notification]);
                setProcessedNotifications(prev => new Set([...prev, notification.id]));
            }
        };

        window.addEventListener('notificationPopup', handlePopupEvent as EventListener);

        return () => {
            window.removeEventListener('notificationPopup', handlePopupEvent as EventListener);
        };
    }, [activePopups.length, maxPopups]);

    const handlePopupClose = (notificationId: string) => {
        setActivePopups(prev => prev.filter(notification => notification.id !== notificationId));
    };

    const handlePopupAction = (notification: any) => {
        // Navigate based on notification type
        if (notification.type === 'MESSAGE' && notification.chatRoomId) {
            window.location.href = `/chat?room=${notification.chatRoomId}`;
        } else if (notification.type === 'BOOKING') {
            window.location.href = '/bookings';
        } else if (notification.type === 'MEETING') {
            window.location.href = '/meetings';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-2">
            {activePopups.map((notification, index) => (
                <div
                    key={notification.id}
                    style={{
                        transform: `translateY(${index * 20}px)`,
                        zIndex: 9999 - index,
                    }}
                >
                    <PopupNotification
                        notification={notification}
                        onClose={() => handlePopupClose(notification.id)}
                        onAction={() => handlePopupAction(notification)}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationManager;
