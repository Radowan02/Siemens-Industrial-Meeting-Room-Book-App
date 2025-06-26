"use client";
import { useEffect, useState } from "react";

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch("/api/bookings/my");
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
    

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Upcoming Bookings</h2>

            {loading && (
                <div className="text-center text-gray-500">Loading your bookings...</div>
            )}

            {error && (
                <div className="text-center text-red-500">{error}</div>
            )}

            {bookings.length === 0 && !loading && !error && (
                <div className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-center">
                            <p className="text-xl font-semibold text-gray-600">No upcoming bookings found</p>
                        </div>
                </div>
            )}

            <div className="space-y-4">
                {bookings.map((booking) => (
                    <div
                        key={booking.BookingId}
                        className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-all duration-300"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xl font-semibold text-gray-800">{booking.roomName}</h3>
                            <span className="text-sm text-gray-500">Booking ID: {booking.BookingId}</span>
                        </div>
                        <p className="text-gray-600">
                            <strong>Date:</strong> {formatDate(booking.BookingDate)}
                        </p>
                        <p className="text-gray-600">
                            <strong>Time:</strong> {formatTime(booking.StartTime)} - {formatTime(booking.EndTime)}
                        </p>

                        <div className="flex justify-between items-center mt-4">
                            <button
                                onClick={() => cancelBooking(booking.BookingId)}
                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200"
                            >
                                Cancel Booking
                            </button>
                            <div className="text-sm text-gray-500 italic">
                                <span>Booked by: {booking.bookedBy}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
