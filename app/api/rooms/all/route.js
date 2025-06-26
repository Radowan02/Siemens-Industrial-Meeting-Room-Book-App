"use server"
import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
    if (decoded.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }
    const db = await createConnection();
    try {
        const { name, capacity, start_time, end_time } = await req.json();
        if (!name || !capacity || !start_time || !end_time) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (isNaN(capacity)) {
            return NextResponse.json({ error: "Capacity must be a number" }, { status: 400 });
        }

        const [result] = await db.query(
            "INSERT INTO rooms (name, capacity, start_time, end_time) VALUES (?, ?, ?, ?)",
            [name, capacity, start_time, end_time]
        );

        return NextResponse.json({ message: "Room added successfully", roomId: result.insertId }, { status: 201 });
    } catch (error) {
        console.error("Error adding room:", error);
        return NextResponse.json({ error: error.message || "Failed to add room" }, { status: 500 });
    }
}

export async function PUT(req) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
    if (decoded.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }
    const db = await createConnection();
    try {
        const { id, name, capacity, start_time, end_time } = await req.json();
        if (!id || !name || !capacity || !start_time || !end_time) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Check if the room exists
        const [room] = await db.query("SELECT * FROM rooms WHERE id = ?", [id]);
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        await db.query(
            "UPDATE rooms SET name = ?, capacity = ?, start_time = ?, end_time = ? WHERE id = ?",
            [name, capacity, start_time, end_time, id]
        );

        return NextResponse.json({ message: "Room updated successfully" });
    } catch (error) {
        console.error("Error updating room:", error);
        return NextResponse.json({ error: error.message || "Failed to update room" }, { status: 500 });
    }
}

export async function DELETE(req) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
    if (decoded.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }
    const db = await createConnection();
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
        }

        const [room] = await db.query("SELECT * FROM rooms WHERE id = ?", [id]);
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        await db.query("DELETE FROM rooms WHERE id = ?", [id]);

        return NextResponse.json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        return NextResponse.json({ error: error.message || "Failed to delete room" }, { status: 500 });
    }
}

