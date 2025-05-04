// app/movies/MoviesClient.js

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Card } from "flowbite-react";

export default function MoviesClient({ movies }) {
  const [unwatched, setUnwatched] = useState(movies.filter((m) => !m.watched));
  const watched = movies.filter((m) => m.watched);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = unwatched.findIndex((m) => m.id === active.id);
    const newIndex = unwatched.findIndex((m) => m.id === over.id);
    setUnwatched(arrayMove(unwatched, oldIndex, newIndex));
    // TODO: POST new order to an API route for persistence
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Movie Watchlist</h1>
        <Button as={Link} href="/movies/create" gradientDuoTone="purpleToBlue">
          Add Movie
        </Button>
      </div>

      {/* Draggable Unwatched Movies */}
      <h2 className="text-lg font-semibold">To Watch (Drag to reorder)</h2>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={unwatched.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {unwatched.map((movie, idx) => (
              <SortableMovieCard key={movie.id} movie={movie} index={idx} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Static Watched Movies */}
      <h2 className="text-lg font-semibold">Watched</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {watched.map((movie) => (
          <Card key={movie.id} className="max-w-sm">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                width={400}
                height={250}
                className="rounded-lg w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
                No Image
              </div>
            )}
            <h5 className="text-xl font-semibold tracking-tight text-gray-900">
              {movie.title}
            </h5>
            <div className="mt-2 flex gap-2">
              <Button size="xs" color="green" as={Link} href={`/movies/${movie.id}`}>
                View
              </Button>
              <Button size="xs" color="cyan" as={Link} href={`/movies/${movie.id}/edit`}>
                Edit
              </Button>
              <Button size="xs" color="red" as={Link} href={`/movies/${movie.id}/delete`}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SortableMovieCard({ movie, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: movie.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-4 max-w-sm">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            width={400}
            height={250}
            className="rounded-lg w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
            No Image
          </div>
        )}
        <h5 className="text-xl font-semibold tracking-tight text-gray-900">
          #{index + 1}: {movie.title}
        </h5>
        <p className="text-sm text-gray-500">
          Rating: {movie.rating ?? "—"}
        </p>
        <p className="text-sm text-gray-500">
          Watched: <span className={movie.watched ? "text-green-600" : "text-red-600"}>
            {movie.watched ? "Yes" : "No"}
          </span>
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="xs" color="green" as={Link} href={`/movies/${movie.id}`}>
            View
          </Button>
          <Button size="xs" color="cyan" as={Link} href={`/movies/${movie.id}/edit`}>
            Edit
          </Button>
          <Button size="xs" color="red" as={Link} href={`/movies/${movie.id}/delete`}>
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}
