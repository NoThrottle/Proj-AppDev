"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, Card, TextInput } from "flowbite-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// This is a placeholder. In a real app, fetch movies from your API/database.
const mockMovies = [
  { id: 1, title: "Inception", posterUrl: "/file.svg" },
  { id: 2, title: "The Matrix", posterUrl: "/file.svg" },
  { id: 3, title: "Interstellar", posterUrl: "/file.svg" },
];

export default function WatchlistSearchPage() {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const router = useRouter();
  const filteredMovies = mockMovies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(movieId) {
    setLoadingId(movieId);
    const res = await fetch("/api/watchlist/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });
    setLoadingId(null);
    if (res.ok) {
      router.push("/watchlist");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to add to watchlist");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add a Movie to Your Watchlist</h1>
      <TextInput
        placeholder="Search movies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredMovies.length === 0 && (
          <div className="text-gray-500">No movies found.</div>
        )}
        {filteredMovies.map((movie) => (
          <Card key={movie.id} className="flex flex-col items-center">
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={120}
              height={180}
              className="rounded mb-2"
            />
            <div className="font-semibold mb-2">{movie.title}</div>
            <Button
              size="xs"
              color="green"
              onClick={() => handleAdd(movie.id)}
              disabled={loadingId === movie.id}
            >
              {loadingId === movie.id ? "Adding..." : "Add to Watchlist"}
            </Button>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Button as={Link} href="/watchlist" color="gray">
          Back to Watchlist
        </Button>
      </div>
    </div>
  );
}
