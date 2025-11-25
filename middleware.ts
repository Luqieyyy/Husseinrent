import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Clone the existing request headers
  const requestHeaders = new Headers(request.headers);

  // 2. Set the 'x-pathname' header on the REQUEST, not the response
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // 3. Pass the modified headers to the next step
  // This allows Server Components (like Navbar.tsx) to read 'x-pathname'
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// 4. Configure the matcher to prevent this from running on static files (images, fonts, etc.)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};