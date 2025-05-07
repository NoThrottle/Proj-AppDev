"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BasicTab from "../BasicTab";
import PublisherTab from "../PublisherTab";
import StudioTab from "../StudioTab";
import CastTab from "../CastTab";
import PlatformsTab from "../PlatformsTab";
import VisibilityTab from "../VisibilityTab";
import ReviewTab from "../ReviewTab";
import MoviePreview from "../MoviePreview";

export default function EditMoviePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  // State (same as add page)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [publisher, setPublisher] = useState("");
  const [studio, setStudio] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("basic");
  const [publishers, setPublishers] = useState([]);
  const [publishersSelected, setPublishersSelected] = useState([]);
  const [studios, setStudios] = useState([]);
  const [studiosSelected, setStudiosSelected] = useState([]);
  const [platformsList, setPlatformsList] = useState([]);
  const [platformsSelected, setPlatformsSelected] = useState([]);
  const [castList, setCastList] = useState([]);
  const [castDialogOpen, setCastDialogOpen] = useState(false);
  const [newCastName, setNewCastName] = useState("");
  const [newCastBirthday, setNewCastBirthday] = useState("");
  const [newCastProfileUrl, setNewCastProfileUrl] = useState("");
  const [castRoles, setCastRoles] = useState([]);
  const [selectedCast, setSelectedCast] = useState("");
  const [castRole, setCastRole] = useState("");
  const [customCastRole, setCustomCastRole] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [editCast, setEditCast] = useState(null);
  const defaultRoles = ["Actor", "Director", "Writer", "Producer", "Composer", "Cinematographer", "Editor"];
  const [genres, setGenres] = useState([]);
  const [genresSelected, setGenresSelected] = useState([]);

  // Fetch movie data
  useEffect(() => {
    if (!id) return;
    fetch(`/api/movies/query?id=${id}`)
      .then(res => res.json())
      .then(data => {
        const m = data.movie;
        if (!m) return;
        setTitle(m.title || "");
        setDescription(m.description || "");
        setPosterUrl(m.posterUrl || "");
        setBannerUrl(m.bannerUrl || "");
        setVisibility(m.visibility || "public");
        setGenresSelected(m.genres?.map(g => String(g.id)) || []);
        setPublishersSelected(m.publishers?.map(p => String(p.id)) || []);
        setStudiosSelected(m.studios?.map(s => String(s.id)) || []);
        setPlatformsSelected(m.platforms?.map(p => String(p.id)) || []);
        setCastRoles(m.movieCasts?.map(mc => ({ castId: String(mc.cast.id), role: mc.role })) || []);
        setCastList(m.movieCasts?.map(mc => mc.cast) || []);
      });
  }, [id]);

  // Fetch lists (same as add page)
  useEffect(() => { fetch("/api/cast").then(res => res.json()).then(setCastList); }, [castDialogOpen]);
  useEffect(() => { fetch("/api/publishers").then(res => res.json()).then(setPublishers); }, []);
  useEffect(() => { fetch("/api/studios").then(res => res.json()).then(setStudios); }, []);
  useEffect(() => { fetch("/api/platforms").then(res => res.json()).then(setPlatformsList); }, []);
  useEffect(() => { fetch("/api/genres").then(res => res.json()).then(setGenres); }, []);

  function handleAddCastRole() {
    const roleToAdd = isCustomRole ? customCastRole : castRole;
    if (selectedCast && roleToAdd) {
      setCastRoles(prev => [...prev, { castId: selectedCast, role: roleToAdd }]);
      setSelectedCast("");
      setCastRole("");
      setCustomCastRole("");
      setIsCustomRole(false);
    }
  }
  function handleRemoveCastRole(idx) {
    setCastRoles(prev => prev.filter((_, i) => i !== idx));
  }

  if (status === "loading") return <div>Loading...</div>;
  if (!session?.user?.admin) {
    return <div className="p-8 text-center text-red-500">403 Forbidden. Admins only.</div>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/movies/${id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          posterUrl,
          bannerUrl,
          genresSelected,
          publishersSelected,
          studiosSelected,
          platformsSelected,
          castRoles,
          visibility,
        }),
      });
      if (!res.ok) throw new Error("Failed to update movie");
      setSuccess("Movie updated!");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-7xl mx-auto">
      <div className="inline-block align-top mt-10 p-6 bg-background rounded shadow w-full lg:max-w-xl" style={{ minWidth: 350 }}>
        <h1 className="text-2xl font-bold mb-4 text-foreground">Edit Movie</h1>
        <form onSubmit={handleSubmit}>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="publisher">Publisher</TabsTrigger>
              <TabsTrigger value="studio">Studio</TabsTrigger>
              <TabsTrigger value="cast">Cast</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="visibility">Visibility</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <BasicTab {...{title, setTitle, description, setDescription, posterUrl, setPosterUrl, bannerUrl, setBannerUrl, genres, genresSelected, setGenresSelected, setTab}} />
            </TabsContent>
            <TabsContent value="publisher">
              <PublisherTab {...{
                publishers,
                publishersSelected,
                setPublishersSelected,
                setTab
              }} />
            </TabsContent>
            <TabsContent value="studio">
              <StudioTab {...{
                studios,
                studiosSelected,
                setStudiosSelected,
                setTab
              }} />
            </TabsContent>
            <TabsContent value="cast">
              <CastTab {...{castList, castDialogOpen, setCastDialogOpen, newCastName, setNewCastName, newCastBirthday, setNewCastBirthday, newCastProfileUrl, setNewCastProfileUrl, selectedCast, setSelectedCast, castRole, setCastRole, customCastRole, setCustomCastRole, isCustomRole, setIsCustomRole, castRoles, setCastRoles, handleAddCastRole, handleRemoveCastRole, defaultRoles, tab, setTab}} />
            </TabsContent>
            <TabsContent value="platforms">
              <PlatformsTab {...{
                platformsList,
                platformsSelected,
                setPlatformsSelected,
                setTab
              }} />
            </TabsContent>
            <TabsContent value="visibility">
              <VisibilityTab {...{visibility, setVisibility, setTab}} />
            </TabsContent>
            <TabsContent value="review">
              <ReviewTab {...{
                title,
                description,
                posterUrl,
                bannerUrl,
                publishers,
                publishersSelected,
                studios,
                studiosSelected,
                castRoles,
                castList,
                platformsList,
                platformsSelected,
                visibility,
                loading,
                error,
                success,
                genres,
                genresSelected
              }} />
            </TabsContent>
          </Tabs>
        </form>
      </div>
      <div className="hidden lg:flex flex-1 flex-col items-start mt-10">
        <div className="bg-card rounded-xl shadow border p-4 w-full">
          <div className="mb-6 text-lg font-semibold text-center text-muted-foreground">Preview</div>
          <MoviePreview
            title={title}
            description={description}
            posterUrl={posterUrl}
            bannerUrl={bannerUrl}
            genres={genres.filter(g => genresSelected.includes(String(g.id)))}
            publishers={publishers.filter(p => publishersSelected.includes(String(p.id)))}
            studios={studios.filter(s => studiosSelected.includes(String(s.id)))}
            platforms={platformsList.filter(p => platformsSelected.includes(String(p.id)))}
            castRoles={castRoles}
            castList={castList}
            visibility={visibility}
          />
        </div>
      </div>
    </div>
  );
}
