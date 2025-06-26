"use client";
import { useState, useEffect } from "react";

export default function BookRoom() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [unavailableRooms, setUnavailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [dateError, setDateError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(null);

  const allowedStartTime = "08:00";
  const allowedEndTime = "20:00";

  const isValidTime = (time) => time >= allowedStartTime && time <= allowedEndTime;

  const isPastDate = (selectedDate) => {
    const today = new Date();
    const inputDate = new Date(selectedDate);
    return inputDate < today.setHours(0, 0, 0, 0);
  };

  const isEndTimeValid = () => {
    return endTime >= startTime;
  };

  const checkAvailability = async () => {
    setTimeError("");
    setDateError("");

    if (!date) {
      setDateError("Please select a valid date.");
      return;
    }

    if (isPastDate(date)) {
      setDateError("You cannot book a room for a past date.");
      return;
    }

    if (startTime === endTime) {
      setTimeError("Start time and end time cannot be the same.");
      return;
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      setTimeError("Please select a time between 08:00 AM and 08:00 PM.");
      return;
    }

    if (!isEndTimeValid()) {
      setTimeError("End time must be after start time.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/bookings/check", {
      method: "POST",
      body: JSON.stringify({ date, startTime, endTime }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setAvailableRooms(data.availableRooms);
      setUnavailableRooms(data.unavailableRooms);
    } else {
      alert(data.error);
    }
  };

  useEffect(() => {
    if (startTime && endTime && date) {
      checkAvailability();
    }
  }, [startTime, endTime, date]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (startTime && endTime && date) {
        checkAvailability();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [startTime, endTime, date]);

  const handleBooking = async (roomId) => {
    if (!roomId) {
      alert("Error: RoomId is missing!");
      return;
    }

    if (isPastDate(date)) {
      alert("Error: You cannot book a room for a past date.");
      return;
    }

    if (startTime === endTime) {
      setTimeError("Start time and end time cannot be the same.");
      return;
    }

    setBookingLoading(roomId);
    const res = await fetch("/api/bookings/create", {
      method: "POST",
      body: JSON.stringify({ roomId, date, startTime, endTime }),
      headers: { "Content-Type": "application/json" },
    });

    setBookingLoading(null);

    if (res.ok) {
      alert("Booking confirmed!");
      setAvailableRooms([]);
      setUnavailableRooms([]);
    } else {
      const data = await res.json();
      alert(data.error || "Error booking the room.");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
  
    const [hours, minutes] = newStartTime.split(":");
    let startHours = parseInt(hours);
    let startMinutes = parseInt(minutes);
  
    let endMinutes = startMinutes + 30;
    let endHours = startHours;
  
    if (endMinutes >= 60) {
      endMinutes -= 60;
      endHours += 1;
    }
  
    const formattedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    
    if (!endTime || newStartTime !== startTime) {
      setEndTime(formattedEndTime);
    }
  };
      
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold text-gray-800 text-center mb-6">Book a Meeting Room</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 mb-6">
        <div className="flex flex-col">
          <label className="text-gray-600 font-medium">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            className="p-3 mt-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
        </div>
        <div className="flex flex-col">
          <label className="text-gray-600 font-medium">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={handleStartTimeChange}
            min={allowedStartTime}
            max={allowedEndTime}
            className={`p-3 mt-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              !isValidTime(startTime) && startTime !== "" ? "border-red-500" : ""
            }`}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-gray-600 font-medium">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            min={startTime}
            max={allowedEndTime}
            className={`p-3 mt-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              !isValidTime(endTime) && endTime !== "" ? "border-red-500" : ""
            }`}
          />
        </div>
      </div>

      {timeError && <p className="text-red-500 text-sm mb-4">{timeError}</p>}

      {availableRooms.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Available Rooms</h2>
          <div className="space-y-4">
            {availableRooms.map((room) => (
              <div
                key={room.RoomId}
                className="flex justify-between items-center bg-green-100 p-4 rounded-md shadow-md hover:bg-green-200"
              >
                <div>
                  <p className="text-xl font-medium text-gray-800">{room.name}</p>
                  <p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
                </div>
                <button
                  onClick={() => handleBooking(room.RoomId)}
                  disabled={bookingLoading === room.RoomId}
                  className={`bg-green-500 text-white px-4 py-2 rounded-md font-semibold ${
                    bookingLoading === room.RoomId
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-green-600"
                  }`}
                >
                  {bookingLoading === room.RoomId ? "Booking..." : "Book Now"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {unavailableRooms.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Unavailable Rooms</h2>
          <div className="space-y-4">
            {unavailableRooms.map((room) => (
              <div key={`unavailable-${room.RoomId}-${room.StartTime}-${room.EndTime}`} className="flex justify-between items-center bg-gray-300 p-4 rounded-md shadow-md">
                <div>
                  <p className="text-xl font-medium text-gray-800">{room.roomName}</p>
                  <p className="text-sm text-gray-600">Booked by: {room.bookedBy} ({room.email})</p>
                  <p className="text-sm text-gray-600">Time: {room.StartTime.slice(0, 5)} - {room.EndTime.slice(0, 5)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
