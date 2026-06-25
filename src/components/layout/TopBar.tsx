"use client";
import { ArrowLeft } from "lucide-react";

interface TopBarProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function TopBar({ title, onBack, right }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="flex items-center gap-3 px-4 h-14">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Retour"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 transition-colors -ml-1 flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="flex-1 text-base font-semibold text-gray-900 truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {title}
        </h1>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </header>
  );
}
