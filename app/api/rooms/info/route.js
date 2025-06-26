"use server"
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createConnection } from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin" && decoded.role !== "employee") {
            return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }

        const db = await createConnection();

        const [rooms] = await db.query(
            `SELECT id, name, capacity, start_time, end_time FROM rooms`
        );

        return NextResponse.json({ rooms }, { status: 200 });

    } catch (error) {
        console.error("Error fetching rooms:", error);
        return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
    }
}


