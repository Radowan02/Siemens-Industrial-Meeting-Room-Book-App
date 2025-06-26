"use server"
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createConnection } from "@/lib/db";

export async function DELETE(req) {
    try {
        const { bookingId } = await req.json();

        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const isAdmin = decoded.role === "admin";

        const db = await createConnection();

        let result;
        if (isAdmin) {
            [result] = await db.query("DELETE FROM bookings WHERE BookingId = ?", [bookingId]);
        } else {
            [result] = await db.query("DELETE FROM bookings WHERE BookingId = ? AND UserId = ?", [bookingId, userId]);
        }

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Booking not found or not authorized" }, { status: 403 });
        }

        return NextResponse.json({ message: "Booking canceled successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error canceling booking:", error);
        return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }
}
