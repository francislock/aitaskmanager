"use client";

import { useState, useEffect, KeyboardEvent, useRef } from 'react';
import styles from './VoiceInput.module.css';

interface VoiceInputProps {
    onCommand: (command: string) => void;
    isProcessing: boolean;
}

export default function VoiceInput({ onCommand, isProcessing }: VoiceInputProps) {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = 'es-ES'; // Default to Spanish as per user context

                recognition.onresult = (event) => {
                    const transcript = Array.from(event.results)
                        .map(result => result[0].transcript)
                        .join('');
                    setInput(transcript);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognition.onerror = (event) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setInput('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim() && !isProcessing) {
            onCommand(input);
            setInput('');
        }
    };

    const handleSubmit = () => {
        if (input.trim() && !isProcessing) {
            onCommand(input);
            setInput('');
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.inputWrapper} ${isListening ? styles.listening : ''}`}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder={isListening ? "Listening..." : "Type or click mic to speak..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isProcessing}
                />
                <button
                    className={`${styles.micButton} ${isListening ? styles.recording : ''}`}
                    onClick={isListening ? toggleListening : (input ? handleSubmit : toggleListening)}
                    disabled={isProcessing}
                    title={input ? "Send Command" : "Start Listening"}
                >
                    {isProcessing ? '...' : (input && !isListening ? '➤' : '🎤')}
                </button>
            </div>
            {isListening && <div className={styles.pulseRing}></div>}
        </div>
    );
}
