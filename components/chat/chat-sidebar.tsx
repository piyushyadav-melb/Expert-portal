import React, { useState } from "react";
import { Search, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { deleteChat } from "@/service/chat.service";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks";

const ChatSidebar = ({ customers, selectedRoom, onSelectCustomer, onChatDeleted, expertId }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentDropdownCustomer, setCurrentDropdownCustomer] = useState(null);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [deletingCustomerId, setDeletingCustomerId] = useState(null);

    const dispatch = useAppDispatch();

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const hasValidProfilePicture = (url) => {
        return url && url !== '' && url !== 'null' && url !== 'undefined';
    };

    const onSearch = () => {
        if (searchQuery.trim()) {
            const filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers([]);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setFilteredCustomers([]);
    };

    const selectUser = (customer) => {
        onSelectCustomer(customer);
        clearSearch();
    };

    const handleCustomerSelect = (customer) => {
        // Only handle selection, no deletion logic here
        onSelectCustomer(customer);
    };

    const toggleDropdown = (event, customer) => {
        event.stopPropagation();
        if (currentDropdownCustomer === customer && isDropdownOpen) {
            setIsDropdownOpen(false);
            setCurrentDropdownCustomer(null);
        } else {
            setCurrentDropdownCustomer(customer);
            setIsDropdownOpen(true);
        }
    };

    const closeCurrentCustomerDropdown = () => {
        setIsDropdownOpen(false);
        setCurrentDropdownCustomer(null);
    };

    const handleDeleteChat = async (customerId, event) => {
        // Stop event propagation to prevent customer selection
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!expertId) {
            toast.error("Expert ID is required to delete chat");
            return;
        }

        // Show confirmation first
        const confirmed = window.confirm("Are you sure you want to delete this chat? This action cannot be undone.");
        if (!confirmed) {
            closeCurrentCustomerDropdown();
            return;
        }

        try {
            // Set deleting states to prevent any interactions
            setDeletingCustomerId(customerId);
            closeCurrentCustomerDropdown();

            // Clear chat selection IMMEDIATELY to prevent race conditions
            if (onChatDeleted) {
                onChatDeleted(customerId);
            }

            // Make the API call
            await deleteChat(expertId, customerId);

            toast.success("Chat deleted successfully");

        } catch (error) {
            console.error("Failed to delete chat:", error);
            toast.error("Failed to delete chat. Please try again.");
        } finally {
            // Always reset the states
            setDeletingCustomerId(null);
        }
    };

    return (
        <div className="w-full bg-white border border-gray-200 p-4 lg:mt-6 rounded-xl overflow-y-auto h-[calc(90vh-100px)]">
            <div className="block items-center justify-between mb-4">
                <div className="flex justify-between">
                    <h5 className="font-semibold mb-5 text-lg">Chats</h5>
                </div>

                {/* Search Bar */}
                <div className="relative w-full">
                    <div className="inline-flex w-full relative items-center bg-gray-50 rounded-full overflow-hidden mb-2">
                        <button className="absolute left-3 text-gray-400">
                            <Search className="w-5 h-5" />
                        </button>
                        <div className="overflow-hidden w-full">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    onSearch();
                                }}
                                className="py-3 px-12 bg-gray-50 w-full placeholder:text-gray-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Search Dropdown */}
                    {searchQuery && filteredCustomers.length > 0 && (
                        <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredCustomers.map((customer) => (
                                <li
                                    key={customer.id}
                                    className="border-b last:border-b-0 flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => selectUser(customer)}
                                >
                                    <div className="relative mr-3 flex-shrink-0">
                                        <div className="relative w-8 h-8">
                                            {hasValidProfilePicture(customer.profile_picture_url) ? (
                                                <img
                                                    src={customer.profile_picture_url}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                    alt="Customer"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                                    {getInitials(customer.name)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium text-gray-900 block truncate">{customer.name}</span>
                                        {customer.email && (
                                            <span className="text-xs text-gray-500 block truncate">{customer.email}</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Customer List */}
            <div className="overflow-y-auto">
                {customers.map((customer) => (
                    <div key={customer.id} className="relative group">
                        {/* Main Customer Row - Only handles selection */}
                        <div
                            className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${selectedRoom?.customerId === customer.id ? "bg-gray-100" : ""
                                } ${deletingCustomerId === customer.id ? 'opacity-50 pointer-events-none' : ''
                                }`}
                            onClick={() => handleCustomerSelect(customer)}
                        >
                            <div className="flex items-center flex-1 min-w-0">
                                <div className="relative mr-3 flex-shrink-0">
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
                                    {/* Online indicator */}
                                    {customer.is_online && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h6 className="text-sm font-semibold text-gray-900 truncate">{customer.name}</h6>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Unread Count */}
                                {customer.unreadCount > 0 && (
                                    <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs text-center font-medium leading-5">
                                        {customer.unreadCount}
                                    </span>
                                )}

                                {/* Time */}
                                <span className="text-xs text-gray-400 text-nowrap">
                                    {/* {customer.lastMessageTime || "10:56 AM"} */}
                                </span>
                            </div>
                        </div>

                        {/* Delete Button - Separate from selection area */}
                        <div className="absolute top-2 right-2 z-10">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleDropdown(e, customer);
                                }}
                                disabled={deletingCustomerId === customer.id}
                                className={`flex items-center justify-center rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-center w-6 h-6 text-sm text-gray-500 hover:text-gray-700 focus:outline-none shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${deletingCustomerId === customer.id ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown */}
                            {isDropdownOpen && currentDropdownCustomer === customer && (
                                <div className="origin-top-right absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                                    <div className="py-1">
                                        <button
                                            onClick={(e) => handleDeleteChat(customer.id, e)}
                                            disabled={deletingCustomerId === customer.id}
                                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deletingCustomerId === customer.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatSidebar;