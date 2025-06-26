"use server"
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
      { message: "Logout successful" },
      { status: 200, headers: { "Set-Cookie": "auth_token=; HttpOnly; Path=/; Max-Age=0;" } }
  );
}