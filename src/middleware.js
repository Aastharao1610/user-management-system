import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.clone();
  console.log(token);
  if (!token) {
    if (url.pathname.startsWith("/user")) {
      url.pathname = "/Login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (token && url.pathname === "/Login") {
    url.pathname = "/user";
    return NextResponse.redirect(url);
  }
  console.log("first");
  try {
    console.log("inside try");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { permissions } = decoded;
    // console.log(decoded, "Token");

    const pathname = url.pathname;
    const parts = pathname.split("/");
    const page = parts[2];

    if (!page || page.toLowerCase() === "Dashboard") {
      return NextResponse.next();
    }

    const hasPermission = permissions?.some(
      (perm) => perm.permissionName?.toLowerCase() === page.toLowerCase()
    );

    if (!hasPermission) {
      url.pathname = "/user";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    url.pathname = "/Login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/user/:path*", "/Login", "/signup"],
  runtime: "nodejs",
};
