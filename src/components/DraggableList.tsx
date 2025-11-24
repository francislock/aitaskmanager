"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { List } from '@/types';
import styles from './DraggableList.module.css';

interface DraggableListProps {
    list: List;
    children: React.ReactNode;
}

export default function DraggableList({ list, children }: DraggableListProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: list.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={styles.container}>
            {/* Drag Handle - visible on hover */}
            <div className={styles.dragHandle} {...attributes} {...listeners}>
                <span className={styles.dragIcon}>⋮⋮</span>
            </div>

            {children}
        </div>
    );
}
