// training/plan.ts
import { definePlan } from "../shared/weekly-plan/define";
import { TrainingMetrics } from "./metrics";
import type { TrainingItem } from "./metrics";
import type { PlanDay, CategoryStyle } from "../shared/weekly-plan/model";

const categories: Record<string, CategoryStyle> = {
  run: { label: "Run", colorToken: "--green" },
  bike: { label: "Bike", colorToken: "--accent" },
  brick: { label: "Bike + run", colorToken: "--gold" },
  easy: { label: "Easy", colorToken: "--dim" },
  strength: { label: "Strength", colorToken: "--red" },
};

const strengthStep = { label: "Routine", detail: "See Strength · 30' panel below" };

const days: PlanDay<TrainingItem>[] = [
  {
    day: "Mon",
    items: [
      {
        title: "VO2 run (coach's session)",
        category: "run",
        time: "18:00",
        hours: 1.1,
        runKm: 12,
        steps: [
          { label: "Warm-up", detail: "15' easy + drills + 4×100m strides (30\" rest)" },
          { label: "Main set", detail: "2 sets of 1000/800/600m @ 5k pace (3:30 / 2:48 / 2:06)" },
          { label: "Recovery", detail: "90\" jog between reps, 3' between sets" },
          { label: "Cool-down", detail: "15' easy + stretch/roll" },
        ],
      },
    ],
  },
  {
    day: "Tue",
    items: [
      {
        title: "SUVelo Hills ride",
        category: "bike",
        time: "06:00",
        hours: 1.25,
        runKm: 0,
        steps: [
          { label: "Ride", detail: "Base bunch, ~30 km (Centennial Park or Mosman)" },
          { label: "Effort", detail: "Climb seated and steady, don't chase attacks" },
        ],
      },
      {
        title: "Strength · 30'",
        category: "strength",
        time: "PM",
        hours: 0.5,
        runKm: 0,
        steps: [strengthStep],
      },
    ],
  },
  {
    day: "Wed",
    items: [
      {
        title: "Threshold run (coach's session)",
        category: "run",
        time: "18:00",
        hours: 1.2,
        runKm: 13,
        steps: [
          { label: "Warm-up", detail: "15' easy + drills + 4×100m strides" },
          { label: "Main set", detail: "5×6' @ 4:00–4:05/km" },
          { label: "Recovery", detail: "90\" jog" },
          { label: "Cool-down", detail: "15' easy + stretch/roll" },
        ],
      },
    ],
  },
  {
    day: "Thu",
    items: [
      {
        title: "Sweet spot + run off the bike",
        category: "brick",
        time: "Flexible",
        hours: 1.5,
        runKm: 3,
        steps: [
          { label: "Warm-up", detail: "15' easy spin, 3×1' fast cadence" },
          { label: "Main set", detail: "3×15' @ 88–93% FTP, 5' easy between" },
          { label: "Off the bike", detail: "Straight into 15' easy run" },
          { label: "Test weeks", detail: "Swap main set for 20' FTP test (FTP = avg × 0.95)" },
        ],
      },
      {
        title: "Strength · 30'",
        category: "strength",
        time: "PM",
        hours: 0.5,
        runKm: 0,
        steps: [strengthStep],
      },
    ],
  },
  {
    day: "Fri",
    items: [
      {
        title: "SUVelo Coffee Ride or rest",
        category: "easy",
        time: "06:00",
        hours: 1,
        runKm: 0,
        steps: [
          { label: "Ride", detail: "Eastern Suburbs, Base, 28 km, no-drop" },
          { label: "Effort", detail: "Easy only, skip if tired" },
          { label: "After", detail: "10' mobility" },
        ],
      },
    ],
  },
  {
    day: "Sat",
    items: [
      {
        title: "SUVelo South Long Haul",
        category: "bike",
        time: "05:55",
        hours: 3,
        runKm: 0,
        steps: [
          { label: "Ride", detail: "Civilised bunch, turn at Waterfall (~90 km); first Saturday of the month = north ride" },
          { label: "Fuel", detail: "60 g carbs/h, 500–750 ml/h" },
          { label: "Build", detail: "Extend to Royal National Park (110 km) by Dec–Jan" },
        ],
      },
    ],
  },
  {
    day: "Sun",
    items: [
      {
        title: "Long run",
        category: "run",
        time: "Morning",
        hours: 1.3,
        runKm: 15,
        steps: [
          { label: "Run", detail: "75–90' easy @ 4:50–5:15/km" },
          { label: "Finish", detail: "6×20\" strides, walk-back rest" },
        ],
      },
    ],
  },
];

export const TRAINING_PLAN = definePlan<TrainingItem>({
  id: "training",
  title: "Training",
  days,
  categories,
  metrics: TrainingMetrics,
  context: {
    heading: "Phase 0 · Engine build",
    dates: "Oct 2026 – Feb 2027",
    lines: [
      "Build bike volume and aerobic base. 80% of time easy.",
      "Next: Gate 1 · Mar 2027: FTP 250 W or more, 5k under 17:00",
    ],
  },
  panels: [
    {
      title: "Strength · 30'",
      badge: "Tue + Thu",
      rows: [
        { label: "Back squat", detail: "3×8, rest 90\"" },
        { label: "Romanian deadlift", detail: "3×8, rest 90\"" },
        { label: "Bulgarian split squat", detail: "3×8 each leg, rest 60\"" },
        { label: "Single-leg calf raise", detail: "3×15 each, rest 45\"" },
        { label: "Plank / side plank", detail: "3×40\" / 2×30\" each, rest 30\"" },
      ],
    },
    {
      title: "Pace guide",
      badge: "5k 17:36 · 10k 38:46",
      rows: [
        { label: "Easy", detail: "4:50–5:15/km, can talk" },
        { label: "Threshold", detail: "4:00–4:05/km, comfortably hard" },
        { label: "5k pace", detail: "~3:30/km, hard and controlled" },
        { label: "Strides", detail: "fast and relaxed, not a sprint" },
      ],
    },
  ],
});
