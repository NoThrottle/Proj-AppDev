import { ComboBox } from "./ComboBox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function PlatformsTab({ platformsList, platformsSelected, setPlatformsSelected, platformDialogOpen, setPlatformDialogOpen, newPlatformName, setNewPlatformName, newPlatformImage, setNewPlatformImage, handleCreatePlatform, setTab }) {
  function handleAddPlatform(id) {
    if (!platformsSelected.includes(id)) setPlatformsSelected([...platformsSelected, id]);
  }
  function handleRemovePlatform(id) {
    setPlatformsSelected(platformsSelected.filter(pid => pid !== id));
  }
  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <label htmlFor="platforms" className="text-foreground font-medium">Platforms</label>
      <div className="flex gap-2 w-full">
        <ComboBox options={platformsList.filter(p => !platformsSelected.includes(p.id.toString()))} value={""} onChange={handleAddPlatform} placeholder="Type to search platform..." />
        <Button type="button" onClick={() => setPlatformDialogOpen(true)} className="shrink-0 h-9 rounded-md">+ New</Button>
      </div>
      <div className="flex flex-col gap-2 mt-2 w-full">
        {platformsSelected.length === 0 && (
          <div className="text-muted-foreground">No platforms added.</div>
        )}
        {platformsSelected.map(pid => {
          const plat = platformsList.find(p => p.id.toString() === pid);
          if (!plat) return null;
          return (
            <div key={pid} className="flex items-center gap-4 p-3 rounded border bg-background shadow-sm mb-2">
              <img src={plat.image || "/file.svg"} alt={plat.name} className="w-10 h-10 rounded object-cover bg-muted" onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{plat.name}</div>
              </div>
              <Button type="button" size="xs" variant="ghost" className="px-0 py-0 h-5 w-5 text-xs bg-transparent shadow-none border-none" onClick={() => handleRemovePlatform(pid)} title={`Remove ${plat.name}`}>×</Button>
            </div>
          );
        })}
      </div>
      <Dialog open={platformDialogOpen} onOpenChange={setPlatformDialogOpen}>
        <DialogContent>
          <DialogTitle>Add Platform</DialogTitle>
          <form onSubmit={handleCreatePlatform} className="flex flex-col gap-2">
            <Input
              placeholder="Platform Name"
              value={newPlatformName}
              onChange={e => setNewPlatformName(e.target.value)}
              required
            />
            <Input
              placeholder="Image URL (optional)"
              value={newPlatformImage}
              onChange={e => setNewPlatformImage(e.target.value)}
            />
            <Button type="submit">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
      <div className="w-full flex justify-start mt-6">
        <Button type="button" onClick={() => setTab("visibility")} className="bg-primary text-primary-foreground hover:bg-primary/90">Next</Button>
      </div>
    </div>
  );
}