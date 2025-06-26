"use server"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token found" }, { status: 401 });
    }
    const { name, email, password, department, role } = await req.json();
    const db = await createConnection();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Only admins can register employees" }, { status: 403 });
    }

    if (!email.endsWith("@siemens.com")) {
      return NextResponse.json({ error: "Email must end with @siemens.com" }, { status: 400 });
    }

    const [existingUser] = await db.query("SELECT * FROM employees WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO employees (name, email, password, department, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, department, role]
    );

    return NextResponse.json({ message: "Employee registered successfully!" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
