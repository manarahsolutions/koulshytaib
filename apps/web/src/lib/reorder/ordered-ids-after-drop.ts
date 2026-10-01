/**
 * Pure list reorder helper for drag-and-drop admin lists.
 */

export function orderedIdsAfterDrop(
  orderedIds: readonly string[],
  sourceId: string,
  targetId: string,
): string[] | null {
  if (sourceId === targetId) return null;
  const from = orderedIds.indexOf(sourceId);
  const to = orderedIds.indexOf(targetId);
  if (from < 0 || to < 0) return null;
  const next = orderedIds.slice();
  const [item] = next.splice(from, 1);
  if (!item) return null;
  next.splice(to, 0, item);
  return next;
}
