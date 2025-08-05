import React, { useState, useEffect } from "react";
import { getChatRoomFiles, type ChatRoomFile } from "@/service/chat.service";

const CustomerProfile = ({ customer, chatRoomId }) => {
    const [chatFiles, setChatFiles] = useState<ChatRoomFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const hasValidProfilePicture = (url) => {
        return url && url !== '' && url !== 'null' && url !== 'undefined';
    };



    // Fetch chat room files
    useEffect(() => {
        const fetchChatFiles = async () => {
            if (!chatRoomId) return;

            setIsLoadingFiles(true);
            try {
                const files = await getChatRoomFiles(chatRoomId);
                setChatFiles(files);
            } catch (error) {
                console.error("Failed to fetch chat files:", error);
                setChatFiles([]);
            } finally {
                setIsLoadingFiles(false);
            }
        };

        fetchChatFiles();
    }, [chatRoomId]);

    const getFileTypeFromFile = (file: ChatRoomFile['files']) => {
        if (file.imageLink) return 'image';
        if (file.videoLink) return 'video';
        if (file.audioLink) return 'audio';
        if (file.documentLink) return 'document';
        return null;
    };

    const getFileUrl = (file: ChatRoomFile['files']) => {
        return file.imageLink || file.videoLink || file.audioLink || file.documentLink;
    };



    const getFileName = (file: ChatRoomFile['files']) => {
        return file.fileName;
    };

    const openFile = (url: string) => {
        window.open(url, '_blank');
    };

    if (!customer) {
        return (
            <div className="w-full  bg-white border border-gray-200 lg:mt-6 rounded-xl overflow-y-auto h-[calc(90vh-100px)] flex items-center justify-center">
                <div className="text-center text-gray-500 p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                    </div>
                    <p className="text-sm">Select a chat to view profile</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full  bg-white border border-gray-200 lg:mt-6 rounded-xl overflow-y-auto h-[calc(90vh-100px)]">
            {/* Profile Header */}
            <div className="flex flex-col items-center">
                <div className="relative w-full mb-3">
                    {hasValidProfilePicture(customer.profile_picture_url) ? (
                        <img
                            src={customer.profile_picture_url}
                            className="w-full h-48 object-cover rounded-t-xl"
                            alt="Customer"
                        />
                    ) : (
                        <div className="w-full h-48 bg-blue-600 text-white flex items-center justify-center text-4xl font-semibold rounded-t-xl">
                            {getInitials(customer.name)}
                        </div>
                    )}
                </div>

                <div className="block text-center bg-white shadow-lg rounded-3xl mx-auto w-[65%] -mt-16 p-4 relative z-10">
                    <h4 className="font-semibold mb-1.5 text-lg 2xl:text-xl">{customer.name}</h4>
                    <p className="text-xs text-gray-500 mb-2.5">{customer.role || "Customer"}</p>
                    <p className="font-medium text-gray-800">{customer.location || "Location not specified"}</p>
                </div>
            </div>

            {/* Personal Information */}
            <div className="p-4 mt-5">
                <h4 className="font-semibold text-sm mb-5 relative">
                    Personal Information
                    <span className="block absolute w-10 h-0.5 rounded-full bg-red-400 mt-1"></span>
                </h4>

                <div className="space-y-4">
                    <div>
                        <span className="font-medium text-gray-500 text-xs block">Email:</span>
                        <p className="font-semibold text-sm mt-1">{customer.email || "Not provided"}</p>
                    </div>

                    <div>
                        <span className="font-medium text-gray-500 text-xs block">Contact:</span>
                        <p className="font-semibold text-sm mt-1">{customer.phone || "Not provided"}</p>
                    </div>
                </div>

                <hr className="mt-6 border-gray-200" />
            </div>

            {/* Media, Links and Documents */}
            <div className="pb-2 px-4">
                <div className="mb-5">
                    <h4 className="font-semibold text-sm relative">
                        Media, links and Documents
                        <span className="block absolute w-10 h-0.5 rounded-full bg-red-400 mt-1"></span>
                    </h4>
                </div>

                {/* Files List */}
                {isLoadingFiles ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                            <span className="ml-2 text-gray-600 text-sm">Loading files...</span>
                        </div>
                    </div>
                ) : chatFiles.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        <div className="grid grid-cols-3 gap-2">
                            {chatFiles.map((chatFile) => {
                                const fileType = getFileTypeFromFile(chatFile.files);
                                const fileUrl = getFileUrl(chatFile.files);
                                const fileName = getFileName(chatFile.files);

                                if (!fileType || !fileUrl) return null;

                                return (
                                    <div
                                        key={chatFile.id}
                                        className="border rounded-lg p-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => openFile(fileUrl)}
                                    >
                                        {/* Image Preview */}
                                        {fileType === 'image' && (
                                            <div className="mb-2">
                                                <img
                                                    src={fileUrl}
                                                    className="w-full h-20 object-cover rounded-md"
                                                    alt="Shared image"
                                                />
                                            </div>
                                        )}

                                        {/* Video Preview */}
                                        {fileType === 'video' && (
                                            <div className="mb-2 relative">
                                                <video
                                                    src={fileUrl}
                                                    className="w-full h-20 object-cover rounded-md"
                                                    preload="metadata"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-md">
                                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}

                                        {/* File Info for Audio/Document without preview */}
                                        {(fileType === 'audio' || fileType === 'document') && (
                                            <div className="flex items-center justify-center mb-2">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${fileType === 'audio' ? 'bg-blue-100' : 'bg-gray-100'
                                                    }`}>
                                                    {fileType === 'audio' && (
                                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                                                        </svg>
                                                    )}
                                                    {fileType === 'document' && (
                                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* File Details */}
                                        <div className="text-center">
                                            <h6 className="text-xs font-medium text-gray-900 truncate mb-1">
                                                {fileName}
                                            </h6>
                                            <div className="text-xs text-gray-500">
                                                <div>{chatFile.senderType === 'EXPERT' ? 'You' : customer.name}</div>
                                                <div>{new Date(chatFile.timestamp).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-center text-gray-500 py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <p>No files shared yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerProfile;