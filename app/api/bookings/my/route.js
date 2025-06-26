"use server"
import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);

    const db = await createConnection();

    const [bookings] = await db.query(
      `SELECT b.BookingId, r.name AS roomName, b.BookingDate, e.name AS bookedBy, 
          b.StartTime, b.EndTime 
      FROM bookings b
      JOIN employees e ON b.UserId = e.id
      JOIN rooms r ON b.RoomId = r.id
      WHERE b.UserId = ? 
      AND CONCAT(b.BookingDate, ' ', b.StartTime) >= NOW() - INTERVAL 30 MINUTE
      ORDER BY b.BookingDate ASC, b.StartTime ASC`,
      [user.id]
);

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    return NextResponse.json({ error: "Error fetching bookings" }, { status: 500 });
  }
}
