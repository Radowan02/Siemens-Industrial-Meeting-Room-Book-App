import { NextResponse } from "next/server";
import { jwtVerify, decodeJwt } from "jose";

const publicRoutes = ["/"];
const adminRoutes = ["/bookings/all",  "/bookings/report", "/allEmployees", "/addRoom", "/register"];
const commonRoutes = ["/dashboard", "/bookRoom", "/bookings/my"];
const protectedRoutes = [...adminRoutes, ...commonRoutes];
const restrictedRoutes = ["/permission-denied"];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  const isAdminRoute = adminRoutes.includes(path);
  const isCommonRoute = commonRoutes.includes(path);
  const isRestrictedRoute = restrictedRoutes.includes(path);

  const token = req.cookies.get("auth_token")?.value;
  const referer = req.headers.get("referer");

  if (!token) {
    if (isAdminRoute || isCommonRoute || isRestrictedRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  let decodedToken;
  try {
      decodedToken = decodeJwt(token);
      if (decodedToken.exp * 1000 < Date.now()) {
          console.error("Token has expired");

          const response = NextResponse.redirect(new URL("/", req.url));
          const expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

          response.headers.set(
              "Set-Cookie",
              `auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expirationDate.toUTCString()}`
          );
          return response;
      }
  } catch (err) {
      console.error("Error decoding token:", err);
      return NextResponse.redirect(new URL("/", req.url));
  }

  if (isRestrictedRoute && (!referer || !protectedRoutes.some(route => referer.includes(route)))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isPublicRoute) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const userRole = payload.role || payload.user_type;

    if (isAdminRoute && userRole === "employee") {
      return NextResponse.redirect(new URL("/permission-denied", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Token verification failed:", err);

    if (err.code === "ERR_JWT_EXPIRED") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.redirect(new URL("/", req.url));
  }
}
