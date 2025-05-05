import { Card } from "@/components/ui/card";

export default function MoviePreview({
  title,
  description,
  posterUrl,
  bannerUrl,
  genres = [],
  publishers = [],
  studios = [],
  platforms = [],
  castRoles = [],
  castList = [],
  visibility = "public"
}) {
  // Map castRoles to cast objects if possible
  const castMap = Object.fromEntries(castList.map(c => [String(c.id), c]));
  return (
    <div className="max-w-2xl mx-auto p-0">
      {/* Banner section */}
      <div className="w-full max-w-[1200px] mx-auto h-48 md:h-64 rounded-b-lg mb-6 overflow-hidden relative flex items-center justify-center -mt-4 bg-muted-foreground/10">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : posterUrl ? (
          <img src={posterUrl} alt="Poster" className="w-32 h-48 object-cover rounded shadow-lg border-2 border-background absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" style={{ zIndex: 2 }} />
        ) : (
          <div className="text-muted-foreground text-lg">No banner or poster available</div>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-2">{title || <span className="text-muted-foreground">Movie Title</span>}</h1>
      <div className="flex gap-4 mb-4">
        {posterUrl && (
          <img src={posterUrl} alt="Poster" className="w-32 h-48 object-cover rounded border" />
        )}
        <div className="flex-1">
          <div className="mb-2 text-muted-foreground whitespace-pre-line">{description || <span className="text-muted-foreground">Movie description...</span>}</div>
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {genres.map((g, i) => (
                <span key={g.id || g.name || i} className="px-2 py-0.5 bg-muted-foreground/20 rounded text-xs text-muted-foreground">{g.name || g}</span>
              ))}
            </div>
          )}
          {publishers.length > 0 && (
            <div className="mb-1"><b>Publishers:</b> {publishers.map(p => p.name || p).join(", ")}</div>
          )}
          {studios.length > 0 && (
            <div className="mb-1"><b>Studios:</b> {studios.map(s => s.name || s).join(", ")}</div>
          )}
          {platforms.length > 0 && (
            <div className="mb-1"><b>Platforms:</b> {platforms.map(p => p.name || p).join(", ")}</div>
          )}
        </div>
      </div>
      {castRoles.length > 0 && (
        <div className="mb-4">
          <b>Cast:</b>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {castRoles.map((cr, i) => {
              const cast = castMap[cr.castId] || { name: cr.castId, profileUrl: "" };
              return (
                <Card key={i} className="flex flex-col items-center p-3">
                  <img
                    src={cast.profileUrl || "/file.svg"}
                    alt={cast.name}
                    className="w-16 h-16 object-cover rounded-full mb-2 border"
                    onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }}
                  />
                  <div className="font-semibold text-center">{cast.name}</div>
                  <div className="text-xs text-muted-foreground text-center">{cr.role}</div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-4 text-sm text-muted-foreground">Visibility: {visibility}</div>
    </div>
  );
}
