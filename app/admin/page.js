"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MovieDialog from "@/components/ui/MovieDialog";
import Link from "next/link";
import MovieList from "./movie/MovieList";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddMovie = () => {
    router.push("/admin/movie");
  };

  // Only allow admin users
  if (status === "loading") return <div>Loading...</div>;
  if (!session?.user?.admin) {
    // Return a 403 status code using Next.js notFound helper
    if (typeof window === "undefined") {
      // SSR: throw a 403 error
      return new Response("Forbidden", { status: 403 });
    }
    // CSR: show a 403 message
    return <div className="p-8 text-center text-red-500">403 Forbidden. Admins only.</div>;
  }

  async function handleSubmit({ title, description, posterUrl, bannerUrl }) {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/movies/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, posterUrl, bannerUrl }),
      });
      if (!res.ok) throw new Error("Failed to add movie");
      setSuccess("Movie added!");
      setDialogOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Admin: Movies</h1>
        <Button onClick={handleAddMovie}>
          Add Movie
        </Button>
      </div>
      <MovieList />
    </div>
  );
}