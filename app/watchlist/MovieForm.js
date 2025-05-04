"use client";

import { useState, useEffect } from "react";
import { Button, Label, TextInput, Textarea, Select, Checkbox } from "flowbite-react";

export default function MovieForm({ movie = {}, onSubmit, genres = [] }) {
  const [watched, setWatched] = useState(!!movie.watched);

  useEffect(() => {
    setWatched(!!movie.watched);
  }, [movie.watched]);

  const handleWatchedChange = (e) => {
    setWatched(e.target.checked);
  };

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <TextInput id="title" name="title" defaultValue={movie.title || ""} required />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={movie.description || ""} />
      </div>

      <div>
        <Label htmlFor="genreId">Genre</Label>
        <Select id="genreId" name="genreId" defaultValue={movie.genreId || ""} required>
          <option value="" disabled>Select a genre</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="watched"
          name="watched"
          defaultChecked={movie.watched}
          onChange={handleWatchedChange}
        />
        <Label htmlFor="watched">Watched</Label>
      </div>

      <div>
        <Label htmlFor="rating">Rating (0–5)</Label>
        <TextInput
          id="rating"
          name="rating"
          type="number"
          min={0}
          max={5}
          defaultValue={movie.rating ?? ""}
          disabled={!watched}
        />
      </div>

      <Button type="submit">Save Movie</Button>
    </form>
  );
}