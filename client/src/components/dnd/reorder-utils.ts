/**
 * Utility functions for reordering items in a draggable list
 */

/**
 * Moves an item from one position to another in an array
 * @param list The array to reorder
 * @param startIndex Source index
 * @param endIndex Destination index
 * @returns The reordered array
 */
export function reorderList<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

/**
 * Moves an item from one list to another list
 * @param source The source list
 * @param destination The destination list
 * @param droppableSource The source object with index
 * @param droppableDestination The destination object with index
 * @returns An object with the updated source and destination lists
 */
export function moveItem<T>(
  source: T[],
  destination: T[],
  droppableSource: { index: number },
  droppableDestination: { index: number }
): { [key: string]: T[] } {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [key: string]: T[] } = {};
  result['source'] = sourceClone;
  result['destination'] = destClone;

  return result;
}