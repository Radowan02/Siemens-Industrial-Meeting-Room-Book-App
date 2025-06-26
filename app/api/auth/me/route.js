import { createConnection } from "@/lib/db";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  const cookies = parse(req.headers.get("cookie") || "");
  const token = cookies.auth_token;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: No token found" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = await createConnection();
    const [rows] = await db.query("SELECT id, name, role FROM employees WHERE id=?", [decoded.id]);

    if (rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    return NextResponse.json({ message: "Invalid Token" }, { status: 403 });
  }
}


