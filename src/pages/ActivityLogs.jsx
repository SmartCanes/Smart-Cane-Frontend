import { useState } from "react";
import { Icon } from "@iconify/react";

// Dummy data for Activity Logs
const activityLogs = [
    {
        id: 1,
        guardian: {
            name: "John Smith",
            avatar: "https://i.pravatar.cc/150?u=john",
        },
        device: "SC-136901",
        vipName: "Mary Smith",
        activity: "Walk to Park",
        location: "Home (123 Main St)",
        destination: "Central Park",
        duration: "45 mins",
        dateTime: "Today at 2:45 PM",
        status: "Completed",
    },
    {
        id: 2,
        guardian: {
            name: "Sarah Johnson",
            avatar: "https://i.pravatar.cc/150?u=sarah",
        },
        device: "SC-136902",
        vipName: "Robert Johnson",
        activity: "Grocery Shopping",
        location: "Home",
        destination: "Whole Foods",
        duration: "1 hr 15 mins",
        dateTime: "Today at 10:30 AM",
        status: "Completed",
    },
    {
        id: 3,
        guardian: {
            name: "Emily Davis",
            avatar: "https://i.pravatar.cc/150?u=emily",
        },
        device: "SC-136903",
        vipName: "William Davis",
        activity: "Daily Walk",
        location: "Home",
        destination: "Neighborhood Loop",
        duration: "20 mins",
        dateTime: "Yesterday at 4:00 PM",
        status: "Completed",
    },
    {
        id: 4,
        guardian: {
            name: "Robert Wilson",
            avatar: "https://i.pravatar.cc/150?u=robert",
        },
        device: "SC-136904",
        vipName: "Patricia Wilson",
        activity: "Doctor Appointment",
        location: "Clinic",
        destination: "Home",
        duration: "30 mins",
        dateTime: "Yesterday at 1:15 PM",
        status: "Completed",
    },
    {
        id: 5,
        guardian: {
            name: "John Smith",
            avatar: "https://i.pravatar.cc/150?u=john",
        },
        device: "SC-136905",
        vipName: "Mary Smith",
        activity: "Morning Walk",
        location: "Home",
        destination: "Local Cafe",
        duration: "15 mins",
        dateTime: "Oct 24, 2023 at 8:00 AM",
        status: "Ongoing",
    },
];

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case "completed":
            return "bg-green-100 text-green-700";
        case "ongoing":
            return "bg-blue-100 text-blue-700";
        case "cancelled":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const ActivityLogs = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredLogs = activityLogs.filter(
        (log) =>
            log.guardian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.vipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.device.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredLogs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1; // Prevent 0 Total Pages

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getVisiblePages = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, "...", totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(
                    1,
                    "...",
                    totalPages - 4,
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages
                );
            } else {
                pages.push(
                    1,
                    "...",
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    "...",
                    totalPages
                );
            }
        }
        return pages;
    };

    return (
        <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
            <div className="w-full font-poppins max-w-5xl mx-auto space-y-6 sm:space-y-8 md:max-w-none md:mx-0 md:pr-6">
                {/* Header Section */}
                <div className="mb-4 md:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-nowrap">
                        Activity Logs
                    </h2>
                    <p className="text-gray-500 text-xs md:text-sm">
                        Monitor and track detailed VIP movement and activity history.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-t-2xl p-4 md:p-6 border-b border-gray-100 shadow-sm">
                    <div className="relative max-w-xl">
                        <Icon
                            icon="ph:magnifying-glass"
                            className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl"
                        />
                        <input
                            type="text"
                            placeholder="Search by guardian, VIP, activity, or device..."
                            className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-600 placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {totalItems === 0 ? (
                    // EMPTY STATE / "Nothing to see here" TAB
                    <div className="bg-white rounded-b-2xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Icon icon="ph:files" className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#11285A] mb-1">
                            Nothing to see here
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            We couldn't find any activities matching "{searchTerm}". Try
                            adjusting your search or filters.
                        </p>
                        <button
                            onClick={() => setSearchTerm("")}
                            className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white rounded-b-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Guardian
                                            </th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                VIP Name
                                            </th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Device
                                            </th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Activity
                                            </th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Locations
                                            </th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredLogs.map((log) => (
                                            <tr
                                                key={log.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            loading="lazy"
                                                            src={log.guardian.avatar}
                                                            alt={log.guardian.name}
                                                            className="w-8 h-8 rounded-full object-cover bg-gray-200"
                                                        />
                                                        <p className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                                                            {log.guardian.name}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                                        {log.vipName}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                                                        {log.device}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="text-sm text-gray-700 font-medium">
                                                        {log.activity}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <div className="flex items-center gap-1.5 text-gray-600 truncate max-w-[200px]">
                                                            <Icon icon="ph:map-pin-line" className="text-blue-500 shrink-0" />
                                                            <span className="truncate" title={log.location}>{log.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-600 truncate max-w-[200px]">
                                                            <Icon icon="ph:flag-checkered" className="text-green-500 shrink-0" />
                                                            <span className="truncate" title={log.destination}>{log.destination}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <p className="text-sm text-gray-800 whitespace-nowrap">
                                                            {log.dateTime}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-medium">
                                                            {log.duration}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                            log.status
                                                        )}`}
                                                    >
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile / Tablet Card View */}
                        <div className="lg:hidden bg-white rounded-b-2xl shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {filteredLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Header: VIP, Device & Status */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-bold text-gray-900">{log.vipName}</p>
                                                <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-100 rounded-lg">
                                                    {log.device}
                                                </span>
                                            </div>
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                    log.status
                                                )}`}
                                            >
                                                {log.status}
                                            </span>
                                        </div>

                                        {/* Activity Content */}
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4">
                                            <div className="flex items-center gap-2 mb-2 text-[#11285A] font-semibold text-sm">
                                                <Icon icon="ph:activity-light" className="text-lg" />
                                                {log.activity}
                                            </div>

                                            <div className="flex flex-col gap-2 relative pl-2">
                                                {/* Connecting Line */}
                                                <div className="absolute left-[13px] top-[14px] bottom-[14px] w-px bg-gray-300"></div>

                                                <div className="flex items-start gap-2 text-xs">
                                                    <div className="shrink-0 mt-0.5 relative z-10 w-4 h-4 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-gray-500 block text-[10px] uppercase font-semibold">Origin</span>
                                                        <span className="text-gray-700 truncate block">{log.location}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2 text-xs">
                                                    <div className="shrink-0 mt-0.5 relative z-10 w-4 h-4 rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-gray-500 block text-[10px] uppercase font-semibold">Destination</span>
                                                        <span className="text-gray-700 truncate block">{log.destination}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer: Guardian & Time */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    loading="lazy"
                                                    src={log.guardian.avatar}
                                                    alt={log.guardian.name}
                                                    className="w-6 h-6 rounded-full object-cover bg-gray-200"
                                                />
                                                <span className="text-xs font-medium text-gray-600">
                                                    {log.guardian.name}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-800 font-medium">
                                                    {log.dateTime}
                                                </p>
                                                <p className="text-[10px] text-gray-500 inline-flex items-center gap-1">
                                                    <Icon icon="ph:clock" /> {log.duration}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination Footer */}
                        <div className="bg-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 rounded-b-2xl">
                            <p className="text-xs sm:text-sm text-gray-500">
                                Showing{" "}
                                {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
                                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                                {totalItems.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Icon icon="ph:caret-left" />
                                </button>

                                {getVisiblePages().map((page, index) =>
                                    typeof page === "number" ? (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs sm:text-sm transition-colors ${currentPage === page
                                                ? "bg-[#11285A] text-white"
                                                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ) : (
                                        <span
                                            key={index}
                                            className="text-gray-400 text-xs sm:text-sm px-0.5 sm:px-1"
                                        >
                                            ...
                                        </span>
                                    )
                                )}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Icon icon="ph:caret-right" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
};

export default ActivityLogs;
