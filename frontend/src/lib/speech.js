// Lightweight speech helper: requests mic permission explicitly before starting recognition
export async function requestMicPermission() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Your browser does not support microphone access. Please use Google Chrome or Microsoft Edge.');
  }
  // Explicitly request permission — this triggers the browser's permission prompt
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // Release the stream immediately; we just needed the permission grant
  stream.getTracks().forEach((t) => t.stop());
  return true;
}

export async function startTranscription({ onPartial, onFinal } = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    throw new Error('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
  }

  // Step 1: Request mic permission explicitly so browser shows the prompt
  await requestMicPermission();

  // Step 2: Start recognition
  const recog = new SpeechRecognition();
  recog.lang = 'en-US';
  recog.interimResults = true;
  recog.continuous = true;

  recog.onresult = (e) => {
    let interim = '';
    let final = '';
    for (let i = e.resultIndex; i < e.results.length; ++i) {
      const r = e.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (onPartial && interim) onPartial(interim);
    if (onFinal && final) onFinal(final);
  };

  recog.onerror = (err) => {
    console.warn('SpeechRecognition error', err);
  };

  recog.start();

  return () => {
    try { recog.stop(); } catch (e) {}
  };
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

export function getAvailableVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  }
  return [];
}

export async function speakText(text, options = {}) {
  if (!text) return;

  const {
    rate = 1.0,
    pitch = 1.0,
    volume = 1.0,
    voiceName = null,
    onStart = null,
    onEnd = null,
    onError = null,
  } = options;

  if (!('speechSynthesis' in window)) {
    throw new Error('Text-to-speech is not supported in this browser.');
  }

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = volume;

  const voices = window.speechSynthesis.getVoices();
  if (voiceName) {
    const selected = voices.find((v) => v.name === voiceName || v.name.includes(voiceName));
    if (selected) utter.voice = selected;
  } else {
    const naturalVoice =
      voices.find(
        (v) =>
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Karen')) &&
          v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));
    if (naturalVoice) utter.voice = naturalVoice;
  }

  if (onStart) utter.onstart = onStart;
  if (onEnd) utter.onend = onEnd;
  if (onError) utter.onerror = onError;

  window.speechSynthesis.speak(utter);
  return utter;
}
