"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ReviewForm({ movieId, onReviewAdded }) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(50);
  const [subject, setSubject] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/movies/${movieId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, subject, comment }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      setSuccess("Review submitted!");
      setSubject("");
      setComment("");
      setRating(50);
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return <div>Loading...</div>;
  if (!session) {
    return <div className="p-4 border rounded bg-muted/30 text-center">You must be logged in to submit a review.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded bg-muted/30 mt-6">
      <div>
        <label className="font-medium">Rating: {rating}</label>
        <input
          type="range"
          min={0}
          max={100}
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="w-full mt-1"
        />
      </div>
      <div>
        <label className="font-medium">Subject</label>
        <Input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full mt-1"
          maxLength={100}
          required
        />
      </div>
      <div>
        <label className="font-medium">Comment</label>
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full mt-1"
          rows={3}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
    </form>
  );
}
