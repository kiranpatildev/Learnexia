
import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechToText = (options = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState(''); // Current session transcript
    const [error, setError] = useState(null);
    const [interimTranscript, setInterimTranscript] = useState(''); // Real-time feedback

    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = options.lang || 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setError(event.error);
                setIsListening(false);
            };

            recognitionRef.current.onresult = (event) => {
                let finalTrans = '';
                let interimTrans = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTrans += event.results[i][0].transcript;
                    } else {
                        interimTrans += event.results[i][0].transcript;
                    }
                }

                if (finalTrans) {
                    setTranscript((prev) => prev + (prev ? ' ' : '') + finalTrans);
                }
                setInterimTranscript(interimTrans);
            };
        } else {
            setError('Browser not supported');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [options.lang]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                setTranscript(''); // Optional: clear previous? Or keep? 
                // Logic: Usually start fresh or append. 
                // User might want to append. But here we reset purely for "session". 
                // The consumer component handles appending to the main text field.
                // BUT wait, if we want "append", we should let consumer handle the update.
                // My hook just emits new chunks.
                // To support "continuous" editing in field:
                // The consumer typically listens to `transcript` changes.
                // But if I clear it on start, it might clear user's manual edits if we bind directly.
                // Best approach: Hook provides `transcript` updates (deltas) or full valid transcript of *current session*.
                // I'll keep it simple: It processes input. The consumer appends it to form state.
                recognitionRef.current.start();
                setError(null);
            } catch (err) {
                console.error(err);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        error,
        isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    };
};
