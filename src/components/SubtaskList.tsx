"use client";

import { Subtask } from '@/types';
import styles from './SubtaskList.module.css';
import { useState } from 'react';
import { EditIcon, DeleteIcon } from './Icons';

interface SubtaskListProps {
    taskId: string;
    subtasks: Subtask[];
    onSubtaskToggle: (subtaskId: string, completed: boolean) => void;
    onSubtaskAdd?: (taskId: string, content: string) => void;
    onSubtaskEdit?: (subtaskId: string, content: string) => void;
    onSubtaskDelete?: (subtaskId: string) => void;
}

export default function SubtaskList({
    taskId,
    subtasks,
    onSubtaskToggle,
    onSubtaskAdd,
    onSubtaskEdit,
    onSubtaskDelete
}: SubtaskListProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    if (!subtasks || subtasks.length === 0) {
        // Show header with add button even if no subtasks
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.icon}>▶</span>
                    <span className={styles.title}>Subtasks (0/0)</span>
                    {onSubtaskAdd && (
                        <button
                            className={styles.addButton}
                            onClick={() => setIsAddingNew(true)}
                            title="Add subtask"
                        >
                            +
                        </button>
                    )}
                </div>
                {isAddingNew && (
                    <div className={styles.list}>
                        <div className={styles.subtask}>
                            <input
                                type="checkbox"
                                disabled
                                className={styles.checkbox}
                            />
                            <input
                                type="text"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newContent.trim() && onSubtaskAdd) {
                                        onSubtaskAdd(taskId, newContent.trim());
                                        setNewContent('');
                                        setIsAddingNew(false);
                                    }
                                    if (e.key === 'Escape') {
                                        setNewContent('');
                                        setIsAddingNew(false);
                                    }
                                }}
                                placeholder="Type new subtask..."
                                autoFocus
                                className={styles.editInput}
                            />
                            <div className={styles.editActions}>
                                <button
                                    onClick={() => {
                                        if (newContent.trim() && onSubtaskAdd) {
                                            onSubtaskAdd(taskId, newContent.trim());
                                            setNewContent('');
                                            setIsAddingNew(false);
                                        }
                                    }}
                                    className={styles.saveBtn}
                                    title="Save"
                                >
                                    ✓
                                </button>
                                <button
                                    onClick={() => {
                                        setNewContent('');
                                        setIsAddingNew(false);
                                    }}
                                    className={styles.cancelBtn}
                                    title="Cancel"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const completedCount = subtasks.filter(st => st.status === 'completed').length;
    const totalCount = subtasks.length;

    const handleStartEdit = (subtask: Subtask) => {
        setEditingId(subtask.id);
        setEditContent(subtask.content);
    };

    const handleSaveEdit = () => {
        if (editContent.trim() && editingId && onSubtaskEdit) {
            onSubtaskEdit(editingId, editContent.trim());
            setEditingId(null);
            setEditContent('');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleDelete = (subtaskId: string) => {
        if (onSubtaskDelete) {
            onSubtaskDelete(subtaskId);
        }
    };

    const handleAddNew = () => {
        if (newContent.trim() && onSubtaskAdd) {
            onSubtaskAdd(taskId, newContent.trim());
            setNewContent('');
            setIsAddingNew(false);
        }
    };

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
                {onSubtaskAdd && isExpanded && (
                    <button
                        className={styles.addButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingNew(true);
                        }}
                        title="Add subtask"
                    >
                        +
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className={styles.list}>
                    {subtasks
                        .sort((a, b) => a.order_index - b.order_index)
                        .map(subtask => (
                            <div
                                key={subtask.id}
                                className={styles.subtask}
                                onMouseEnter={() => setHoveredId(subtask.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {editingId === subtask.id ? (
                                    <>
                                        <input
                                            type="checkbox"
                                            disabled
                                            className={styles.checkbox}
                                        />
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
                                            <button
                                                onClick={handleSaveEdit}
                                                className={styles.saveBtn}
                                                title="Save"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className={styles.cancelBtn}
                                                title="Cancel"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type="checkbox"
                                            checked={subtask.status === 'completed'}
                                            onChange={(e) => onSubtaskToggle(subtask.id, e.target.checked)}
                                            className={styles.checkbox}
                                        />
                                        <span className={subtask.status === 'completed' ? styles.completed : ''}>
                                            {subtask.content}
                                        </span>
                                        {(hoveredId === subtask.id || window.innerWidth < 768) && (
                                            <div className={styles.actions}>
                                                {onSubtaskEdit && (
                                                    <button
                                                        onClick={() => handleStartEdit(subtask)}
                                                        className={styles.actionBtn}
                                                        title="Edit subtask"
                                                    >
                                                        <EditIcon size={16} />
                                                    </button>
                                                )}
                                                {onSubtaskDelete && (
                                                    <button
                                                        onClick={() => handleDelete(subtask.id)}
                                                        className={styles.actionBtn}
                                                        title="Delete subtask"
                                                    >
                                                        <DeleteIcon size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}

                    {isAddingNew && (
                        <div className={styles.subtask}>
                            <input
                                type="checkbox"
                                disabled
                                className={styles.checkbox}
                            />
                            <input
                                type="text"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newContent.trim()) handleAddNew();
                                    if (e.key === 'Escape') {
                                        setNewContent('');
                                        setIsAddingNew(false);
                                    }
                                }}
                                placeholder="Type new subtask..."
                                autoFocus
                                className={styles.editInput}
                            />
                            <div className={styles.editActions}>
                                <button
                                    onClick={handleAddNew}
                                    className={styles.saveBtn}
                                    title="Save"
                                >
                                    ✓
                                </button>
                                <button
                                    onClick={() => {
                                        setNewContent('');
                                        setIsAddingNew(false);
                                    }}
                                    className={styles.cancelBtn}
                                    title="Cancel"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
