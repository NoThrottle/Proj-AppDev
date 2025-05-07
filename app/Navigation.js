"use client";

import Link from "next/link";
import { Navbar } from "flowbite-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export function Navigation() {
  const path = usePathname();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [watchlists, setWatchlists] = useState([]);
  const [addingMovieId, setAddingMovieId] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef();

  // Effect to update profile image when session changes or localStorage is updated
  useEffect(() => {
    // First try to get image from session
    if (session?.user?.image) {
      setProfileImage(`${session.user.image}?t=${Date.now()}`); // Add cache-busting
    } else {
      // If no session image, try localStorage as fallback
      const cachedImage = typeof window !== 'undefined' ? localStorage.getItem('profileImage') : null;
      if (cachedImage) {
        setProfileImage(cachedImage);
      }
    }

    // Listen for localStorage changes from other components
    const handleStorageChange = (e) => {
      if (e.key === 'profileImage' && e.newValue) {
        setProfileImage(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [session]);

  // Fetch user's watchlists if logged in
  useEffect(() => {
    if (session?.user) {
      // Fetch user's watchlists
      fetch('/api/movies/query?type=watchlists')
        .then(res => res.json())
        .then(data => {
          if (data.watchlists) {
            setWatchlists(data.watchlists);
          }
        })
        .catch(err => {
          console.error('Error fetching watchlists:', err);
        });
    }
  }, [session]);

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

  // Function to add a movie to a watchlist
  async function addToWatchlist(movieId, watchlistId) {
    if (!session) {
      toast({
        title: "Not logged in",
        description: "Please login to add movies to your watchlist",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setAddingMovieId(movieId);
    
    try {
      const res = await fetch('/api/watchlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ movieId, watchlistId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to add movie to watchlist");
      }
      
      toast({
        title: "Success!",
        description: "Movie added to watchlist",
        variant: "default"
      });
    } catch (error) {
      console.error("Error adding movie to watchlist:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add movie to watchlist",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setAddingMovieId(null);
    }
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
        <div className="w-full flex flex-row items-center justify-between gap-4">
          {/* Left Nav Links */}
          <div className="flex flex-row items-center min-w-[220px] justify-start gap-2">
            <Navbar.Link as={Link} href="/" active={path === "/"}
              className="px-2">
              Home
            </Navbar.Link>
            <Navbar.Link as={Link} href="/leaderboards" active={path === "/leaderboards"}
              className="px-2">
              Leaderboards
            </Navbar.Link>
            <Navbar.Link as={Link} href="/watchlist" active={path === "/watchlist"}
              className="px-2">
              Watchlist
            </Navbar.Link>
          </div>

          {/* Centered Search Bar */}
          <div className="flex-1 flex justify-center relative">
            <div className="w-[300px] px-2">
              <input
                type="text"
                placeholder="Search movies..."
                value={search}
                onChange={handleSearch}
                onFocus={() => setShowResults(results.length > 0)}
                ref={searchRef}
                className="block w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:placeholder-gray-400"
              />
              {showResults && results.length > 0 && (
                <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 z-50 rounded shadow max-h-[500px] overflow-y-auto border border-gray-200 dark:border-gray-700 p-2" style={{ width: 300 }}>
                  {results.map((movie) => (
                    <Card key={movie.id} className="mb-2 overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          {movie.posterUrl ? (
                            <img 
                              src={movie.posterUrl} 
                              alt={movie.title}
                              className="h-24 w-16 object-cover rounded"
                            />
                          ) : (
                            <div className="h-24 w-16 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
                              <span role="img" aria-label="Movie">🎬</span>
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <Link 
                                href={`/movie/${movie.id}`}
                                onClick={() => setShowResults(false)}
                                className="font-medium hover:underline text-black dark:text-white line-clamp-1"
                              >
                                {movie.title}
                              </Link>
                              <div className="text-gray-500 dark:text-gray-400 text-xs">
                                {movie.releaseYear && (
                                  <span>{movie.releaseYear}</span>
                                )}
                                {movie.duration && (
                                  <span> • {Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                                )}
                              </div>
                            </div>
                            
                            {session && (
                              <div className="mt-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      disabled={loading && addingMovieId === movie.id}
                                      className="text-xs h-7"
                                    >
                                      {loading && addingMovieId === movie.id 
                                        ? "Adding..." 
                                        : "Add to Wishlist"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-56 p-2" align="start">
                                    <div className="space-y-1">
                                      <h4 className="font-medium text-sm mb-1">Select a watchlist</h4>
                                      {watchlists.length === 0 ? (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                          No watchlists found. Create one first.
                                        </div>
                                      ) : (
                                        watchlists.map(list => (
                                          <button
                                            key={list.id}
                                            className="w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                            onClick={() => {
                                              addToWatchlist(movie.id, list.id);
                                              setShowResults(false);
                                            }}
                                          >
                                            {list.image ? (
                                              <img 
                                                src={list.image} 
                                                alt={list.name} 
                                                className="w-4 h-4 rounded-sm object-cover"
                                              />
                                            ) : (
                                              <span className="w-4 h-4">📋</span>
                                            )}
                                            <span className="truncate">{list.name}</span>
                                          </button>
                                        ))
                                      )}
                                      <div className="pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
                                        <Link 
                                          href="/watchlist/create" 
                                          className="w-full block text-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                          onClick={() => setShowResults(false)}
                                        >
                                          Create New Watchlist
                                        </Link>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - User Profile */}
          <div className="flex flex-row items-center min-w-[120px] justify-end">
            {!session ? (
              <Navbar.Link as={Link} href="/login" active={path === "/login"}>
                Login
              </Navbar.Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    {profileImage ? (
                      <span className="w-9 h-9 rounded-full overflow-hidden border bg-muted inline-block">
                        <Image
                          src={profileImage}
                          alt={session.user.name || session.user.email || "User"}
                          width={36}
                          height={36}
                          className="object-cover w-9 h-9 rounded-full"
                        />
                      </span>
                    ) : (
                      <Avatar
                        src={undefined}
                        alt={session.user.name || session.user.email || "User"}
                        fallback={
                          session.user.name
                            ? session.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                            : session.user.email
                            ? session.user.email[0].toUpperCase()
                            : "U"
                        }
                        className="w-9 h-9 border bg-muted text-white"
                      />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/account">Account Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-500">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
}