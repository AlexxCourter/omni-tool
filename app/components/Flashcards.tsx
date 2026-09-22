"use client";

import React, { useEffect, useMemo, useState } from "react";

type Flashcard = {
  id: string;
  front: string;
  back: string;
};

type FlashcardDeck = {
  id: string;
  name: string;
  cards: Flashcard[];
};

type SavedData = {
  decks: FlashcardDeck[];
  selectedDeckId: string;
};

const STORAGE_KEY = "omni_flashcards_v1";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultDecks(): FlashcardDeck[] {
  return [
    {
      id: "starter-deck",
      name: "Starter Deck",
      cards: [
        { id: makeId(), front: "What is 2 + 2?", back: "4" },
        { id: makeId(), front: "Capital of France", back: "Paris" },
      ],
    },
  ];
}

export default function Flashcards() {
  const [decks, setDecks] = useState<FlashcardDeck[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedData;
        if (saved && Array.isArray(saved.decks) && saved.decks.length > 0) {
          return saved.decks;
        }
      }
    } catch {
      // ignore malformed local data
    }
    return defaultDecks();
  });
  const [selectedDeckId, setSelectedDeckId] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedData;
        if (saved && saved.selectedDeckId) return saved.selectedDeckId;
      }
    } catch {
      // ignore malformed local data
    }
    return "starter-deck";
  });
  const [newDeckName, setNewDeckName] = useState("");
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);

  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");

  const [flippedCardIds, setFlippedCardIds] = useState<Set<string>>(new Set());

  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyFlipped, setStudyFlipped] = useState(false);
  const [studyCorrect, setStudyCorrect] = useState(0);
  const [studyAttempted, setStudyAttempted] = useState(0);

  const selectedDeck = useMemo(() => decks.find((deck) => deck.id === selectedDeckId) ?? decks[0], [decks, selectedDeckId]);

  useEffect(() => {
    if (!decks.length) return;
    try {
      const payload: SavedData = {
        decks,
        selectedDeckId: selectedDeckId || decks[0].id,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage failures
    }
  }, [decks, selectedDeckId]);

  function stopStudyMode() {
    setIsStudyMode(false);
    setStudyCards([]);
    setStudyIndex(0);
    setStudyFlipped(false);
    setStudyCorrect(0);
    setStudyAttempted(0);
  }

  function selectDeck(deckId: string) {
    setSelectedDeckId(deckId);
    setFlippedCardIds(new Set());
    setShowAddCardForm(false);
    stopStudyMode();
  }

  function createDeck() {
    const name = newDeckName.trim();
    if (!name) return;

    const nextDeck: FlashcardDeck = {
      id: makeId(),
      name,
      cards: [],
    };

    setDecks((prev) => [...prev, nextDeck]);
    setSelectedDeckId(nextDeck.id);
    setNewDeckName("");
    setShowCreateDeckModal(false);
    setFlippedCardIds(new Set());
    stopStudyMode();
  }

  function addCard() {
    if (!selectedDeck) return;
    const front = newCardFront.trim();
    const back = newCardBack.trim();
    if (!front || !back) return;

    const card: Flashcard = {
      id: makeId(),
      front,
      back,
    };

    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === selectedDeck.id
          ? { ...deck, cards: [...deck.cards, card] }
          : deck
      )
    );

    setNewCardFront("");
    setNewCardBack("");
    setShowAddCardForm(false);
  }

  function toggleCard(cardId: string) {
    setFlippedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }

  function resetCards() {
    setFlippedCardIds(new Set());
  }

  function toggleStudyMode() {
    if (!selectedDeck) return;

    if (isStudyMode) {
      stopStudyMode();
      return;
    }

    if (selectedDeck.cards.length === 0) return;

    setIsStudyMode(true);
    setStudyCards(selectedDeck.cards.slice());
    setStudyIndex(0);
    setStudyFlipped(false);
    setStudyCorrect(0);
    setStudyAttempted(0);
  }

  function gradeStudyCard(correct: boolean) {
    const nextAttempted = studyAttempted + 1;
    const nextCorrect = studyCorrect + (correct ? 1 : 0);
    const isLastCard = studyIndex >= studyCards.length - 1;

    setStudyAttempted(nextAttempted);
    setStudyCorrect(nextCorrect);

    if (isLastCard) {
      stopStudyMode();
      return;
    }

    setStudyIndex((value) => value + 1);
    setStudyFlipped(false);
  }

  const currentStudyCard = isStudyMode ? studyCards[studyIndex] : null;
  const totalCards = selectedDeck?.cards.length ?? 0;

  return (
    <div className="p-3 sm:p-6">
      {showCreateDeckModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <button
            aria-label="Close create deck modal"
            className="absolute inset-0 bg-black/55"
            onClick={() => setShowCreateDeckModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border bg-[var(--background)] p-4">
            <h3 className="text-lg font-semibold">Create Deck</h3>
            <input
              value={newDeckName}
              onChange={(event) => setNewDeckName(event.target.value)}
              placeholder="Deck name"
              className="w-full mt-3 px-3 py-2 rounded border bg-white/5"
              autoFocus
            />
            <div className="mt-3 flex gap-2 justify-end">
              <button onClick={() => setShowCreateDeckModal(false)} className="px-3 py-2 rounded border bg-white/8 hover:bg-white/12">
                Cancel
              </button>
              <button onClick={createDeck} className="px-3 py-2 rounded border bg-white/10 hover:bg-white/15" disabled={!newDeckName.trim()}>
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[260px_1fr] items-start">
        <aside className="w-full border rounded-xl p-3 bg-white/4 lg:sticky lg:top-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Decks</h2>
            <button
              onClick={() => setShowCreateDeckModal(true)}
              className="h-8 w-8 rounded-full border bg-white/10 hover:bg-white/15 text-lg leading-none"
              aria-label="Create deck"
              title="Create deck"
            >
              +
            </button>
          </div>

          <div className="mt-3 space-y-2 max-h-[60vh] overflow-auto pr-1">
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => selectDeck(deck.id)}
                className={`w-full text-left px-3 py-2 rounded border ${deck.id === selectedDeck?.id ? "bg-white/12 border-white/30" : "bg-white/3 border-white/10"}`}
              >
                <div className="font-medium">{deck.name}</div>
                <div className="text-xs opacity-70">{deck.cards.length} cards</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 border rounded-xl p-4 sm:p-5 bg-white/4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">{selectedDeck?.name ?? "No Deck"}</h2>
              <div className="text-sm opacity-75">Total cards: {totalCards}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isStudyMode ? (
                <>
                  <button onClick={() => setShowAddCardForm((value) => !value)} className="px-3 py-2 rounded border bg-white/10 hover:bg-white/15">
                    Add card
                  </button>
                  <button onClick={resetCards} className="px-3 py-2 rounded border bg-white/8 hover:bg-white/12" disabled={totalCards === 0}>
                    Reset cards
                  </button>
                </>
              ) : null}

              <button onClick={toggleStudyMode} className="px-3 py-2 rounded border bg-white/10 hover:bg-white/15" disabled={totalCards === 0 && !isStudyMode}>
                {isStudyMode ? "Review" : "Study"}
              </button>
            </div>
          </div>

          {showAddCardForm && !isStudyMode ? (
            <div className="mt-4 border rounded-lg p-3 bg-white/5">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={newCardFront}
                  onChange={(event) => setNewCardFront(event.target.value)}
                  placeholder="Card front"
                  className="px-3 py-2 rounded border bg-white/6"
                />
                <input
                  value={newCardBack}
                  onChange={(event) => setNewCardBack(event.target.value)}
                  placeholder="Card back"
                  className="px-3 py-2 rounded border bg-white/6"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={addCard} className="px-3 py-2 rounded border bg-white/10 hover:bg-white/15">Save card</button>
                <button onClick={() => setShowAddCardForm(false)} className="px-3 py-2 rounded border bg-white/8 hover:bg-white/12">Cancel</button>
              </div>
            </div>
          ) : null}

          {isStudyMode && currentStudyCard ? (
            <div className="mt-5">
              <div className="text-sm opacity-80 mb-3">Score: {studyCorrect} / {studyAttempted}</div>
              <div className="text-xs uppercase tracking-[0.2em] opacity-70 mb-2">Card {studyIndex + 1} of {studyCards.length}</div>

              <button
                onClick={() => setStudyFlipped((value) => !value)}
                className={`flashcard-tile flashcard-study w-full min-h-52 rounded-xl border p-0 text-center ${studyFlipped ? "is-flipped" : ""}`}
              >
                <div className="flashcard-tile-inner">
                  <div className="flashcard-face flashcard-front">
                    <div className="text-lg leading-relaxed whitespace-pre-wrap text-center">{currentStudyCard.front}</div>
                  </div>
                  <div className="flashcard-face flashcard-back">
                    <div className="text-lg leading-relaxed whitespace-pre-wrap text-center">{currentStudyCard.back}</div>
                  </div>
                </div>
              </button>

              {studyFlipped ? (
                <div className="mt-4 flex gap-3">
                  <button onClick={() => gradeStudyCard(true)} className="px-4 py-2 rounded border bg-emerald-700/40 hover:bg-emerald-700/55">✓ Correct</button>
                  <button onClick={() => gradeStudyCard(false)} className="px-4 py-2 rounded border bg-red-700/40 hover:bg-red-700/55">✕ Missed</button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {selectedDeck?.cards.length ? (
                selectedDeck.cards.map((card) => {
                  const isFlipped = flippedCardIds.has(card.id);
                  return (
                    <button
                      key={card.id}
                      onClick={() => toggleCard(card.id)}
                      className={`flashcard-tile text-center rounded-xl border p-0 min-h-40 ${isFlipped ? "is-flipped" : ""}`}
                    >
                      <div className="flashcard-tile-inner">
                        <div className="flashcard-face flashcard-front">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap text-center">{card.front}</div>
                        </div>
                        <div className="flashcard-face flashcard-back">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap text-center">{card.back}</div>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full rounded-xl border p-5 bg-white/3 text-sm opacity-80">
                  This deck has no cards yet. Use Add card to create your first flashcard.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}