import * as React from "react";

export function BirthdayYMDPicker({ value, onChange, minYear = 1900, maxYear = 2025 }) {
  const today = new Date();
  const [year, setYear] = React.useState(value ? new Date(value).getFullYear() : "");
  const [month, setMonth] = React.useState(value ? (new Date(value).getMonth() + 1) : "");
  const [day, setDay] = React.useState(value ? new Date(value).getDate() : "");

  React.useEffect(() => {
    if (year && month && day) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10) - 1;
      const d = parseInt(day, 10);
      const date = new Date(y, m, d);
      if (date && date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) {
        onChange(date.toISOString().slice(0, 10));
      } else {
        onChange("");
      }
    } else {
      onChange("");
    }
  }, [year, month, day, onChange]);

  // Days in month
  const daysInMonth = year && month ? new Date(year, month, 0).getDate() : 31;
  const years = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);
  const months = [
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
  ];
  const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, "0"));

  return (
    <div className="flex gap-2">
      <select
        className="bg-background text-white border border-input rounded-md h-9 px-2"
        value={year}
        onChange={e => setYear(e.target.value)}
      >
        <option value="">Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select
        className="bg-background text-white border border-input rounded-md h-9 px-2"
        value={month}
        onChange={e => setMonth(e.target.value)}
      >
        <option value="">Month</option>
        {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <select
        className="bg-background text-white border border-input rounded-md h-9 px-2"
        value={day}
        onChange={e => setDay(e.target.value)}
        disabled={!year || !month}
      >
        <option value="">Day</option>
        {days.map(d => <option key={d} value={parseInt(d, 10)}>{d}</option>)}
      </select>
    </div>
  );
}
