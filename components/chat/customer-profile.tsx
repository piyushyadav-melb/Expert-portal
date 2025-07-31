import React, { useState } from "react";

const CustomerProfile = ({ customer }) => {
    const [showAllDocuments, setShowAllDocuments] = useState(false);

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const hasValidProfilePicture = (url) => {
        return url && url !== '' && url !== 'null' && url !== 'undefined';
    };

    const getFileIcon = (fileType) => {
        // You can add different icons based on file type
        const iconMap = {
            'pdf': '/assets/pdf-icon.svg',
            'doc': '/assets/doc-icon.svg',
            'docx': '/assets/doc-icon.svg',
            'xls': '/assets/excel-icon.svg',
            'xlsx': '/assets/excel-icon.svg',
            'txt': '/assets/txt-icon.svg',
            'default': '/assets/file-icon.svg'
        };

        return iconMap[fileType?.toLowerCase()] || iconMap.default;
    };

    const downloadFile = (fileUrl, fileName) => {
        // Implement file download functionality
        console.log("Download file:", fileName, fileUrl);
    };

    const viewAllDocuments = () => {
        setShowAllDocuments(!showAllDocuments);
    };

    // Mock data - replace with actual data from customer prop
    const recentDocuments = customer?.documents || [];

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
                <div className="flex w-full justify-between items-center mb-5">
                    <h4 className="font-semibold text-sm relative">
                        Media, links and Documents
                        <span className="block absolute w-10 h-0.5 rounded-full bg-red-400 mt-1"></span>
                    </h4>
                    {recentDocuments.length > 0 && (
                        <button
                            onClick={viewAllDocuments}
                            className="text-gray-500 text-xs font-medium underline hover:text-gray-800 transition-colors"
                        >
                            {showAllDocuments ? 'Show Less' : 'View All'}
                        </button>
                    )}
                </div>

                {/* Documents List */}
                {recentDocuments.length > 0 ? (
                    <div className="space-y-2">
                        {(showAllDocuments ? recentDocuments : recentDocuments.slice(0, 5)).map((doc, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-3 py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 rounded px-2 transition-colors"
                                onClick={() => downloadFile(doc.fileUrl, doc.fileName)}
                            >
                                <img
                                    src={getFileIcon(doc.fileType)}
                                    className="w-7 h-7 flex-shrink-0"
                                    alt="file-icon"
                                />

                                <div className="flex-1 min-w-0">
                                    <h6 className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</h6>
                                    <span className="text-xs text-gray-500">{doc.uploadDate}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-center text-gray-500 py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <p>No documents shared yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerProfile;