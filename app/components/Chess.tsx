"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChessPawn,
  faChessRook,
  faChessKnight,
  faChessBishop,
  faChessQueen,
  faChessKing,
} from "@fortawesome/free-solid-svg-icons";

type ModalState = { from: string; to: string } | null;

const ICON_MAP: Record<string, any> = {
  p: faChessPawn,
  r: faChessRook,
  n: faChessKnight,
  b: faChessBishop,
  q: faChessQueen,
  k: faChessKing,
};

function squareName(r: number, c: number) {
  const file = String.fromCharCode("a".charCodeAt(0) + c);
  const rank = 8 - r;
  return `${file}${rank}`;
}

export default function ChessComponent() {
  const [game] = useState(() => new Chess());
  const [, setTick] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<ModalState>(null);

  // force update helper
  const refresh = () => setTick((t) => t + 1);

  // recompute board on each render from the mutable chess.js instance
  const board = game.board();

  const legalTargets: string[] = selected
    ? game
        .moves({ verbose: true })
        .filter((m: any) => m.from === selected)
        .map((m: any) => m.to)
    : [];

  useEffect(() => {
    // re-render whenever game history changes
    const orig = game.history;
    refresh();
    // no cleanup necessary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSquareClick(r: number, c: number) {
    const sq = squareName(r, c);
  const piece = game.get(sq as any);
    if (selected) {
      // check legal moves for the selected piece
      const legalMove = game.moves({ verbose: true }).find((m: any) => m.from === selected && m.to === sq);
      if (!legalMove) {
        // if user clicked on another own piece, change selection
        if (piece && piece.color === game.turn()) {
          setSelected(sq);
          refresh();
          return;
        }
        setSelected(null);
        refresh();
        return;
      }

      // handle promotion via modal
      if (legalMove.promotion) {
        setPromotion({ from: selected, to: sq });
        setSelected(null);
        refresh();
        return;
      }

      // execute legal move
      try {
        const res = game.move({ from: selected, to: sq } as any);
        if (res) refresh();
      } catch (err) {
        // ignore invalid move errors
      }
      setSelected(null);
      return;
    }
    if (piece && piece.color === game.turn()) {
      setSelected(sq);
      refresh();
    }
  }

  function doPromotion(pieceType: string) {
    if (!promotion) return;
    const { from, to } = promotion;
    const res = game.move({ from, to, promotion: pieceType } as any);
    if (res) refresh();
    setPromotion(null);
  }

  const turn = game.turn() === "w" ? "white" : "black";

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chess</h1>
        <div className="text-sm opacity-80">Turn: {turn}</div>
      </div>

      <div className="chess-board grid grid-cols-8 gap-0 border rounded mx-auto" role="grid" aria-label="Chess board">
        {board.map((row: any[], r: number) =>
          row.map((cell: any, c: number) => {
            const sq = squareName(r, c);
            const dark = (r + c) % 2 === 1;
            const isSelected = selected === sq;
            const isMoveTarget = legalTargets.includes(sq);
            return (
              <button
                key={sq}
                role="gridcell"
                aria-label={`Square ${sq}${cell ? `, ${cell.color} ${cell.type}` : ""}`}
                onClick={() => handleSquareClick(r, c)}
                className={`square-button ${dark ? "square-dark" : "square-light"} ${isSelected ? "selected-square" : ""} ${isMoveTarget ? "move-target" : ""}`}
              >
                {cell ? (
                  <FontAwesomeIcon
                    icon={ICON_MAP[cell.type]}
                    className={`piece-emoji ${cell.color === "w" ? "piece-white" : "piece-black"} ${dark ? "on-dark" : "on-light"}`}
                  />
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {/* promotion modal */}
      {promotion ? (
        <div className="promo-modal fixed inset-0 flex items-center justify-center">
          <div className="promo-backdrop absolute inset-0 bg-black/50" />
          <div className="promo-card relative bg-var card p-4 rounded z-10">
            <div className="mb-3 font-semibold">Select a piece to promote to</div>
            <div className="flex gap-3">
              {[
                ["q", faChessQueen],
                ["r", faChessRook],
                ["b", faChessBishop],
                ["n", faChessKnight],
              ].map(([t, icon]) => (
                <button key={t as string} className="p-3 border rounded" onClick={() => doPromotion(t as string)}>
                  <FontAwesomeIcon icon={icon as any} className="text-2xl" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
