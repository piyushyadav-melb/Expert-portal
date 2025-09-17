import { store } from "@/redux/store";
import { addNotification, setConnectionStatus } from "@/redux/slice/notification.slice";
import { getCookie } from "@/utils/cookie";

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
    private isInitialized: boolean = false;
    private eventListenersSetup: boolean = false;

    private constructor() { }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public initializeSocket(socket: any) {
        console.log('Initializing notification service with socket, connected:', socket?.connected);

        if (this.isInitialized && this.socket === socket) {
            console.log('Notification service already initialized with this socket');
            return;
        }

        // Clean up previous socket if exists
        if (this.socket && this.socket !== socket) {
            this.cleanup();
        }

        this.socket = socket;
        this.setupEventListeners();
        this.isInitialized = true;

        console.log('Notification service initialized successfully');
    }

    private setupEventListeners() {
        if (!this.socket || this.eventListenersSetup) {
            console.log('Socket not available or listeners already setup');
            return;
        }

        console.log('Setting up event listeners for notification service');

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
        // this.socket.on('messageNotification', (payload: MessageNotificationPayload) => {
        //     console.log('Message notification received:', payload);
        //     this.handleMessageNotification(payload);
        // });

        // Handle general notifications
        this.socket.on('notification', (payload: GeneralNotificationPayload) => {
            console.log('General notification received:', payload);
            this.handleGeneralNotification(payload);
        });

        // Handle booking notifications
        this.socket.on('bookingNotification', (payload: any) => {
            console.log('Booking notification received:', payload);
            this.handleBookingNotification(payload);
        });

        // Handle meeting notifications
        this.socket.on('meetingNotification', (payload: any) => {
            console.log('Meeting notification received:', payload);
            this.handleMeetingNotification(payload);
        });

        this.eventListenersSetup = true;

        // Set initial connection status if socket is already connected
        if (this.socket.connected) {
            store.dispatch(setConnectionStatus(true));
        }
    }

    private handleMessageNotification(payload: MessageNotificationPayload) {
        // Get current user ID from token or auth context
        const currentUserId = this.getCurrentUserId();

        // Only show notification if it's for the current user
        if (payload.recipientId !== currentUserId) {
            return;
        }

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
                recipientId: payload.recipientId,
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
        // Get current user ID from token or auth context
        const currentUserId = this.getCurrentUserId();

        // Only show notification if it's for the current user
        if (payload.userId !== currentUserId) {
            return;
        }

        const notification = {
            id: `general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: payload.type,
            title: payload.title,
            body: payload.body,
            data: {
                ...payload.data,
                userId: payload.userId,
            },
            timestamp: payload.timestamp,
            read: false,
        };

        store.dispatch(addNotification(notification));
        this.showBrowserNotification(notification);
        this.triggerPopupNotification(notification);
    }

    private handleBookingNotification(payload: any) {
        // Get current user ID from token or auth context
        const currentUserId = this.getCurrentUserId();

        // Only show notification if it's for the current user
        if (payload.userId && payload.userId !== currentUserId) {
            console.log(`Booking notification not for current user. Expected: ${currentUserId}, Got: ${payload.userId}`);
            return;
        }

        const notification = {
            id: `booking_${payload.bookingId || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'BOOKING' as const,
            title: payload.title || 'New Booking',
            body: payload.body || 'You have a new booking',
            data: {
                ...(payload.data || payload),
                userId: payload.userId,
            },
            timestamp: payload.timestamp || new Date().toISOString(),
            read: false,
        };

        store.dispatch(addNotification(notification));
        this.showBrowserNotification(notification);
        this.triggerPopupNotification(notification);
    }

    private handleMeetingNotification(payload: any) {
        // Get current user ID from token or auth context
        const currentUserId = this.getCurrentUserId();

        // Only show notification if it's for the current user
        if (payload.userId && payload.userId !== currentUserId) {
            console.log(`Meeting notification not for current user. Expected: ${currentUserId}, Got: ${payload.userId}`);
            return;
        }

        const notification = {
            id: `meeting_${payload.meetingId || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'MEETING' as const,
            title: payload.title || 'Meeting Update',
            body: payload.body || 'You have a meeting update',
            data: {
                ...(payload.data || payload),
                userId: payload.userId,
            },
            timestamp: payload.timestamp || new Date().toISOString(),
            read: false,
        };

        store.dispatch(addNotification(notification));
        this.showBrowserNotification(notification);
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

    private getCurrentUserId(): string | null {
        try {
            const token = getCookie("token");
            if (!token) {
                console.log("No token found for user ID extraction");
                return null;
            }

            // Decode JWT token to get user ID
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.sub || null;
        } catch (error) {
            console.error("Error extracting user ID from token:", error);
            return null;
        }
    }

    public cleanup() {
        if (this.socket) {
            console.log('Cleaning up notification service event listeners');
            this.socket.off('messageNotification');
            this.socket.off('notification');
            this.socket.off('bookingNotification');
            this.socket.off('meetingNotification');
            this.socket.off('connect');
            this.socket.off('disconnect');
            this.socket.off('connect_error');
            this.eventListenersSetup = false;
        }
        this.isInitialized = false;
    }

    // Add method to check if service is properly initialized
    public isServiceReady(): boolean {
        return this.isInitialized && this.socket && this.socket.connected;
    }
}

export default NotificationService;