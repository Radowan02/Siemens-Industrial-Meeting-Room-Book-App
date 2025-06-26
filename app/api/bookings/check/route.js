"use server"
import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const db = await createConnection();
    const { date, startTime, endTime } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const [rooms] = await db.query("SELECT * FROM rooms");

    const [bookedRooms] = await db.query(
      `SELECT b.RoomId, b.StartTime, b.EndTime, e.name AS bookedBy, e.email, r.name AS roomName
       FROM bookings b
       JOIN employees e ON b.UserId = e.id
       JOIN rooms r ON b.RoomId = r.id
       WHERE b.BookingDate = ? 
       AND (
         (b.StartTime < ? AND b.EndTime > ?)
       )`,
      [date, endTime, startTime]
    );

    const bookedRoomIds = bookedRooms.map((b) => b.RoomId);
    const availableRooms = rooms.filter((room) => !bookedRoomIds.includes(room.id)).map((room) => ({RoomId: room.id, name: room.name, capacity: room.capacity,}));

    const unavailableRooms = bookedRooms;

    return NextResponse.json({ availableRooms, unavailableRooms }, { status: 200 });
  } catch (error) {
    console.error("Error fetching rooms:", error); 
    return NextResponse.json({ error: "Error fetching rooms" }, { status: 500 });
  }
}
