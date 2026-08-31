const TIME_ZONE = "Australia/Sydney";

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function asUtcInstant(y: number, m: number, d: number, h: number, min: number, s: number): number {
  return Date.UTC(y, m - 1, d, h, min, s);
}

// Fixed-point conversion: guess a UTC instant, check what Sydney wall-clock
// that instant actually displays as, and correct by how far it is from the
// *target* wall-clock (always compared against the fixed target, not the
// shifting guess — otherwise the same offset correction gets reapplied every
// iteration and overshoots). Naturally handles AEST/AEDT without a timezone
// database; converges within 1-2 iterations, 3 gives headroom at DST edges.
export function sydneyWallClockToUtc(dateStr: string, hour: number, minute: number): Date {
  const [y, m, d] = dateStr.split("-").map(Number) as [number, number, number];
  const target = asUtcInstant(y, m, d, hour, minute, 0);

  let instant = target;
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(
      fmt.formatToParts(new Date(instant)).map((p) => [p.type, p.value]),
    );
    const shown = asUtcInstant(
      Number(parts.year),
      Number(parts.month),
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    const diff = target - shown;
    if (diff === 0) break;
    instant += diff;
  }

  return new Date(instant);
}

export function toGoogleUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0]! + "Z";
}
