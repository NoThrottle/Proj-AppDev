"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import ReviewForm from "./ReviewForm";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FastAverageColor } from "fast-average-color";
import { Card } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";

const RatingsChart = dynamic(() => import("@/components/ui/chart"), { ssr: false });

export default function MoviePage() {
  const { data: session } = useSession();
  const params = useParams();
  const id = parseInt(params.id, 10);
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("30"); // default: 30 days
  const [chartData, setChartData] = useState([]);
  const [bannerColor, setBannerColor] = useState(null);
  const posterImgRef = useRef();
  const [castPage, setCastPage] = useState(1);
  const castPerPage = 8;

  const handleSortChange = useCallback((e) => {
    setSort(e.target.value);
  }, []);

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

  useEffect(() => {
    if (!id) return;
    fetch(`/api/movies/${id}/reviews?period=${chartPeriod}`)
      .then(res => res.json())
      .then(data => setChartData(data.chart || []));
  }, [id, chartPeriod]);

  useEffect(() => {
    if (!movie) return;
    if (!movie.bannerUrl && movie.posterUrl) {
      // Get average color of poster
      const fac = new FastAverageColor();
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = movie.posterUrl;
      img.onload = () => {
        const color = fac.getColor(img).hex;
        setBannerColor(color);
      };
    } else {
      setBannerColor(null);
    }
  }, [movie]);

  if (!movie) return <div>Loading...</div>;

  const totalCast = movie.movieCasts ? movie.movieCasts.length : 0;
  const totalCastPages = Math.ceil(totalCast / castPerPage);
  const paginatedCast = movie.movieCasts ? movie.movieCasts.slice((castPage - 1) * castPerPage, castPage * castPerPage) : [];

  return (
    <div className="max-w-2xl mx-auto p-0">
      {/* Banner section */}
      <div className="w-full max-w-[1200px] mx-auto h-48 md:h-64 rounded-b-lg mb-6 overflow-hidden relative flex items-center justify-center -mt-4" style={{ background: movie.bannerUrl ? undefined : bannerColor || '#18181b' }}>
        {movie.bannerUrl ? (
          <img src={movie.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : movie.posterUrl ? (
          <img ref={posterImgRef} src={movie.posterUrl} alt="Poster" className="w-32 h-48 object-cover rounded shadow-lg border-2 border-background absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" style={{ zIndex: 2 }} />
        ) : null}
        {!movie.bannerUrl && !movie.posterUrl && (
          <div className="text-muted-foreground text-lg">No banner or poster available</div>
        )}
      </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {paginatedCast.map(mc => (
              <Card key={mc.id} className="flex flex-col items-center p-3">
                <img
                  src={mc.cast.profileUrl || "/file.svg"}
                  alt={mc.cast.name}
                  className="w-16 h-16 object-cover rounded-full mb-2 border"
                  onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }}
                />
                <div className="font-semibold text-center">{mc.cast.name}</div>
                <div className="text-xs text-muted-foreground text-center">{mc.role}</div>
              </Card>
            ))}
          </div>
          {totalCastPages > 1 && (
            <Pagination className="mt-4 justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCastPage(castPage - 1)} disabled={castPage === 1} />
                </PaginationItem>
                {[...Array(totalCastPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink isActive={castPage === i + 1} onClick={() => setCastPage(i + 1)}>{i + 1}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => setCastPage(castPage + 1)} disabled={castPage === totalCastPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
      {session?.user?.admin && (
        <div className="mt-4 text-sm text-muted-foreground">Visibility: {movie.visibility}</div>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Leave a Review</h2>
        <ReviewForm movieId={movie.id} />
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Ratings Over Time</h2>
        <div className="mb-2">
          <Select value={chartPeriod} onValueChange={setChartPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="bg-background rounded p-4 border">
          <RatingsChart data={chartData} />
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Other People's Reviews</h2>
        <div className="mb-4">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
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
