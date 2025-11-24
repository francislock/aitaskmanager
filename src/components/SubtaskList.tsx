"use client";

import { Subtask } from '@/types';
import { supabase } from '@/lib/supabase';
import styles from './SubtaskList.module.css';
import { useState } from 'react';

interface SubtaskListProps {
    taskId: string;
    subtasks: Subtask[];
    onSubtaskToggle: (subtaskId: string, completed: boolean) => void;
}

export default function SubtaskList({ taskId, subtasks, onSubtaskToggle }: SubtaskListProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!subtasks || subtasks.length === 0) return null;

    const completedCount = subtasks.filter(st => st.status === 'completed').length;
    const totalCount = subtasks.length;

    return (
        <div className={styles.container}>
            <div
                className={styles.header}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className={styles.icon}>{isExpanded ? '▼' : '▶'}</span>
                <span className={styles.title}>
                    Subtasks ({completedCount}/{totalCount})
                </span>
            </div>

            {isExpanded && (
                <div className={styles.list}>
                    {subtasks
                        .sort((a, b) => a.order_index - b.order_index)
                        .map(subtask => (
                            <div key={subtask.id} className={styles.subtask}>
                                <input
                                    type="checkbox"
                                    checked={subtask.status === 'completed'}
                                    onChange={(e) => onSubtaskToggle(subtask.id, e.target.checked)}
                                    className={styles.checkbox}
                                />
                                <span className={subtask.status === 'completed' ? styles.completed : ''}>
                                    {subtask.content}
                                </span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
