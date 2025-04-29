import { ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DragAndDropProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application with React DnD context
 * This is required for drag and drop functionality to work
 */
export function DragAndDropProvider({ children }: DragAndDropProviderProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
}