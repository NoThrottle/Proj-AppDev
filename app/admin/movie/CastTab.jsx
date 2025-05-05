import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ComboBox } from "./ComboBox";
import { BirthdayYMDPicker } from "./BirthdayYMDPicker";

export default function CastTab({ castList, castDialogOpen, setCastDialogOpen, newCastName, setNewCastName, newCastBirthday, setNewCastBirthday, newCastProfileUrl, setNewCastProfileUrl, handleCreateCast, selectedCast, setSelectedCast, castRole, setCastRole, customCastRole, setCustomCastRole, isCustomRole, setIsCustomRole, castRoles, setCastRoles, handleAddCastRole, handleRemoveCastRole, defaultRoles, tab, setTab }) {
  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <label className="text-foreground font-medium">Cast</label>
      <div className="flex gap-2 w-full items-end">
        <ComboBox options={castList} value={selectedCast} onChange={setSelectedCast} placeholder="Type to search cast member..." />
        <Button type="button" onClick={() => setCastDialogOpen(true)} className="shrink-0">+ New</Button>
      </div>
      {selectedCast && (
        <div className="flex flex-col gap-2 w-full border rounded p-4 bg-muted/30">
          <div className="flex items-center gap-4">
            <img
              src={castList.find(c => c.id.toString() === selectedCast)?.profileUrl || "/file.svg"}
              alt="Cast"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-semibold text-lg text-foreground">
                {castList.find(c => c.id.toString() === selectedCast)?.name}
              </div>
              <div className="text-sm text-muted-foreground">
                Age: {castList.find(c => c.id.toString() === selectedCast)?.birthday ? Math.floor((new Date().getTime() - new Date(castList.find(c => c.id.toString() === selectedCast)?.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : "-"}
              </div>
            </div>
          </div>
          <div className="flex items-end w-full mt-4">
            <div className="flex flex-col flex-1">
              <label className="text-foreground font-medium mb-1">Role</label>
              <Select value={isCustomRole ? "custom" : castRole} onValueChange={val => {
                if (val === "custom") {
                  setIsCustomRole(true);
                  setCastRole("");
                } else {
                  setIsCustomRole(false);
                  setCastRole(val);
                }
              }}>
                <SelectTrigger className="bg-background w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {defaultRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              {isCustomRole && (
                <Input
                  placeholder="Enter custom role"
                  value={customCastRole}
                  onChange={e => setCustomCastRole(e.target.value)}
                  className="bg-background w-40 mt-2"
                />
              )}
            </div>
            <div className="flex-1 flex justify-end">
              <Button type="button" onClick={handleAddCastRole} className="ml-4">Add</Button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full mt-4">
        <label className="text-foreground font-medium mb-2 block">Added Cast Members</label>
        <ul className="w-full divide-y divide-border">
          {(() => {
            // Group castRoles by castId
            const grouped = {};
            castRoles.forEach((cr, idx) => {
              if (!grouped[cr.castId]) grouped[cr.castId] = { roles: [], idxs: [] };
              grouped[cr.castId].roles.push(cr.role);
              grouped[cr.castId].idxs.push(idx);
            });
            const castIds = Object.keys(grouped);
            if (castIds.length === 0) return <li className="text-muted-foreground">No cast members added.</li>;
            return castIds.map(castId => {
              const castObj = castList.find(c => c.id.toString() === castId);
              return (
                <li key={castId} className="flex items-center gap-4 py-2 rounded mb-2 bg-background">
                  <img
                    src={castObj?.profileUrl ? castObj.profileUrl : "/file.svg"}
                    alt={castObj?.name || "Cast"}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={e => { e.target.onerror = null; e.target.src = "/file.svg"; }}
                  />
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="font-semibold text-foreground truncate">{castObj?.name || castId}</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {grouped[castId].roles.map((role, i) => (
                        <span key={i} className="px-2 py-0.5 bg-muted-foreground/20 rounded text-xs text-muted-foreground flex items-center gap-1">
                          {role}
                          <Button
                            type="button"
                            size="xs"
                            variant="ghost"
                            className="ml-1 px-0 py-0 h-5 w-5 text-xs bg-transparent shadow-none hover:bg-muted-foreground/10 focus:bg-muted-foreground/20 border-none"
                            onClick={() => handleRemoveCastRole(grouped[castId].idxs[i])}
                            title={`Remove role '${role}' from ${castObj?.name || castId}`}
                          >
                            ×
                          </Button>
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              );
            });
          })()}
        </ul>
      </div>
      <Dialog open={castDialogOpen} onOpenChange={setCastDialogOpen}>
        <DialogContent>
          <DialogTitle>Add Cast Member</DialogTitle>
          <form onSubmit={handleCreateCast} className="flex flex-col gap-2">
            <Input
              placeholder="Name"
              value={newCastName}
              onChange={e => setNewCastName(e.target.value)}
              required
              className="bg-background"
            />
            <BirthdayYMDPicker value={newCastBirthday} onChange={setNewCastBirthday} />
            <Input
              placeholder="Profile Picture URL (optional)"
              value={newCastProfileUrl}
              onChange={e => setNewCastProfileUrl(e.target.value)}
              className="bg-background"
            />
            <Button type="submit">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
      <div className="w-full flex justify-start mt-6">
        <Button type="button" onClick={() => setTab("platforms")} className="bg-primary text-primary-foreground hover:bg-primary/90">Next</Button>
      </div>
    </div>
  );
}