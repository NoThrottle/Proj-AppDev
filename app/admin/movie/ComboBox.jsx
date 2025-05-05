import { Input } from "@/components/ui/input";
import * as React from "react";

export function ComboBox({ options, value, onChange, placeholder = "Type to search...", getLabel = o => o.name }) {
  const [query, setQuery] = React.useState("");
  const filtered = query
    ? options.filter(o => getLabel(o).toLowerCase().includes(query.toLowerCase()))
    : options;
  return (
    <div className="relative w-full max-w-xs">
      <Input
        placeholder={placeholder}
        value={query || (value ? getLabel(options.find(o => o.id.toString() === value)) : "")}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setQuery("")}
        className="bg-background w-full h-9 rounded-md text-white"
      />
      {query && (
        <div className="absolute z-10 mt-1 w-full bg-background border rounded shadow max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-2 text-muted-foreground">No results</div>
          ) : (
            filtered.map(o => (
              <div
                key={o.id}
                className="p-2 cursor-pointer hover:bg-accent"
                onMouseDown={() => {
                  onChange(o.id.toString());
                  setQuery("");
                }}
              >
                {getLabel(o)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
