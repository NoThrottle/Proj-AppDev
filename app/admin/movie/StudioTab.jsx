import { ComboBox } from "./ComboBox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function StudioTab({ studios, studiosSelected, setStudiosSelected, studioDialogOpen, setStudioDialogOpen, newStudioName, setNewStudioName, newStudioPicture, setNewStudioPicture, handleCreateStudio, setTab }) {
  function handleAddStudio(id) {
    if (!studiosSelected.includes(id)) setStudiosSelected([...studiosSelected, id]);
  }
  function handleRemoveStudio(id) {
    setStudiosSelected(studiosSelected.filter(sid => sid !== id));
  }
  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <label htmlFor="studio" className="text-foreground font-medium">Studios</label>
      <div className="flex gap-2 w-full">
        <ComboBox options={studios.filter(s => !studiosSelected.includes(s.id.toString()))} value={""} onChange={handleAddStudio} placeholder="Type to search studio..." />
        <Button type="button" onClick={() => setStudioDialogOpen(true)} className="shrink-0 h-9 rounded-md">+ New</Button>
      </div>
      <div className="flex flex-col gap-2 mt-2 w-full">
        {studiosSelected.length === 0 && (
          <div className="text-muted-foreground">No studios added.</div>
        )}
        {studiosSelected.map(sid => {
          const studio = studios.find(s => s.id.toString() === sid);
          if (!studio) return null;
          return (
            <div key={sid} className="flex items-center gap-4 p-3 rounded border bg-background shadow-sm mb-2">
              <img src={studio.pictureUrl || "/file.svg"} alt={studio.name} className="w-10 h-10 rounded object-cover bg-muted" onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{studio.name}</div>
              </div>
              <Button type="button" size="xs" variant="ghost" className="px-0 py-0 h-5 w-5 text-xs bg-transparent shadow-none border-none" onClick={() => handleRemoveStudio(sid)} title={`Remove ${studio.name}`}>×</Button>
            </div>
          );
        })}
      </div>
      <Dialog open={studioDialogOpen} onOpenChange={setStudioDialogOpen}>
        <DialogContent>
          <DialogTitle>Add Studio</DialogTitle>
          <form onSubmit={handleCreateStudio} className="flex flex-col gap-2">
            <Input
              placeholder="Studio Name"
              value={newStudioName}
              onChange={e => setNewStudioName(e.target.value)}
              required
            />
            <Input
              placeholder="Picture URL (optional)"
              value={newStudioPicture}
              onChange={e => setNewStudioPicture(e.target.value)}
            />
            <Button type="submit">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
      <div className="w-full flex justify-start mt-6">
        <Button type="button" onClick={() => setTab("cast")} className="bg-primary text-primary-foreground hover:bg-primary/90">Next</Button>
      </div>
    </div>
  );
}