"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableTask from './DraggableTask';
import { Task } from '@/types';

interface DroppableListProps {
    listId: string;
    tasks: Task[];
    onToggleComplete: (taskId: string, completed: boolean) => void;
    onEdit: (taskId: string, newContent: string) => void;
    onDelete: (taskId: string) => void;
    onChangePriority: (taskId: string, priority: 'high' | 'medium' | 'low') => void;
    onSubtaskToggle: (subtaskId: string, completed: boolean) => void;
    onSubtaskAdd?: (taskId: string, content: string) => void;
    onSubtaskEdit?: (subtaskId: string, content: string) => void;
    onSubtaskDelete?: (subtaskId: string) => void;
}

export default function DroppableList({
    listId,
    tasks,
    onToggleComplete,
    onEdit,
    onDelete,
    onChangePriority,
    onSubtaskToggle,
    onSubtaskAdd,
    onSubtaskEdit,
    onSubtaskDelete,
}: DroppableListProps) {
    const { setNodeRef } = useDroppable({
        id: `droppable-${listId}`,
    });

    return (
        <div ref={setNodeRef} style={{ minHeight: '100px' }}>
            <SortableContext
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                {tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                        No tasks in this list
                    </div>
                ) : (
                    tasks.map(task => (
                        <DraggableTask
                            key={task.id}
                            task={task}
                            onToggleComplete={onToggleComplete}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onChangePriority={onChangePriority}
                            onSubtaskToggle={onSubtaskToggle}
                            onSubtaskAdd={onSubtaskAdd}
                            onSubtaskEdit={onSubtaskEdit}
                            onSubtaskDelete={onSubtaskDelete}
                        />
                    ))
                )}
            </SortableContext>
        </div>
    );
}
