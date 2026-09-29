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

const shinSafeStrength = { label: "Routine", detail: "See Strength · shin-safe panel below" };

// Injury Plan — Shin stress injury (Sep 2026): cycling only until a doctor
// or physio clears running. Replaces the Phase 0 running+bike week until
// then; see the Return to running panel for what comes after clearance.
const days: PlanDay<TrainingItem>[] = [
  {
    day: "Mon",
    items: [
      {
        title: "Indoor Z2 ride + core",
        category: "bike",
        time: "Flexible",
        hours: 1.25,
        runKm: 0,
        steps: [
          { label: "Ride", detail: "Indoor Z2, 75'" },
          { label: "Core", detail: "Plank, side plank, dead bug" },
        ],
      },
    ],
  },
  {
    day: "Tue",
    items: [
      {
        title: "Indoor sweet spot",
        category: "bike",
        time: "Flexible",
        hours: 0.9,
        runKm: 0,
        steps: [
          { label: "Main set", detail: "3×15' @ 88–93% FTP, 5' easy between" },
        ],
        note: "Skip the SUVelo Hills ride — standing climbs load the shin",
      },
      {
        title: "Strength · shin-safe",
        category: "strength",
        time: "PM",
        hours: 0.5,
        runKm: 0,
        steps: [shinSafeStrength],
      },
    ],
  },
  {
    day: "Wed",
    items: [
      {
        title: "Indoor Z2 + high cadence",
        category: "bike",
        time: "Flexible",
        hours: 1.2,
        runKm: 0,
        steps: [
          { label: "Endurance", detail: "Indoor Z2, 60'" },
          { label: "Cadence", detail: "6×1' @ 110+ rpm, 1' easy between" },
        ],
        note: "Keeps running-like leg speed",
      },
    ],
  },
  {
    day: "Thu",
    items: [
      {
        title: "FTP test / build",
        category: "bike",
        time: "Flexible",
        hours: 0.75,
        runKm: 0,
        steps: [
          { label: "Week 1", detail: "20' FTP test, seated the whole time" },
          { label: "Later weeks", detail: "2×20' @ 95% FTP" },
        ],
      },
      {
        title: "Strength · shin-safe",
        category: "strength",
        time: "PM",
        hours: 0.5,
        runKm: 0,
        steps: [shinSafeStrength],
      },
    ],
  },
  {
    day: "Fri",
    items: [],
  },
  {
    day: "Sat",
    items: [
      {
        title: "Long ride",
        category: "bike",
        time: "Flexible",
        hours: 2.75,
        runKm: 0,
        steps: [
          { label: "Ride", detail: "2.5–3h, Civilised bunch or solo" },
          { label: "Effort", detail: "Stay seated on climbs; stop if the shin hurts" },
        ],
      },
    ],
  },
  {
    day: "Sun",
    items: [
      {
        title: "Easy Z2 ride",
        category: "easy",
        time: "Flexible",
        hours: 1.5,
        runKm: 0,
        steps: [
          { label: "Ride", detail: "Easy Z2, 90' (indoor if the roads are hilly)" },
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
    heading: "Injury comeback · cycling only",
    dates: "Status as of 29 Sep 2026",
    lines: [
      "Shin stress injury: pain when walking or running. Cycling only until a doctor or physio clears running.",
      "Cycling is allowed only if it's pain-free during the ride and the next morning — stay seated, standing climbs load the shin more.",
      "Gate 1 (Mar 2027) FTP 250W still stands; the 5k target moves to the first test after 6 weeks of pain-free running.",
      "Skip: NSW 10000m (15 Oct), NSW 3000m (31 Oct), Twilight 5000m (26 Nov). NSW Duathlon State Champs (late Jan 2027) only if pain-free running for 6+ weeks by then.",
    ],
  },
  panels: [
    {
      title: "Strength · shin-safe",
      badge: "Tue + Thu, no shin load",
      rows: [
        { label: "Glute bridge", detail: "3×12, rest 60\"" },
        { label: "Clamshell", detail: "3×15 each side, rest 30\"" },
        { label: "Side-lying leg raise", detail: "3×15 each side, rest 30\"" },
        { label: "Upper body (push-up or row)", detail: "3×10, rest 60\"" },
        { label: "Core (dead bug / plank)", detail: "3×40\", rest 30\"" },
      ],
    },
    {
      title: "Return to running",
      badge: "Only once cleared — 6–12 weeks typical",
      rows: [
        { label: "1. Walk", detail: "30' pain-free for 1–2 weeks, no pain when the doctor presses the bone" },
        { label: "2. Hop test", detail: "20× on the injured leg with no pain" },
        { label: "3. Walk–run", detail: "1' run / 1' walk × 10, every second day, build over 4–6 weeks" },
        { label: "4. Easy running", detail: "2–3 weeks before any speed work" },
        { label: "5. Rebuild", detail: "add no more than ~10% running per week back to the old plan" },
      ],
    },
    {
      title: "Bone healing basics",
      rows: [
        { label: "Fuel", detail: "Eat enough — under-fuelling (RED-S) is a main cause of stress fractures. Fuel every ride over 60'" },
        { label: "Calcium", detail: "~1,000mg/day — dairy, fortified soy milk, tofu, leafy greens" },
        { label: "Vitamin D", detail: "Ask your doctor to check it" },
        { label: "Sleep", detail: "8 hours — that's when bone repairs" },
      ],
    },
    {
      title: "Pace guide (target once cleared)",
      badge: "5k 17:36 → 16:00 · 10k 38:46 → 34:00",
      rows: [
        { label: "Easy", detail: "4:50–5:15/km, can talk" },
        { label: "Threshold", detail: "4:00–4:05/km, comfortably hard" },
        { label: "5k pace", detail: "~3:30/km, hard and controlled" },
        { label: "Strides", detail: "fast and relaxed, not a sprint" },
      ],
    },
  ],
});
