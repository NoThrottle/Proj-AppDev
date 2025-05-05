"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MovieDialog from "@/components/ui/MovieDialog";
import Link from "next/link";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    <div className="max-w-xl mx-auto mt-10 p-6 bg-background rounded shadow dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Admin: Add Movie</h1>
      <Link
        href="/admin/movie"
        className="mb-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Add Movie
      </Link>
      <MovieDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        success={success}
        mode="add"
      />
    </div>
  );
}