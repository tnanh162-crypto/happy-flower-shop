import { NextResponse } from "next/server";

const ADMIN_PORT = "3001";

export function middleware(request) {
  const port = request.headers.get("host")?.split(":")[1] || "80";
  const pathname = request.nextUrl.pathname;
  const isAdminServer = port === ADMIN_PORT;
  const isVercel = process.env.VERCEL === "1";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isApiRoute = pathname.startsWith("/api/");
  const isPublicAsset = pathname.startsWith("/uploads/") || /\.[a-z0-9]+$/i.test(pathname);

  if (!isVercel && isAdminServer && !isAdminRoute && !isApiRoute && !isPublicAsset && !pathname.startsWith("/_next/")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!isVercel && !isAdminServer && isAdminRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
