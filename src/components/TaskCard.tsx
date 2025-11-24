"use client";

import { Task } from '@/types';
import styles from './TaskCard.module.css';
import { useState } from 'react';
import SubtaskList from './SubtaskList';
import { generateGoogleCalendarUrl } from '@/lib/calendar';

interface TaskCardProps {
    task: Task;
    onToggleComplete: (taskId: string, completed: boolean) => void;
    onEdit: (taskId: string, newContent: string) => void;
    onDelete: (taskId: string) => void;
    onChangePriority: (taskId: string, priority: 'high' | 'medium' | 'low') => void;
    onSubtaskToggle: (subtaskId: string, completed: boolean) => void;
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete, onChangePriority, onSubtaskToggle }: TaskCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(task.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPriorityPicker, setShowPriorityPicker] = useState(false);
    const isCompleted = task.status === 'completed';

    const handleSaveEdit = () => {
        if (editContent.trim() && editContent !== task.content) {
            onEdit(task.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(task.content);
        setIsEditing(false);
    };

    return (
        <div className={`${styles.card
            } ${isCompleted ? styles.completed : ''
            } ${task.priority === 'high' ? styles.priorityHigh :
                task.priority === 'low' ? styles.priorityLow :
                    styles.priorityMedium
            }`}>
            {/* Metadata row with checkbox and icons */}
            <div className={styles.metaRow}>
                {/* Checkbox on the left */}
                <div className={styles.checkbox}>
                    <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => onToggleComplete(task.id, e.target.checked)}
                        title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                    />
                </div>

                {/* Icons on the right */}
                <div className={styles.metaLeft}>
                    {task.priority && (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <span
                                className={styles.priorityBadge}
                                onClick={() => setShowPriorityPicker(!showPriorityPicker)}
                                title="Click to change priority"
                            >
                                {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                            </span>
                            {showPriorityPicker && (
                                <div className={styles.priorityPicker}>
                                    <button
                                        onClick={() => {
                                            onChangePriority(task.id, 'high');
                                            setShowPriorityPicker(false);
                                        }}
                                        className={styles.priorityOption}
                                    >
                                        🔴 High
                                    </button>
                                    <button
                                        onClick={() => {
                                            onChangePriority(task.id, 'medium');
                                            setShowPriorityPicker(false);
                                        }}
                                        className={styles.priorityOption}
                                    >
                                        🟡 Medium
                                    </button>
                                    <button
                                        onClick={() => {
                                            onChangePriority(task.id, 'low');
                                            setShowPriorityPicker(false);
                                        }}
                                        className={styles.priorityOption}
                                    >
                                        🟢 Low
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {task.suggested_due_date && (
                        <span className={styles.time}>{task.suggested_due_date}</span>
                    )}

                    <div className={styles.actions}>
                        <button
                            onClick={() => {
                                const calendarUrl = generateGoogleCalendarUrl(task);
                                window.open(calendarUrl, '_blank');
                            }}
                            className={styles.calendarBtn}
                            title="Add to Google Calendar"
                        >
                            📅
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className={styles.editBtn}
                            title="Edit task"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className={styles.deleteBtn}
                            title="Delete task"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={styles.mainContent}>
                <div className={styles.content}>
                    {isEditing ? (
                        <div className={styles.editMode}>
                            <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit();
                                    if (e.key === 'Escape') handleCancelEdit();
                                }}
                                autoFocus
                                className={styles.editInput}
                            />
                            <div className={styles.editActions}>
                                <button onClick={handleSaveEdit} className={styles.saveBtn}>✓</button>
                                <button onClick={handleCancelEdit} className={styles.cancelBtn}>✕</button>
                            </div>
                        </div>
                    ) : (
                        <span className={isCompleted ? styles.completedText : ''}>
                            {task.content}
                        </span>
                    )}
                </div>
            </div>

            <SubtaskList
                taskId={task.id}
                subtasks={task.subtasks || []}
                onSubtaskToggle={onSubtaskToggle}
            />

            {showDeleteConfirm && (
                <div className={styles.confirmOverlay}>
                    <div className={styles.confirmDialog}>
                        <p>Delete this task?</p>
                        <div className={styles.confirmActions}>
                            <button
                                onClick={() => {
                                    onDelete(task.id);
                                    setShowDeleteConfirm(false);
                                }}
                                className={styles.confirmYes}
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className={styles.confirmNo}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
