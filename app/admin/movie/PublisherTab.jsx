import { ComboBox } from "./ComboBox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function PublisherTab({ publishers, publishersSelected, setPublishersSelected, publisherDialogOpen, setPublisherDialogOpen, newPublisherName, setNewPublisherName, newPublisherPicture, setNewPublisherPicture, handleCreatePublisher, setTab }) {
  function handleAddPublisher(id) {
    if (!publishersSelected.includes(id)) setPublishersSelected([...publishersSelected, id]);
  }
  function handleRemovePublisher(id) {
    setPublishersSelected(publishersSelected.filter(pid => pid !== id));
  }
  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <label htmlFor="publisher" className="text-foreground font-medium">Publishers</label>
      <div className="flex gap-2 w-full">
        <ComboBox options={publishers.filter(p => !publishersSelected.includes(p.id.toString()))} value={""} onChange={handleAddPublisher} placeholder="Type to search publisher..." />
        <Button type="button" onClick={() => setPublisherDialogOpen(true)} className="shrink-0 h-9 rounded-md">+ New</Button>
      </div>
      <div className="flex flex-col gap-2 mt-2 w-full">
        {publishersSelected.length === 0 && (
          <div className="text-muted-foreground">No publishers added.</div>
        )}
        {publishersSelected.map(pid => {
          const pub = publishers.find(p => p.id.toString() === pid);
          if (!pub) return null;
          return (
            <div key={pid} className="flex items-center gap-4 p-3 rounded border bg-background shadow-sm mb-2">
              <img src={pub.pictureUrl || "/file.svg"} alt={pub.name} className="w-10 h-10 rounded object-cover bg-muted" onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{pub.name}</div>
              </div>
              <Button type="button" size="xs" variant="ghost" className="px-0 py-0 h-5 w-5 text-xs bg-transparent shadow-none border-none" onClick={() => handleRemovePublisher(pid)} title={`Remove ${pub.name}`}>×</Button>
            </div>
          );
        })}
      </div>
      <Dialog open={publisherDialogOpen} onOpenChange={setPublisherDialogOpen}>
        <DialogContent>
          <DialogTitle>Add Publisher</DialogTitle>
          <form onSubmit={handleCreatePublisher} className="flex flex-col gap-2">
            <Input
              placeholder="Publisher Name"
              value={newPublisherName}
              onChange={e => setNewPublisherName(e.target.value)}
              required
            />
            <Input
              placeholder="Picture URL (optional)"
              value={newPublisherPicture}
              onChange={e => setNewPublisherPicture(e.target.value)}
            />
            <Button type="submit">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
      <div className="w-full flex justify-start mt-6">
        <Button type="button" onClick={() => setTab("studio")} className="bg-primary text-primary-foreground hover:bg-primary/90">Next</Button>
      </div>
    </div>
  );
}