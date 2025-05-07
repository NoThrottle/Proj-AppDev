"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BasicTab from "./BasicTab";
import PublisherTab from "./PublisherTab";
import StudioTab from "./StudioTab";
import CastTab from "./CastTab";
import PlatformsTab from "./PlatformsTab";
import VisibilityTab from "./VisibilityTab";
import ReviewTab from "./ReviewTab";
import MoviePreview from "./MoviePreview";

export default function AddMoviePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
  const [publisherDialogOpen, setPublisherDialogOpen] = useState(false);
  const [newPublisherName, setNewPublisherName] = useState("");
  const [newPublisherPicture, setNewPublisherPicture] = useState("");

  const [studios, setStudios] = useState([]);
  const [studiosSelected, setStudiosSelected] = useState([]);
  const [studioDialogOpen, setStudioDialogOpen] = useState(false);
  const [newStudioName, setNewStudioName] = useState("");
  const [newStudioPicture, setNewStudioPicture] = useState("");

  const [platformsList, setPlatformsList] = useState([]);
  const [platformsSelected, setPlatformsSelected] = useState([]);
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newPlatformImage, setNewPlatformImage] = useState("");

  const [castList, setCastList] = useState([]);
  const [castDialogOpen, setCastDialogOpen] = useState(false);
  const [newCastName, setNewCastName] = useState("");
  const [newCastBirthday, setNewCastBirthday] = useState("");
  const [newCastProfileUrl, setNewCastProfileUrl] = useState("");
  const [castRoles, setCastRoles] = useState([]); // [{ castId, role }]
  const [selectedCast, setSelectedCast] = useState("");
  const [castRole, setCastRole] = useState("");
  const [customCastRole, setCustomCastRole] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [editCast, setEditCast] = useState(null);
  const defaultRoles = ["Actor", "Director", "Writer", "Producer", "Composer", "Cinematographer", "Editor"];

  const [genres, setGenres] = useState([]);
  const [genresSelected, setGenresSelected] = useState([]);

  useEffect(() => {
    fetch("/api/cast")
      .then(res => res.json())
      .then(setCastList);
  }, [castDialogOpen]); // refresh when dialog closes (new cast added)

  // Fetch publishers on mount
  useEffect(() => {
    fetch("/api/publishers")
      .then(res => res.json())
      .then(setPublishers);
  }, []);

  // Fetch studios on mount
  useEffect(() => {
    fetch("/api/studios")
      .then(res => res.json())
      .then(setStudios);
  }, []);

  // Fetch platforms on mount
  useEffect(() => {
    fetch("/api/platforms")
      .then(res => res.json())
      .then(setPlatformsList);
  }, []);

  // Fetch genres on mount
  useEffect(() => {
    fetch("/api/genres")
      .then(res => res.json())
      .then(setGenres);
  }, []);

  async function handleCreatePublisher(e) {
    e.preventDefault();
    const res = await fetch("/api/publishers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPublisherName, pictureUrl: newPublisherPicture })
    });
    if (res.ok) {
      const created = await res.json();
      setPublishers(prev => [...prev, created]);
      setPublishersSelected(prev => [...prev, created.id.toString()]); // auto-add new publisher
      setPublisherDialogOpen(false);
      setNewPublisherName("");
      setNewPublisherPicture("");
    }
  }

  async function handleCreateStudio(e) {
    e.preventDefault();
    const res = await fetch("/api/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStudioName, pictureUrl: newStudioPicture })
    });
    if (res.ok) {
      const created = await res.json();
      setStudios(prev => [...prev, created]);
      setStudiosSelected(prev => [...prev, created.id.toString()]); // auto-add new studio
      setStudioDialogOpen(false);
      setNewStudioName("");
      setNewStudioPicture("");
    }
  }

  async function handleCreatePlatform(e) {
    e.preventDefault();
    const res = await fetch("/api/platforms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPlatformName, image: newPlatformImage })
    });
    if (res.ok) {
      const created = await res.json();
      setPlatformsList(prev => [...prev, created]);
      setPlatformsSelected(prev => [...prev, created.id.toString()]); // auto-add new platform
      setPlatformDialogOpen(false);
      setNewPlatformName("");
      setNewPlatformImage("");
    }
  }

  async function handleCreateCast(e) {
    e.preventDefault();
    const res = await fetch("/api/cast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCastName, birthday: newCastBirthday, profileUrl: newCastProfileUrl })
    });
    if (res.ok) {
      const created = await res.json();
      setCastList(prev => [...prev, created]);
      setCastDialogOpen(false);
      setNewCastName("");
      setNewCastBirthday("");
      setNewCastProfileUrl("");
    }
  }

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
      const res = await fetch("/api/movies/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          posterUrl,
          bannerUrl,
          genresSelected,
          publisher,
          studio,
          platforms,
          castRoles, // send cast-role pairs
          visibility,
        }),
      });
      if (!res.ok) throw new Error("Failed to add movie");
      const data = await res.json();
      setSuccess("Movie added!");
      setTitle("");
      setDescription("");
      setPosterUrl("");
      setBannerUrl("");
      setPublisher("");
      setStudio("");
      setPlatforms("");
      setCastRoles([]);
      setVisibility("public");
      setPublishersSelected([]);
      setStudiosSelected([]);
      setPlatformsSelected([]);
      setGenresSelected([]);
      if (data.movie && data.movie.id) {
        router.push(`/watchlist/${data.movie.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-7xl mx-auto">
      <div className="inline-block align-top mt-10 p-6 bg-background rounded shadow w-full lg:max-w-xl" style={{ minWidth: 350 }}>
        <h1 className="text-2xl font-bold mb-4 text-foreground">Add Movie</h1>
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
                publisherDialogOpen,
                setPublisherDialogOpen,
                newPublisherName,
                setNewPublisherName,
                newPublisherPicture,
                setNewPublisherPicture,
                handleCreatePublisher,
                setTab
              }} />
            </TabsContent>
            <TabsContent value="studio">
              <StudioTab {...{
                studios,
                studiosSelected,
                setStudiosSelected,
                studioDialogOpen,
                setStudioDialogOpen,
                newStudioName,
                setNewStudioName,
                newStudioPicture,
                setNewStudioPicture,
                handleCreateStudio,
                setTab
              }} />
            </TabsContent>
            <TabsContent value="cast">
              <CastTab {...{castList, castDialogOpen, setCastDialogOpen, newCastName, setNewCastName, newCastBirthday, setNewCastBirthday, newCastProfileUrl, setNewCastProfileUrl, handleCreateCast, selectedCast, setSelectedCast, castRole, setCastRole, customCastRole, setCustomCastRole, isCustomRole, setIsCustomRole, castRoles, setCastRoles, handleAddCastRole, handleRemoveCastRole, defaultRoles, tab, setTab}} />
            </TabsContent>
            <TabsContent value="platforms">
              <PlatformsTab {...{
                platformsList,
                platformsSelected,
                setPlatformsSelected,
                platformDialogOpen,
                setPlatformDialogOpen,
                newPlatformName,
                setNewPlatformName,
                newPlatformImage,
                setNewPlatformImage,
                handleCreatePlatform,
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
      {/* Preview frame on the right for large screens */}
      <div className="hidden lg:block flex-1 sticky top-10">
        <div className="bg-card rounded-xl shadow border p-4 mt-16">
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
