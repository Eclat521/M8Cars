"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import AuthPromptModal from "@/components/AuthPromptModal";

interface Props {
  vehicleId: number;
  isLoggedIn: boolean;
}

export default function DetailFavouriteButton({ vehicleId, isLoggedIn }: Props) {
  const [isFavourited, setIsFavourited] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/favourites")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.favourites)) {
          setIsFavourited(json.favourites.includes(vehicleId));
        }
      })
      .catch(() => {});
  }, [isLoggedIn, vehicleId]);

  async function toggle() {
    if (!isLoggedIn) {
      setShowAuthPrompt(true);
      return;
    }
    const next = !isFavourited;
    setIsFavourited(next);
    try {
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setIsFavourited(!next);
    }
  }

  async function onAuthSuccess() {
    setShowAuthPrompt(false);
    setIsFavourited(true);
    try {
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setIsFavourited(false);
    }
  }

  return (
    <>
      {showAuthPrompt && (
        <AuthPromptModal
          onClose={() => setShowAuthPrompt(false)}
          onSuccess={onAuthSuccess}
        />
      )}
      <button
        type="button"
        aria-label={isFavourited ? "Remove from favourites" : "Save to favourites"}
        onClick={toggle}
        className="group/btn flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white hover:border-red-300 transition-colors shadow-sm text-sm font-medium"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isFavourited
              ? "fill-red-500 text-red-500"
              : "text-gray-400 group-hover/btn:text-red-400"
          }`}
        />
        {isFavourited ? "Saved" : "Save"}
      </button>
    </>
  );
}
