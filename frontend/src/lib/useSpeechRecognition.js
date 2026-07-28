import { useRef, useState, useCallback, useEffect } from "react";

export function useSpeechRecognition() {
  const [state, setState] = useState("idle"); // 'idle' | 'listening' | 'recording_fallback' | 'error' | 'unsupported'
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [useFallbackMode, setUseFallbackMode] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  const shouldListenRef = useRef(false);
  const finalTranscriptRef = useRef("");

  const isWebSpeechSupported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const isMediaRecorderSupported = typeof window !== "undefined" && navigator?.mediaDevices?.getUserMedia;

  const isSupported = isWebSpeechSupported || isMediaRecorderSupported;

  useEffect(() => {
    if (!isSupported) setState("unsupported");
  }, [isSupported]);

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }
  }, []);

  const teardownWebSpeech = useCallback((recognition) => {
    try {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    } catch {}
  }, []);

  // Fallback engine using HTML5 MediaRecorder (Local Microphone Recording)
  const startFallbackAudioRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setState("idle");
      };

      recorder.start(250);
      setState("recording_fallback");
      setUseFallbackMode(true);
      setError("Cloud speech recognition unreachable. Using direct microphone audio recording fallback. You can speak and edit your response below.");
    } catch (err) {
      console.error("MediaRecorder fallback error:", err);
      setError("Microphone access denied or unavailable. Please check your browser mic permissions.");
      setState("error");
    }
  }, []);

  // Start Speech Recognition (attempts Web Speech API first, falls back to MediaRecorder on network error)
  const start = useCallback(() => {
    setError(null);
    setAudioBlob(null);

    // If already known to fail cloud WebSpeech, go directly to MediaRecorder fallback
    if (useFallbackMode || !isWebSpeechSupported) {
      startFallbackAudioRecording();
      return;
    }

    shouldListenRef.current = false;
    if (recognitionRef.current) {
      teardownWebSpeech(recognitionRef.current);
      recognitionRef.current = null;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;
    finalTranscriptRef.current = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const txt = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += txt + " ";
        } else {
          interim += txt;
        }
      }
      setTranscript(finalTranscriptRef.current + interim);
    };

    recognition.onerror = (e) => {
      console.warn("SpeechRecognition error:", e.error);
      if (e.error === "no-speech" || e.error === "aborted") return;

      if (e.error === "network") {
        // Network error during Web Speech API (Google Cloud Speech unreachable)
        // Automatically switch to local MediaRecorder audio capture fallback!
        teardownWebSpeech(recognition);
        recognitionRef.current = null;
        startFallbackAudioRecording();
      } else if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access denied. Allow microphone permissions in your browser settings and try again.");
        setState("error");
        shouldListenRef.current = false;
      } else if (e.error === "audio-capture") {
        setError("No microphone detected. Connect a microphone and try again.");
        setState("error");
        shouldListenRef.current = false;
      } else {
        // Any other error -> fall back to local MediaRecorder audio recording
        teardownWebSpeech(recognition);
        recognitionRef.current = null;
        startFallbackAudioRecording();
      }
    };

    recognition.onend = () => {
      if (shouldListenRef.current && state === "listening") {
        try {
          recognition.start();
        } catch {}
      } else if (state !== "recording_fallback") {
        setState("idle");
      }
    };

    try {
      recognition.start();
      shouldListenRef.current = true;
      recognitionRef.current = recognition;
      setState("listening");
      setTranscript("");
    } catch (err) {
      console.warn("Failed to start WebSpeech, starting fallback:", err);
      startFallbackAudioRecording();
    }
  }, [isWebSpeechSupported, useFallbackMode, startFallbackAudioRecording, teardownWebSpeech, state]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      teardownWebSpeech(recognitionRef.current);
      recognitionRef.current = null;
    }
    stopMediaRecorder();
    setState("idle");
  }, [teardownWebSpeech, stopMediaRecorder]);

  const reset = useCallback(() => {
    stop();
    setTranscript("");
    finalTranscriptRef.current = "";
    setError(null);
    setAudioBlob(null);
  }, [stop]);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) teardownWebSpeech(recognitionRef.current);
      stopMediaRecorder();
    };
  }, [teardownWebSpeech, stopMediaRecorder]);

  return {
    state,
    transcript,
    error,
    isSupported,
    audioBlob,
    useFallbackMode,
    start,
    stop,
    reset,
    setTranscript,
  };
}
