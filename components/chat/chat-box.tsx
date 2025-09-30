import React, { useEffect, useRef, useState } from "react";
import { Send, Search, X, ChevronLeft, ChevronRight, Paperclip, Square, Mic, Pause, PlayCircle, Check, CheckCheck } from 'lucide-react';
import { useSocket } from "@/config/use-socket";
import { getChatHistory, sendMessage, uploadFile, type Message, type FileUploadResponse } from "@/service/chat.service";
import { getTimeFromTimestamp, to12HourFormat, getFileTypeFromMimeType, formatFileSize } from "@/utils/helper";
import { fetchProfile } from "@/service/profile.service";

const CURRENT_USER_ID = "CURRENT_USER_ID"; // Replace with actual expert user ID from auth

const ChatBox = ({ roomId, customer }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messageSearchTerm, setMessageSearchTerm] = useState("");
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
    const [isSearchingMessages, setIsSearchingMessages] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFileData, setUploadedFileData] = useState<FileUploadResponse | null>(null);
    const [attachmentDropdown, setAttachmentDropdown] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [profile, setProfile] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const attachmentDropdownRef = useRef<HTMLDivElement>(null);

    // Add voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>("");
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
    const [unreadCount, setUnreadCount] = useState<any>()

    const socket = useSocket();

    // Add refs
    const audioRef = useRef<HTMLAudioElement>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);


    const fetchProfileData = async () => {
        const response: any = await fetchProfile();
        if (response.data.profile_picture_url) {
            setProfileImage(response.data.profile_picture_url);
            setProfile(response.data);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const hasValidProfilePicture = (url) => {
        return url && url !== '' && url !== 'null' && url !== 'undefined';
    };

    const getUserStatus = (userId) => {
        // Use customer data directly from props (managed by parent)
        return customer?.is_online ? 'online' : 'offline';
    };

    const getMessageTickStatus = (message: Message) => {
        // Only show ticks for messages sent by the expert
        if (message.senderType !== "EXPERT") {
            return null;
        }

        // Return tick status based on read status
        return message.is_read ? 'read' : 'sent';
    };

    // Group messages by date
    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { [key: string]: Message[] } = {};

        messages.forEach(message => {
            const messageDate = new Date(message.timestamp);
            const dateKey = messageDate.toDateString(); // e.g., "Mon Dec 25 2023"

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
        });

        return groups;
    };

    // Format date for display
    const formatDateForDisplay = (dateString: string) => {
        const messageDate = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time to compare only dates
        const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (messageDateOnly.getTime() === todayOnly.getTime()) {
            return "Today";
        } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
            return "Yesterday";
        } else {
            return messageDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    // Initialize chat and join room
    useEffect(() => {
        const initializeChat = async () => {
            if (!roomId || !customer) {
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const response = await getChatHistory(roomId);
                if (response?.length > 0) setMessages(response);

                if (socket) {
                    await socket.emitWithAck?.("joinChat", {
                        chatRoomId: roomId,
                        userId: profile?.id
                    });
                }
            } catch (error) {
                console.log("error in initialize chat", error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        };
        initializeChat();
    }, [roomId, customer, socket]);

    // Listen for socket events
    useEffect(() => {
        if (!socket || !roomId) return;

        // Clean up function to remove listeners
        const cleanup = () => {
            socket.off("newMessage");
            socket.off("userTyping");
            socket.off("messageRead");
        };

        // Clean up any existing listeners first
        cleanup();

        const handleNewMessage = (message: Message) => {
            if (message.chatRoomId === roomId) {
                setMessages((prev) => [...prev, message]);

                // Mark as read if the message is from the customer
                if (message.senderType === 'CUSTOMER' && profile?.id) {
                    socket.emit('markAsRead', {
                        chatRoomId: roomId,
                        receiverId: profile.id
                    });
                }
            }
        };

        const handleUserTyping = (data) => {
            if (data.userId === customer.id && data.chatRoomId === roomId) {
                setIsTyping(data.isTyping);
            }
        };

        const handleMessageRead = (data) => {
            console.log("Message read:", data);

            if (data.chatRoomId === roomId) {
                // Update the read status for messages in this room
                setMessages(prev => prev.map(msg =>
                    msg.senderType === "EXPERT" && !msg.is_read
                        ? { ...msg, is_read: true }
                        : msg
                ));
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("userTyping", handleUserTyping);
        socket.on("messagesRead", handleMessageRead);
        return cleanup;
    }, [socket, roomId, customer?.id]);
    // Join room effect
    useEffect(() => {
        if (socket && roomId && customer?.id) {

            socket.emit("joinChat", {
                chatRoomId: roomId,
                userId: profile?.id
            });
        }
    }, [socket, roomId, customer?.id]);

    useEffect(() => {
        if (socket && roomId && profile?.id) {
            // Mark messages as read when entering the chat room
            socket.emit('markAsRead', {
                chatRoomId: roomId,
                receiverId: profile.id
            });
        }
    }, [socket, roomId, profile?.id]);


    useEffect(() => {
        setMessages([]);
        setMessageSearchTerm("");
        setIsSearchMode(false);
        setSearchResults([]);
        setCurrentSearchIndex(0);

        return () => {
            if (socket && roomId) {
                socket.emit("leaveChat", { chatRoomId: roomId });
            }
        };
    }, [roomId, customer?.id]); // Added customer?.id to dependencies

    // useEffect(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, [messages]);

    // Close attachment dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (attachmentDropdown && attachmentDropdownRef.current && !attachmentDropdownRef.current.contains(event.target as Node)) {
                setAttachmentDropdown(false);
            }
        };

        if (attachmentDropdown) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [attachmentDropdown]);


    const handleSendMessage = async () => {
        if ((!input.trim() && !uploadedFileData) || !roomId) return;
        try {
            if (socket) {
                const messageData: any = {
                    chatRoomId: roomId,
                    senderId: profile?.id,
                    senderType: "EXPERT",
                    content: input,
                };

                if (uploadedFileData) {
                    messageData.fileLink = uploadedFileData.fileUrl;
                    messageData.fileType = uploadedFileData.fileType;
                    messageData.fileName = uploadedFileData.fileName;
                }

                const message = await socket.emitWithAck?.("sendMessage", messageData);
                if (message) {
                    setInput("");
                    setSelectedFile(null);
                    setUploadedFileData(null);
                    setImagePreview("");
                    setUploadError("");
                    // scrollToBottom();
                }
            }
        } catch (error) {
            // Handle error (optional)
        }
    };

    const handleTyping = (isTyping: boolean) => {
        if (socket && roomId) {
            socket.emit("typing", {
                chatRoomId: roomId,
                isTyping,
                userId: profile?.id,
            });
        }
    };

    const onMessageSearchInput = async () => {
        if (messageSearchTerm.trim()) {
            setIsSearchMode(true);
            setIsSearchingMessages(true);

            try {
                // Server-side search
                const response = await getChatHistory(roomId, 1, 1000, messageSearchTerm.trim());
                setSearchResults(response || []);
                setCurrentSearchIndex(0);

                // Also search in current messages for instant results
                const localFiltered = messages.filter(msg =>
                    msg.content && msg.content.toLowerCase().includes(messageSearchTerm.toLowerCase())
                );

                // Combine server results with local results and remove duplicates
                const combinedResults = [...response || [], ...localFiltered];
                const uniqueResults = combinedResults.filter((msg, index, self) =>
                    index === self.findIndex(m => m.id === msg.id)
                );

                setSearchResults(uniqueResults);
            } catch (error) {
                console.error("Search failed:", error);
                // Fallback to local search
                const filtered = messages.filter(msg =>
                    msg.content && msg.content.toLowerCase().includes(messageSearchTerm.toLowerCase())
                );
                setSearchResults(filtered);
            } finally {
                setIsSearchingMessages(false);
            }
        } else {
            setIsSearchMode(false);
            setSearchResults([]);
            setCurrentSearchIndex(0);
        }
    };

    const clearMessageSearch = () => {
        setMessageSearchTerm("");
        setIsSearchMode(false);
        setSearchResults([]);
        setCurrentSearchIndex(0);
        setIsSearchingMessages(false);
    };

    const nextSearchResult = () => {
        if (currentSearchIndex < searchResults.length - 1) {
            setCurrentSearchIndex(currentSearchIndex + 1);
        }
    };

    const previousSearchResult = () => {
        if (currentSearchIndex > 0) {
            setCurrentSearchIndex(currentSearchIndex - 1);
        }
    };

    const openAttachmentDropdown = () => {
        setAttachmentDropdown(true);
    };

    const closeAttachmentMenuDropdown = () => {
        setAttachmentDropdown(false);
    };

    const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setIsUploadingFile(true);
        setUploadError("");
        setAttachmentDropdown(false);

        try {
            // Create preview for images and videos
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    setImagePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            }

            // Determine file type and upload
            const fileType = getFileTypeFromMimeType(file.type);
            const uploadedData = await uploadFile(file, fileType);
            setUploadedFileData(uploadedData);
        } catch (error) {
            console.error("File upload failed:", error);
            setUploadError("Failed to upload file. Please try again.");
            setSelectedFile(null);
            setImagePreview("");
        } finally {
            setIsUploadingFile(false);
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        setUploadedFileData(null);
        setImagePreview("");
        setUploadError("");
    };

    const highlightSearchTerm = (text: string, searchTerm: string) => {
        if (!searchTerm || !text) return text;

        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <mark key={index} className="bg-green-600 text-inherit rounded ">
                    {part}
                </mark>
            ) : part
        );
    };


    const startRecording = async () => {
        if (isRecording) return; // Prevent multiple recordings

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);

                setAudioBlob(audioBlob);
                setAudioUrl(audioUrl);
                setAudioChunks([]);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setMediaRecorder(mediaRecorder);
            setIsRecording(true);
            setRecordingDuration(0);
            setAudioChunks([]);

            // Start recording timer
            const interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
            setRecordingTimer(interval);

        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };


    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);

            if (recordingTimer) {
                clearInterval(recordingTimer);
                setRecordingTimer(null);
            }
        }
    };

    const playRecording = () => {
        if (audioUrl && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const deleteRecording = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl("");
        setRecordingDuration(0);
        setIsPlaying(false);
    };

    const sendVoiceMessage = async () => {
        if (!audioBlob || !roomId) return;

        try {
            if (socket) {
                // Convert blob to file for upload
                const audioFile = new File([audioBlob], `voice-message-${Date.now()}.wav`, {
                    type: 'audio/wav'
                });

                // Upload the audio file first
                const fileType = getFileTypeFromMimeType(audioFile.type);
                const uploadedData = await uploadFile(audioFile, fileType);

                if (uploadedData) {
                    const messageData: any = {
                        chatRoomId: roomId,
                        senderId: profile?.id,
                        senderType: "EXPERT",
                        content: "🎤 Voice message", // Placeholder text
                        fileLink: uploadedData.fileUrl,
                        fileType: uploadedData.fileType,
                        fileName: uploadedData.fileName,
                    };

                    const message = await socket.emitWithAck?.("sendMessage", messageData);
                    if (message) {
                        // Clear recording data
                        deleteRecording();
                        setInput("");
                        setSelectedFile(null);
                        setUploadedFileData(null);
                        setImagePreview("");
                        setUploadError("");
                    }
                }
            }
        } catch (error) {
            console.error("Error sending voice message:", error);
            setUploadError("Failed to send voice message. Please try again.");
        }
    };

    // Add this useEffect for cleanup
    useEffect(() => {
        return () => {
            // Cleanup audio URL when component unmounts
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            // Clear recording timer
            if (recordingTimer) {
                clearInterval(recordingTimer);
            }
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, [audioUrl, recordingTimer]);

    // Format recording duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };



    if (!customer) {
        return (
            <div className="flex-1 flex flex-col bg-white border border-gray-200 my-5 sm:my-0 lg:mx-5 lg:mt-6 rounded-xl items-center justify-center">
                <div className="text-center text-gray-500 p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.879 8-1.171 0-2.297-.2-3.337-.546l-2.383.948a1 1 0 01-1.262-1.263l.949-2.383A8.902 8.902 0 013 12c0-4.418 4.005-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">Welcome to Chat</p>
                    <p className="text-sm">Select a customer to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white border border-gray-200 my-5 sm:my-0 lg:mx-5 lg:mt-6 rounded-xl h-[calc(90vh-100px)]">
            {/* Chat Header */}
            <div className="inline-block w-full md:flex md:w-auto items-center px-4 py-3 border-b border-gray-200">
                <div className="relative float-left mr-3">
                    <div className="relative w-10 h-10">
                        {hasValidProfilePicture(customer.profile_picture_url) ? (
                            <img
                                src={customer.profile_picture_url}
                                className="w-10 h-10 rounded-full object-cover"
                                alt="Customer"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                {getInitials(customer.name)}
                            </div>
                        )}
                    </div>
                    {getUserStatus(customer.id) === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg m-0 leading-7">{customer.name}</h3>
                    <div className="flex items-center text-gray-500">
                        {getUserStatus(customer.id) === 'online' ? (
                            <span className="text-green-500 font-medium">Online</span>
                        ) : (
                            <span className="text-gray-400">
                                {customer?.last_seen ? `Last seen ${getTimeFromTimestamp(customer.last_seen)}` : 'Offline'}
                            </span>
                        )}
                        {isTyping && (
                            <span className="ml-2 text-blue-500 italic">typing...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={messageSearchTerm}
                        onChange={(e) => setMessageSearchTerm(e.target.value)}
                        onInput={onMessageSearchInput}
                        placeholder="Search in conversation..."
                        className="w-full px-4 py-2 pr-20 border rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                        disabled={isSearchingMessages}
                        style={{ opacity: isSearchingMessages ? 0.5 : 1 }}
                    />
                    {messageSearchTerm && (
                        <button
                            onClick={clearMessageSearch}
                            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onMessageSearchInput}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isSearchingMessages}
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>

                {/* Search Navigation */}
                {isSearchMode && searchResults.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{currentSearchIndex + 1} of {searchResults.length}</span>
                        <div className="flex gap-1">
                            <button
                                onClick={previousSearchResult}
                                disabled={currentSearchIndex === 0}
                                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={nextSearchResult}
                                disabled={currentSearchIndex >= searchResults.length - 1}
                                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse" style={{ scrollbarWidth: 'thin' }}>
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                ) : (
                    <>
                        {(() => {
                            const messagesToRender = isSearchMode ? searchResults : [...messages].reverse();
                            const messageGroups = groupMessagesByDate(messagesToRender);
                            const sortedDates = Object.keys(messageGroups).sort((a, b) =>
                                new Date(b).getTime() - new Date(a).getTime() // Reverse date order for flex-col-reverse
                            );

                            return sortedDates.map((dateKey) => (
                                <div key={dateKey}>
                                    {/* Date Separator */}
                                    <div className="flex items-center justify-center my-4">
                                        <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                                            {formatDateForDisplay(dateKey)}
                                        </div>
                                    </div>

                                    {/* Messages for this date */}
                                    {messageGroups[dateKey].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((message: any, index) => {
                                        const isHighlighted = isSearchMode && searchResults.findIndex(m => m.id === message.id) === currentSearchIndex;

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex items-start space-x-2 mb-4 ${message.senderType === "EXPERT" ? "justify-end" : "justify-start"
                                                    } ${isHighlighted ? "bg-yellow-100 rounded-lg p-2" : ""}`}
                                            >
                                                {/* Profile Picture on Left Side for received messages */}
                                                {message.senderType === "CUSTOMER" && (
                                                    <div className="relative w-8 h-8 mt-1">
                                                        {hasValidProfilePicture(customer.profile_picture_url) ? (
                                                            <img
                                                                src={customer.profile_picture_url}
                                                                alt="Customer"
                                                                className="rounded-full w-8 h-8 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                                                {getInitials(customer.name)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Message Content */}
                                                <div
                                                    className={`rounded-xl pt-1.5 pb-1 px-3 max-w-xs lg:max-w-md ${message.senderType === "EXPERT"
                                                        ? "bg-blue-600 text-white rounded-br-none"
                                                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                                                        }`}
                                                >
                                                    {message.content && (
                                                        <p className="text-xs leading-relaxed">
                                                            {isSearchMode && messageSearchTerm ?
                                                                highlightSearchTerm(message.content, messageSearchTerm) :
                                                                message.content
                                                            }
                                                        </p>
                                                    )}

                                                    {/* File Display */}
                                                    {(message.imageLink || message.videoLink || message.audioLink || message.documentLink) && (
                                                        <div className="mt-2">
                                                            {/* Image Display */}
                                                            {message.imageLink && (
                                                                <img
                                                                    src={message.imageLink}
                                                                    className="max-w-full h-auto rounded-lg cursor-pointer"
                                                                    alt="Image"
                                                                    onClick={() => window.open(message.imageLink, '_blank')}
                                                                />
                                                            )}

                                                            {/* Video Display */}
                                                            {message.videoLink && (
                                                                <video
                                                                    src={message.videoLink}
                                                                    controls
                                                                    className="max-w-full h-auto rounded-lg"
                                                                />
                                                            )}

                                                            {/* Document Display */}
                                                            {message.documentLink && (
                                                                <div
                                                                    className="inline-flex items-center gap-2 mt-1 bg-black bg-opacity-60 py-2 px-3 rounded cursor-pointer hover:bg-opacity-80 transition-colors"
                                                                    onClick={() => window.open(message.documentLink, '_blank')}
                                                                >
                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                                    </svg>
                                                                    <span className="text-xs text-white">{message?.fileName || "Document"}</span>
                                                                </div>
                                                            )}

                                                            {/* Audio Display */}
                                                            {message.audioLink && (
                                                                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                                                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                                                        </svg>
                                                                    </div>

                                                                    <audio controls className="h-8">
                                                                        <source src={message.audioLink} type="audio/wav" />
                                                                        Your browser does not support the audio element.
                                                                    </audio>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-end gap-1 mt-1">
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {getMessageTickStatus(message) && (
                                                            <div className="flex items-center">
                                                                {getMessageTickStatus(message) === 'read' ? (
                                                                    <CheckCheck className="w-3 h-3 text-blue-400" />
                                                                ) : (
                                                                    <Check className="w-3 h-3 text-gray-400" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Profile Picture on Right Side for sent messages */}
                                                {message.senderType === "EXPERT" && (
                                                    <div className="relative w-8 h-8 mt-1">
                                                        {hasValidProfilePicture(profileImage) ? (
                                                            <img
                                                                src={profileImage}
                                                                alt="Expert"
                                                                className="rounded-full w-8 h-8 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                                                {getInitials(customer.name)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ));
                        })()}

                        {/* No search results message */}
                        {isSearchMode && searchResults.length === 0 && messageSearchTerm.trim() !== '' && (
                            <div className="flex items-center justify-center py-8 text-gray-500">
                                <div className="text-center">
                                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No messages found</p>
                                    <p className="text-sm">Try searching with different keywords</p>
                                </div>
                            </div>
                        )}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex items-start space-x-2 mb-3">
                                <div className="relative w-8 h-8 mt-1">
                                    {hasValidProfilePicture(customer.profile_picture_url) ? (
                                        <img
                                            src={customer.profile_picture_url}
                                            alt="Customer"
                                            className="rounded-full w-8 h-8 object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                            {getInitials(customer.name)}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-100 rounded-xl rounded-bl-none pt-1.5 pb-1 px-3">
                                    <div className="flex items-center py-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 relative">
                <div className="flex items-center">
                    <div className="inline-flex w-full relative items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                        {/* Selected File Display */}
                        {(selectedFile || uploadError) && (
                            <div className="flex items-center w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                {uploadError ? (
                                    <div className="flex items-center w-full">
                                        <div className="w-5 h-5 mr-2 bg-red-500 rounded"></div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-red-600 block">
                                                Upload Failed
                                            </span>
                                            <span className="text-xs text-red-500">
                                                {uploadError}
                                            </span>
                                        </div>
                                        <button
                                            onClick={removeSelectedFile}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : isUploadingFile ? (
                                    <div className="flex items-center w-full">
                                        <div className="w-5 h-5 mr-2">
                                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-blue-600 block">
                                                Uploading...
                                            </span>
                                            <span className="text-xs text-blue-500">
                                                {selectedFile?.name}
                                            </span>
                                        </div>
                                    </div>
                                ) : selectedFile && getFileTypeFromMimeType(selectedFile.type) === 'image' && imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            className="w-20 h-20 object-cover rounded-lg mr-3"
                                            alt="Preview"
                                        />
                                        <div className="absolute top-0 left-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <button
                                            onClick={removeSelectedFile}
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : selectedFile && getFileTypeFromMimeType(selectedFile.type) === 'video' && imagePreview ? (
                                    <div className="relative">
                                        <video
                                            src={imagePreview}
                                            className="w-20 h-20 object-cover rounded-lg mr-3"
                                            preload="metadata"
                                            muted
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg mr-3">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                        <div className="absolute top-0 left-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <button
                                            onClick={removeSelectedFile}
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : selectedFile ? (
                                    <div className="flex items-center w-full">
                                        <div className="w-5 h-5 mr-2 bg-green-500 rounded flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-gray-900 truncate block">
                                                {selectedFile.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatFileSize(selectedFile.size)} • Uploaded
                                            </span>
                                        </div>
                                        <button
                                            onClick={removeSelectedFile}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Voice Recording Display */}
                        {audioBlob && (
                            <div className="flex items-center w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center w-full">
                                    <div className="w-5 h-5 mr-2 bg-green-500 rounded flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium text-green-600 block">
                                            Voice Message ({formatDuration(recordingDuration)})
                                        </span>
                                        <span className="text-xs text-green-500">
                                            Tap to play
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={playRecording}
                                            className="text-green-600 hover:text-green-700 p-1"
                                        >
                                            {isPlaying ? <Pause className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={deleteRecording}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Message Input */}
                        {!selectedFile && !audioBlob && (
                            <div className="overflow-hidden w-full">
                                <input
                                    type="text"
                                    className="px-4 py-3 w-full bg-white placeholder:text-gray-500 focus:outline-none"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        handleTyping(true);
                                    }}
                                    onBlur={() => handleTyping(false)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            handleSendMessage();
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* Voice Recording Button */}
                        {!selectedFile && !audioBlob && (
                            <button
                                className={`p-2 rounded-full focus:outline-none transition-colors ${isRecording
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                                onClick={isRecording ? stopRecording : startRecording}
                                title={isRecording ? "Click to stop recording" : "Click to start recording"}
                            >
                                {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        )}

                        {/* Attachment Button */}
                        {!selectedFile && !audioBlob && (
                            <button
                                className="text-gray-500 bg-transparent rounded-full focus:outline-none p-2"
                                onClick={openAttachmentDropdown}
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={audioBlob ? sendVoiceMessage : handleSendMessage}
                        className="ml-3 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={(!input.trim() && !uploadedFileData && !audioBlob) || isUploadingFile}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>

                {/* Hidden audio element for playing recordings */}
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                />

                {/* Recording indicator */}
                {isRecording && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        Recording... {formatDuration(recordingDuration)}
                    </div>
                )}
            </div>

            {/* Attachment Dropdown - Positioned Outside */}
            {attachmentDropdown && (
                <div
                    ref={attachmentDropdownRef}
                    className="absolute bottom-16 right-16 bg-white shadow-xl border rounded-lg py-2 z-[9999] min-w-[140px]"
                    style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }}
                >
                    <label className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx"
                            className="hidden"
                            onChange={onFileUpload}
                        />
                        📄 Document
                    </label>
                    <label className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onFileUpload}
                        />
                        🖼️ Photos
                    </label>
                    <label className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={onFileUpload}
                        />
                        🎥 Videos
                    </label>
                    <label className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={onFileUpload}
                        />
                        🎵 Audio
                    </label>
                </div>
            )}
        </div>
    );
};

export default ChatBox;