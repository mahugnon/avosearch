/** Bill in 15-minute increments, minimum one increment, never below the quoted minimum. */
export function computeTimedPriceCents(
  durationSeconds: number,
  hourlyRateCents: number,
  minimumCents: number
): number {
  const quarterHours = Math.max(1, Math.ceil(durationSeconds / 900));
  const timed = Math.ceil((quarterHours / 4) * hourlyRateCents);
  return Math.max(minimumCents, timed);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

export function elapsedWorkSeconds(workStartedAt: Date | null, storedSeconds: number): number {
  if (!workStartedAt) return storedSeconds;
  const running = Math.max(0, Math.floor((Date.now() - workStartedAt.getTime()) / 1000));
  return storedSeconds + running;
}
