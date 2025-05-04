"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, TextInput } from "flowbite-react";
import WatchlistCard from "../../components/ui/WatchlistCard";
import { Checkbox } from "../../components/ui/checkbox";

export default function WatchlistsClient({ watchlists, onCreate, onDelete }) {
  const [view, setView] = useState("cards");
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);

  const filtered = watchlists.filter(wl => wl.name.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleDeleteSelected = () => {
    selected.forEach(id => onDelete(id));
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
          placeholder="Search watchlists..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>
      {view === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.length === 0 && <div className="text-gray-500">No watchlists found.</div>}
          {filtered.map((wl) => (
            <div key={wl.id} className="relative">
              {editMode && (
                <Checkbox
                  checked={selected.includes(wl.id)}
                  onCheckedChange={() => toggleSelect(wl.id)}
                  className="absolute top-2 left-2 z-10 w-5 h-5 bg-white"
                />
              )}
              <WatchlistCard
                image={wl.image}
                tintColor={wl.tintColor}
                title={wl.name}
                href={editMode ? undefined : `/watchlist/${wl.id}`}
                imageAlt={wl.name}
              >
                {/* No delete button in card, use top delete */}
              </WatchlistCard>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {filtered.map((wl) => (
            <div
              key={wl.id}
              className="flex items-center justify-between p-4 bg-white/10 dark:bg-gray-800/80 hover:bg-white/20 dark:hover:bg-gray-700/80 transition rounded-lg shadow ring-1 ring-black/10 dark:ring-white/10 mb-2 backdrop-blur min-h-[64px] relative"
            >
              {editMode && (
                <Checkbox
                  checked={selected.includes(wl.id)}
                  onCheckedChange={() => toggleSelect(wl.id)}
                  className="mr-3 w-5 h-5 bg-white"
                />
              )}
              <div className="flex-1 min-w-0 flex items-center" style={{ minHeight: '2.5em' }}>
                <div className="font-medium truncate leading-tight w-full" style={{lineHeight: '1.25em', maxHeight: '2.5em', overflow: 'hidden'}} title={wl.name}>{wl.name}</div>
              </div>
              {/* Removed per-item Delete button for cleaner UI */}
            </div>
          ))}
        </div>
      )}
      <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); onCreate(fd.get("name")); e.target.reset(); }} className="flex gap-2 mt-6">
        <TextInput name="name" placeholder="New watchlist name..." required />
        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}
