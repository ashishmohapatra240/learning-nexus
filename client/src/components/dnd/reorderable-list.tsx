import { useState, useCallback } from 'react';
import { DraggableItem } from './draggable-item';
import { reorderList } from './reorder-utils';

interface ReorderableListProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onReorder?: (reorderedItems: T[]) => void;
  className?: string;
  itemClassName?: string;
  dragType?: string;
}

/**
 * A reorderable list component that allows for drag and drop reordering of items
 */
export function ReorderableList<T>({
  items,
  keyExtractor,
  renderItem,
  onReorder,
  className = '',
  itemClassName = '',
  dragType = 'list-item'
}: ReorderableListProps<T>) {
  const [listItems, setListItems] = useState<T[]>(items);

  // Update internal state when items prop changes
  if (JSON.stringify(items) !== JSON.stringify(listItems)) {
    setListItems(items);
  }

  const handleMoveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    const reordered = reorderList(listItems, dragIndex, hoverIndex);
    setListItems(reordered);
    if (onReorder) {
      onReorder(reordered);
    }
  }, [listItems, onReorder]);

  return (
    <div className={className}>
      {listItems.map((item, index) => (
        <DraggableItem
          key={keyExtractor(item, index)}
          id={keyExtractor(item, index)}
          index={index}
          type={dragType}
          onMoveItem={handleMoveItem}
          className={itemClassName}
        >
          {renderItem(item, index)}
        </DraggableItem>
      ))}
    </div>
  );
}