"use client";

import Link from "next/link";
import { Navbar } from "flowbite-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef } from "react";

export function Navigation() {
  const path = usePathname();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef();

  async function handleSearch(e) {
    const value = e.target.value;
    setSearch(value);
    if (value.length > 1) {
      try {
        const res = await fetch(`/api/movies/query?type=search&query=${encodeURIComponent(value)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.movies || []);
          setShowResults(true);
        } else {
          setResults([]);
          setShowResults(false);
        }
      } catch {
        setResults([]);
        setShowResults(false);
      }
    } else {
      setResults([]);
      setShowResults(false);
    }
  }

  function handleBlur() {
    setTimeout(() => setShowResults(false), 150);
  }

  // Hide navigation on login page
  if (path === "/login") {
    return null;
  }

  return (
    <Navbar fluid rounded className="bg-background shadow-md sticky top-0 z-50">
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
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
          {/* Centered Search Bar */}
          <div className="w-full max-w-lg md:mx-8 flex-shrink">
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={handleSearch}
              onFocus={() => setShowResults(results.length > 0)}
              onBlur={handleBlur}
              ref={searchRef}
              className="block w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:placeholder-gray-400"
            />
            {showResults && results.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 z-50 rounded shadow max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700">
                {results.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 truncate"
                    onClick={() => setShowResults(false)}
                  >
                    {movie.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {/* Nav links and session buttons */}
          <div className="flex flex-row items-center gap-4">
            <Navbar.Link as={Link} href="/" active={path === "/"}>
              Home
            </Navbar.Link>
            <Navbar.Link as={Link} href="/leaderboards" active={path === "/leaderboards"}>
              Leaderboards
            </Navbar.Link>
            <Navbar.Link as={Link} href="/watchlist" active={path === "/watchlist"}>
              Watchlist
            </Navbar.Link>
            {/* <Navbar.Link as={Link} href="/movies" active={path.startsWith("/movies")}> 
              Movies
            </Navbar.Link> */}
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
          </div>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
}