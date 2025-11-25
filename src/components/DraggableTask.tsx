"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import TaskCard from './TaskCard';
import styles from './DraggableTask.module.css';

interface DraggableTaskProps {
    task: Task;
    onToggleComplete: (taskId: string, completed: boolean) => void;
    onEdit: (taskId: string, newContent: string) => void;
    onDelete: (taskId: string) => void;
    onChangePriority: (taskId: string, priority: 'high' | 'medium' | 'low') => void;
    onSubtaskToggle: (subtaskId: string, completed: boolean) => void;
    onSubtaskAdd?: (taskId: string, content: string) => void;
    onSubtaskEdit?: (subtaskId: string, content: string) => void;
    onSubtaskDelete?: (subtaskId: string) => void;
}

export default function DraggableTask({
    task,
    onToggleComplete,
    onEdit,
    onDelete,
    onChangePriority,
    onSubtaskToggle,
    onSubtaskAdd,
    onSubtaskEdit,
    onSubtaskDelete,
}: DraggableTaskProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={styles.container}>
            {/* Drag Handle */}
            <div className={styles.dragHandle} {...attributes} {...listeners}>
                <span className={styles.dragIcon}>⋮⋮</span>
            </div>

            <div style={{ flex: 1 }}>
                <TaskCard
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
            </div>
        </div>
    );
}
