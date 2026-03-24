"use client";

import { LayoutGrid, List, Clock } from "lucide-react";
import { ViewMode } from "@/types/database";

interface ViewToggleProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const views: { key: ViewMode; icon: typeof LayoutGrid }[] = [
  { key: "grid", icon: LayoutGrid },
  { key: "list", icon: List },
  { key: "timeline", icon: Clock },
];

export default function ViewToggle({
  activeView,
  onViewChange,
}: ViewToggleProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-bg-card">
      {views.map(({ key, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onViewChange(key)}
          className={`p-2 rounded transition-colors ${
            activeView === key
              ? "bg-accent text-white"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
