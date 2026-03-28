"use client";

import { Heart } from "lucide-react";

interface FavouriteButtonProps {
  vehicleId: number;
  isFavourited: boolean;
  onToggle: (vehicleId: number) => void;
}

export default function FavouriteButton({ vehicleId, isFavourited, onToggle }: FavouriteButtonProps) {
  return (
    <button
      type="button"
      aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(vehicleId);
      }}
      className="group/btn p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          isFavourited ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/btn:text-red-400"
        }`}
      />
    </button>
  );
}
