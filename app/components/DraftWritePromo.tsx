"use client";

import React, { useEffect, useState } from "react";

const STORAGE_KEY = "omni_draftwrite_promo_hidden_v1";
const TARGET_URL = "https://draftwrite.app";

export default function DraftWritePromo() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Ignore storage errors and keep promo visible.
    }
  }, []);

  const hidePromo = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setHidden(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors.
    }
  };

  const openPromo = () => {
    window.open(TARGET_URL, "_blank", "noopener,noreferrer");
  };

  if (hidden) {
    return null;
  }

  return (
    <aside
      className="draftwrite-promo"
      onClick={openPromo}
      role="button"
      tabIndex={0}
      aria-label="Open draftwrite.app"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPromo();
        }
      }}
    >
      <button
        type="button"
        className="draftwrite-promo-hide"
        onClick={hidePromo}
        aria-label="Hide ad"
      >
        hide x
      </button>

      <img
        className="draftwrite-promo-image"
        src="/draft-write-promo.png"
        alt="DraftWrite promotional graphic"
      />

      <p className="draftwrite-promo-text">
        Our friends over at draftwrite.app just launched! Check them out if you
        want an easier writing tool.
      </p>
    </aside>
  );
}
