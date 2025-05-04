import prisma from "@/lib/prisma";
import MovieForm from "../MovieForm";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";  // Updated import path
import { getServerSession } from "next-auth";

export default async function CreateMoviePage() {
    // Get the server-side session
    const session = await getServerSession(authOptions);

    // If no session exists, redirect to login
    if (!session) {
        return redirect("/login"); // Redirect to login if the user is not authenticated
    }

    // Fetch genres from the database
    const genres = await prisma.genre.findMany();

    // Save the movie after form submission
    const saveMovie = async (formData) => {
        "use server";

        const title = formData.get("title");
        const description = formData.get("description");
        const watched = formData.get("watched") === "on";
        const rating = parseInt(formData.get("rating"));
        const genreId = parseInt(formData.get("genreId"));

        if (!genreId) {
            throw new Error("Genre is required.");
        }

        // Create the movie in the database
        const movie = await prisma.movie.create({
            data: {
                title,
                description,
                watched,
                rating: isNaN(rating) ? null : rating,
                genre: { connect: { id: genreId } }, // Connect the genre
                user: { connect: { id: session.user.id } }, // Connect the logged-in user
            },
        });

        // Redirect to the newly created movie's page
        redirect(`/movies/${movie.id}`);
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-4">Add a New Movie</h1>
            <MovieForm genres={genres} onSubmit={saveMovie} />
        </div>
    );
}