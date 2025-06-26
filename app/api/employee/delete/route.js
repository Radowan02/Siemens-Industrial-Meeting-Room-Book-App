"use server"
import { createConnection } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(req) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
    if (decoded.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const db = await createConnection();
    const { id } = await req.json();

    // Check if the employee exists
    const [employee] = await db.query("SELECT * FROM employees WHERE id = ?", [id]);
    if (employee.length === 0) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Step 1: Delete upcoming bookings associated with the employee
    const currentTime = new Date();
    const [bookings] = await db.query(
        `SELECT * FROM bookings 
        WHERE UserId = ? 
        AND (CONCAT(BookingDate, ' ', EndTime)) >= NOW()`, 
        [id]
    );

    if (bookings.length > 0) {
        // Delete the upcoming bookings
        await db.query("DELETE FROM bookings WHERE UserId = ? AND (CONCAT(BookingDate, ' ', EndTime)) >= NOW()", [id]);
    }

    // Step 2: Delete the employee
    const [result] = await db.query("DELETE FROM employees WHERE id = ?", [id]);

    return NextResponse.json({ 
        message: "Employee and associated upcoming bookings deleted successfully", 
        affectedRows: result.affectedRows 
    });
}
