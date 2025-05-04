import { useState } from "react";

export default function ColorPickerWithInput({ name }) {
  const [color, setColor] = useState("#ffffff");
  return (
    <div className="mb-4 flex items-center gap-2">
      <label htmlFor={name} className="text-sm">Tint Color:</label>
      <div className="relative flex items-center">
        <input
          id={name}
          name={name}
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition-colors cursor-pointer bg-white dark:bg-gray-800"
          style={{ padding: 0, background: 'none' }}
        />
        <span className="absolute left-0 top-0 w-8 h-8 rounded-lg border border-gray-400 dark:border-gray-700 pointer-events-none" style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}></span>
      </div>
      <input
        name={name}
        value={color}
        onChange={e => setColor(e.target.value)}
        placeholder="#hex or CSS color (optional)"
        className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 rounded px-2 py-1"
        type="text"
      />
    </div>
  );
}
