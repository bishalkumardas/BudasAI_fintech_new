import { Link } from "@tanstack/react-router";
import { GripVertical } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5" />
          <span className="text-xl font-bold">BUDASAI</span>
        </div>
      </div>
    </header>
  );
}
