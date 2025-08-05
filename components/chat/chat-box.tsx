import React, { useEffect, useRef, useState } from "react";
import { Send, Search, X, ChevronLeft, ChevronRight, Paperclip } from 'lucide-react';
import { useSocket } from "@/config/use-socket";
import { getChatHistory, sendMessage, uploadFile, type Message, type FileUploadResponse } from "@/service/chat.service";
import { getTimeFromTimestamp, to12HourFormat, getFileTypeFromMimeType, formatFileSize } from "@/utils/helper";

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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const attachmentDropdownRef = useRef<HTMLDivElement>(null);
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
        };

        // Clean up any existing listeners first
        cleanup();

        const handleNewMessage = (message: Message) => {
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
                    senderId: CURRENT_USER_ID,
                    senderType: "EXPERT",
                    content: input,
                };

                if (uploadedFileData) {
                    messageData.fileLink = uploadedFileData.fileUrl;
                    messageData.fileType = uploadedFileData.fileType;
                    messageData.fileName = uploadedFileData.fileName;
                }

                console.log("Sending message data:", messageData);
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

    const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log("File selected:", file.name, file.type, file.size);
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
            <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse" style={{ scrollbarWidth: 'thin' }}>
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
                        {[...messages].reverse().map((message: any, index) => (
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
                                    {message.content && (
                                        <p className="text-xs leading-relaxed">{message.content}</p>
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

                                            {/* Audio Display */}
                                            {message.audioLink && (
                                                <audio
                                                    src={message.audioLink}
                                                    controls
                                                    className="w-full"
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
                                className="text-gray-500 bg-transparent rounded-full focus:outline-none p-2"
                                onClick={openAttachmentDropdown}
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSendMessage}
                        className="ml-3 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={(!input.trim() && !uploadedFileData) || isUploadingFile}
                    >
                        <Send className="w-5 h-5" />
                    </button>
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
        </div>
    );
};

export default ChatBox;