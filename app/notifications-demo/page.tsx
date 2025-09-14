"use client";
import React from "react";
import { NotificationTest } from "@/components/notifications";

const NotificationsDemoPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Notification System Demo
                    </h1>

                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                🎉 Popup Notifications with Sound
                            </h2>
                            <p className="text-blue-700 dark:text-blue-300">
                                Click the buttons below to test different types of popup notifications.
                                Each notification will appear as a popup in the top-right corner with an alert sound.
                            </p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <h3 className="text-md font-semibold text-green-900 dark:text-green-100 mb-2">
                                Features:
                            </h3>
                            <ul className="text-green-700 dark:text-green-300 space-y-1">
                                <li>• <strong>Popup Display:</strong> Notifications appear as animated popups</li>
                                <li>• <strong>Alert Sound:</strong> Each notification plays a sound alert</li>
                                <li>• <strong>Sender Information:</strong> Shows sender name and message content</li>
                                <li>• <strong>Auto-close:</strong> Popups automatically close after 8 seconds</li>
                                <li>• <strong>Click to Navigate:</strong> Click popup to go to relevant page</li>
                                <li>• <strong>Multiple Popups:</strong> Up to 3 popups can be shown simultaneously</li>
                                <li>• <strong>Progress Bar:</strong> Visual countdown until auto-close</li>
                            </ul>
                        </div>

                        <NotificationTest />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsDemoPage;
