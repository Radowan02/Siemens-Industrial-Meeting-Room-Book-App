"use server";
import { createConnection } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST(req) { 
  try {
    const { email, password } = await req.json(); 
    const db = await createConnection();

    const [rows] = await db.query("SELECT id, name, role, password FROM employees WHERE email=?", [email]);
    const user = rows[0];

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Invalid Email" }), { status: 401 });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return new NextResponse(JSON.stringify({ message: "Invalid Password" }), { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "168h" }
    );

    const headers = new Headers(); 
    headers.append(
      "Set-Cookie",
      serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
      })
    );

    return new NextResponse(JSON.stringify({ 
      message: "Login successful", 
      user: { id: user.id, name: user.name, role: user.role }
    }), { status: 200, headers });

  } catch (error) {
    console.error("Login Error:", error);
    return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}