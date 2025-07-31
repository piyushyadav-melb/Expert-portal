import React, { useEffect, useRef, useState } from "react";
import { Send, Search, X, ChevronLeft, ChevronRight, Paperclip } from 'lucide-react';
import { useSocket } from "@/config/use-socket";
import { getChatHistory, sendMessage, type Message } from "@/service/chat.service";
import { getTimeFromTimestamp, to12HourFormat } from "@/utils/helper";

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
    const [selectedFile, setSelectedFile] = useState(null);
    const [attachmentDropdown, setAttachmentDropdown] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socket = useSocket();

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

    // Initialize chat and join room
    useEffect(() => {
        const initializeChat = async () => {
            if (!roomId || !customer) return;
            try {
                const response = await getChatHistory(roomId);
                if (response?.length > 0) setMessages(response);

                if (socket) {
                    console.log("inside initialize chat")
                    await socket.emitWithAck?.("joinChat", {
                        chatRoomId: roomId,
                        userId: CURRENT_USER_ID
                    });
                }
            } catch (error) {
                // Handle error (optional)
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
            // Remove userStatusChanged as it's handled by parent
        };

        // Clean up any existing listeners first
        cleanup();

        const handleNewMessage = (message: Message) => {
            console.log("MESSAGE IN EXPERT", message);
            if (message.chatRoomId === roomId) {
                setMessages((prev) => [...prev, message]);
            }
        };

        const handleUserTyping = (data) => {
            if (data.userId === customer.id && data.chatRoomId === roomId) {
                setIsTyping(data.isTyping);
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("userTyping", handleUserTyping);

        return cleanup;
    }, [socket, roomId, customer?.id]);
    // Join room effect
    useEffect(() => {
        if (socket && roomId && customer?.id) {

            // OR if you update backend to use chatRoomId:
            socket.emit("joinChat", {
                chatRoomId: roomId,
                userId: CURRENT_USER_ID
            });
        }
    }, [socket, roomId, customer?.id]);

    useEffect(() => {
        setMessages([]);
        return () => {
            if (socket && roomId) {
                console.log("LEAVING CHAT EXPERT");
                socket.emit("leaveChat", { chatRoomId: roomId });
            }
        };
    }, [roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if ((!input.trim() && !selectedFile) || !roomId) return;
        try {
            if (socket) {
                const messageData: any = {
                    chatRoomId: roomId,
                    senderId: CURRENT_USER_ID,
                    senderType: "EXPERT",
                    content: input,
                };

                if (selectedFile) {
                    // Handle file upload logic here
                    messageData.file = selectedFile;
                }

                const message = await socket.emitWithAck?.("sendMessage", messageData);
                if (message) {
                    setInput("");
                    setSelectedFile(null);
                    setImagePreview("");
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
                userId: CURRENT_USER_ID,
            });
        }
    };

    const onMessageSearchInput = () => {
        if (messageSearchTerm.trim()) {
            setIsSearchMode(true);
            // Implement search logic
            const filtered = messages.filter(msg =>
                msg.content && msg.content.toLowerCase().includes(messageSearchTerm.toLowerCase())
            );
            setSearchResults(filtered);
            setCurrentSearchIndex(0);
        } else {
            setIsSearchMode(false);
            setSearchResults([]);
        }
    };

    const clearMessageSearch = () => {
        setMessageSearchTerm("");
        setIsSearchMode(false);
        setSearchResults([]);
        setCurrentSearchIndex(0);
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

    const onFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);

            // Create preview for images
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    setImagePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
        setAttachmentDropdown(false);
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        setImagePreview("");
    };

    const getFileType = (file) => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        return 'document';
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



            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                            <span className="ml-2 text-gray-600 font-medium">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message: any, index) => (
                            <div
                                key={message.id}
                                className={`flex items-start space-x-2 mb-4 ${message.senderType === "EXPERT" ? "justify-end" : "justify-start"
                                    } ${isSearchMode && index === currentSearchIndex ? "bg-yellow-100 rounded-lg p-2" : ""}`}
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
                                    <p className="text-xs leading-relaxed">{message.content}</p>

                                    {/* File Display */}
                                    {message.file && (
                                        <div className="mt-2">
                                            {message.file.type?.startsWith('image/') ? (
                                                <img
                                                    src={message.file.url}
                                                    className="max-w-full h-auto rounded-lg cursor-pointer"
                                                    alt="Image"
                                                />
                                            ) : message.file.type?.startsWith('video/') ? (
                                                <video
                                                    src={message.file.url}
                                                    controls
                                                    className="max-w-full h-auto rounded-lg"
                                                />
                                            ) : (
                                                <div className="inline-flex items-center gap-2 mt-1 bg-black bg-opacity-60 py-1 px-2 rounded cursor-pointer hover:bg-opacity-80 transition-colors">
                                                    <span className="text-xs text-white">{message.file.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <span className="text-xs text-gray-400 float-right mt-1">
                                        {new Date(message.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                {/* Profile Picture on Right Side for sent messages */}
                                {message.senderType === "EXPERT" && (
                                    <div className="relative w-8 h-8 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                            E
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div ref={messagesEndRef} />

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
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                    <div className="inline-flex w-full relative items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                        {/* Selected File Display */}
                        {selectedFile && (
                            <div className="flex items-center w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                {getFileType(selectedFile) === 'image' && (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            className="w-20 h-20 object-cover rounded-lg mr-3"
                                            alt="Preview"
                                        />
                                        <button
                                            onClick={removeSelectedFile}
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                {getFileType(selectedFile) === 'video' && (
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
                                        <button
                                            onClick={removeSelectedFile}
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                {getFileType(selectedFile) === 'document' && (
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 mr-2 bg-gray-400 rounded"></div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-gray-900 truncate block">
                                                {selectedFile.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <button
                                            onClick={removeSelectedFile}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Message Input */}
                        {!selectedFile && (
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

                        {/* Attachment Button */}
                        {!selectedFile && (
                            <button
                                className="absolute right-12 sm:relative text-gray-500 bg-transparent rounded-full focus:outline-none p-2"
                                onClick={openAttachmentDropdown}
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Attachment Dropdown */}
                    {attachmentDropdown && (
                        <div className="absolute bottom-20 right-8 bg-white shadow-lg border rounded-lg py-2 z-10">
                            <label className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    className="hidden"
                                    onChange={onFileUpload}
                                />
                                Document
                            </label>
                            <label className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={onFileUpload}
                                />
                                Photos & Videos
                            </label>
                        </div>
                    )}

                    {/* Send Button */}
                    <button
                        onClick={handleSendMessage}
                        className="ml-3 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-900 transition-colors"
                        disabled={!input.trim() && !selectedFile}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;