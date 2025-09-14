"use client";
import React, { useState, useRef, useEffect } from "react";
import { Bell, X, Check, CheckCheck, Trash2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import {
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
} from "@/redux/slice/notification.slice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

interface NotificationBellProps {
    className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const { notifications, unreadCount } = useAppSelector((state) => state.notification);

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

    // Filter notifications for current user only
    const currentUserId = getCurrentUserId();
    const filteredNotifications = notifications.filter(notification => {
        // For message notifications, check recipientId
        if (notification.type === 'MESSAGE' && notification.data?.recipientId) {
            const isForCurrentUser = notification.data.recipientId === currentUserId;
            if (!isForCurrentUser) {
            }
            return isForCurrentUser;
        }
        // For other notifications, check userId in data
        if (notification.data?.userId) {
            const isForCurrentUser = notification.data.userId === currentUserId;
            if (!isForCurrentUser) {
            }
            return isForCurrentUser;
        }
        return true;
    });

    // Calculate unread count for filtered notifications
    const filteredUnreadCount = filteredNotifications.filter(n => !n.read).length;

    // Debug logging

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            dispatch(markAsRead(notification.id));
        }

        // Navigate based on notification type
        if (notification.type === 'MESSAGE' && notification.chatRoomId) {
            window.location.href = `/chat?room=${notification.chatRoomId}`;
        } else if (notification.type === 'BOOKING') {
            window.location.href = '/bookings';
        } else if (notification.type === 'MEETING') {
            window.location.href = '/meetings';
        }

        setIsOpen(false);
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const handleRemoveNotification = (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(removeNotification(notificationId));
    };

    const handleClearAll = () => {
        dispatch(clearAllNotifications());
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'MESSAGE':
                return '💬';
            case 'BOOKING':
                return '📅';
            case 'MEETING':
                return '🎥';
            case 'SYSTEM':
                return '🔔';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'MESSAGE':
                return 'text-blue-600';
            case 'BOOKING':
                return 'text-green-600';
            case 'MEETING':
                return 'text-purple-600';
            case 'SYSTEM':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className="h-5 w-5" />
                {filteredUnreadCount > 0 && (
                    <Badge
                        variant="soft"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                        {filteredUnreadCount > 99 ? '99+' : filteredUnreadCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            <div className="flex items-center space-x-2">
                                {filteredUnreadCount > 0 && (
                                    <Button
                                        variant="soft"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs"
                                    >
                                        <CheckCheck className="h-4 w-4 mr-1" />
                                        Mark all read
                                    </Button>
                                )}
                                {filteredNotifications.length > 0 && (
                                    <Button
                                        variant="soft"
                                        size="sm"
                                        onClick={handleClearAll}
                                        className="text-xs text-red-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />

                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="max-h-96">
                        {filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors",
                                            !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <span className="text-lg">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={cn(
                                                        "text-sm font-medium",
                                                        getNotificationColor(notification.type)
                                                    )}>
                                                        {notification.title}
                                                    </p>
                                                    <div className="flex items-center space-x-1">
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => handleRemoveNotification(notification.id, e)}
                                                            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                                    {notification.body}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                </p>
                                                {notification.data?.senderName && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        From: {notification.data.senderName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
