"use client";

import { useMemo, useState } from "react";
import { format, addDays, isSameDay, parse, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({
  selectedDate,
  onDateChange,
}: DatePickerProps) {
  const today = startOfDay(new Date());
  const [windowStart, setWindowStart] = useState<Date>(today);

  const days = useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(windowStart, i)),
    [windowStart]
  );

  const scrollLeft = () => {
    setWindowStart((prev) => addDays(prev, -7));
  };

  const scrollRight = () => {
    setWindowStart((prev) => addDays(prev, 7));
  };

  const onPickDate = (value: string) => {
    if (!value) return;
    const picked = startOfDay(parse(value, "yyyy-MM-dd", new Date()));
    onDateChange(picked);
    // Recenter the visible strip around selected day.
    setWindowStart(addDays(picked, -6));
  };

  return (
    <div className="flex items-center gap-2 py-4">
      <button
        onClick={scrollLeft}
        className="p-2 rounded-lg bg-bg-card hover:bg-bg-card-hover transition-colors flex-shrink-0"
      >
        <ChevronLeft className="w-5 h-5 text-text-secondary" />
      </button>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateChange(day)}
              className={`flex flex-col items-center px-4 py-3 rounded-lg min-w-[70px] transition-all flex-shrink-0 ${
                isSelected
                  ? "bg-accent text-white"
                  : "bg-bg-card text-text-secondary hover:bg-bg-card-hover"
              }`}
            >
              <span className="text-xs opacity-80">
                {format(day, "EEE")}
              </span>
              <span className="text-lg font-medium">
                {format(day, "d")}
              </span>
              {isToday && !isSelected && (
                <span className="text-xs text-accent">Today</span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={scrollRight}
        className="p-2 rounded-lg bg-bg-card hover:bg-bg-card-hover transition-colors flex-shrink-0"
      >
        <ChevronRight className="w-5 h-5 text-text-secondary" />
      </button>

      <label className="relative p-2 rounded-lg bg-bg-card hover:bg-bg-card-hover transition-colors flex-shrink-0 cursor-pointer">
        <Calendar className="w-5 h-5 text-text-secondary" />
        <input
          type="date"
          aria-label="Pick date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(e) => onPickDate(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
    </div>
  );
}
