import { store } from "@/redux/store";
import { addNotification, setConnectionStatus } from "@/redux/slice/notification.slice";

export interface MessageNotificationPayload {
    type: 'NEW_MESSAGE';
    chatRoomId: string;
    messageId: string;
    sender: {
        id: string;
        name: string;
        profilePicture?: string;
        type: 'CUSTOMER' | 'EXPERT';
    };
    message: {
        content: string;
        timestamp: string;
        hasFile: boolean;
        fileType?: 'image' | 'video' | 'audio' | 'document' | null;
    };
    recipientId: string;
    recipientType: 'CUSTOMER' | 'EXPERT';
}

export interface GeneralNotificationPayload {
    userId: string;
    type: 'MESSAGE' | 'BOOKING' | 'MEETING' | 'SYSTEM';
    title: string;
    body: string;
    data?: any;
    timestamp: string;
}

class NotificationService {
    private static instance: NotificationService;
    private socket: any = null;

    private constructor() { }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public initializeSocket(socket: any) {
        this.socket = socket;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (!this.socket) return;

        // Handle socket connection status
        this.socket.on('connect', () => {
            console.log('Socket connected for notifications');
            store.dispatch(setConnectionStatus(true));
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected for notifications');
            store.dispatch(setConnectionStatus(false));
        });

        this.socket.on('connect_error', (error: any) => {
            console.error('Socket connection error for notifications:', error);
            store.dispatch(setConnectionStatus(false));
        });

        // Handle message notifications
        this.socket.on('messageNotification', (payload: MessageNotificationPayload) => {
            this.handleMessageNotification(payload);
        });

        // Handle general notifications
        this.socket.on('notification', (payload: GeneralNotificationPayload) => {
            this.handleGeneralNotification(payload);
        });

        // Handle booking notifications
        this.socket.on('bookingNotification', (payload: any) => {
            this.handleBookingNotification(payload);
        });

        // Handle meeting notifications
        this.socket.on('meetingNotification', (payload: any) => {
            this.handleMeetingNotification(payload);
        });
    }

    private handleMessageNotification(payload: MessageNotificationPayload) {
        const notification = {
            id: `msg_${payload.messageId}_${Date.now()}`,
            type: 'MESSAGE' as const,
            title: `New message from ${payload.sender.name}`,
            body: payload.message.content.length > 50
                ? `${payload.message.content.substring(0, 50)}...`
                : payload.message.content,
            data: {
                chatRoomId: payload.chatRoomId,
                messageId: payload.messageId,
                senderId: payload.sender.id,
                senderType: payload.sender.type,
                senderName: payload.sender.name,
                senderProfilePicture: payload.sender.profilePicture,
                hasFile: payload.message.hasFile,
                fileType: payload.message.fileType,
            },
            timestamp: payload.message.timestamp,
            read: false,
            chatRoomId: payload.chatRoomId,
            messageId: payload.messageId,
            senderId: payload.sender.id,
            senderType: payload.sender.type,
        };

        store.dispatch(addNotification(notification));
        this.showBrowserNotification(notification);
        this.triggerPopupNotification(notification);
    }

    private handleGeneralNotification(payload: GeneralNotificationPayload) {
        const notification = {
            id: `general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: payload.type,
            title: payload.title,
            body: payload.body,
            data: payload.data,
            timestamp: payload.timestamp,
            read: false,
        };

        store.dispatch(addNotification(notification));
        this.showBrowserNotification(notification);
        this.triggerPopupNotification(notification);
    }

    private handleBookingNotification(payload: any) {
        const notification = {
            id: `booking_${payload.bookingId || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'BOOKING' as const,
            title: payload.title || 'New Booking',
            body: payload.body || 'You have a new booking',
            data: payload.data || payload,
            timestamp: payload.timestamp || new Date().toISOString(),
            read: false,
        };

        store.dispatch(addNotification(notification));
        this.showBrowserNotification(notification);
        this.triggerPopupNotification(notification);
    }

    private handleMeetingNotification(payload: any) {
        const notification = {
            id: `meeting_${payload.meetingId || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'MEETING' as const,
            title: payload.title || 'Meeting Update',
            body: payload.body || 'You have a meeting update',
            data: payload.data || payload,
            timestamp: payload.timestamp || new Date().toISOString(),
            read: false,
        };

        store.dispatch(addNotification(notification));
        this.showBrowserNotification(notification);
        this.triggerPopupNotification(notification);
        this.triggerPopupNotification(notification);
    }

    private showBrowserNotification(notification: any) {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        // Check if permission is granted
        if (Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.body,
                icon: notification.data?.senderProfilePicture || '/favicon.ico',
                tag: notification.id,
                data: notification.data,
            });

            // Handle notification click
            browserNotification.onclick = () => {
                window.focus();
                browserNotification.close();

                // Navigate to relevant page based on notification type
                if (notification.type === 'MESSAGE' && notification.chatRoomId) {
                    window.location.href = `/chat?room=${notification.chatRoomId}`;
                } else if (notification.type === 'BOOKING') {
                    window.location.href = '/bookings';
                } else if (notification.type === 'MEETING') {
                    window.location.href = '/meetings';
                }
            };

            // Auto close after 5 seconds
            setTimeout(() => {
                browserNotification.close();
            }, 5000);
        } else if (Notification.permission !== 'denied') {
            // Request permission
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    this.showBrowserNotification(notification);
                }
            });
        }
    }

    private triggerPopupNotification(notification: any) {
        // Dispatch a custom event to trigger popup notification
        const event = new CustomEvent('notificationPopup', {
            detail: notification
        });
        window.dispatchEvent(event);
    }

    public requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            return Notification.requestPermission();
        }
        return Promise.resolve(Notification.permission);
    }

    public cleanup() {
        if (this.socket) {
            this.socket.off('messageNotification');
            this.socket.off('notification');
            this.socket.off('bookingNotification');
            this.socket.off('meetingNotification');
            this.socket.off('connect');
            this.socket.off('disconnect');
            this.socket.off('connect_error');
        }
    }
}

export default NotificationService;
