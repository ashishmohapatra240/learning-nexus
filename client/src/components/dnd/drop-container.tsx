import { ReactNode } from 'react';
import { useDrop } from 'react-dnd';
import { cn } from '@/lib/utils';

interface DropContainerProps {
  accept: string | string[];
  onDrop: (item: any) => void;
  children: ReactNode;
  className?: string;
}

/**
 * A container that can receive dragged items
 */
export function DropContainer({
  accept,
  onDrop,
  children,
  className
}: DropContainerProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={cn(
        'rounded border-2 transition-colors p-4',
        isActive 
          ? 'border-primary bg-primary/10 border-dashed' 
          : canDrop 
            ? 'border-gray-300 hover:border-primary/50 border-dashed' 
            : 'border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
}