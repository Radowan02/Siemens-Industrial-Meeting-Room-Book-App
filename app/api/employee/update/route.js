"use server";
import { createConnection } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const db = await createConnection();
    const { id, name, email, department, role, password } = await req.json();

    let hashedPassword = null;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    if (hashedPassword) {
        await db.query("UPDATE employees SET name=?, department=?, email=?, role=?, password=? WHERE id=?", [name, department, email, role, hashedPassword, id]);
    } else {
        await db.query("UPDATE employees SET name=?, department=?, email=?, role=? WHERE id=?", [name, department, email, role, id]);
    }

    return NextResponse.json({ message: "Employee updated successfully" });
}