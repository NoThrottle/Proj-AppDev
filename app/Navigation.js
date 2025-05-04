"use client";

import Link from "next/link";
import { Navbar } from "flowbite-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function Navigation() {
  const path = usePathname();
  const { data: session } = useSession();

  // Hide navigation on login page
  if (path === "/login") {
    return null;
  }

  return (
    <Navbar fluid rounded className="bg-white shadow-md">
      <Navbar.Brand as={Link} href="/">
        <Image
          src="/favicon.ico"
          className="mr-3"
          height={25}
          width={25}
          alt="Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold">
          Watchlist
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link as={Link} href="/" active={path === "/"}>
          Home
        </Navbar.Link>
        <Navbar.Link as={Link} href="/top10list" active={path === "/top10list"}>
          Top 10 List
        </Navbar.Link>
        <Navbar.Link as={Link} href="/movies" active={path.startsWith("/movies")}> 
          Movies
        </Navbar.Link>

            {!session ? (
      <>
        <Navbar.Link as={Link} href="/login" active={path === "/login"}>
          Login
        </Navbar.Link>
        <Navbar.Link as={Link} href="/signup" active={path.startsWith("/signup")}>
          Signup
        </Navbar.Link>
      </>
    ) : (
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-red-500 font-medium px-2 hover:underline"
      >
        Logout ({session.user.name || session.user.email})
      </button>
    )}  
      </Navbar.Collapse>

    </Navbar>
  );
}