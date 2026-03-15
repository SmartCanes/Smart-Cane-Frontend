import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

// Tiny calendar 
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const CalendarMonth = ({ year, month, startDate, endDate, hoverDate, onDayClick, onDayHover }) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const isStart = (d) => d && startDate && d.toDateString() === startDate.toDateString();
  const isEnd = (d) => d && endDate && d.toDateString() === endDate.toDateString();
  const inRange = (d) => {
    if (!d || !startDate) return false;
    const end = endDate || hoverDate;
    if (!end) return false;
    const [lo, hi] = startDate <= end ? [startDate, end] : [end, startDate];
    return d > lo && d < hi;
  };

  return (
    <div className="select-none">
      <p className="text-center text-sm font-semibold text-[#11285A] mb-3">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          const start = isStart(date);
          const end = isEnd(date);
          const range = inRange(date);
          const today = date && date.toDateString() === new Date().toDateString();
          const future = date && date > new Date();

          return (
            <div
              key={i}
              onClick={() => date && !future && onDayClick(date)}
              onMouseEnter={() => date && !future && onDayHover(date)}
              className={`
                relative h-8 flex items-center justify-center text-xs cursor-pointer
                transition-colors duration-100
                ${!date ? "cursor-default" : ""}
                ${future ? "opacity-30 cursor-not-allowed" : ""}
                ${range ? "bg-blue-50" : ""}
                ${start || end ? "bg-[#11285A] rounded-full text-white font-bold z-10" : ""}
                ${!start && !end && date && !future ? "hover:bg-gray-100 rounded-full text-gray-700" : ""}
                ${today && !start && !end ? "font-bold text-[#11285A]" : ""}
              `}
            >
              {date?.getDate()}
              {today && !start && !end && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#11285A]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main FilterDropdown 
const FilterDropdown = ({
  // Action filter props
  actionOptions,
  selectedActions,
  onActionChange,

  // Status filter props
  statusOptions,
  selectedStatuses,
  onStatusChange,

  // Date filter props
  showDateFilter,
  startDate,
  endDate,
  onDateChange, // ({ startDate, endDate }) => void

  onClearAll,
  activeCount,
}) => {
  const [open, setOpen] = useState(false);
  const [calView, setCalView] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [hoverDate, setHoverDate] = useState(null);
  const [pickingEnd, setPickingEnd] = useState(false);
  const ref = useRef(null);

  const DATE_PRESETS = [
    { label: "Today", fn: () => { const d = new Date(); return { s: d, e: d }; } },
    { label: "Yesterday", fn: () => { const d = new Date(); d.setDate(d.getDate() - 1); return { s: d, e: d }; } },
    { label: "Last 7 days", fn: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 6); return { s, e }; } },
    { label: "Last 30 days", fn: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 29); return { s, e }; } },
  ];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDayClick = (date) => {
    if (!pickingEnd || !startDate) {
      onDateChange({ startDate: date, endDate: null });
      setPickingEnd(true);
    } else {
      const [s, e] = date >= startDate ? [startDate, date] : [date, startDate];
      onDateChange({ startDate: s, endDate: e });
      setPickingEnd(false);
      setHoverDate(null);
    }
  };

  const handlePreset = ({ s, e }) => {
    onDateChange({ startDate: s, endDate: e });
    setPickingEnd(false);
    setHoverDate(null);
  };

  const prevMonth = () => setCalView((v) => {
    if (v.month === 0) return { year: v.year - 1, month: 11 };
    return { ...v, month: v.month - 1 };
  });

  const nextMonth = () => setCalView((v) => {
    if (v.month === 11) return { year: v.year + 1, month: 0 };
    return { ...v, month: v.month + 1 };
  });

  const fmt = (d) => d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const isPresetActive = (preset) => {
    if (!startDate || !endDate) return false;
    const { s, e } = preset.fn();
    return startDate.toDateString() === s.toDateString() && endDate.toDateString() === e.toDateString();
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer
          ${open || activeCount > 0
            ? "border-[#11285A] bg-[#11285A] text-white shadow-sm"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          }`}
      >
        <Icon icon="ph:funnel-bold" className="text-base shrink-0" />
        <span className="hidden sm:inline">Filter</span>
        {activeCount > 0 && (
          <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold
            ${open || activeCount > 0 ? "bg-white text-[#11285A]" : "bg-[#11285A] text-white"}`}>
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 w-[320px] sm:w-[360px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-[#11285A]">Filters</span>
            {activeCount > 0 && (
              <button
                onClick={() => { onClearAll(); }}
                className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">

            {/* Action type filter */}
            {actionOptions && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                  Action Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {actionOptions.map((opt) => {
                    const active = selectedActions.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onActionChange(opt.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
                          ${active
                            ? "bg-[#11285A] text-white border-[#11285A]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#11285A] hover:text-[#11285A]"
                          }`}
                      >
                        {opt.icon && <Icon icon={opt.icon} className="text-sm" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status filter */}
            {statusOptions && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((opt) => {
                    const active = selectedStatuses.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onStatusChange(opt.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
                          ${active
                            ? "bg-[#11285A] text-white border-[#11285A]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#11285A] hover:text-[#11285A]"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Date filter */}
            {showDateFilter && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                  Date
                </p>

                {/* presets */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {DATE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePreset(preset.fn())}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
                        ${isPresetActive(preset)
                          ? "bg-[#11285A] text-white border-[#11285A]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#11285A] hover:text-[#11285A]"
                        }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* selected range display */}
                {(startDate || endDate) && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50 rounded-xl text-xs text-[#11285A] font-medium">
                    <Icon icon="ph:calendar-check" className="shrink-0" />
                    <span>
                      {fmt(startDate)}
                      {endDate && endDate.toDateString() !== startDate?.toDateString()
                        ? ` → ${fmt(endDate)}`
                        : ""}
                    </span>
                    <button
                      onClick={() => { onDateChange({ startDate: null, endDate: null }); setPickingEnd(false); }}
                      className="ml-auto text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <Icon icon="ph:x-bold" />
                    </button>
                  </div>
                )}

                {pickingEnd && startDate && !endDate && (
                  <p className="text-[11px] text-blue-500 font-medium mb-2 px-1">
                    Now pick an end date
                  </p>
                )}

                {/* calendar nav */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <button
                    onClick={prevMonth}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                  >
                    <Icon icon="ph:caret-left-bold" className="text-xs" />
                  </button>
                  <span className="text-xs font-semibold text-gray-700">
                    {MONTHS[calView.month]} {calView.year}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                  >
                    <Icon icon="ph:caret-right-bold" className="text-xs" />
                  </button>
                </div>

                <CalendarMonth
                  year={calView.year}
                  month={calView.month}
                  startDate={startDate}
                  endDate={endDate}
                  hoverDate={hoverDate}
                  onDayClick={handleDayClick}
                  onDayHover={setHoverDate}
                />
              </div>
            )}
          </div>

          {/* footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 rounded-xl bg-[#11285A] text-white text-sm font-semibold hover:bg-[#0d1f4a] transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;