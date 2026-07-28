import React, { useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Square, Play, RotateCcw, AlertCircle } from 'lucide-react';
import { startTranscription, speakText, stopSpeaking } from '../../lib/speech';

export default function VoiceInterview() {
  const [listening, setListening] = useState(false);
  const [speakingState, setSpeakingState] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [permissionError, setPermissionError] = useState('');
  const stopRef = useRef(null);

  const handleStart = async () => {
    setPermissionError('');
    try {
      stopSpeaking();
      setSpeakingState(false);
      setListening(true);
      stopRef.current = await startTranscription({
        onPartial: (t) => setTranscript((prev) => (prev ? prev + ' ' + t : t)),
        onFinal: (t) => setTranscript((prev) => (prev ? prev + ' ' + t : t)),
      });
    } catch (e) {
      console.error(e);
      setListening(false);
      const msg = e.message || '';
      if (msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
        setPermissionError(
          'Microphone access was denied. Please click the 🔒 lock icon in your browser address bar, allow microphone access, then reload the page.'
        );
      } else if (msg.toLowerCase().includes('not supported') || msg.toLowerCase().includes('not found')) {
        setPermissionError('No microphone found. Please connect a microphone and try again.');
      } else {
        setPermissionError(e.message || 'Could not access microphone.');
      }
    }
  };

  const handleStop = () => {
    try {
      if (stopRef.current) stopRef.current();
    } catch (e) {}
    setListening(false);
  };

  const handleSpeak = async () => {
    if (!transcript.trim()) return;
    try {
      handleStop();
      setSpeakingState(true);
      await speakText(transcript, {
        onStart: () => setSpeakingState(true),
        onEnd: () => setSpeakingState(false),
        onError: () => setSpeakingState(false),
      });
    } catch (e) {
      console.error(e);
      setSpeakingState(false);
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setSpeakingState(false);
  };

  const handleClear = () => {
    handleStop();
    handleStopSpeaking();
    setTranscript('');
    setPermissionError('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              listening ? 'bg-red-500 animate-ping' : speakingState ? 'bg-orange-400 animate-pulse' : 'bg-gray-300'
            }`}
          />
          <span className="text-sm font-semibold text-gray-800">
            {listening ? 'Listening to your voice...' : speakingState ? 'AI is speaking...' : 'Voice AI Ready'}
          </span>
        </div>
        {(listening || speakingState) && (
          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            2-Way Voice Active
          </span>
        )}
      </div>

      {/* Permission error banner */}
      {permissionError && (
        <div className="flex items-start gap-3 p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={listening ? handleStop : handleStart}
          className={`px-5 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
            listening
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200'
          }`}
        >
          {listening ? (
            <><Square className="w-4 h-4" /> Stop Recording</>
          ) : (
            <><Mic className="w-4 h-4" /> Start Voice Input</>
          )}
        </button>

        <button
          onClick={speakingState ? handleStopSpeaking : handleSpeak}
          disabled={!transcript.trim()}
          className="px-5 py-3 rounded-xl font-medium text-sm border border-gray-200 hover:border-gray-300 text-gray-800 bg-gray-50 hover:bg-gray-100 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {speakingState ? (
            <><Square className="w-4 h-4 text-orange-600" /> Stop AI Voice</>
          ) : (
            <><Volume2 className="w-4 h-4 text-orange-600" /> Listen to AI Voice</>
          )}
        </button>

        {transcript && (
          <button
            onClick={handleClear}
            className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-all"
            title="Clear transcript"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Voice Transcript & AI Conversation
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={6}
          placeholder="Click 'Start Voice Input' and speak clearly into your microphone..."
          className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 leading-relaxed resize-none transition"
        />
      </div>
    </div>
  );
}
