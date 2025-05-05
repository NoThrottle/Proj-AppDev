"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReviewForm from "./ReviewForm";
import { Select } from "@/components/ui/select";

export default function MoviePage() {
  const params = useParams();
  const id = parseInt(params.id, 10);
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/movies/query?id=${id}`)
      .then(res => res.json())
      .then(data => setMovie(data.movie));
    fetch(`/api/movies/${id}/reviews?sort=${sort}`)
      .then(res => res.json())
      .then(data => setReviews(data.reviews))
      .finally(() => setLoading(false));
  }, [id, sort]);

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
      {movie.bannerUrl && (
        <img src={movie.bannerUrl} alt="Banner" className="w-full max-h-64 object-cover rounded mb-4" />
      )}
      <div className="flex gap-4 mb-4">
        {movie.posterUrl && (
          <img src={movie.posterUrl} alt="Poster" className="w-32 h-48 object-cover rounded border" />
        )}
        <div className="flex-1">
          <div className="mb-2 text-muted-foreground whitespace-pre-line">{movie.description}</div>
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {movie.genres.map(g => (
                <span key={g.id} className="px-2 py-0.5 bg-muted-foreground/20 rounded text-xs text-muted-foreground">{g.name}</span>
              ))}
            </div>
          )}
          {movie.publishers && movie.publishers.length > 0 && (
            <div className="mb-1"><b>Publishers:</b> {movie.publishers.map(p => p.name).join(", ")}</div>
          )}
          {movie.studios && movie.studios.length > 0 && (
            <div className="mb-1"><b>Studios:</b> {movie.studios.map(s => s.name).join(", ")}</div>
          )}
          {movie.platforms && movie.platforms.length > 0 && (
            <div className="mb-1"><b>Platforms:</b> {movie.platforms.map(p => p.name).join(", ")}</div>
          )}
        </div>
      </div>
      {movie.movieCasts && movie.movieCasts.length > 0 && (
        <div className="mb-4">
          <b>Cast:</b>
          <ul className="mt-1 ml-2 list-disc">
            {movie.movieCasts.map(mc => (
              <li key={mc.id}>
                {mc.cast.name} <span className="text-xs text-muted-foreground">({mc.role})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 text-sm text-muted-foreground">Visibility: {movie.visibility}</div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Leave a Review</h2>
        <ReviewForm movieId={movie.id} />
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Other People's Reviews</h2>
        <div className="mb-4">
          <Select value={sort} onChange={e => setSort(e.target.value)} className="w-48">
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </Select>
        </div>
        {loading ? (
          <div>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-muted-foreground">No reviews yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {reviews.map(r => (
              <li key={r.id} className="py-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{r.user?.name || r.user?.email || "User"}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                  <span className="ml-auto font-bold text-primary">{r.rating}/100</span>
                </div>
                <div className="font-medium mt-1">{r.subject}</div>
                <div className="text-muted-foreground whitespace-pre-line">{r.comment}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
