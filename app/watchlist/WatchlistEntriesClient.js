"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Button, TextInput } from "flowbite-react";
import WatchlistCard from "../../components/ui/WatchlistCard";
import { Checkbox } from "../../components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../components/ui/select";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function WatchlistEntriesClient({ entries }) {
  const [view, setView] = useState("cards");
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [sortBy, setSortBy] = useState("index");
  const [items, setItems] = useState(entries.map(e => e));
  const [deleting, setDeleting] = useState([]);

  useEffect(() => {
    setItems(entries.map(e => e));
  }, [entries]);

  const filtered = items.filter(entry =>
    entry.movie.title.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "index") return a.rank - b.rank;
    if (sortBy === "rating") return (b.movie.rating ?? 0) - (a.movie.rating ?? 0);
    if (sortBy === "watched") return (a.dateWatched ? 1 : 0) - (b.dateWatched ? 1 : 0);
    return 0;
  });

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    for (const id of selected) {
      setDeleting(prev => [...prev, id]);
      await fetch(`/api/watchlist/${id}/delete`, { method: 'DELETE' });
    }
    setSelected([]);
    setDeleting([]);
    // Optionally: refresh entries from server here if needed
    // For now, remove deleted items from UI
    setItems(items => items.filter(e => !selected.includes(e.id)));
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id || sortBy !== "index") return;
    const oldIndex = items.findIndex(e => e.id === active.id);
    const newIndex = items.findIndex(e => e.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    // TODO: Persist new order to backend
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="index">Index</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="watched">Watched</SelectItem>
            </SelectContent>
          </Select>
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
      ) : view === "list" && sortBy === "index" ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map(e => e.id)} strategy={verticalListSortingStrategy}>
            {sorted.map((entry, idx) => (
              <SortableEntryCard key={entry.id} entry={entry} index={idx} editMode={editMode} selected={selected} toggleSelect={toggleSelect} />
            ))}
          </SortableContext>
        </DndContext>
      ) : view === "list" ? (
        <div>
          {sorted.map((entry, idx) => (
            <EntryCard key={entry.id} entry={entry} index={idx} editMode={editMode} selected={selected} toggleSelect={toggleSelect} />
          ))}
        </div>
      ) : (
        <div className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sorted.map(entry => (
              <div
                key={entry.id}
                className={`relative transition-all duration-200 rounded-lg shadow-sm border border-gray-500 overflow-hidden w-full max-w-xs min-w-[16rem] min-h-[340px] max-h-[340px] ${editMode ? 'cursor-pointer' : ''} ${editMode && selected.includes(entry.id) ? 'ring-2 ring-blue-500 bg-blue-100/20 dark:bg-blue-900/20 border-blue-500' : ''} ${editMode && !selected.includes(entry.id) ? 'hover:ring-2 hover:ring-blue-400/80 hover:bg-blue-50/10 dark:hover:bg-blue-900/10' : ''}`}
                onClick={editMode ? () => toggleSelect(entry.id) : undefined}
              >
                {editMode && (
                  <Checkbox
                    checked={selected.includes(entry.id)}
                    onCheckedChange={() => toggleSelect(entry.id)}
                    className="absolute top-2 left-2 z-10 w-5 h-5 bg-white"
                  />
                )}
                <WatchlistCard
                  image={entry.movie.posterUrl}
                  tintColor={entry.movie.tintColor}
                  title={entry.movie.title}
                  imageAlt={entry.movie.title}
                  placeholderIcon="🎬"
                  clickable={false}
                >
                  <p className="text-sm text-gray-500">
                    {entry.movie.genres && entry.movie.genres.length > 0
                      ? entry.movie.genres.map(g => g.name).join(", ")
                      : null}
                  </p>
                  <p className="text-xs text-gray-400">Added: {new Date(entry.dateAdded).toLocaleDateString()}</p>
                </WatchlistCard>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SortableEntryCard({ entry, index, editMode, selected, toggleSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: entry.id });
  const style = { transform: CSS.Transform.toString(transform), transition, cursor: editMode ? "pointer" : undefined };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between p-4 bg-white/10 dark:bg-gray-800/80 hover:bg-white/20 dark:hover:bg-gray-700/80 transition rounded-lg shadow ring-1 ring-black/10 dark:ring-white/10 mb-2 backdrop-blur min-h-[64px] relative"
      onClick={editMode ? () => toggleSelect(entry.id) : undefined}
    >
      {editMode && (
        <>
          <span {...listeners} className="mr-2 cursor-grab select-none text-xl" title="Drag to reorder">⠿</span>
          <Checkbox
            checked={selected.includes(entry.id)}
            onCheckedChange={() => toggleSelect(entry.id)}
            className="mr-3 w-5 h-5 bg-white"
          />
        </>
      )}
      <div className="flex items-center gap-4 flex-1 min-w-0 h-12">
        {entry.movie.posterUrl ? (
          <img src={entry.movie.posterUrl} alt={entry.movie.title} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-gray-400 rounded-md flex-shrink-0">
            <span className="text-2xl">🎬</span>
          </div>
        )}
        <div className="font-medium truncate leading-tight w-full" style={{lineHeight: '1.25em', maxHeight: '2.5em', overflow: 'hidden'}} title={entry.movie.title}>{`#${index + 1} ${entry.movie.title}`}</div>
        <div className="ml-4 text-xs text-gray-500">Rating: {entry.movie.rating ?? "—"}</div>
        <div className="ml-4 text-xs"><span className={entry.dateWatched ? "text-green-600" : "text-red-600"}>{entry.dateWatched ? "Watched" : "Unwatched"}</span></div>
      </div>
    </div>
  );
}

function EntryCard({ entry, index, editMode, selected, toggleSelect }) {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-white/10 dark:bg-gray-800/80 transition rounded-lg shadow ring-1 ring-black/10 dark:ring-white/10 mb-2 backdrop-blur min-h-[64px] relative border border-gray-500 overflow-hidden ${editMode ? 'cursor-pointer' : ''} ${editMode && selected.includes(entry.id) ? 'ring-2 ring-blue-500 bg-blue-100/20 dark:bg-blue-900/20 border-blue-500' : ''} ${editMode && !selected.includes(entry.id) ? 'hover:ring-2 hover:ring-blue-400/80 hover:bg-blue-50/10 dark:hover:bg-blue-900/10' : ''}`}
      onClick={editMode ? () => toggleSelect(entry.id) : undefined}
    >
      {editMode && (
        <Checkbox
          checked={selected.includes(entry.id)}
          onCheckedChange={() => toggleSelect(entry.id)}
          className="mr-3 w-5 h-5 bg-white"
        />
      )}
      <div className="flex items-center gap-4 flex-1 min-w-0 h-12">
        {entry.movie.posterUrl ? (
          <img src={entry.movie.posterUrl} alt={entry.movie.title} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-gray-400 rounded-md flex-shrink-0">
            <span className="text-2xl">🎬</span>
          </div>
        )}
        <div className="font-medium truncate leading-tight w-full" style={{lineHeight: '1.25em', maxHeight: '2.5em', overflow: 'hidden'}} title={entry.movie.title}>{`#${index + 1} ${entry.movie.title}`}</div>
        <div className="ml-4 text-xs text-gray-500">Rating: {entry.movie.rating ?? "—"}</div>
        <div className="ml-4 text-xs"><span className={entry.dateWatched ? "text-green-600" : "text-red-600"}>{entry.dateWatched ? "Watched" : "Unwatched"}</span></div>
      </div>
    </div>
  );
}
