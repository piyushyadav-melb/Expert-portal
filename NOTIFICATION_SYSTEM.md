# Global Notification System

This document describes the implementation of a global notification system for the Expert Portal that allows experts to receive real-time notifications across all pages.

## Overview

The notification system consists of several key components:

1. **Redux Store Management** - Centralized state management for notifications
2. **Socket Integration** - Real-time notification delivery via WebSocket
3. **UI Components** - Notification bell and dropdown interface
4. **Service Layer** - Business logic for handling different notification types
5. **Global Provider** - Ensures notifications work across all pages

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Backend       │    │   Socket.io      │    │   Frontend      │
│   (NestJS)      │───▶│   Server         │───▶│   (Next.js)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Notification   │
                       │   Service        │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Redux Store    │
                       │   (Global State) │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   UI Components  │
                       │   (Bell/Dropdown)│
                       └──────────────────┘
```

## Components

### 1. Redux Slice (`redux/slice/notification.slice.ts`)

Manages the global notification state including:
- List of notifications
- Unread count
- Connection status
- Actions for adding, marking as read, removing notifications

**Key Actions:**
- `addNotification` - Add new notification
- `markAsRead` - Mark specific notification as read
- `markAllAsRead` - Mark all notifications as read
- `removeNotification` - Remove specific notification
- `clearAllNotifications` - Clear all notifications
- `setConnectionStatus` - Update socket connection status

### 2. Notification Service (`service/notification.service.ts`)

Handles socket event processing and notification creation:

**Supported Notification Types:**
- `MESSAGE` - Chat message notifications
- `BOOKING` - Booking-related notifications
- `MEETING` - Meeting-related notifications
- `SYSTEM` - System-wide notifications

**Socket Events Handled:**
- `messageNotification` - Real-time message notifications
- `notification` - General notifications
- `bookingNotification` - Booking updates
- `meetingNotification` - Meeting updates

### 3. UI Components

#### Notification Bell (`components/notifications/notification-bell.tsx`)
- Displays notification count badge
- Shows dropdown with notification list
- Handles notification interactions
- Supports different notification types with icons and colors

#### Notification Test (`components/notifications/notification-test.tsx`)
- Testing component for development
- Allows manual triggering of different notification types

### 4. Global Provider (`provider/notification.provider.tsx`)

Wraps the entire application to ensure notifications work globally:
- Initializes socket connection
- Sets up event listeners
- Requests browser notification permission
- Handles cleanup on unmount

## Backend Integration

The system expects the backend to emit the following socket events:

### Message Notification Event
```typescript
// Event: 'messageNotification'
{
  type: 'NEW_MESSAGE',
  chatRoomId: string,
  messageId: string,
  sender: {
    id: string,
    name: string,
    profilePicture?: string,
    type: 'CUSTOMER' | 'EXPERT'
  },
  message: {
    content: string,
    timestamp: string,
    hasFile: boolean,
    fileType?: 'image' | 'video' | 'audio' | 'document' | null
  },
  recipientId: string,
  recipientType: 'CUSTOMER' | 'EXPERT'
}
```

### General Notification Event
```typescript
// Event: 'notification'
{
  userId: string,
  type: 'MESSAGE' | 'BOOKING' | 'MEETING' | 'SYSTEM',
  title: string,
  body: string,
  data?: any,
  timestamp: string
}
```

## Usage

### 1. Adding Notifications Programmatically

```typescript
import { useAppDispatch } from '@/hooks';
import { addNotification } from '@/redux/slice/notification.slice';

const dispatch = useAppDispatch();

dispatch(addNotification({
  id: 'unique-id',
  type: 'MESSAGE',
  title: 'New Message',
  body: 'You have a new message',
  timestamp: new Date().toISOString(),
  read: false,
  // ... other properties
}));
```

### 2. Accessing Notification State

```typescript
import { useAppSelector } from '@/hooks';

const { notifications, unreadCount, isConnected } = useAppSelector(
  (state) => state.notification
);
```

### 3. Socket Event Handling

The notification service automatically handles socket events. To add new event types:

1. Add the event handler in `NotificationService.setupEventListeners()`
2. Create a corresponding handler method
3. Update the Redux store with the new notification

## Browser Notifications

The system supports browser notifications with:
- Permission request on first load
- Click handling to navigate to relevant pages
- Auto-close after 5 seconds
- Custom icons and data

## Styling

Notifications support:
- Dark/light theme compatibility
- Responsive design
- Custom colors for different notification types
- Smooth animations and transitions

## Testing

Use the `NotificationTest` component to test different notification types during development:

```tsx
import NotificationTest from '@/components/notifications/notification-test';

// Add to any page for testing
<NotificationTest />
```

## Configuration

### Socket Configuration
- Server URL: `http://localhost:7000`
- Auto-connect: `true`
- Transports: `['websocket', 'polling']`
- Authentication: JWT token from cookies

### Notification Limits
- Maximum 50 notifications stored in memory
- Notifications older than 50 are automatically removed
- Unread count is maintained separately

## Security

- JWT token authentication for socket connection
- User-specific notification filtering
- Secure cookie-based token storage
- Input validation for notification data

## Performance

- Efficient Redux state management
- Minimal re-renders with proper selectors
- Lazy loading of notification components
- Automatic cleanup of old notifications

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check socket connection status
   - Verify Redux store is properly configured
   - Ensure NotificationProvider wraps the app

2. **Browser notifications not working**
   - Check notification permission status
   - Verify browser supports notifications
   - Check console for permission errors

3. **Socket connection issues**
   - Verify backend server is running
   - Check JWT token validity
   - Review network connectivity

### Debug Mode

Enable debug logging by checking browser console for:
- Socket connection events
- Notification service logs
- Redux action dispatches

## Future Enhancements

- Push notification support for mobile
- Notification sound alerts
- Notification persistence across sessions
- Advanced filtering and search
- Notification templates
- Analytics and metrics
