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
});
