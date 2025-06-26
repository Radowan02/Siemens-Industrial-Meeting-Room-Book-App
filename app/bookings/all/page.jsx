"use client";
import { useEffect, useState } from "react";

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [newEndTime, setNewEndTime] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch("/api/bookings/all");
                const data = await res.json();
                if (res.ok) {
                    setBookings(data.bookings || []);
                } else {
                    setError("Failed to fetch bookings");
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error);
                setError("Failed to fetch bookings");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timeString) => {
        return timeString.slice(0, 5);
    };

    const cancelBooking = async (bookingId) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            const res = await fetch("/api/bookings/cancel", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId }),
            });

            if (res.ok) {
                setBookings((prev) => prev.filter((b) => b.BookingId !== bookingId));
            } else {
                alert("Failed to cancel booking.");
            }
        } catch (error) {
            console.error("Error canceling booking:", error);
            alert("An error occurred while canceling the booking.");
        }
    };

    const openEditModal = (booking) => {
        setEditingBooking(booking);
        setNewEndTime(formatTime(booking.EndTime));
    };

    const closeEditModal = () => {
        setEditingBooking(null);
    };

    const handleEndTimeChange = (e) => {
        const selectedTime = e.target.value;

        if (!selectedTime) {
            setNewEndTime(null);
            return;
        }

        setNewEndTime(selectedTime);
    };

    const updateBooking = async () => {
        if (!editingBooking) return;

        const startTime = formatTime(editingBooking.StartTime);
        const currentEndTime = formatTime(editingBooking.EndTime);

        const convertToMinutes = (timeString) => {
            const [hours, minutes] = timeString.split(":").map(Number);
            return hours * 60 + minutes;
        };

        const startTimeInMinutes = convertToMinutes(startTime);
        const currentEndTimeInMinutes = convertToMinutes(currentEndTime);
        const selectedEndTimeInMinutes = convertToMinutes(newEndTime);

        if (newEndTime === null || newEndTime === "") {
            alert("End time cannot be empty.");
            return;
        }

        if (selectedEndTimeInMinutes > currentEndTimeInMinutes) {
            alert("You can only decrease the End Time.");
            return;
        }

        if (selectedEndTimeInMinutes < startTimeInMinutes) {
            alert("End time cannot be earlier than the start time.");
            return;
        }

        try {
            const res = await fetch("/api/bookings/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: editingBooking.BookingId,
                    endTime: newEndTime,
                }),
            });

            if (res.ok) {
                setBookings((prev) =>
                    prev.map((b) =>
                        b.BookingId === editingBooking.BookingId
                            ? { ...b, EndTime: `${newEndTime}:00` }
                            : b
                    )
                );
                closeEditModal();
            } else {
                alert("Failed to update booking.");
            }
        } catch (error) {
            console.error("Error updating booking:", error);
            alert("An error occurred while updating the booking.");
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredBookings = bookings.filter((booking) =>
        booking.BookingId.toString().includes(searchQuery)
    );

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">All Upcoming Bookings</h2>
            <div className="mb-6 text-center">
                <div className="relative w-full sm:w-1/2 md:w-1/3 mx-auto">
                    <input
                        type="text"
                        placeholder="Search by Booking ID"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="border border-gray-300 rounded-lg p-3 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 4a7 7 0 110 14 7 7 0 010-14zm0 0v2m0 12v2m8-8h2m-2 0h-2m-12 0H3m2 0h2m8-2h2m2 0h2"
                        />
                    </svg>
                </div>
            </div>
            {loading && <div className="text-center text-gray-500">Loading your bookings...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {filteredBookings.length === 0 && !loading && !error && (
                <div className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-center">
                            <p className="text-xl font-semibold text-gray-600">No upcoming bookings found</p>
                        </div>
                </div>
            )}

            <div className="space-y-4">
                {filteredBookings.map((booking) => (
                    <div key={booking.BookingId} className="p-6 bg-white shadow-lg rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xl font-semibold text-gray-800">{booking.roomName}</h3>
                            <span className="text-sm text-gray-500">Booking ID: {booking.BookingId}</span>
                        </div>
                        <p className="text-gray-600"><strong>Date:</strong> {formatDate(booking.BookingDate)}</p>
                        <p className="text-gray-600"><strong>Time:</strong> {formatTime(booking.StartTime)} - {formatTime(booking.EndTime)}</p>
                        <div className="text-sm text-gray-500 italic mt-2">
                            <span>Booked by: {booking.bookedBy}</span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <button onClick={() => cancelBooking(booking.BookingId)} className="bg-red-600 text-white py-2 px-4 rounded-lg">
                                Cancel Booking
                            </button>
                            <button onClick={() => openEditModal(booking)} className="bg-blue-600 text-white py-2 px-4 rounded-lg">
                                Update Booking
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {editingBooking && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Update Booking</h3>
                        <div className="space-y-2">
                            <p className="text-gray-700"><strong>Room:</strong> {editingBooking.roomName}</p>
                            <p className="text-gray-700"><strong>Booking ID:</strong> {editingBooking.BookingId}</p>
                            <p className="text-gray-700"><strong>Date:</strong> {formatDate(editingBooking.BookingDate)}</p>
                            <p className="text-gray-700"><strong>Start Time:</strong> {formatTime(editingBooking.StartTime)}</p>
                            <p className="text-gray-700"><strong>End Time:</strong> {formatTime(editingBooking.EndTime)}</p>
                            <p className="text-sm text-gray-500 italic"><strong>Booked by:</strong> {editingBooking.bookedBy}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">New End Time:</label>
                            <input
                                type="time"
                                value={newEndTime}
                                onChange={handleEndTimeChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={closeEditModal}
                                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateBooking}
                                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
