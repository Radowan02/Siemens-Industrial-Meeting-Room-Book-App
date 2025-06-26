"use server";
import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
    try {
        const currentDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");

        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }

        const db = await createConnection();

        const [completedBookings] = await db.query(
            `SELECT 
                b.BookingId, 
                COALESCE(r.name, "Room doesn't exist") AS RoomName, 
                b.BookingDate, 
                COALESCE(e.name, "Employee doesn't exist") AS EmployeeName, 
                b.StartTime, 
                b.EndTime 
            FROM bookings b
            LEFT JOIN employees e ON b.UserId = e.id
            LEFT JOIN rooms r ON b.RoomId = r.id
            WHERE CONCAT(b.BookingDate, ' ', b.EndTime) < ?
            ORDER BY b.BookingDate DESC`,
            [currentDateTime]
        );

        return NextResponse.json({ completedBookings });
    } catch (error) {
        console.error("Error fetching completed bookings:", error);
        return NextResponse.json({ error: "Failed to fetch completed bookings" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }

        const db = await createConnection();
        const { year } = await request.json();

        const [monthlyBookings] = await db.query(
            `SELECT 
                MONTH(b.BookingDate) AS month, 
                COALESCE(r.name, "Room doesn't exist") AS RoomName, 
                COUNT(*) AS count
            FROM bookings b
            LEFT JOIN rooms r ON b.RoomId = r.id
            WHERE YEAR(b.BookingDate) = ? 
            AND CONCAT(b.BookingDate, ' ', b.EndTime) < NOW()
            GROUP BY month, RoomName
            ORDER BY month ASC, RoomName ASC`,
            [year]
        );

        return NextResponse.json({ monthlyBookings });
    } catch (error) {
        console.error("Error fetching monthly room bookings:", error);
        return NextResponse.json({ error: "Failed to fetch monthly room bookings" }, { status: 500 });
    }
}
