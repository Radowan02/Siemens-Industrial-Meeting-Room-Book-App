"use server"
import { createConnection } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const db = await createConnection();
    const { roomId, date, startTime, endTime } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token found" }, { status: 401 });
    }

    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT Verification Error:", err);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: No user ID found in token" }, { status: 401 });
    }

    const [existingBookings] = await db.query(
      `SELECT * FROM bookings
      WHERE RoomId = ? 
      AND BookingDate = ? 
      AND (
        (StartTime < ? AND EndTime > ?)
      )`,
      [roomId, date, endTime, startTime]
    );

    if (existingBookings.length > 0) {
      return NextResponse.json({ error: "The room is already booked during this time slot." }, { status: 400 });
    }

    await db.query(
      `INSERT INTO bookings (RoomId, UserId, BookingDate, StartTime, EndTime) VALUES (?, ?, ?, ?, ?)`,
      [roomId, userId, date, startTime, endTime]
    );

    return NextResponse.json({ message: "Booking confirmed!" }, { status: 200 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Error creating booking" }, { status: 500 });
  }
}