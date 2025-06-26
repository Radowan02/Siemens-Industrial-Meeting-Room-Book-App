"use server"
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createConnection } from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }

        const db = await createConnection();

        const [bookings] = await db.query(
            `SELECT b.BookingId, r.name AS roomName, b.BookingDate, e.name AS bookedBy,
                b.StartTime, b.EndTime 
            FROM bookings b
            JOIN employees e ON b.UserId = e.id
            JOIN rooms r ON b.RoomId = r.id
            WHERE CONCAT(b.BookingDate, ' ', b.EndTime) >= NOW()
            ORDER BY b.BookingDate ASC, b.StartTime ASC`
        );

        return NextResponse.json({ bookings }, { status: 200 });
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}

