import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MoviePreview from "./MoviePreview";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "unlisted", label: "Unlisted" },
];

export default function MovieList() {
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, movie: null, input: "", error: "" });
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      type: "search",
      query: search,
      visibility,
      limit: "50"
    });
    fetch(`/api/movies/query?${params.toString()}`)
      .then(res => res.json())
      .then(data => setMovies(data.movies || []))
      .finally(() => setLoading(false));
  }, [search, visibility]);

  const handleEdit = (movie) => {
    router.push(`/admin/movie/${movie.id}`);
  };

  const handleDelete = async () => {
    if (!deleteDialog.movie) return;
    if (deleteDialog.input !== deleteDialog.movie.title) {
      setDeleteDialog(d => ({ ...d, error: "Movie name does not match." }));
      return;
    }
    setDeleteDialog(d => ({ ...d, error: "" }));
    await fetch(`/api/movies/${deleteDialog.movie.id}/delete`, { method: "POST" });
    setMovies(movies.filter(m => m.id !== deleteDialog.movie.id));
    setDeleteDialog({ open: false, movie: null, input: "", error: "" });
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : movies.length === 0 ? (
        <div className="text-gray-500">No movies found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map(movie => (
            <ContextMenu key={movie.id}>
              <ContextMenuTrigger asChild>
                <Card className="h-full flex flex-col cursor-pointer">
                  <CardHeader>
                    <CardTitle>{movie.title}</CardTitle>
                    <CardDescription>{movie.description?.slice(0, 80) || "No description."}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-2">
                    <img
                      src={movie.posterUrl || "/file.svg"}
                      alt={movie.title}
                      className="w-32 h-48 object-cover rounded border mb-2"
                      onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }}
                    />
                    <div className="text-xs text-muted-foreground mb-1">Visibility: {movie.visibility}</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {movie.genres?.map(g => (
                        <span key={g.id || g.name} className="px-2 py-0.5 bg-muted-foreground/20 rounded text-xs text-muted-foreground">{g.name || g}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleEdit(movie)}>Edit</ContextMenuItem>
                <ContextMenuItem onClick={() => setDeleteDialog({ open: true, movie, input: "", error: "" })} className="text-red-600">Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      )}
      <Dialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog(d => ({ ...d, open, input: "", error: "" }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Movie</DialogTitle>
            <DialogDescription>
              Type <b>{deleteDialog.movie?.title}</b> to confirm deletion. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <input
            className="border rounded px-3 py-2 w-full mt-4"
            placeholder="Type movie name..."
            value={deleteDialog.input}
            onChange={e => setDeleteDialog(d => ({ ...d, input: e.target.value, error: "" }))}
          />
          {deleteDialog.error && <div className="text-red-600 text-sm mt-2">{deleteDialog.error}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, movie: null, input: "", error: "" })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteDialog.input !== deleteDialog.movie?.title}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
