"use client";

import React, { useMemo, useState } from "react";

type Color = "white" | "black";
type Source = { kind: "point"; point: number } | { kind: "bar" } | null;
type PointMove = { kind: "point"; point: number; dice: number[] };
type BearOffMove = { kind: "bear-off"; dice: number[] };
type MoveTarget = PointMove | BearOffMove;

type GameState = {
  points: Color[][];
  bar: Record<Color, number>;
  borneOff: Record<Color, number>;
  turn: Color;
  dice: number[];
  selected: Source;
  winner: Color | null;
  message: string;
};

const POINTS_PER_SIDE = 12;
const CHECKERS_PER_COLOR = 15;
const COLORS: Color[] = ["white", "black"];

function otherColor(color: Color): Color {
  return color === "white" ? "black" : "white";
}

function titleCase(color: Color) {
  return color === "white" ? "White" : "Black";
}

function pointIndex(point: number) {
  return point - 1;
}

function pointOwner(stack: Color[]) {
  return stack.length > 0 ? stack[0] : null;
}

function createInitialState(): GameState {
  const points: Color[][] = Array.from({ length: 24 }, () => []);
  const place = (point: number, color: Color, count: number) => {
    for (let index = 0; index < count; index += 1) {
      points[pointIndex(point)].push(color);
    }
  };

  place(24, "white", 2);
  place(13, "white", 5);
  place(8, "white", 3);
  place(6, "white", 5);

  place(1, "black", 2);
  place(12, "black", 5);
  place(17, "black", 3);
  place(19, "black", 5);

  return {
    points,
    bar: { white: 0, black: 0 },
    borneOff: { white: 0, black: 0 },
    turn: "white",
    dice: [],
    selected: null,
    winner: null,
    message: "White to roll.",
  };
}

function clonePoints(points: Color[][]) {
  return points.map((stack) => stack.slice());
}

function isPointBlocked(stack: Color[], color: Color) {
  return stack.length >= 2 && pointOwner(stack) === otherColor(color);
}

function isSourceOwned(state: GameState, source: Source, color: Color) {
  if (!source) return false;
  if (source.kind === "bar") {
    return state.bar[color] > 0;
  }
  const stack = state.points[pointIndex(source.point)];
  return pointOwner(stack) === color;
}

function homeRange(color: Color) {
  return color === "white" ? { start: 1, end: 6 } : { start: 19, end: 24 };
}

function isAllInHome(state: GameState, color: Color) {
  if (state.bar[color] > 0) return false;
  const { start, end } = homeRange(color);
  return state.points.every((stack, index) => {
    const point = index + 1;
    if (stack.length === 0) return true;
    if (pointOwner(stack) !== color) return true;
    return point >= start && point <= end;
  });
}

function canBearOffFromPoint(state: GameState, point: number, die: number, color: Color) {
  if (!isAllInHome(state, color)) return false;
  const { start, end } = homeRange(color);

  if (color === "white") {
    if (point < start || point > end) return false;
    const distance = point;
    if (die < distance) return false;
    if (die === distance) return true;
    for (let cursor = point + 1; cursor <= end; cursor += 1) {
      if (state.points[pointIndex(cursor)].includes(color)) return false;
    }
    return true;
  }

  if (point < start || point > end) return false;
  const distance = 25 - point;
  if (die < distance) return false;
  if (die === distance) return true;
  for (let cursor = point - 1; cursor >= start; cursor -= 1) {
    if (state.points[pointIndex(cursor)].includes(color)) return false;
  }
  return true;
}

function canEnterFromBar(state: GameState, color: Color, die: number) {
  const point = color === "white" ? 25 - die : die;
  if (point < 1 || point > 24) return false;
  return !isPointBlocked(state.points[pointIndex(point)], color);
}

function canLandOnPoint(state: GameState, color: Color, point: number) {
  if (point < 1 || point > 24) return false;
  return !isPointBlocked(state.points[pointIndex(point)], color);
}

function getLegalTargetsForSource(state: GameState, source: Source): MoveTarget[] {
  const color = state.turn;
  if (!source) return [];
  if (!isSourceOwned(state, source, color)) return [];
  if (state.bar[color] > 0 && source.kind !== "bar") return [];

  const targets = new Map<string, MoveTarget>();

  for (const die of state.dice) {
    if (source.kind === "bar") {
      const entryPoint = color === "white" ? 25 - die : die;
      if (canEnterFromBar(state, color, die)) {
        const key = `point:${entryPoint}`;
        const existing = targets.get(key) as PointMove | undefined;
        if (existing) existing.dice.push(die);
        else targets.set(key, { kind: "point", point: entryPoint, dice: [die] });
      }
      continue;
    }

    const point = source.point;
    const destination = color === "white" ? point - die : point + die;
    if (destination >= 1 && destination <= 24) {
      if (canLandOnPoint(state, color, destination)) {
        const key = `point:${destination}`;
        const existing = targets.get(key) as PointMove | undefined;
        if (existing) existing.dice.push(die);
        else targets.set(key, { kind: "point", point: destination, dice: [die] });
      }
      continue;
    }

    if (canBearOffFromPoint(state, point, die, color)) {
      const key = "bear-off";
      const existing = targets.get(key) as BearOffMove | undefined;
      if (existing) existing.dice.push(die);
      else targets.set(key, { kind: "bear-off", dice: [die] });
    }
  }

  return Array.from(targets.values());
}

function getAllLegalMoves(state: GameState) {
  if (state.winner) return [] as { source: Source; target: MoveTarget }[];

  const sources: Source[] = state.bar[state.turn] > 0
    ? [{ kind: "bar" }]
    : state.points.flatMap((stack, index) => (pointOwner(stack) === state.turn ? [{ kind: "point", point: index + 1 }] : []));

  const moves: { source: Source; target: MoveTarget }[] = [];
  for (const source of sources) {
    const legalTargets = getLegalTargetsForSource(state, source);
    for (const target of legalTargets) {
      moves.push({ source, target });
    }
  }
  return moves;
}

function chooseDie(target: MoveTarget) {
  return target.dice.slice().sort((left, right) => left - right)[0];
}

function removeDie(dice: number[], die: number) {
  const next = dice.slice();
  const index = next.indexOf(die);
  if (index !== -1) next.splice(index, 1);
  return next;
}

function switchTurn(state: GameState, message?: string) {
  const nextTurn = otherColor(state.turn);
  return {
    ...state,
    turn: nextTurn,
    dice: [],
    selected: null,
    message: message ?? `${titleCase(nextTurn)} to roll.`,
  };
}

function moveChecker(state: GameState, source: Source, target: MoveTarget) {
  if (!source) return state;
  const color = state.turn;
  const die = chooseDie(target);
  const points = clonePoints(state.points);
  const bar = { ...state.bar };
  const borneOff = { ...state.borneOff };

  if (source.kind === "bar") {
    bar[color] -= 1;
  } else {
    points[pointIndex(source.point)].pop();
  }

  if (target.kind === "point") {
    const destinationStack = points[pointIndex(target.point)];
    if (destinationStack.length === 1 && pointOwner(destinationStack) === otherColor(color)) {
      destinationStack.pop();
      bar[otherColor(color)] += 1;
    }
    destinationStack.push(color);
  } else {
    borneOff[color] += 1;
  }

  const nextDice = removeDie(state.dice, die);
  const movedState: GameState = {
    ...state,
    points,
    bar,
    borneOff,
    dice: nextDice,
    selected: null,
    message: target.kind === "point"
      ? `${titleCase(color)} moved to point ${target.point}.`
      : `${titleCase(color)} bears off a checker.`,
  };

  if (borneOff[color] >= CHECKERS_PER_COLOR) {
    return {
      ...movedState,
      winner: color,
      dice: [],
      message: `${titleCase(color)} wins the game.`,
    };
  }

  if (movedState.dice.length === 0 || getAllLegalMoves(movedState).length === 0) {
    return switchTurn(movedState, `${titleCase(otherColor(color))} to roll.`);
  }

  return movedState;
}

function formatDice(dice: number[]) {
  if (dice.length === 0) return "Roll to begin";
  return dice.join("  ");
}

function pointLabel(point: number) {
  return point.toString().padStart(2, "0");
}

export default function Backgammon() {
  const [game, setGame] = useState<GameState>(() => createInitialState());

  const selectedTargets = useMemo(() => getLegalTargetsForSource(game, game.selected), [game]);
  const targetPoints = useMemo(() => new Set(selectedTargets.filter((target): target is PointMove => target.kind === "point").map((target) => target.point)), [selectedTargets]);
  const bearOffAvailable = selectedTargets.some((target) => target.kind === "bear-off");
  const legalMovesAvailable = useMemo(() => getAllLegalMoves(game).length > 0, [game]);

  function rollDice() {
    setGame((current) => {
      if (current.winner || current.dice.length > 0) return current;

      const first = 1 + Math.floor(Math.random() * 6);
      const second = 1 + Math.floor(Math.random() * 6);
      const dice = first === second ? [first, first, first, first] : [first, second];
      const next = {
        ...current,
        dice,
        selected: null,
        message: `${titleCase(current.turn)} rolled ${formatDice(dice)}.`,
      };

      if (getAllLegalMoves(next).length === 0) {
        return switchTurn(next, `${titleCase(current.turn)} has no legal moves. ${titleCase(otherColor(current.turn))} to roll.`);
      }

      return next;
    });
  }

  function resetGame() {
    setGame(createInitialState());
  }

  function endTurn() {
    setGame((current) => {
      if (current.winner) return current;
      if (current.dice.length === 0) return current;
      return switchTurn(current);
    });
  }

  function selectSource(source: Source) {
    setGame((current) => {
      if (current.winner) return current;
      if (!source) {
        return { ...current, selected: null };
      }
      if (!isSourceOwned(current, source, current.turn)) {
        return current;
      }
      if (current.bar[current.turn] > 0 && source.kind !== "bar") {
        return { ...current, selected: { kind: "bar" }, message: `${titleCase(current.turn)} must enter from the bar.` };
      }
      const targets = getLegalTargetsForSource(current, source);
      if (targets.length === 0) {
        return { ...current, selected: null, message: "That checker has no legal moves right now." };
      }
      return { ...current, selected: source, message: source.kind === "bar" ? `${titleCase(current.turn)} selected the bar.` : `Selected point ${source.point}.` };
    });
  }

  function handlePointClick(point: number) {
    setGame((current) => {
      if (current.winner) return current;
      if (!current.selected) {
        const stack = current.points[pointIndex(point)];
        if (pointOwner(stack) === current.turn) {
          const source = { kind: "point", point } as const;
          if (current.bar[current.turn] > 0) {
            return { ...current, selected: { kind: "bar" }, message: `${titleCase(current.turn)} must enter from the bar.` };
          }
          const targets = getLegalTargetsForSource(current, source);
          if (targets.length === 0) {
            return { ...current, message: "That checker has no legal moves right now." };
          }
          return { ...current, selected: source, message: `Selected point ${point}.` };
        }
        return current;
      }

      const target = selectedTargets.find((candidate) => candidate.kind === "point" && candidate.point === point) ?? null;
      if (target) {
        return moveChecker(current, current.selected, target);
      }

      const stack = current.points[pointIndex(point)];
      if (pointOwner(stack) === current.turn) {
        return { ...current, selected: { kind: "point", point }, message: `Selected point ${point}.` };
      }

      return { ...current, selected: null };
    });
  }

  function handleBarClick() {
    setGame((current) => {
      if (current.winner || current.bar[current.turn] === 0) return current;
      if (current.dice.length === 0) return { ...current, selected: { kind: "bar" }, message: `${titleCase(current.turn)} must roll first.` };
      if (current.selected?.kind === "bar") return current;
      const targets = getLegalTargetsForSource(current, { kind: "bar" });
      if (targets.length === 0) {
        return { ...current, selected: null, message: "No legal bar entries are available right now." };
      }
      return { ...current, selected: { kind: "bar" }, message: `${titleCase(current.turn)} selected the bar.` };
    });
  }

  function handleBearOff() {
    setGame((current) => {
      if (!current.selected) return current;
      const target = selectedTargets.find((candidate) => candidate.kind === "bear-off") ?? null;
      if (!target) return current;
      return moveChecker(current, current.selected, target);
    });
  }

  const topPoints = [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13];
  const bottomPoints = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="p-6 backgammon-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backgammon</h1>
          <p className="text-sm opacity-70 mt-2">Two-player local play with dice, bar hits, and bearing off.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="px-3 py-2 rounded-full border bg-white/5 text-sm">Turn: {titleCase(game.turn)}</span>
          <span className="px-3 py-2 rounded-full border bg-white/5 text-sm">Dice: {formatDice(game.dice)}</span>
          <button onClick={rollDice} className="px-3 py-2 rounded-full border bg-white/10 hover:bg-white/15 text-sm" disabled={Boolean(game.winner) || game.dice.length > 0}>
            Roll dice
          </button>
          <button onClick={endTurn} className="px-3 py-2 rounded-full border bg-white/10 hover:bg-white/15 text-sm" disabled={Boolean(game.winner) || game.dice.length === 0}>
            End turn
          </button>
          <button onClick={resetGame} className="px-3 py-2 rounded-full border bg-white/10 hover:bg-white/15 text-sm">
            New game
          </button>
        </div>
      </div>

      <div className="backgammon-status rounded-2xl border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-semibold">{game.message}</div>
          <div className="text-sm opacity-70 mt-1">
            {game.bar.white > 0 || game.bar.black > 0 ? "Checkers on the bar must enter first." : ""}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1 rounded-full border">White borne off: {game.borneOff.white}</span>
          <span className="px-3 py-1 rounded-full border">Black borne off: {game.borneOff.black}</span>
        </div>
      </div>

      <div className="backgammon-board" role="grid" aria-label="Backgammon board">
        <div className="backgammon-bar">
          <button type="button" onClick={handleBarClick} className={`bar-half ${game.selected?.kind === "bar" && game.turn === "white" ? "selected-square" : ""}`} aria-label={`White bar with ${game.bar.white} checkers`}>
            <div className="text-xs uppercase tracking-[0.2em] opacity-70">White bar</div>
            <div className="text-lg font-semibold">{game.bar.white}</div>
          </button>
          <button type="button" onClick={handleBarClick} className={`bar-half ${game.selected?.kind === "bar" && game.turn === "black" ? "selected-square" : ""}`} aria-label={`Black bar with ${game.bar.black} checkers`}>
            <div className="text-xs uppercase tracking-[0.2em] opacity-70">Black bar</div>
            <div className="text-lg font-semibold">{game.bar.black}</div>
          </button>
        </div>

        {topPoints.map((point, index) => {
          const stack = game.points[pointIndex(point)];
          const owner = pointOwner(stack);
          const isSelected = game.selected?.kind === "point" && game.selected.point === point;
          const isTarget = targetPoints.has(point);
          const isTopHalf = true;
          const darkPoint = index % 2 === 0;

          return (
            <button
              key={`top-${point}`}
              type="button"
              role="gridcell"
              onClick={() => handlePointClick(point)}
              aria-label={`Point ${point}${owner ? `, ${titleCase(owner)} ${stack.length} checkers` : ""}`}
              className={`backgammon-point ${isTopHalf ? "top" : "bottom"} ${darkPoint ? "dark" : "light"} ${isSelected ? "selected-square" : ""} ${isTarget ? "move-target" : ""}`}
            >
              <span className="point-label">{pointLabel(point)}</span>
              <div className="checker-stack top-stack">
                {stack.slice(0, 5).map((checker, checkerIndex) => (
                  <span key={`${point}-${checkerIndex}`} className={`checker-token ${checker === "white" ? "checker-white" : "checker-black"}`} />
                ))}
                {stack.length > 5 ? <span className="checker-count">+{stack.length - 5}</span> : null}
              </div>
            </button>
          );
        })}

        {bottomPoints.map((point, index) => {
          const stack = game.points[pointIndex(point)];
          const owner = pointOwner(stack);
          const isSelected = game.selected?.kind === "point" && game.selected.point === point;
          const isTarget = targetPoints.has(point);
          const darkPoint = index % 2 === 1;

          return (
            <button
              key={`bottom-${point}`}
              type="button"
              role="gridcell"
              onClick={() => handlePointClick(point)}
              aria-label={`Point ${point}${owner ? `, ${titleCase(owner)} ${stack.length} checkers` : ""}`}
              className={`backgammon-point bottom ${darkPoint ? "dark" : "light"} ${isSelected ? "selected-square" : ""} ${isTarget ? "move-target" : ""}`}
            >
              <span className="point-label">{pointLabel(point)}</span>
              <div className="checker-stack bottom-stack">
                {stack.slice(0, 5).map((checker, checkerIndex) => (
                  <span key={`${point}-${checkerIndex}`} className={`checker-token ${checker === "white" ? "checker-white" : "checker-black"}`} />
                ))}
                {stack.length > 5 ? <span className="checker-count">+{stack.length - 5}</span> : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border p-4 bg-white/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">Selected checker</div>
              <div className="text-sm opacity-70">
                {game.selected ? (game.selected.kind === "bar" ? `${titleCase(game.turn)} bar` : `Point ${game.selected.point}`) : "None"}
              </div>
            </div>
            <button
              type="button"
              onClick={handleBearOff}
              className="px-4 py-2 rounded-full border bg-white/10 hover:bg-white/15 text-sm"
              disabled={!bearOffAvailable || Boolean(game.winner)}
            >
              Bear off
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {selectedTargets.length === 0 ? (
              <div className="text-sm opacity-70">Select one of your checkers to see its legal moves.</div>
            ) : (
              selectedTargets.map((target, index) => (
                <button
                  key={`${target.kind}-${index}`}
                  type="button"
                  onClick={() => {
                    if (!game.selected) return;
                    setGame((current) => moveChecker(current, current.selected, target));
                  }}
                  className="px-3 py-2 rounded-full border bg-white/10 hover:bg-white/15 text-sm"
                >
                  {target.kind === "point" ? `Point ${target.point}` : "Bear off"}
                  <span className="ml-2 opacity-70">{target.dice.join("/")}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-4 bg-white/5">
          <div className="font-semibold">Rules summary</div>
          <ul className="mt-3 space-y-2 text-sm opacity-80">
            <li>Roll dice to start a turn.</li>
            <li>Use both dice if you can, or as many as the board allows.</li>
            <li>Hit a single opposing checker to send it to the bar.</li>
            <li>When all 15 checkers are in the home board, you can bear them off.</li>
          </ul>
          <div className="mt-4 text-xs uppercase tracking-[0.2em] opacity-60">Legal moves: {legalMovesAvailable ? "available" : "none"}</div>
        </div>
      </div>
    </div>
  );
}