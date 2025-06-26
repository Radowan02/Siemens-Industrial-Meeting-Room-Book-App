"use server"
import { createConnection } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function PUT(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
                
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }
        
        const { bookingId, endTime } = await req.json();

        if (!bookingId || !endTime) {
            return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
        }

        const db = await createConnection();

        const [result] = await db.query(
            "UPDATE bookings SET EndTime = ? WHERE BookingId = ?",
            [endTime, bookingId]
        );

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ message: "Booking not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: "Booking updated successfully" }), { status: 200 });
    } catch (error) {
        console.error("Database error:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}
