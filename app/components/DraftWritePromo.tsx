"use client";

import React, { useState } from "react";
const TARGET_URL = "https://draftwrite.app";

export default function DraftWritePromo() {
  const [hidden, setHidden] = useState(false);

  const hidePromo = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setHidden(true);
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
        Our friends over at draftwrite.app just launched! Check out their easy to use writing and writing analysis tool by clicking here.
      </p>
    </aside>
  );
}
