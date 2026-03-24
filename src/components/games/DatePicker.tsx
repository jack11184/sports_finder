"use client";

import { format, addDays, isSameDay } from "date-fns";

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({
  selectedDate,
  onDateChange,
}: DatePickerProps) {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);

        return (
          <button
            key={day.toISOString()}
            onClick={() => onDateChange(day)}
            className={`flex shrink-0 flex-col items-center rounded-lg px-4 py-2 transition-colors ${
              isSelected
                ? "bg-accent text-white"
                : "bg-bg-card text-text-secondary hover:bg-bg-card-hover"
            }`}
          >
            <span className="text-xs font-medium">
              {isToday ? "Today" : format(day, "EEE")}
            </span>
            <span className="text-lg font-bold">{format(day, "d")}</span>
            <span className="text-xs">{format(day, "MMM")}</span>
          </button>
        );
      })}
    </div>
  );
}
