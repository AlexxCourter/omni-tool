"use client";

import React, { useState, useEffect, useRef } from "react";

type ExerciseType = "timed" | "repetitions";

interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  duration?: number; // in seconds for timed exercises
  reps?: number;
  sets?: number;
}

interface DayPlan {
  exercises: Exercise[];
  descriptor: string;
}

interface WeekPlan {
  [key: string]: DayPlan; // "sunday", "monday", etc.
}

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ExercisePlan() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({
    sunday: { exercises: [], descriptor: "Rest" },
    monday: { exercises: [], descriptor: "Rest" },
    tuesday: { exercises: [], descriptor: "Rest" },
    wednesday: { exercises: [], descriptor: "Rest" },
    thursday: { exercises: [], descriptor: "Rest" },
    friday: { exercises: [], descriptor: "Rest" },
    saturday: { exercises: [], descriptor: "Rest" },
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<string>("");

  // Form fields for adding exercise
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseType, setExerciseType] = useState<ExerciseType>("timed");
  const [durationMinutes, setDurationMinutes] = useState<number | string>(0);
  const [durationSeconds, setDurationSeconds] = useState<number | string>(30);
  const [reps, setReps] = useState(10);
  const [sets, setSets] = useState(3);

  // Tracker state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [trackerPhase, setTrackerPhase] = useState<"exercise" | "rest" | "complete">("exercise");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("exercisePlan");
    if (saved) {
      try {
        setWeekPlan(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved exercise plan", e);
      }
    }

    // Determine current day
    const today = new Date().getDay(); // 0 = Sunday
    setCurrentDay(DAYS[today]);
  }, []);

  // Save to localStorage whenever weekPlan changes
  useEffect(() => {
    if (Object.keys(weekPlan).length > 0) {
      localStorage.setItem("exercisePlan", JSON.stringify(weekPlan));
    }
  }, [weekPlan]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    const exercises = weekPlan[currentDay]?.exercises || [];
    const currentExercise = exercises[currentExerciseIndex];

    if (!currentExercise) return;

    if (trackerPhase === "exercise" && currentExercise.type === "timed") {
      // Move to rest phase (90 seconds between exercises)
      if (currentExerciseIndex < exercises.length - 1) {
        setTrackerPhase("rest");
        setTimeLeft(90);
        setIsResting(true);
        setIsRunning(true);
      } else {
        // All exercises complete
        setTrackerPhase("complete");
      }
    } else if (trackerPhase === "rest") {
      // Move to next exercise
      setCurrentExerciseIndex((prev) => prev + 1);
      setCurrentSet(1);
      setTrackerPhase("exercise");
      setIsResting(false);
      
      const nextExercise = exercises[currentExerciseIndex + 1];
      if (nextExercise && nextExercise.type === "timed") {
        setTimeLeft(nextExercise.duration || 0);
      }
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Save when exiting edit mode (already auto-saved via useEffect)
      setSelectedDay(null);
      setIsEditMode(false);
    } else {
      // When entering edit mode, auto-select current day
      setIsEditMode(true);
      setSelectedDay(currentDay);
    }
  };

  const handleDayClick = (day: string) => {
    if (isEditMode) {
      setSelectedDay(day);
    }
  };

  const addExercise = () => {
    if (!selectedDay || !exerciseName.trim()) return;

    // Calculate total duration in seconds
    const mins = durationMinutes === "" ? 0 : Number(durationMinutes);
    const secs = durationSeconds === "" ? 0 : Number(durationSeconds);
    const totalDuration = (mins * 60) + secs;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      type: exerciseType,
      ...(exerciseType === "timed" ? { duration: totalDuration } : { reps, sets }),
    };

    setWeekPlan((prev) => {
      const dayPlan = prev[selectedDay];
      const updatedExercises = [...dayPlan.exercises, newExercise];
      
      // Update descriptor
      const descriptor = updatedExercises.length > 0
        ? updatedExercises.map(e => e.name).join(", ").substring(0, 30) + (updatedExercises.map(e => e.name).join(", ").length > 30 ? "..." : "")
        : "Rest";

      return {
        ...prev,
        [selectedDay]: {
          exercises: updatedExercises,
          descriptor,
        },
      };
    });

    // Reset form
    setExerciseName("");
    setDurationMinutes(0);
    setDurationSeconds(30);
    setReps(10);
    setSets(3);
  };

  const removeExercise = (day: string, exerciseId: string) => {
    setWeekPlan((prev) => {
      const dayPlan = prev[day];
      const updatedExercises = dayPlan.exercises.filter(e => e.id !== exerciseId);
      
      const descriptor = updatedExercises.length > 0
        ? updatedExercises.map(e => e.name).join(", ").substring(0, 30) + (updatedExercises.map(e => e.name).join(", ").length > 30 ? "..." : "")
        : "Rest";

      return {
        ...prev,
        [day]: {
          exercises: updatedExercises,
          descriptor,
        },
      };
    });
  };

  const startTimer = () => {
    const exercises = weekPlan[currentDay]?.exercises || [];
    const currentExercise = exercises[currentExerciseIndex];

    if (currentExercise && currentExercise.type === "timed" && !isRunning) {
      if (timeLeft === 0) {
        setTimeLeft(currentExercise.duration || 0);
      }
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const handleRepComplete = () => {
    const exercises = weekPlan[currentDay]?.exercises || [];
    const currentExercise = exercises[currentExerciseIndex];

    if (!currentExercise || currentExercise.type !== "repetitions") return;

    if (currentSet < (currentExercise.sets || 1)) {
      // Move to rest between sets (60 seconds)
      setTrackerPhase("rest");
      setTimeLeft(60);
      setIsResting(true);
      setIsRunning(true);
    } else {
      // Move to next exercise or complete
      if (currentExerciseIndex < exercises.length - 1) {
        // 90 second rest between exercises
        setTrackerPhase("rest");
        setTimeLeft(90);
        setIsResting(true);
        setIsRunning(true);
        setCurrentSet(1);
      } else {
        setTrackerPhase("complete");
      }
    }
  };

  useEffect(() => {
    // Handle rest phase completion for rep exercises
    if (trackerPhase === "rest" && timeLeft === 0 && isResting) {
      setIsResting(false);
      setIsRunning(false);
      
      const exercises = weekPlan[currentDay]?.exercises || [];
      const currentExercise = exercises[currentExerciseIndex];

      if (currentExercise && currentExercise.type === "repetitions") {
        if (currentSet < (currentExercise.sets || 1)) {
          // Continue to next set
          setCurrentSet((prev) => prev + 1);
          setTrackerPhase("exercise");
        } else {
          // Move to next exercise
          setCurrentExerciseIndex((prev) => prev + 1);
          setCurrentSet(1);
          setTrackerPhase("exercise");
          
          const nextExercise = exercises[currentExerciseIndex + 1];
          if (nextExercise && nextExercise.type === "timed") {
            setTimeLeft(nextExercise.duration || 0);
          }
        }
      }
    }
  }, [timeLeft, isResting, trackerPhase]);

  const resetTracker = () => {
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setTimeLeft(0);
    setIsRunning(false);
    setIsResting(false);
    setTrackerPhase("exercise");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const todayExercises = weekPlan[currentDay]?.exercises || [];
  const currentExercise = todayExercises[currentExerciseIndex];
  const nextExercise = todayExercises[currentExerciseIndex + 1];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Exercise Plan</h1>
          <p className="text-sm opacity-70 mt-1">Track your weekly fitness routine</p>
        </div>
        <button
          onClick={toggleEditMode}
          className="px-4 py-2 rounded border hover:bg-white/5 transition-colors flex items-center gap-2"
          aria-label={isEditMode ? "Save and exit edit mode" : "Enter edit mode"}
        >
          {isEditMode ? (
            <>
              <span>💾</span> Save
            </>
          ) : (
            <>
              <span>✏️</span> Edit
            </>
          )}
        </button>
      </div>

      {/* Weekly Calendar */}
      <div className="mb-6 p-4 border rounded bg-white/5">
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, index) => {
            const isToday = day === currentDay;
            const isSelected = day === selectedDay;
            const dayPlan = weekPlan[day];

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  p-3 rounded border transition-all cursor-pointer
                  ${isToday ? "border-cyan-400 bg-cyan-400/10" : "border-white/20"}
                  ${isSelected && isEditMode ? "border-yellow-400 bg-yellow-400/20" : ""}
                  ${isEditMode ? "hover:bg-white/10" : ""}
                `}
              >
                <div className="font-semibold text-center mb-1">{DAY_LABELS[index]}</div>
                <div className="text-xs text-center opacity-70 break-words">
                  {dayPlan.descriptor}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Mode Instructions */}
      {isEditMode && !selectedDay && (
        <div className="mb-6 p-4 border rounded bg-yellow-400/5 border-yellow-400/30 text-center">
          <p className="opacity-70">👆 Click on a day above to add or edit exercises</p>
        </div>
      )}

      {/* Edit Mode Panel */}
      {isEditMode && selectedDay && (
        <div className="mb-6 p-4 border rounded bg-yellow-400/5 border-yellow-400/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold capitalize">
              Editing {selectedDay}
            </h3>
            <p className="text-sm opacity-60">Click another day to switch</p>
          </div>

          {/* Exercise List for Selected Day */}
          {weekPlan[selectedDay].exercises.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Current Exercises:</h4>
              <div className="space-y-2">
                {weekPlan[selectedDay].exercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <div>
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-sm opacity-70 ml-2">
                        {exercise.type === "timed"
                          ? `${formatTime(exercise.duration || 0)}`
                          : `${exercise.reps} reps × ${exercise.sets} sets`}
                      </span>
                    </div>
                    <button
                      onClick={() => removeExercise(selectedDay, exercise.id)}
                      className="px-2 py-1 text-sm border border-red-400/50 rounded hover:bg-red-400/10"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Exercise Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Exercise Name</label>
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border rounded"
                placeholder="e.g., Running, Push-ups"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Type</label>
              <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
                className="w-full px-3 py-2 bg-white/5 border rounded"
              >
                <option value="timed">Timed Exercise</option>
                <option value="repetitions">Repetitions</option>
              </select>
            </div>

            {exerciseType === "timed" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Minutes</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white/5 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Seconds</label>
                  <input
                    type="number"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(e.target.value === "" ? "" : Number(e.target.value))}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white/5 border rounded"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Reps</label>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(Number(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 bg-white/5 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Sets</label>
                    <input
                      type="number"
                      value={sets}
                      onChange={(e) => setSets(Number(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 bg-white/5 border rounded"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={addExercise}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add Exercise
            </button>
          </div>
        </div>
      )}

      {/* Tracker View */}
      {!isEditMode && (
        <div className="p-6 border rounded bg-white/5">
          <h2 className="text-2xl font-semibold mb-4 capitalize">
            {currentDay} - {weekPlan[currentDay]?.descriptor}
          </h2>

          {todayExercises.length === 0 ? (
            <p className="text-center opacity-70 py-8">
              No exercises planned for today. Click Edit to add some!
            </p>
          ) : trackerPhase === "complete" ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-semibold mb-2">Workout Complete!</h3>
              <p className="opacity-70 mb-4">Great job finishing today's exercises!</p>
              <button
                onClick={resetTracker}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Start Over
              </button>
            </div>
          ) : (
            <div>
              {/* Current Exercise Display */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">
                    {currentExercise?.name}
                  </h3>
                  <span className="text-sm opacity-70">
                    Exercise {currentExerciseIndex + 1} of {todayExercises.length}
                  </span>
                </div>

                {isResting ? (
                  <div className="text-center py-8">
                    <div className="text-lg mb-2 opacity-70">Rest Period</div>
                    <div className="text-6xl font-bold mb-4">{formatTime(timeLeft)}</div>
                    <div className="text-sm opacity-70">Get ready for the next {
                      currentExercise?.type === "repetitions" && currentSet < (currentExercise.sets || 1)
                        ? "set"
                        : "exercise"
                    }!</div>
                  </div>
                ) : currentExercise?.type === "timed" ? (
                  <div className="text-center py-8">
                    <div className="text-8xl font-bold mb-6 font-mono">
                      {formatTime(timeLeft || currentExercise.duration || 0)}
                    </div>
                    <div className="flex gap-4 justify-center">
                      {!isRunning ? (
                        <button
                          onClick={startTimer}
                          className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xl"
                        >
                          ▶️ Start
                        </button>
                      ) : (
                        <button
                          onClick={pauseTimer}
                          className="px-8 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-xl"
                        >
                          ⏸️ Pause
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <div className="text-center mb-6">
                      <div className="text-6xl font-bold mb-2">
                        {currentExercise?.reps} reps
                      </div>
                      <div className="text-xl opacity-70">
                        Set {currentSet} of {currentExercise?.sets}
                      </div>
                    </div>

                    {/* Preview Next Step */}
                    <div className="text-center mb-6 opacity-40 text-sm">
                      <div>Next: {
                        currentSet < (currentExercise?.sets || 1)
                          ? `60 sec rest → Set ${currentSet + 1}`
                          : nextExercise
                            ? `90 sec rest → ${nextExercise.name}`
                            : "Workout complete!"
                      }</div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handleRepComplete}
                        className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xl"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Exercise List */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Today's Exercises:</h4>
                <div className="space-y-2">
                  {todayExercises.map((exercise, idx) => (
                    <div
                      key={exercise.id}
                      className={`p-2 rounded ${
                        idx === currentExerciseIndex
                          ? "bg-cyan-400/20 border border-cyan-400/50"
                          : idx < currentExerciseIndex
                          ? "bg-green-400/10 opacity-50"
                          : "bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {idx < currentExerciseIndex && "✓ "}
                          {exercise.name}
                        </span>
                        <span className="text-sm opacity-70">
                          {exercise.type === "timed"
                            ? formatTime(exercise.duration || 0)
                            : `${exercise.reps} × ${exercise.sets}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
