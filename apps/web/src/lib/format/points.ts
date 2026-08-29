/**
 * Points display helpers — points are not IQD.
 */

export function formatPoints(
  points: number,
  options: { signed?: boolean } = {},
): string {
  const { signed = false } = options;
  const abs = Math.abs(points);
  const body = `${abs.toLocaleString("en-IQ")} نقطة`;
  if (!signed) return body;
  if (points > 0) return `+${body}`;
  if (points < 0) return `−${body}`;
  return `0 نقطة`;
}

export function formatPointsSigned(points: number): string {
  return formatPoints(points, { signed: true });
}
