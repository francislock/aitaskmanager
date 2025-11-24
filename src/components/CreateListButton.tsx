"use client";

import { useState } from 'react';
import styles from './CreateListButton.module.css';

interface CreateListButtonProps {
    onCreate: (name: string, emoji: string) => void;
}

const DEFAULT_EMOJIS = ['📋', '💼', '🏠', '🛒', '💡', '🎯', '📚', '🎨'];

export default function CreateListButton({ onCreate }: CreateListButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('📋');

    const handleCreate = () => {
        if (newListName.trim()) {
            onCreate(newListName.trim(), selectedEmoji);
            setNewListName('');
            setSelectedEmoji('📋');
            setShowModal(false);
        }
    };

    return (
        <>
            <button
                className={styles.createButton}
                onClick={() => setShowModal(true)}
            >
                <span className={styles.icon}>➕</span>
                <span>Create New List</span>
            </button>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Create New List</h3>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.field}>
                                <label>Emoji</label>
                                <div className={styles.emojiSelector}>
                                    {DEFAULT_EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            className={`${styles.emojiOption} ${selectedEmoji === emoji ? styles.selected : ''}`}
                                            onClick={() => setSelectedEmoji(emoji)}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>List Name</label>
                                <input
                                    type="text"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreate();
                                        if (e.key === 'Escape') setShowModal(false);
                                    }}
                                    placeholder="e.g., Client Projects, Fitness Goals..."
                                    autoFocus
                                    className={styles.nameInput}
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.createBtn}
                                onClick={handleCreate}
                                disabled={!newListName.trim()}
                            >
                                Create List
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
