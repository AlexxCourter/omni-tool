"use client";

import React, { useState } from "react";

type Piece = null | { color: "red" | "black"; king?: boolean };

const initialBoard = (): Piece[][] => {
  const board: Piece[][] = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board[r][c] = { color: "black" };
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board[r][c] = { color: "red" };
    }
  }
  return board;
};

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export default function Checkers() {
  const [board, setBoard] = useState<Piece[][]>(() => initialBoard());
  const [turn, setTurn] = useState<"red" | "black">("red");
  const [selected, setSelected] = useState<[number, number] | null>(null);

  function canMoveFrom(r: number, c: number) {
    const p = board[r][c];
    if (!p) return false;
    return p.color === turn;
  }

  function possibleMoves(r: number, c: number) {
    const p = board[r][c];
    if (!p) return [] as [number, number][];
    // directions: normal pieces move one way; kings move both directions
    const dirs = p.king ? [-1, 1] : p.color === "red" ? [-1] : [1];
    const moves: [number, number][] = [];

    const tryMove = (nr: number, nc: number) => {
      if (!inBounds(nr, nc)) return;
      if (!board[nr][nc]) moves.push([nr, nc]);
    };

    for (const dir of dirs) {
      tryMove(r + dir, c - 1);
      tryMove(r + dir, c + 1);
      // capture checks (jump over opponent)
      const mr1 = r + dir;
      const mc1 = c - 1;
      const tr1 = r + dir * 2;
      const tc1 = c - 2;
      if (inBounds(mr1, mc1) && inBounds(tr1, tc1)) {
        const mid = board[mr1][mc1];
        if (mid && mid.color !== p.color && !board[tr1][tc1]) moves.push([tr1, tc1]);
      }

      const mr2 = r + dir;
      const mc2 = c + 1;
      const tr2 = r + dir * 2;
      const tc2 = c + 2;
      if (inBounds(mr2, mc2) && inBounds(tr2, tc2)) {
        const mid = board[mr2][mc2];
        if (mid && mid.color !== p.color && !board[tr2][tc2]) moves.push([tr2, tc2]);
      }
    }

    return moves;
  }

  function handleSquareClick(r: number, c: number) {
    const p = board[r][c];
    if (selected) {
      const [sr, sc] = selected;
      const moves = possibleMoves(sr, sc).map(([a, b]) => `${a},${b}`);
      if (moves.includes(`${r},${c}`)) {
        // perform move
        setBoard((prev) => {
          const copy = prev.map((row) => row.slice());
          copy[r][c] = copy[sr][sc];
          copy[sr][sc] = null;
          // check capture
          if (Math.abs(r - sr) === 2) {
            const mr = (r + sr) / 2;
            const mc = (c + sc) / 2;
            copy[mr][mc] = null;
          }
          // promote to king
          if (
            copy[r][c] &&
            ((copy[r][c]!.color === "red" && r === 0) || (copy[r][c]!.color === "black" && r === 7))
          ) {
            copy[r][c] = { ...copy[r][c]!, king: true };
          }
          return copy;
        });
        setSelected(null);
        setTurn((t) => (t === "red" ? "black" : "red"));
        return;
      }
      // if clicked own piece, change selection
      if (p && p.color === turn) {
        setSelected([r, c]);
        return;
      }
      // otherwise clear selection
      setSelected(null);
    } else {
      if (p && p.color === turn) setSelected([r, c]);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Checkers</h1>
        <div className="text-sm opacity-80">Turn: {turn === "red" ? "🔴 Red" : "⚫ Black"}</div>
      </div>

  <div className="checkers-board grid grid-cols-8 gap-0 border rounded">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const dark = (r + c) % 2 === 1;
            const isSelected = selected && selected[0] === r && selected[1] === c;
            const moves = selected ? possibleMoves(selected[0], selected[1]).map(([a, b]) => `${a},${b}`) : [];
            const isMoveTarget = moves.includes(`${r},${c}`);
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                aria-label={`Square ${r + 1}-${c + 1}${cell ? `, ${cell.color} piece${cell.king ? ", king" : ""}` : ""}`}
                className={`flex items-center justify-center square-button ${dark ? "square-dark" : "square-light"} ${isSelected ? "selected-square" : ""} ${isMoveTarget ? "move-target" : ""}`}
              >
                {cell ? (
                  <span className="relative inline-flex items-center justify-center">
                    <span aria-hidden className="piece-emoji">{cell.color === "red" ? "🔴" : "⚫"}</span>
                    {cell.king ? <span aria-hidden className="king-overlay">👑</span> : null}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
