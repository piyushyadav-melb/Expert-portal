import React, { useState, useEffect } from "react";
import ChatSidebar from "./chat-sidebar";
import ChatBox from "./chat-box";
import CustomerProfile from "./customer-profile";
import { createOrGetChatRoom, getChatHistory, getChattedCustomers } from "@/service/chat.service";
import { useSocket } from "@/config/use-socket";
import { fetchProfile } from "@/service/profile.service";
import { useAppSelector } from "@/hooks";
import { useSearchParams } from "next/navigation";

const Chat: React.FC = () => {
    const [customers, setCustomers] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expertId, setExpertId] = useState(null);
    const socket = useSocket();

    const searchParams = useSearchParams();
    const customerId = searchParams.get('customerId');

    useEffect(() => {
        // Fetch customers and chat rooms on mount
        setIsLoading(true);
        getChattedCustomers().then(setCustomers).finally(() => setIsLoading(false));
        // getChatRooms().then(setChatRooms);
        const loadProfile = async () => {
            const response: any = await fetchProfile();
            setExpertId(response.data.id);
        };
        loadProfile();

    }, []);

    useEffect(() => {
        // Fetch customers and chat rooms on mount
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const customersData = await getChattedCustomers();
                setCustomers(customersData);

                // Load expert profile
                const response: any = await fetchProfile();
                setExpertId(response.data.id);

                // Check if there's a customerId in URL params
                const customerId = searchParams.get('customerId');
                if (customerId) {
                    // Find customer in the fetched data
                    const targetCustomer = customersData.find(customer => customer.id === customerId);
                    if (targetCustomer) {
                        // Automatically select this customer
                        await handleSelectCustomer(targetCustomer);
                    } else {
                        // If customer not found in chatted customers, fetch customer data and create chat room
                        try {
                            const room = await createOrGetChatRoom(customerId);
                            setChatRooms(prev => [...prev, room]);
                            setSelectedRoom(room);
                            if (room.customer) {
                                setCustomer(room.customer);
                                const history = await getChatHistory(room.id);
                                setMessages(history);
                            }
                        } catch (error) {
                            console.error('Error creating chat room for customer:', customerId, error);
                            // Could add user notification here if needed
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching customers:', error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    // Listen for global user status changes
    useEffect(() => {
        if (!socket) return;

        const handleUserStatusChanged = (data: { userId: string; isOnline: boolean }) => {
            console.log("Global user status changed:", data);

            // Update the customers array with the new status
            setCustomers(prevCustomers =>
                prevCustomers.map(customer =>
                    customer.id === data.userId
                        ? {
                            ...customer,
                            is_online: data.isOnline,
                            last_seen: data.isOnline ? customer.last_seen : new Date().toISOString()
                        }
                        : customer
                )
            );

            // Also update the selected customer if it matches
            if (customer?.id === data.userId) {
                setCustomer(prev => prev ? {
                    ...prev,
                    is_online: data.isOnline,
                    last_seen: data.isOnline ? prev.last_seen : new Date().toISOString()
                } : prev);
            }
        };

        socket.on("userStatusChanged", handleUserStatusChanged);

        return () => {
            socket.off("userStatusChanged");
        };
    }, [socket, customer?.id]);

    const handleSelectCustomer = async (customer) => {
        // Find or create chat room for this customer
        let room = chatRooms.find(r => r.customerId === customer.id);
        if (!room) {
            room = await createOrGetChatRoom(customer.id);
            setChatRooms(prev => [...prev, room]);
        }
        setSelectedRoom(room);
        setCustomer(customer);
        getChatHistory(room.id).then(setMessages);
    };

    const handleChatDeleted = (deletedCustomerId: string) => {

        // This prevents any race conditions
        if (customer?.id === deletedCustomerId) {
            setSelectedRoom(null);
            setCustomer(null);
            setMessages([]);
            console.log("Cleared selected chat for deleted customer");
        }

        // Remove the customer from the customers list
        setCustomers(prevCustomers => {
            const updatedCustomers = prevCustomers.filter(customer => customer.id !== deletedCustomerId);
            console.log("Updated customers list, removed:", deletedCustomerId);
            return updatedCustomers;
        });

        // Remove the chat room from the chat rooms list
        setChatRooms(prevRooms => {
            const updatedRooms = prevRooms.filter(room => room.customerId !== deletedCustomerId);
            console.log("Updated chat rooms list, removed room for customer:", deletedCustomerId);
            return updatedRooms;
        });
    };

    return (
        isLoading ? (
            <div className="flex justify-center items-center min-h-[calc(90vh-100px)]">
                <div className="flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                </div>
            </div>
        ) : (
            <div className="mx-auto sm:px-5 sm:mt-8  px-4 pb-5 bg-gray-100 min-h-[calc(90vh-100px)]">
                <div className="lg:flex gap-4 lg:gap-0">
                    {/* Chat Sidebar */}
                    <div className="w-full md:flex-1 order-2 md:order-1">
                        <ChatSidebar
                            customers={customers}
                            selectedRoom={selectedRoom}
                            onSelectCustomer={handleSelectCustomer}
                            onChatDeleted={handleChatDeleted}
                            expertId={expertId}

                        />
                    </div>

                    {/* Chat Box */}
                    <div className="w-full md:w-96 lg:w-[500px] xl:w-[600px] flex-shrink-0 order-1 md:order-2 min-h-0">
                        <ChatBox
                            roomId={selectedRoom?.id}
                            customer={customer}
                        />
                    </div>

                    {/* Customer Profile */}
                    <div className="w-full md:flex-1 lg:block order-3">
                        <CustomerProfile customer={customer} chatRoomId={selectedRoom?.id} />
                    </div>
                </div>
            </div>
        ));
};

export default Chat;