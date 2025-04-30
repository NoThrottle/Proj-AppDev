// app/page.js (Home Page)
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Card } from "flowbite-react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-2xl shadow-lg border border-gray-200">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">
              🎬 Movie Watchlist
            </h1>
            <p className="text-gray-600 text-lg">
              Organize your movie collection effortlessly. Track what you've seen, rate your favorites, and plan your next movie night.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              as={Link}
              href="/movies"
              gradientDuoTone="purpleToPink"
              size="lg"
            >
              Go to Movies
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
