"use client";
import { useEffect, useState, useContext } from "react";
import { useAuth } from "@/context/AuthContext";

export default function RoomsPage() {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch("/api/rooms/info"); 
                if (!response.ok) {
                    throw new Error("Failed to fetch rooms");
                }
                const data = await response.json();
                setRooms(data.rooms || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);

        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {currentUser ? (
                <h1 className="text-2xl font-semibold text-center my-6">
                    Hi, {currentUser.name}!
                </h1>
            ) : (
                <h1 className="text-2xl font-semibold text-center my-6">
                    Hi, Guest!
                </h1>
            )}

            <h2 className="text-xl font-semibold text-center my-6">Available Meeting Rooms</h2>

            {rooms.length === 0 ? (
                <p>No rooms available.</p>
            ) : (
                rooms.map((room) => (
                    <div
                        key={room.id}
                        className="bg-white shadow-md rounded-lg p-4 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all hover:shadow-xl hover:scale-105"
                    >
                        <div className="flex flex-col sm:flex-row sm:space-x-4">
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold">{room.name}</h4>
                                <h4 className="font-sm-semibold text-black-800">Capacity: {room.capacity}</h4>
                                <div className="flex flex-col sm:flex-row sm:space-x-4">
                                    <h4 className="font-sm-semibold text-black-800">Availability:</h4>
                                    <span className="text-gray-700">
                                        {formatTime(room.start_time)} - {formatTime(room.end_time)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}