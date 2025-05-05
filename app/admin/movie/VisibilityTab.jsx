import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";

export default function VisibilityTab({ visibility, setVisibility, setTab }) {
  return (
    <div className="flex flex-col gap-4 items-start">
      <label htmlFor="visibility" className="text-foreground font-medium">Visibility</label>
      <RadioGroup value={visibility} onValueChange={setVisibility} className="flex flex-row gap-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" value="public" checked={visibility === "public"} onChange={() => setVisibility("public")} />
          <span>Public</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" value="private" checked={visibility === "private"} onChange={() => setVisibility("private")} />
          <span>Private</span>
        </label>
      </RadioGroup>
      <div className="w-full flex justify-start mt-6">
        <Button type="button" onClick={() => setTab("review")} className="bg-primary text-primary-foreground hover:bg-primary/90">Next</Button>
      </div>
    </div>
  );
}