import { useRef, useState, useCallback, useEffect } from 'react';
export function useSpeechRecognition() {
    const [state, setState] = useState('idle');
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const shouldListenRef = useRef(false);
    const finalTranscriptRef = useRef('');
    const isSupported = typeof window !== 'undefined' &&
        (window.SpeechRecognition || window.webkitSpeechRecognition);
    useEffect(() => {
        if (!isSupported)
            setState('unsupported');
    }, [isSupported]);
    const teardown = useCallback((recognition) => {
        try {
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
            recognition.stop();
        }
        catch { }
    }, []);
    const start = useCallback(() => {
        if (!isSupported) {
            setState('unsupported');
            setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
            return;
        }
        // Tear down any existing instance cleanly before starting a fresh one.
        shouldListenRef.current = false;
        if (recognitionRef.current) {
            teardown(recognitionRef.current);
            recognitionRef.current = null;
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        finalTranscriptRef.current = '';
        recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const txt = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += txt + ' ';
                }
                else {
                    interim += txt;
                }
            }
            setTranscript(finalTranscriptRef.current + interim);
        };
        recognition.onerror = (e) => {
            if (e.error === 'no-speech' || e.error === 'aborted')
                return;
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                setError('Microphone access denied. Allow microphone permissions in your browser settings and try again.');
                setState('error');
                shouldListenRef.current = false;
            }
            else if (e.error === 'network') {
                setError('Network error during speech recognition. Check your connection and try again.');
                setState('error');
                shouldListenRef.current = false;
            }
            else if (e.error === 'audio-capture') {
                setError('No microphone detected. Connect a microphone and try again.');
                setState('error');
                shouldListenRef.current = false;
            }
            else if (e.error === 'already-started') {
                // Ignore — recognition is already running.
            }
            else {
                setError(`Speech recognition error: ${e.error}`);
                setState('error');
                shouldListenRef.current = false;
            }
        };
        recognition.onend = () => {
            // Auto-restart only while still supposed to be listening (handles browser timeouts).
            if (shouldListenRef.current) {
                try {
                    recognition.start();
                }
                catch {
                    // start() throws if already starting — safe to ignore.
                }
            }
            else {
                setState('idle');
            }
        };
        try {
            recognition.start();
            shouldListenRef.current = true;
            recognitionRef.current = recognition;
            setState('listening');
            setError(null);
            setTranscript('');
        }
        catch (err) {
            setError('Failed to start microphone: ' + (err.message || 'unknown error'));
            setState('error');
        }
    }, [isSupported, teardown]);
    const stop = useCallback(() => {
        shouldListenRef.current = false;
        if (recognitionRef.current) {
            teardown(recognitionRef.current);
            recognitionRef.current = null;
        }
        setState('idle');
    }, [teardown]);
    const reset = useCallback(() => {
        stop();
        setTranscript('');
        finalTranscriptRef.current = '';
        setError(null);
    }, [stop]);
    // Stop on unmount.
    useEffect(() => {
        return () => {
            shouldListenRef.current = false;
            if (recognitionRef.current)
                teardown(recognitionRef.current);
        };
    }, [teardown]);
    return { state, transcript, error, isSupported, start, stop, reset, setTranscript };
}
