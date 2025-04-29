import { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { cn } from '@/lib/utils';

// Type definition for drag items
export interface DraggableItemProps {
  id: number | string;
  index: number;
  type: string;
  children: React.ReactNode;
  onMoveItem: (dragIndex: number, hoverIndex: number) => void;
  className?: string;
}

// Interface for the item being dragged
interface DragItem {
  id: number | string;
  index: number;
  type: string;
}

export function DraggableItem({
  id,
  index,
  type,
  children,
  onMoveItem,
  className
}: DraggableItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag({
    type,
    item: (): DragItem => ({ id, index, type }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop functionality
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: any }>({
    accept: type,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover: (item: DragItem, monitor: DropTargetMonitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset ? clientOffset.y - hoverBoundingRect.top : 0;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMoveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // Initialize drag and drop refs
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={cn(
        'transition-colors rounded',
        isDragging ? 'opacity-50 border-dashed border-2 border-primary' : '',
        className
      )}
      data-handler-id={handlerId}
    >
      {children}
    </div>
  );
}