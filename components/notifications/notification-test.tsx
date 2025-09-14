"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { addNotification } from "@/redux/slice/notification.slice";

const NotificationTest: React.FC = () => {
    const dispatch = useAppDispatch();

    // Helper function to get current user ID
    const getCurrentUserId = () => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) return 'test-user-123';

            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.sub || 'test-user-123';
        } catch (error) {
            return 'test-user-123';
        }
    };

    const testMessageNotification = () => {
        const currentUserId = getCurrentUserId();

        const notification = {
            id: `test_msg_${Date.now()}`,
            type: 'MESSAGE' as const,
            title: 'New message from John Doe',
            body: 'Hey! How are you doing today? I have a question about our project.',
            data: {
                chatRoomId: 'test-room-123',
                messageId: 'msg-123',
                senderId: 'user-123',
                senderType: 'CUSTOMER' as const,
                senderName: 'John Doe',
                senderProfilePicture: '/images/avatar/avatar-1.jpg',
                hasFile: false,
                fileType: null,
                recipientId: currentUserId, // Add recipientId for filtering
            },
            timestamp: new Date().toISOString(),
            read: false,
            chatRoomId: 'test-room-123',
            messageId: 'msg-123',
            senderId: 'user-123',
            senderType: 'CUSTOMER' as const,
        };

        dispatch(addNotification(notification));

        // Also trigger popup directly
        const event = new CustomEvent('notificationPopup', {
            detail: notification
        });
        window.dispatchEvent(event);
    };

    const testBookingNotification = () => {
        const currentUserId = getCurrentUserId();

        const notification = {
            id: `test_booking_${Date.now()}`,
            type: 'BOOKING' as const,
            title: 'New Booking Request',
            body: 'You have received a new booking request for tomorrow at 2:00 PM',
            data: {
                bookingId: 'booking-123',
                customerName: 'Jane Smith',
                date: '2024-01-15',
                time: '14:00',
                userId: currentUserId, // Add userId for filtering
            },
            timestamp: new Date().toISOString(),
            read: false,
        };

        dispatch(addNotification(notification));

        // Also trigger popup directly
        const event = new CustomEvent('notificationPopup', {
            detail: notification
        });
        window.dispatchEvent(event);
    };

    const testMeetingNotification = () => {
        const currentUserId = getCurrentUserId();

        const notification = {
            id: `test_meeting_${Date.now()}`,
            type: 'MEETING' as const,
            title: 'Meeting Reminder',
            body: 'Your meeting with Sarah Johnson starts in 15 minutes',
            data: {
                meetingId: 'meeting-123',
                participantName: 'Sarah Johnson',
                startTime: '15:00',
                userId: currentUserId, // Add userId for filtering
            },
            timestamp: new Date().toISOString(),
            read: false,
        };

        dispatch(addNotification(notification));

        // Also trigger popup directly
        const event = new CustomEvent('notificationPopup', {
            detail: notification
        });
        window.dispatchEvent(event);
    };

    const testSystemNotification = () => {
        const currentUserId = getCurrentUserId();

        const notification = {
            id: `test_system_${Date.now()}`,
            type: 'SYSTEM' as const,
            title: 'System Update',
            body: 'The system will be undergoing maintenance tonight from 2:00 AM to 4:00 AM',
            data: {
                maintenanceWindow: '2:00 AM - 4:00 AM',
                affectedServices: ['Chat', 'Bookings', 'Meetings'],
                userId: currentUserId, // Add userId for filtering
            },
            timestamp: new Date().toISOString(),
            read: false,
        };

        dispatch(addNotification(notification));

        // Also trigger popup directly
        const event = new CustomEvent('notificationPopup', {
            detail: notification
        });
        window.dispatchEvent(event);
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Test Notifications</h3>
            <div className="flex flex-wrap gap-2">
                <Button onClick={testMessageNotification} variant="outline">
                    Test Message Notification
                </Button>
                <Button onClick={testBookingNotification} variant="outline">
                    Test Booking Notification
                </Button>
                <Button onClick={testMeetingNotification} variant="outline">
                    Test Meeting Notification
                </Button>
                <Button onClick={testSystemNotification} variant="outline">
                    Test System Notification
                </Button>
            </div>
        </div>
    );
};

export default NotificationTest;
