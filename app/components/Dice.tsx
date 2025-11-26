"use client";

import React, { useState } from "react";

const DICE = [4, 6, 8, 10, 12, 20, 100];

function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

export default function Dice() {
  const [selected, setSelected] = useState<number>(6);
  const [quantity, setQuantity] = useState<number>(1);
  const [results, setResults] = useState<(number | string)[]>([]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [animatingResults, setAnimatingResults] = useState<(number | string)[]>([]);

  function doRoll() {
    setIsRolling(true);
    
    // Calculate final results
    const finalResults: (number | string)[] = [];
    for (let i = 0; i < quantity; i++) {
      if (selected === 0) {
        // coin flip
        finalResults.push(Math.random() < 0.5 ? "Heads" : "Tails");
      } else {
        finalResults.push(rollDie(selected));
      }
    }

    // Start animation - show random values
    const animationDuration = 600;
    const animationInterval = 50;
    const steps = Math.floor(animationDuration / animationInterval);
    let currentStep = 0;

    const intervalId = setInterval(() => {
      currentStep++;
      
      // Generate random values for animation
      const randomResults = finalResults.map(() => {
        if (selected === 0) {
          return Math.random() < 0.5 ? "Heads" : "Tails";
        }
        return rollDie(selected);
      });
      
      setAnimatingResults(randomResults);

      if (currentStep >= steps) {
        clearInterval(intervalId);
        // Show final results with a slight delay for smooth transition
        setTimeout(() => {
          setResults(finalResults);
          setIsRolling(false);
          setAnimatingResults([]);
        }, 100);
      }
    }, animationInterval);
  }

  function increaseQuantity() {
    if (quantity < 5) setQuantity(quantity + 1);
  }

  function decreaseQuantity() {
    if (quantity > 1) setQuantity(quantity - 1);
  }

  return (
    <div className="p-6 border rounded max-w-md mx-auto">
      <div className="mb-4">
        <div className="text-sm opacity-60">Select a die</div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {DICE.map((d) => (
            <button
              key={d}
              onClick={() => setSelected(d)}
              className={`dice-btn ${selected === d ? "selected-dice" : ""}`}
            >
              d{d}
            </button>
          ))}
          <button onClick={() => setSelected(0)} className={`dice-btn ${selected === 0 ? "selected-dice" : ""}`}>Coin</button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm opacity-60">Quantity</div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <button 
            onClick={decreaseQuantity} 
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-lg"
            disabled={quantity <= 1}
          >
            ▼
          </button>
          <div className="text-2xl font-bold w-12 text-center">{quantity}</div>
          <button 
            onClick={increaseQuantity} 
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-lg"
            disabled={quantity >= 5}
          >
            ▲
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs opacity-60">Result{results.length > 1 ? 's' : ''}</div>
        <div className="flex gap-2 justify-center flex-wrap mt-2">
          {(isRolling ? animatingResults : results).length > 0 ? (
            (isRolling ? animatingResults : results).map((r, idx) => (
              <div 
                key={idx} 
                className={`text-center text-5xl font-mono p-4 border rounded bg-white/5 min-w-[80px] ${isRolling ? 'blur-sm' : 'animate-bounce-in'}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {r}
              </div>
            ))
          ) : (
            <div className="text-center text-6xl font-mono p-6 border rounded bg-white/5">-</div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={doRoll} 
          className="px-6 py-3 bg-blue-600 text-white rounded text-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isRolling}
        >
          {isRolling ? 'Rolling...' : 'Roll'}
        </button>
      </div>
    </div>
  );
}
