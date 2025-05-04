"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, Button, TextInput } from "flowbite-react";
import WatchlistCard from "../../components/ui/WatchlistCard";
import { Checkbox } from "../../components/ui/checkbox";

export default function WatchlistEntriesClient({ entries }) {
  const [view, setView] = useState("cards");
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const filtered = entries.filter(entry =>
    entry.movie.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleDeleteSelected = () => {
    selected.forEach(id => {
      // You may want to call a delete handler here
      // For now, just log
      // onDelete(id); // if you have an onDelete prop
    });
    setSelected([]);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex gap-2 items-center">
          <Button size="xs" color={view === "cards" ? "blue" : "gray"} onClick={() => setView("cards")}>Cards</Button>
          <Button size="xs" color={view === "list" ? "blue" : "gray"} onClick={() => setView("list")}>List</Button>
          <Button size="xs" color={editMode ? "red" : "gray"} onClick={() => { setEditMode(!editMode); setSelected([]); }}>{editMode ? "Done" : "Edit"}</Button>
          {editMode && selected.length > 0 && (
            <Button size="xs" color="red" onClick={handleDeleteSelected}>Delete Selected</Button>
          )}
        </div>
        <TextInput
          placeholder="Search movies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-gray-500">No movies found.</div>
      ) : view === "cards" ? (
        <div className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(entry => (
              <WatchlistCard
                key={entry.id}
                image={entry.movie.posterUrl}
                tintColor={entry.movie.tintColor}
                title={entry.movie.title}
                imageAlt={entry.movie.title}
                placeholderIcon="🎬"
              >
                <p className="text-sm text-gray-500">
                  {entry.movie.genres && entry.movie.genres.length > 0
                    ? entry.movie.genres.map(g => g.name).join(", ")
                    : null}
                </p>
                <p className="text-xs text-gray-400">Added: {new Date(entry.dateAdded).toLocaleDateString()}</p>
              </WatchlistCard>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {filtered.map(entry => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 bg-white/10 dark:bg-gray-800/80 hover:bg-white/20 dark:hover:bg-gray-700/80 transition rounded-lg shadow ring-1 ring-black/10 dark:ring-white/10 mb-2 backdrop-blur min-h-[64px] relative"
            >
              {editMode && (
                <Checkbox
                  checked={selected.includes(entry.id)}
                  onCheckedChange={() => toggleSelect(entry.id)}
                  className="mr-3 w-5 h-5 bg-white"
                />
              )}
              <div className="flex-1 min-w-0 flex items-center" style={{ minHeight: '2.5em' }}>
                <div className="font-medium truncate leading-tight w-full" style={{lineHeight: '1.25em', maxHeight: '2.5em', overflow: 'hidden'}} title={entry.movie.title}>{entry.movie.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
