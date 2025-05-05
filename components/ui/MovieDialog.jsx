import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MovieDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData = {},
  loading = false,
  error = "",
  success = "",
  mode = "add", // or "edit"
}) {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [posterUrl, setPosterUrl] = useState(initialData.posterUrl || "");
  const [bannerUrl, setBannerUrl] = useState(initialData.bannerUrl || "");

  useEffect(() => {
    setTitle(initialData.title || "");
    setDescription(initialData.description || "");
    setPosterUrl(initialData.posterUrl || "");
    setBannerUrl(initialData.bannerUrl || "");
  }, [initialData, open]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ title, description, posterUrl, bannerUrl });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full bg-background p-6 rounded shadow dark:bg-gray-900">
        <DialogTitle className="text-xl font-bold mb-4 text-foreground">
          {mode === "edit" ? "Edit Movie" : "Add Movie"}
        </DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-foreground font-medium" htmlFor="title">Title</label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="bg-background text-foreground border-border dark:border-gray-700" />
          <label className="block text-foreground font-medium" htmlFor="description">Description</label>
          <Input id="description" value={description} onChange={e => setDescription(e.target.value)} className="bg-background text-foreground border-border dark:border-gray-700" />
          <label className="block text-foreground font-medium" htmlFor="posterUrl">Poster URL</label>
          <Input id="posterUrl" value={posterUrl} onChange={e => setPosterUrl(e.target.value)} className="bg-background text-foreground border-border dark:border-gray-700" />
          <label className="block text-foreground font-medium" htmlFor="bannerUrl">Banner Image URL</label>
          <Input id="bannerUrl" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="bg-background text-foreground border-border dark:border-gray-700" />
          <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
            {loading ? (mode === "edit" ? "Saving..." : "Adding...") : mode === "edit" ? "Save Changes" : "Add Movie"}
          </Button>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
