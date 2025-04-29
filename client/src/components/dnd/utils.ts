/**
 * Reorder an array by moving an item from one position to another
 * @param list - The array to reorder
 * @param startIndex - The index of the item to move
 * @param endIndex - The index to move the item to
 * @returns A new array with the item moved to the new position
 */
export function reorderItems<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}