import { NextResponse } from "next/server";
import { menusConfig } from "./config/menus";

const publicRoutes = ["/login", "/forgot-password", "/register"];

// Function to recursively find all href values
function findHrefs(navArray: any) {
  let hrefs = <any>[];

  navArray.forEach((item: any) => {
    if (item.href) {
      hrefs.push(item.href);
    }
    if (item.child) {
      hrefs = hrefs.concat(findHrefs(item.child));
    }
  });

  return hrefs;
}

export function middleware(request: any) {
  const url = request.nextUrl.clone();
  const pathname = request.nextUrl.pathname; // Check if there is any supported locale in the pathname
  const token = request.cookies.get("token")?.value;
  if (!token) {
    const hrefs = findHrefs(menusConfig.mainNav);
    if (hrefs.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else if (publicRoutes.includes(pathname)) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, assets, api)
    //"/((?!api|assets|.*\\..*|_next).*)",
    "/((?!api|assets|docs|.*\\..*|_next).*)",
    // Optional: only run on root (/) URL
  ],
};
