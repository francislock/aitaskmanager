"use client";

import { List } from '@/types';
import { useState } from 'react';
import styles from './ListHeader.module.css';

interface ListHeaderProps {
    list: List;
    taskCount: number;
    onEdit: (listId: string, name: string, emoji: string) => void;
    onDelete?: (listId: string) => void;
}

const EMOJI_OPTIONS = [
    '💼', '📊', '📈', '💻', '🎯', '📝', '🏢', '👔',
    '🏠', '🛋️', '🧹', '🍳', '👨‍👩‍👧', '🌱', '🏡', '🔑',
    '🛒', '🛍️', '🥗', '🍕', '🧺', '🥤', '🍎', '🧃',
    '💡', '🎨', '📚', '✨', '🚀', '⭐', '🌟', '💫',
    '📋', '📌', '📍', '🎯', '🔔', '⏰', '📅', '🗓️'
];

export default function ListHeader({ list, taskCount, onEdit, onDelete }: ListHeaderProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(list.name);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleSaveName = () => {
        if (editName.trim() && editName !== list.name) {
            onEdit(list.id, editName.trim(), list.emoji);
        }
        setIsEditingName(false);
    };

    const handleEmojiSelect = (emoji: string) => {
        onEdit(list.id, list.name, emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className={styles.header}>
            <div className={styles.left}>
                {/* Emoji Selector */}
                <div className={styles.emojiContainer}>
                    <span
                        className={styles.emoji}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Click to change emoji"
                    >
                        {list.emoji}
                    </span>
                    {showEmojiPicker && (
                        <div className={styles.emojiPicker}>
                            {EMOJI_OPTIONS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => handleEmojiSelect(emoji)}
                                    className={styles.emojiOption}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Name Editor */}
                {isEditingName ? (
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={handleSaveName}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName();
                            if (e.key === 'Escape') {
                                setEditName(list.name);
                                setIsEditingName(false);
                            }
                        }}
                        autoFocus
                        className={styles.nameInput}
                    />
                ) : (
                    <div className={styles.nameWrapper}>
                        <h2
                            className={styles.name}
                            onClick={() => setIsEditingName(true)}
                            title="Click to edit name"
                        >
                            {list.name}
                        </h2>
                        <span className={styles.taskCount}>{taskCount}</span>
                    </div>
                )}
            </div>

            {/* Delete Button (only for non-default lists) */}
            {!list.is_default && onDelete && (
                <button
                    onClick={() => onDelete(list.id)}
                    className={styles.deleteBtn}
                    title="Delete list"
                >
                    🗑️
                </button>
            )}
        </div>
    );
}
