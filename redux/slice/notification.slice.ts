import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
    id: string;
    type: 'MESSAGE' | 'BOOKING' | 'MEETING' | 'SYSTEM';
    title: string;
    body: string;
    data?: any;
    timestamp: string;
    read: boolean;
    chatRoomId?: string;
    messageId?: string;
    senderId?: string;
    senderType?: 'CUSTOMER' | 'EXPERT';
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isConnected: boolean;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isConnected: false,
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            const notification = action.payload;
            // Check if notification already exists (avoid duplicates)
            const exists = state.notifications.find(n => n.id === notification.id);
            if (!exists) {
                state.notifications.unshift(notification);
                if (!notification.read) {
                    state.unreadCount += 1;
                }
                // Keep only last 50 notifications
                if (state.notifications.length > 50) {
                    state.notifications = state.notifications.slice(0, 50);
                }
            }
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notificationId = action.payload;
            const notification = state.notifications.find(n => n.id === notificationId);
            if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(notification => {
                notification.read = true;
            });
            state.unreadCount = 0;
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            const notificationId = action.payload;
            const notification = state.notifications.find(n => n.id === notificationId);
            if (notification && !notification.read) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications = state.notifications.filter(n => n.id !== notificationId);
        },
        clearAllNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        updateNotification: (state, action: PayloadAction<{ id: string; updates: Partial<Notification> }>) => {
            const { id, updates } = action.payload;
            const notification = state.notifications.find(n => n.id === id);
            if (notification) {
                const wasRead = notification.read;
                Object.assign(notification, updates);
                // Update unread count if read status changed
                if (wasRead !== notification.read) {
                    if (notification.read && !wasRead) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    } else if (!notification.read && wasRead) {
                        state.unreadCount += 1;
                    }
                }
            }
        },
    },
});

export const {
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    setConnectionStatus,
    updateNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
