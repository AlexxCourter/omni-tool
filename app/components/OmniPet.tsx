"use client";

import { useEffect, useRef, useState } from "react";

type Pet = {
  birth_date: string; // ISO
  name: string;
  sprite_set: string; // Cat, Dog, Alligator, Panda, Frog
  hunger: number; // 0-100
  cleanliness: number; // 0-100
  happiness: number; // 0-1000
  growth_stage: number; // 1-3
  last_tick?: string; // ISO last time hunger/cleanliness were decremented
};

const STORAGE_KEY = "omni_pet_v1";

const FOOD_EMOJI = ["🍪", "🍕", "🍓", "🍔"];

const SPRITE_CHOICES = ["Cat", "Dog", "Alligator", "Panda", "Frog"];

export default function OmniPet() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [overlayEmoji, setOverlayEmoji] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayKey, setOverlayKey] = useState(0);
  const [showStatus, setShowStatus] = useState(false);
  const [playCards, setPlayCards] = useState<string[] | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [spriteIndex, setSpriteIndex] = useState(0);
  const [spriteError, setSpriteError] = useState(false);
  const overlayHideRef = useRef<number | null>(null);
  const overlayRemoveRef = useRef<number | null>(null);
  const OVERLAY_EXIT_MS = 220;
  const OVERLAY_DEFAULT_MS = 900;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPet(JSON.parse(raw) as Pet);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (pet) localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, [pet]);

  function hatch() {
    const newPet: Pet = {
      birth_date: new Date().toISOString(),
      name: "",
      sprite_set: SPRITE_CHOICES[Math.floor(Math.random() * SPRITE_CHOICES.length)],
      hunger: 100,
      cleanliness: 100,
      happiness: 1,
      growth_stage: 1,
      last_tick: new Date().toISOString(),
    };
    setPet(newPet);
    // show in-app name modal
    setNameInput("");
    setTimeout(() => setShowNameModal(true), 40);
  }

  function feed() {
    if (!pet) return;
    if (pet.hunger >= 100) {
      showOverlay("❌");
      setPet({ ...pet, happiness: Math.max(0, pet.happiness - 1) });
      return;
    }
    const food = FOOD_EMOJI[Math.floor(Math.random() * FOOD_EMOJI.length)];
    showOverlay(food);
    setPet({ ...pet, hunger: Math.min(100, pet.hunger + 20) });
  }

  function clean() {
    if (!pet) return;
    if (pet.cleanliness >= 100) {
      showOverlay("❌");
      setPet({ ...pet, happiness: Math.max(0, pet.happiness - 1) });
      return;
    }
    showOverlay("🧼");
    setPet({ ...pet, cleanliness: Math.min(100, pet.cleanliness + 20) });
  }

  function status() {
    setShowStatus(true);
    setTimeout(() => setShowStatus(false), 3000);
  }

  function play() {
    // start the 3-card mini-game
    setPlayCards(shuffle(["♠️", "♥️", "🤡"]));
  }

  function pickCard(emoji: string) {
    if (!pet || !playCards) return;
    // reveal chosen
    if (emoji === "🤡") {
      setPet({ ...pet, happiness: Math.min(1000, pet.happiness + 5) });
      showOverlay("😄", 600);
    } else {
      showOverlay("😔", 600);
    }
    // keep only the picked card visible, hide after a moment
    setPlayCards([emoji]);
    setTimeout(() => { setPlayCards(null); }, 900);
  }

  // show overlay with managed enter/exit so we can animate out before removal
  function showOverlay(emoji: string, displayMs = OVERLAY_DEFAULT_MS) {
    // clear existing timers
    if (overlayHideRef.current) window.clearTimeout(overlayHideRef.current);
    if (overlayRemoveRef.current) window.clearTimeout(overlayRemoveRef.current);
    setOverlayEmoji(emoji);
    setOverlayVisible(true);
    setOverlayKey((k) => k + 1);
    // schedule hide (start exit animation)
    overlayHideRef.current = window.setTimeout(() => {
      setOverlayVisible(false);
      // remove element after exit animation
      overlayRemoveRef.current = window.setTimeout(() => setOverlayEmoji(null), OVERLAY_EXIT_MS);
    }, displayMs);
  }

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (overlayHideRef.current) window.clearTimeout(overlayHideRef.current);
      if (overlayRemoveRef.current) window.clearTimeout(overlayRemoveRef.current);
    };
  }, []);

  function shuffle<T>(arr: T[]) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function ageDays(birthIso: string) {
    const b = new Date(birthIso);
    const now = new Date();
    const diff = now.getTime() - b.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function ageDaysHours(birthIso: string) {
    const b = new Date(birthIso);
    const now = new Date();
    const diff = now.getTime() - b.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  }

  // apply offline ticks for hunger/cleanliness based on last_tick or birth
  useEffect(() => {
    if (!pet) return;
    const now = new Date();
    const last = pet.last_tick ? new Date(pet.last_tick) : new Date(pet.birth_date);
    const msPerTick = 6 * 60 * 1000; // 6 minutes
    const elapsed = now.getTime() - last.getTime();
    const ticks = Math.floor(elapsed / msPerTick);
    if (ticks > 0) {
      setPet((p) => {
        if (!p) return p;
        const hunger = Math.max(0, p.hunger - ticks);
        const cleanliness = Math.max(0, p.cleanliness - ticks);
        const updated = { ...p, hunger, cleanliness, last_tick: now.toISOString() };
        return updated;
      });
    } else if (!pet.last_tick) {
      // store initial last_tick
      setPet((p) => p ? { ...p, last_tick: now.toISOString() } : p);
    }

    // schedule recurring ticks every 6 minutes
    const interval = setInterval(() => {
      setPet((p) => {
        if (!p) return p;
        const hunger = Math.max(0, p.hunger - 1);
        const cleanliness = Math.max(0, p.cleanliness - 1);
        return { ...p, hunger, cleanliness, last_tick: new Date().toISOString() };
      });
    }, msPerTick);

    return () => clearInterval(interval);
  }, [pet?.birth_date]);

  // check growth criteria whenever pet updates
  useEffect(() => {
    if (!pet) return;
    // stage 2 criteria
    if (pet.growth_stage < 2) {
      const age = ageDays(pet.birth_date);
      if (age >= 1 && pet.hunger >= 75 && pet.happiness >= 100) {
        setPet((p) => p ? { ...p, growth_stage: 2 } : p);
      }
    }
    // stage 3 criteria: at least 10 days old, hunger >=75, happiness >=500
    if (pet.growth_stage < 3) {
      const age = ageDays(pet.birth_date);
      if (age >= 10 && pet.hunger >= 75 && pet.happiness >= 500) {
        setPet((p) => p ? { ...p, growth_stage: 3 } : p);
      }
    }
  }, [pet?.hunger, pet?.happiness, pet?.growth_stage, pet?.birth_date]);

  // sprite animation toggle (2s)
  useEffect(() => {
    if (!pet) return;
    const t = setInterval(() => setSpriteIndex((s) => 1 - s), 2000);
    return () => clearInterval(t);
  }, [pet?.growth_stage, pet?.sprite_set]);

  // reset sprite error when pet or sprite frame changes
  useEffect(() => {
    setSpriteError(false);
  }, [pet?.growth_stage, pet?.sprite_set, spriteIndex]);

  // helper to build sprite src path based on growth stage and chosen set
  function spriteSrc() {
    if (!pet) return undefined;
    const frame = spriteIndex + 1; // 1 or 2
    if (pet.growth_stage === 1) {
      return `/egg_${frame}.png`;
    }
    const map: Record<string, string> = {
      Cat: "cat",
      Dog: "dog",
      Alligator: "gator",
      Panda: "panda",
      Frog: "frog",
    };
    const key = map[pet.sprite_set] ?? pet.sprite_set.toLowerCase();
    return `/${key}_${frame}.png`;
  }

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <h2 className="text-2xl font-semibold">Omni-pet</h2>

      {!pet ? (
        <div className="p-6 text-center">
          <button onClick={hatch} className="btn btn-eq px-4 py-2">Hatch a pet</button>
        </div>
      ) : (
        <div className="relative w-full max-w-md p-4 border rounded flex flex-col items-center gap-4">
          {/* top-right overlay (not clipped) */}
          {overlayEmoji && (
            <div key={overlayKey} className={`absolute top-2 right-3 text-3xl z-80 pointer-events-none ${overlayVisible ? 'emoji-pop' : 'emoji-pop-exit'}`}>{overlayEmoji}</div>
          )}

          <div className="relative w-48 h-48 bg-gradient-to-b from-gray-800 to-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            {pet && (
              spriteError ? (
                <div className="text-6xl">🐾</div>
              ) : (
                <img src={spriteSrc()} alt={`${pet.name || 'Omni pet'} sprite`} onError={() => setSpriteError(true)} className="w-40 h-40 object-contain" />
              )
            )}
          </div>

          <div className="w-full flex justify-between items-center">
            <div className="font-semibold">{pet.name || "(unnamed)"}</div>
            <div className="text-xs opacity-60">Age: {ageDaysHours(pet.birth_date).days}d {ageDaysHours(pet.birth_date).hours}h</div>
          </div>

          <div className="w-full grid grid-cols-4 gap-2">
            <button onClick={status} className="p-2 border rounded">Status</button>
            <button onClick={feed} className="p-2 border rounded">Feed</button>
            <button onClick={clean} className="p-2 border rounded">Clean</button>
            <button onClick={play} className="p-2 border rounded">Play</button>
          </div>

          {/* play cards */}
          {playCards && (
            <div className="w-full mt-4 flex items-center justify-center gap-4">
              {playCards.map((c, i) => (
                <button key={i} onClick={() => pickCard(c)} className="p-4 bg-var card-shadow rounded">{c === '♠️' || c === '♥️' || c === '🤡' ? c : ' '}</button>
              ))}
            </div>
          )}

          {/* status drawer */}
          {showStatus && (
            <div className="w-full p-3 mt-4 border-t">
              <div className="text-sm font-semibold mb-2">Status</div>
              <div className="mb-2">Hunger</div>
              <div className="w-full bg-gray-900 h-4 rounded overflow-hidden mb-3">
                <div style={{ width: `${pet.hunger}%`, background: 'linear-gradient(90deg,#f59e0b,#f97316)' , height: '100%'}}/>
                <div className="absolute w-full h-4 flex">
                  {[1,2,3].map((i)=> <div key={i} style={{ width: '25%', borderLeft: '1px solid rgba(255,255,255,0.06)' }}/>) }
                </div>
              </div>

              <div className="mb-2">Cleanliness</div>
              <div className="w-full bg-gray-900 h-4 rounded overflow-hidden mb-3">
                <div style={{ width: `${pet.cleanliness}%`, background: 'linear-gradient(90deg,#60a5fa,#3b82f6)' , height: '100%'}}/>
                <div className="absolute w-full h-4 flex">
                  {[1,2,3].map((i)=> <div key={i} style={{ width: '25%', borderLeft: '1px solid rgba(255,255,255,0.06)' }}/>) }
                </div>
              </div>

              <div className="mb-2">Happiness</div>
              <div className="w-full bg-gray-900 h-4 rounded overflow-hidden mb-1">
                <div style={{ width: `${Math.min(100, Math.floor(pet.happiness/10))}%`, background: 'linear-gradient(90deg,#34d399,#10b981)' , height: '100%'}}/>
                <div className="absolute w-full h-4 flex">
                  {Array.from({length:10}).map((_,i)=> <div key={i} style={{ width: '10%', borderLeft: '1px solid rgba(255,255,255,0.04)' }}/>) }
                </div>
              </div>
            </div>
          )}

        </div>
      )}
      {/* name modal */}
      {showNameModal && pet && (
        <div className="fixed inset-0 flex items-center justify-center z-80">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative p-6 bg-var rounded w-80">
            <div className="font-semibold mb-2">Name your pet</div>
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full p-2 mb-3 bg-black/10 rounded" placeholder="Pet name" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowNameModal(false); setPet((p) => p ? { ...p, name: (nameInput || 'Omni') } : p); }} className="px-3 py-1 border rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
