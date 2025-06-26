"use server"
import { createConnection } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req) {

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const db = await createConnection();
        if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
    
        if (decoded.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }

        const [rows] = await db.query(
            "SELECT id, name, department, email, role FROM employees WHERE id != ?",
            [userId]
        );

        return NextResponse.json({ employees: rows });

    } catch (error) {
        console.error("JWT verification failed:", error);
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
}
