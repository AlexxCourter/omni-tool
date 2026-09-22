"use client";

import React, { useEffect, useMemo, useState } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type Mode = "solo" | "pass";
type Phase = "config" | "player-turn" | "round-over" | "session-over";
type Result = "win" | "lose" | "push" | "bust" | "blackjack";

type Card = { rank: Rank; suit: Suit };

type RoundState = {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  result: Result | null;
  dealerVisible: boolean;
};

type PlayerSummary = {
  name: string;
  result: Result | null;
  playerTotal: number;
  dealerTotal: number;
};

type CardRenderProps = {
  card?: Card | null;
  faceDown?: boolean;
  delayMs?: number;
  label: string;
};

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck() {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }

  return deck;
}

function drawCard(deck: Card[]) {
  const nextDeck = deck.slice();
  const card = nextDeck.pop();
  if (!card) {
    return { card: null, deck: createDeck() };
  }
  return { card, deck: nextDeck };
}

function cardValue(card: Card) {
  if (card.rank === "A") return 11;
  if (card.rank === "K" || card.rank === "Q" || card.rank === "J") return 10;
  return Number(card.rank);
}

function handTotal(hand: Card[]) {
  let total = hand.reduce((sum, card) => sum + cardValue(card), 0);
  let aces = hand.filter((card) => card.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function isBlackjack(hand: Card[]) {
  return hand.length === 2 && handTotal(hand) === 21;
}

function formatCard(card: Card) {
  return `${card.rank}${card.suit}`;
}

function resultMessage(result: Result | null, name: string) {
  switch (result) {
    case "win":
      return `${name} wins.`;
    case "lose":
      return `${name} loses.`;
    case "push":
      return `${name} pushes.`;
    case "bust":
      return `${name} busts.`;
    case "blackjack":
      return `${name} hits blackjack.`;
    default:
      return "Round in progress.";
  }
}

function compareHands(playerTotal: number, dealerTotal: number): Result {
  if (playerTotal > 21) return "bust";
  if (dealerTotal > 21) return "win";
  if (playerTotal === 21 && dealerTotal !== 21) return "blackjack";
  if (dealerTotal === 21 && playerTotal !== 21) return "lose";
  if (playerTotal > dealerTotal) return "win";
  if (playerTotal < dealerTotal) return "lose";
  return "push";
}

function dealerPlay(deck: Card[], dealerHand: Card[]) {
  let nextDeck = deck;
  const nextDealerHand = dealerHand.slice();

  while (handTotal(nextDealerHand) < 17) {
    const draw = drawCard(nextDeck);
    if (!draw.card) break;
    nextDealerHand.push(draw.card);
    nextDeck = draw.deck;
  }

  return { deck: nextDeck, dealerHand: nextDealerHand };
}

function dealRound() {
  let deck = createDeck();
  const playerHand: Card[] = [];
  const dealerHand: Card[] = [];

  for (let index = 0; index < 2; index += 1) {
    const playerDraw = drawCard(deck);
    if (playerDraw.card) {
      playerHand.push(playerDraw.card);
      deck = playerDraw.deck;
    }

    const dealerDraw = drawCard(deck);
    if (dealerDraw.card) {
      dealerHand.push(dealerDraw.card);
      deck = dealerDraw.deck;
    }
  }

  return { deck, playerHand, dealerHand };
}

function makeSummary(name: string): PlayerSummary {
  return { name, result: null, playerTotal: 0, dealerTotal: 0 };
}

function isRedSuit(suit: Suit) {
  return suit === "♥" || suit === "♦";
}

function cardInkClass(card?: Card | null) {
  if (!card) return "black";
  return isRedSuit(card.suit) ? "red" : "black";
}

function CardView({ card, faceDown = false, delayMs = 0, label }: CardRenderProps) {
  if (!card && !faceDown) return null;
  const inkClass = cardInkClass(card);

  return (
    <div
      className={`blackjack-card-wrap ${faceDown ? "flip" : ""}`}
      style={{ animationDelay: `${delayMs}ms` }}
      aria-label={label}
    >
      {faceDown ? (
        <div className="blackjack-card-surface blackjack-card-back">
          <div className="back-pattern">
            <span>♣</span>
            <span>♠</span>
            <span>♥</span>
            <span>♦</span>
          </div>
        </div>
      ) : (
        <div className={`blackjack-card-surface blackjack-card-front ${inkClass}`}>
          {card ? (
            <>
              <span>{formatCard(card)}</span>
              <span className="card-suit">{card.suit}</span>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function Blackjack() {
  const [mode, setMode] = useState<Mode>("solo");
  const [phase, setPhase] = useState<Phase>("config");
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [round, setRound] = useState<RoundState | null>(null);
  const [players, setPlayers] = useState<PlayerSummary[]>([makeSummary("Player 1"), makeSummary("Player 2")]);
  const [status, setStatus] = useState("Choose a mode and deal the first hand.");
  const [showResultOverlay, setShowResultOverlay] = useState(false);

  const activePlayerName = mode === "solo" ? "Player" : players[activePlayerIndex]?.name ?? "Player";
  const dealerVisible = round?.dealerVisible ?? false;
  const playerTotal = round ? handTotal(round.playerHand) : 0;
  const dealerTotal = round ? handTotal(round.dealerHand) : 0;
  const isRoundOver = phase === "round-over" || phase === "session-over";
  const resultOverlay = round?.result
    ? round.result === "win" || round.result === "blackjack"
      ? "WIN"
      : round.result === "push"
        ? "PUSH"
        : "LOSE..."
    : null;

  useEffect(() => {
    setShowResultOverlay(false);

    if (!isRoundOver || !resultOverlay) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowResultOverlay(true);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [isRoundOver, resultOverlay, round?.result]);

  const visibleDealerHand = useMemo(() => {
    if (!round) return [];
    if (dealerVisible) return round.dealerHand;
    return round.dealerHand;
  }, [dealerVisible, round]);

  function resetSession(nextMode: Mode = mode) {
    setMode(nextMode);
    setPhase("config");
    setActivePlayerIndex(0);
    setRound(null);
    setPlayers([makeSummary("Player 1"), makeSummary("Player 2")]);
    setShowResultOverlay(false);
    setStatus(nextMode === "solo" ? "Solo mode ready." : "Pass the device to Player 1 and deal their hand.");
  }

  function finishRound(nextRound: RoundState, nextResult: Result) {
    const nextPlayerTotal = handTotal(nextRound.playerHand);
    const nextDealerTotal = handTotal(nextRound.dealerHand);
    const finishedRound = { ...nextRound, result: nextResult, dealerVisible: true };
    setRound(finishedRound);
    setPhase("round-over");
    setStatus(resultMessage(nextResult, activePlayerName));
    setPlayers((current) => {
      const next = current.slice();
      next[activePlayerIndex] = {
        name: next[activePlayerIndex].name,
        result: nextResult,
        playerTotal: nextPlayerTotal,
        dealerTotal: nextDealerTotal,
      };
      return next;
    });
  }

  function startRound() {
    setShowResultOverlay(false);
    const initial = dealRound();
    const roundState: RoundState = { ...initial, result: null, dealerVisible: false };
    setRound(roundState);

    if (isBlackjack(roundState.playerHand)) {
      const playedDealer = dealerPlay(roundState.deck, roundState.dealerHand);
      finishRound({ ...roundState, ...playedDealer }, compareHands(handTotal(roundState.playerHand), handTotal(playedDealer.dealerHand)));
      return;
    }

    if (isBlackjack(roundState.dealerHand)) {
      finishRound({ ...roundState, dealerHand: roundState.dealerHand, dealerVisible: true }, compareHands(handTotal(roundState.playerHand), handTotal(roundState.dealerHand)));
      return;
    }

    setPhase("player-turn");
    setStatus(`${activePlayerName} to act.`);
  }

  function hit() {
    if (!round || phase !== "player-turn") return;
    const draw = drawCard(round.deck);
    if (!draw.card) return;

    const playerHand = [...round.playerHand, draw.card];
    const nextRound = { ...round, deck: draw.deck, playerHand };
    const nextTotal = handTotal(playerHand);

    if (nextTotal > 21) {
      finishRound(nextRound, "bust");
      return;
    }

    setRound(nextRound);
    setStatus(`${activePlayerName} drew ${formatCard(draw.card)}. Hit or stand.`);
  }

  function stand() {
    if (!round || phase !== "player-turn") return;
    const playedDealer = dealerPlay(round.deck, round.dealerHand);
    const result = compareHands(handTotal(round.playerHand), handTotal(playedDealer.dealerHand));
    finishRound({ ...round, ...playedDealer }, result);
  }

  function dealAction() {
    if (phase === "player-turn") return;
    startRound();
  }

  return (
    <div className="p-6 blackjack-shell">
      <div className="flex flex-wrap gap-2 items-center justify-end">
          <button onClick={() => resetSession("solo")} className={`px-3 py-2 rounded-full border text-sm ${mode === "solo" ? "bg-white/15" : "bg-white/8"}`}>
            Solo
          </button>
          <button
            disabled
            title="Coming soon"
            className="px-3 py-2 rounded-full border text-sm bg-white/8 opacity-45 cursor-not-allowed"
            aria-disabled="true"
          >
            Two players
          </button>
      </div>

      <div className="blackjack-status rounded-2xl border p-4 mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-semibold">{status}</div>
          <div className="text-sm opacity-70 mt-1">
            {mode === "pass" ? `${activePlayerName} is up next.` : "Play your hand against the dealer."}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap text-sm">
          <span className="px-3 py-1 rounded-full border">Player: {round ? playerTotal : "-"}</span>
          <span className="px-3 py-1 rounded-full border">Dealer: {dealerVisible ? dealerTotal : "?"}</span>
        </div>
      </div>

      <div className="mt-6">
        <div className="blackjack-table-shell rounded-[2rem] border p-5 bg-white/4 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          {isRoundOver && resultOverlay && showResultOverlay ? (
            <div className="blackjack-result-overlay" aria-live="polite">
              <div className={`blackjack-result-message ${resultOverlay === "WIN" ? "win" : resultOverlay === "PUSH" ? "push" : "lose"}`}>
                {resultOverlay}
              </div>
              <div className="blackjack-result-hint">Click Deal cards to start the next hand.</div>
            </div>
          ) : null}

          <div className="blackjack-zone blackjack-zone-dealer mt-4">
            <div className="blackjack-zone-label">Dealer: {dealerVisible ? dealerTotal : "?"}</div>
            <div className="blackjack-cards">
              {round
                ? visibleDealerHand.map((card, index) => {
                    const isHiddenHoleCard = index === 1 && !dealerVisible;
                    return (
                      <CardView
                        key={`dealer-${index}`}
                        card={card}
                        faceDown={isHiddenHoleCard}
                        delayMs={index * 220}
                        label={isHiddenHoleCard ? "Dealer facedown card" : `Dealer card ${formatCard(card)}`}
                      />
                    );
                  })
                : <div className="text-sm opacity-70">Deal cards to start.</div>}
            </div>
          </div>

          <div className="blackjack-control-rail">
            <div className="blackjack-control-copy">
              <div className="blackjack-control-title">Table controls</div>
              <div className="blackjack-control-subtitle">Deal starts a new hand. Hit and stand are only active on your turn.</div>
            </div>
            <div className="blackjack-control-buttons">
              <button onClick={dealAction} className="blackjack-action-btn primary">
                Deal cards
              </button>
              <button onClick={hit} disabled={phase !== "player-turn"} className="blackjack-action-btn" aria-disabled={phase !== "player-turn"}>
                Hit
              </button>
              <button onClick={stand} disabled={phase !== "player-turn"} className="blackjack-action-btn" aria-disabled={phase !== "player-turn"}>
                Stand
              </button>
            </div>
          </div>

          <div className="blackjack-table-divider" />

          <div className="blackjack-zone blackjack-zone-player mt-4">
            <div className="blackjack-zone-label">Player: {round ? playerTotal : "-"}</div>
            <div className="blackjack-cards">
              {round
                ? round.playerHand.map((card, index) => (
                    <CardView
                      key={`player-${index}`}
                      card={card}
                      delayMs={index * 180}
                      label={`Player card ${formatCard(card)}`}
                    />
                  ))
                : <div className="text-sm opacity-70">No hand yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}