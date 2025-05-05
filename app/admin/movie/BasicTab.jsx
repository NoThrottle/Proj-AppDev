import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import { ComboBox } from "./ComboBox";

export default function BasicTab({ title, setTitle, description, setDescription, posterUrl, setPosterUrl, bannerUrl, setBannerUrl, genres, genresSelected, setGenresSelected, setTab }) {
  const descRef = useRef(null);
  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [description]);

  function handleAddGenre(id) {
    if (!genresSelected.includes(id)) setGenresSelected([...genresSelected, id]);
  }

  function handleRemoveGenre(id) {
    setGenresSelected(genresSelected.filter(gid => gid !== id));
  }

  return (
    <div className="flex flex-col gap-4 items-start">
      <label htmlFor="title" className="text-foreground font-medium">Title</label>
      <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="bg-background text-foreground border-border w-full" />
      <label htmlFor="description" className="text-foreground font-medium">Description</label>
      <Textarea
        id="description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="bg-background text-foreground border-border w-full"
        ref={descRef}
        rows={2}
        style={{ resize: "none", overflow: "hidden" }}
      />
      <label htmlFor="posterUrl" className="text-foreground font-medium">Poster URL</label>
      <Input id="posterUrl" value={posterUrl} onChange={e => setPosterUrl(e.target.value)} className="bg-background text-foreground border-border w-full" />
      <label htmlFor="bannerUrl" className="text-foreground font-medium">Banner Image URL</label>
      <Input id="bannerUrl" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="bg-background text-foreground border-border w-full" />
      <label htmlFor="genres" className="text-foreground font-medium">Genres</label>
      <div className="flex gap-2 w-full">
        <ComboBox
          options={genres.map(g => ({ id: g.id.toString(), name: g.name }))}
          value={""}
          onChange={handleAddGenre}
          placeholder="Type to search genre..."
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {genresSelected.length === 0 && <div className="text-muted-foreground">No genres added.</div>}
        {genresSelected.map(gid => {
          const genre = genres.find(g => g.id.toString() === gid);
          return genre ? (
            <span key={gid} className="px-2 py-0.5 bg-muted-foreground/20 rounded text-xs text-muted-foreground flex items-center gap-1">
              {genre.name}
              <button type="button" className="px-0 py-0 h-5 w-5 text-xs bg-transparent shadow-none border-none ml-1" onClick={() => handleRemoveGenre(gid)} title={`Remove ${genre.name}`}>×</button>
            </span>
          ) : null;
        })}
      </div>
      <div className="w-full flex justify-start mt-6">
        <Button type="button" onClick={() => setTab("publisher")}
          className="bg-primary text-primary-foreground hover:bg-primary/90">Next</Button>
      </div>
    </div>
  );
}