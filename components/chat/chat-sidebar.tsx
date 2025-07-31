import React, { useState } from "react";
import { Search, MoreVertical } from "lucide-react";

const ChatSidebar = ({ customers, selectedRoom, onSelectCustomer }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentDropdownCustomer, setCurrentDropdownCustomer] = useState(null);
    const [filteredCustomers, setFilteredCustomers] = useState([]);

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

    const deleteChat = (customerId) => {
        // Implement delete chat functionality
        console.log("Delete chat for customer:", customerId);
        closeCurrentCustomerDropdown();
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
                    <div
                        key={customer.id}
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-gray-50 ${selectedRoom?.customerId === customer.id ? "bg-gray-100" : ""
                            }`}
                        onClick={() => onSelectCustomer(customer)}
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
                                {/* <p className="text-gray-500 text-xs truncate">{customer.lastMessage || "No messages yet"}</p> */}
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0 ml-2">
                            {customer.unreadCount > 0 && (
                                <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs text-center font-medium leading-5 mb-1.5 mr-3">
                                    {customer.unreadCount}
                                </span>
                            )}
                            <div className="inline-block text-left mb-0.5 relative">
                                <button
                                    onClick={(e) => toggleDropdown(e, customer)}
                                    className="flex items-center justify-center rounded-full bg-gray-50 text-center w-5 h-5 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {/* Dropdown */}
                                {isDropdownOpen && currentDropdownCustomer === customer && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <div className="py-1">
                                            <button
                                                onClick={() => deleteChat(customer.id)}
                                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-gray-400 text-nowrap block">
                                {/* {customer.lastMessageTime || "10:56 AM"} */}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatSidebar;