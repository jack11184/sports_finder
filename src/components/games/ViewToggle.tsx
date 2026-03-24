"use client";

import { LayoutGrid, List, Clock } from "lucide-react";
import { ViewMode } from "@/types/database";

interface ViewToggleProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const views: { key: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { key: "grid", icon: LayoutGrid, label: "Grid" },
  { key: "list", icon: List, label: "List" },
  { key: "timeline", icon: Clock, label: "Timeline" },
];

export default function ViewToggle({
  activeView,
  onViewChange,
}: ViewToggleProps) {
  return (
    <div className="flex rounded-lg border border-border bg-bg-card">
      {views.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onViewChange(key)}
          title={label}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors first:rounded-l-lg last:rounded-r-lg ${
            activeView === key
              ? "bg-accent text-white"
              : "text-text-secondary hover:bg-bg-card-hover"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
