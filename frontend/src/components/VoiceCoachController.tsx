import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, Globe } from 'lucide-react';

interface VoiceCoachControllerProps {
  currentHintText?: string;
  onSpokenQuery?: (query: string) => void;
}

export const VoiceCoachController: React.FC<VoiceCoachControllerProps> = ({
  currentHintText,
  onSpokenQuery,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window) || !currentHintText) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentHintText);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleListen = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (onSpokenQuery) onSpokenQuery(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  if (!speechSupported) return null;

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
      {/* Language Toggle */}
      <button
        type="button"
        onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
          language === 'bn'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
        }`}
        title="Toggle between English and Bangla (বাংলা)"
      >
        <Globe className="w-3 h-3" />
        <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
      </button>

      {/* Audio Playback Button */}
      <button
        type="button"
        onClick={handleSpeak}
        disabled={!currentHintText}
        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 disabled:opacity-40 ${
          isPlaying
            ? 'bg-amber-500 text-white animate-pulse'
            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
        }`}
        title={isPlaying ? 'Stop voice readout' : 'Read hint aloud via Voice Synthesis'}
      >
        {isPlaying ? (
          <>
            <VolumeX className="w-3 h-3 text-white" />
            <span className="font-mono text-[10px]">Playing</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3 h-3 text-slate-500" />
            <span className="font-mono text-[10px]">Listen</span>
          </>
        )}
      </button>

      {/* Speech-to-Text Mic Button */}
      <button
        type="button"
        onClick={handleListen}
        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
        }`}
        title={isListening ? 'Listening to speech...' : 'Speak your question'}
      >
        {isListening ? (
          <>
            <Mic className="w-3 h-3 animate-bounce" />
            <span className="font-mono text-[10px]">Listening</span>
          </>
        ) : (
          <>
            <Mic className="w-3 h-3 text-slate-500" />
            <span className="font-mono text-[10px]">Mic</span>
          </>
        )}
      </button>
    </div>
  );
};
