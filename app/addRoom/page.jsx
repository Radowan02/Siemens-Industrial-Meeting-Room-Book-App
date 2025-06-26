"use client";
import { useEffect, useState } from "react";

export default function ManageRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newRoom, setNewRoom] = useState({ name: "", capacity: "", start_time: "", end_time: "" });
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [updatedRoomData, setUpdatedRoomData] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch("/api/rooms/info");
                const data = await res.json();
                if (res.ok) {
                    setRooms(data.rooms);
                } else {
                    setError("Failed to fetch rooms");
                }
            } catch (error) {
                console.error("Failed to fetch rooms", error);
                setError("Failed to fetch rooms");
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const handleNewRoomChange = (e, field) => {
        setNewRoom((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleAddRoom = async () => {
        if (!newRoom.name || !newRoom.capacity || !newRoom.start_time || !newRoom.end_time) {
            alert("Please fill in all fields");
            return;
        }
        setIsAdding(true);
        try {
            const res = await fetch("/api/rooms/all", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRoom),
            });
            if (res.ok) {
                const addedRoom = await res.json();
                setRooms((prev) => [...prev, { id: addedRoom.roomId, ...newRoom }]);
                setNewRoom({ name: "", capacity: "", start_time: "", end_time: "" });
            } else {
                alert("Failed to add room.");
            }
        } catch (error) {
            console.error("Error adding room:", error);
            alert("An error occurred while adding the room.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleEdit = (room) => {
        setEditingRoomId(room.id);
        setUpdatedRoomData(room);
    };

    const handleUpdateChange = (e, field) => {
        setUpdatedRoomData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch("/api/rooms/all", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedRoomData),
            });
            if (res.ok) {
                setRooms((prev) =>
                    prev.map((room) => (room.id === updatedRoomData.id ? updatedRoomData : room))
                );
                setEditingRoomId(null);
            } else {
                alert("Failed to update room.");
            }
        } catch (error) {
            console.error("Error updating room:", error);
            alert("An error occurred while updating the room.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this room?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch("/api/rooms/all", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setRooms((prev) => prev.filter((room) => room.id !== id));
            } else {
                alert("Failed to delete room.");
            }
        } catch (error) {
            console.error("Error deleting room:", error);
            alert("An error occurred while deleting the room.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Manage Rooms</h2>
            <div className="p-6 bg-white shadow-lg rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Add New Room</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <input
                            type="text"
                            placeholder="Room Name"
                            value={newRoom.name}
                            onChange={(e) => handleNewRoomChange(e, "name")}
                            className="border px-4 py-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 transition duration-200"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Capacity"
                            value={newRoom.capacity}
                            onChange={(e) => handleNewRoomChange(e, "capacity")}
                            className="border px-4 py-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 transition duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="startTime" className="block text-gray-600 font-medium mb-1">Start Time</label>
                        <input
                            type="time"
                            placeholder="Select Start Time"
                            value={newRoom.start_time}
                            onChange={(e) => handleNewRoomChange(e, "start_time")}
                            className="border px-4 py-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 transition duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-gray-600 font-medium mb-1">End Time</label>
                        <input
                            type="time"
                            placeholder="Select End Time"
                            value={newRoom.end_time}
                            onChange={(e) => handleNewRoomChange(e, "end_time")}
                            className="border px-4 py-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 transition duration-200"
                        />
                    </div>
                </div>
                <button
                    onClick={handleAddRoom}
                    className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg w-full text-lg hover:bg-blue-700 transition duration-200"
                    disabled={isAdding}
                >
                    {isAdding ? "Adding..." : "Add Room"}
                </button>
            </div>
            {loading && <p className="text-center text-lg text-gray-600">Loading...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {rooms.length === 0 && !loading && !error && (
                <p className="text-center text-lg text-gray-500">No rooms available.</p>
            )}
            {rooms.map((room) => (
                <div
                    key={room.id}
                    className="p-6 bg-white shadow-lg rounded-lg mb-4 hover:shadow-xl transition duration-300"
                >
                    {editingRoomId === room.id ? (
                        <>
                            <input
                                type="text"
                                value={updatedRoomData.name}
                                onChange={(e) => handleUpdateChange(e, "name")}
                                className="border px-4 py-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 transition duration-200"
                            />
                            <input
                                type="text"
                                value={updatedRoomData.capacity}
                                onChange={(e) => handleUpdateChange(e, "capacity")}
                                className="border px-4 py-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 transition duration-200"
                            />
                            <input
                                type="time"
                                value={updatedRoomData.start_time}
                                onChange={(e) => handleUpdateChange(e, "start_time")}
                                className="border px-4 py-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 transition duration-200"
                            />
                            <input
                                type="time"
                                value={updatedRoomData.end_time}
                                onChange={(e) => handleUpdateChange(e, "end_time")}
                                className="border px-4 py-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 transition duration-200"
                            />
                            <button
                                onClick={handleUpdate}
                                className="bg-green-500 text-white px-6 py-2 rounded-lg mr-2 hover:bg-green-600 transition duration-200"
                            >
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-lg font-semibold text-gray-800">{room.name}</p>
                            <p className="text-gray-600">Capacity: {room.capacity} People</p>
                            <p className="text-gray-600">
                                Availability: {room.start_time.slice(0, 5)} - {room.end_time.slice(0, 5)}
                            </p>
                            <div className="mt-4">
                                <button
                                    onClick={() => handleEdit(room)}
                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg mr-2 hover:bg-blue-600 transition duration-200"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(room.id)}
                                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                                    disabled={isDeleting}
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
