import { Button } from "@/components/ui/button";

export default function ReviewTab({ title, description, posterUrl, bannerUrl, publishers, publishersSelected = [], studios, studiosSelected = [], castRoles, castList, platformsList, platformsSelected = [], visibility, loading, error, success, genres, genresSelected = [] }) {
  return (
    <div className="flex flex-col gap-6 items-start w-full max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-foreground mb-2">Review Movie Details</h2>
      {(bannerUrl || posterUrl) && (
        <div className="w-full flex flex-row items-start gap-4 mb-2">
          <div className="flex-shrink-0 flex flex-col gap-2">
            {bannerUrl && (
              <img
                src={bannerUrl}
                alt="Banner Preview"
                className="w-48 max-h-32 object-cover rounded border"
                style={{ background: '#222' }}
                onError={e => { e.target.onerror = null; e.target.src = '/file.svg'; }}
              />
            )}
            {posterUrl && (
              <img
                src={posterUrl}
                alt="Poster Preview"
                className="w-24 h-36 object-cover rounded border mt-2"
                style={{ background: '#222' }}
                onError={e => { e.target.onerror = null; e.target.src = '/file.svg'; }}
              />
            )}
          </div>
          <div className="flex flex-col justify-start gap-2 flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground mb-1 break-words">{title}</h2>
            <div className="text-muted-foreground break-words whitespace-pre-line">{description}</div>
            {genres && genresSelected && genresSelected.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {genresSelected.map(gid => {
                  const genre = genres.find(g => g.id.toString() === gid);
                  return genre ? (
                    <span key={gid} className="px-2 py-0.5 bg-muted-foreground/20 rounded text-xs text-muted-foreground flex items-center gap-1">
                      {genre.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="w-full border rounded p-4 bg-muted/30 text-left">
        <h3 className="font-semibold mb-2">Images</h3>
        <div><b>Poster URL:</b> {posterUrl}</div>
        <div><b>Banner Image URL:</b> {bannerUrl}</div>
      </div>
      <div className="w-full border rounded p-4 bg-muted/30 text-left">
        <h3 className="font-semibold mb-2">Publishers</h3>
        <div className="flex flex-col gap-2">
          {publishersSelected.length === 0 && <div className="text-muted-foreground">No publishers added.</div>}
          {publishersSelected.map(pid => {
            const pub = publishers.find(p => p.id.toString() === pid);
            if (!pub) return null;
            return (
              <div key={pid} className="flex items-center gap-4 p-2 rounded border bg-background shadow-sm">
                <img src={pub.pictureUrl || "/file.svg"} alt={pub.name} className="w-8 h-8 rounded object-cover bg-muted" onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }} />
                <div className="font-semibold text-foreground truncate">{pub.name}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full border rounded p-4 bg-muted/30 text-left">
        <h3 className="font-semibold mb-2">Studios</h3>
        <div className="flex flex-col gap-2">
          {studiosSelected.length === 0 && <div className="text-muted-foreground">No studios added.</div>}
          {studiosSelected.map(sid => {
            const studio = studios.find(s => s.id.toString() === sid);
            if (!studio) return null;
            return (
              <div key={sid} className="flex items-center gap-4 p-2 rounded border bg-background shadow-sm">
                <img src={studio.pictureUrl || "/file.svg"} alt={studio.name} className="w-8 h-8 rounded object-cover bg-muted" onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }} />
                <div className="font-semibold text-foreground truncate">{studio.name}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full border rounded p-4 bg-muted/30 text-left">
        <h3 className="font-semibold mb-2">Cast</h3>
        <ul className="divide-y divide-border">
          {castRoles.length === 0 && <li className="text-muted-foreground">No cast members added.</li>}
          {castRoles.map((cr, idx) => {
            const castObj = castList.find(c => c.id.toString() === cr.castId);
            return (
              <li key={idx} className="flex items-center gap-4 py-2">
                <img
                  src={castObj?.profileUrl ? castObj.profileUrl : "/file.svg"}
                  alt={castObj?.name || "Cast"}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }}
                />
                <div className="flex-1 flex flex-col">
                  <span className="font-semibold text-foreground">{castObj?.name || cr.castId}</span>
                  <span className="text-sm text-muted-foreground">{cr.role}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="w-full border rounded p-4 bg-muted/30 text-left">
        <h3 className="font-semibold mb-2">Platforms</h3>
        <div className="flex flex-col gap-2">
          {platformsSelected.length === 0 && <div className="text-muted-foreground">No platforms added.</div>}
          {platformsSelected.map(pid => {
            const plat = platformsList.find(p => p.id.toString() === pid);
            if (!plat) return null;
            return (
              <div key={pid} className="flex items-center gap-4 p-2 rounded border bg-background shadow-sm">
                <img src={plat.image || "/file.svg"} alt={plat.name} className="w-8 h-8 rounded object-cover bg-muted" onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }} />
                <div className="font-semibold text-foreground truncate">{plat.name}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full border rounded p-4 bg-muted/30 text-left">
        <h3 className="font-semibold mb-2">Visibility</h3>
        <div>{visibility.charAt(0).toUpperCase() + visibility.slice(1)}</div>
      </div>
      <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full mt-6">
        {loading ? "Adding..." : "Add Movie"}
      </Button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </div>
  );
}