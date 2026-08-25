import { useDraggable } from '@dnd-kit/core';

import TaskCard from './TaskCard';

/** Wraps TaskCard with drag behaviour (dims the source card while dragging). */
export default function DraggableTaskCard({ task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40' : ''}`}
    >
      <TaskCard task={task} />
    </div>
  );
}
