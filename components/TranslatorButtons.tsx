'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { AppMode, Language, LANGUAGES, RoomState } from '@/lib/translator-types';
import * as roomStateService from '@/lib/roomStateService';
import { streamTranslation } from '@/lib/geminiService';

interface TranslatorButtonsProps {
  userId: string;
  userName: string;
}

const TranslatorButtons = ({ userId, userName }: TranslatorButtonsProps) => {
  const [mode, setMode] = useState<AppMode>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [roomState, setRoomState] = useState<RoomState>(roomStateService.getRoomState());
  const [showLangs, setShowLangs] = useState(false);
  const [transcription, setTranscription] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const selectedLanguageRef = useRef<Language>(LANGUAGES[0]);

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    const unsub = roomStateService.subscribeToRoomState(setRoomState);
    return () => unsub();
  }, []);

  const isSomeoneElseSpeaking = roomState.activeSpeaker && roomState.activeSpeaker.userId !== userId;
  const isMeSpeaking = mode === 'speaking';
  const isMeListening = mode === 'listening';

  const handleSpeakToggle = useCallback(async () => {
    if (mode === 'speaking') {
      isRunningRef.current = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      setMode('idle');
      setTranscription('');
      roomStateService.releaseSpeaker(userId);
    } else {
      const acquired = roomStateService.tryAcquireSpeaker(userId, userName);
      if (acquired) {
        setMode('speaking');
        setTranscription('Initializing transcription...');
        isRunningRef.current = true;

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = audioCtx;

          // Note: In a real implementation, we would hook up speech-to-text here 
          // or send audio chunks to Gemini. For this demo integration, we are calling 
          // streamTranslation which is expecting text input in the original code,
          // but we canadapt logic or use speech recognition as a bridge.
          // 
          // Given the current geminiService logic (text-to-speech-translation),
          // let's keep the speech recognition for input, and use Gemini for output (if that was the intent)
          // OR if streamTranslation supports audio input (the updated one does via 'turn'?), 
          // let's re-examine geminiService.ts. 
          //
          // Wait, the geminiService.ts I copied uses:
          // sessionPromise.then(s => s.sendClientContent({ turns: [{ parts: [{ text: sourceText }] }] }));
          // It sends TEXT. So we need Speech-to-Text first.
          
          if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
              // eslint-disable-next-line new-cap
              const SpeechRecognition = (window as any).webkitSpeechRecognition;
              const recognition = new SpeechRecognition();
              recognition.continuous = true;
              recognition.interimResults = true;
              recognition.lang = selectedLanguageRef.current.code === 'auto' 
                ? navigator.language 
                : selectedLanguageRef.current.code;
              
              recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                  if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                  }
                }
                
                if (finalTranscript && isRunningRef.current) {
                  setTranscription(`Translating: ${finalTranscript}`);
                  // Send to Gemini for translation and speech output
                   streamTranslation(
                      finalTranscript,
                      selectedLanguageRef.current.name,
                      audioCtx,
                      (data) => { /* handle audio data visualization if needed */ },
                      (text) => setTranscription(text),
                      () => { /* interaction ended */ },
                      navigator.language
                   );
                }
              };
              
              recognition.start();
              // Store recognition to stop it later
              (mediaStreamRef as any).recognition = recognition; 
          }

        } catch (err) {
          console.error("Error accessing microphone:", err);
          setMode('idle');
          setTranscription('Error accessing microphone');
        }
      }
    }
  }, [mode, userId, userName]);

  const handleListenToggle = useCallback(() => {
    if (mode === 'listening') {
      setMode('idle');
      setTranscription('');
    } else {
      setMode('listening');
      setTranscription('Listening for translations...');
    }
  }, [mode]);

  const handleLangClick = () => {
    if (!isMeListening) {
      setShowLangs(!showLangs);
    }
  };

  // Square button base style with 4px elevation
  const buttonBaseStyle = `flex cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#19232d] px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all hover:bg-[#4c535b]`;

  return (
    <div className="relative flex flex-col items-center">
      {/* Transcription display - 15px above buttons */}
      {transcription && (
        <div 
          className="absolute bottom-[calc(100%+15px)] w-[400px] max-w-[90vw] text-center"
        >
          <span className="inline-block max-w-full truncate rounded-[8px] bg-[#1c1f2e]/90 px-4 py-2 text-sm text-white shadow-lg">
            {transcription}
          </span>
        </div>
      )}
      
      {/* Buttons row */}
      <div className="flex items-center gap-2">
        {/* Speak Button - text only */}
        <button
          onClick={handleSpeakToggle}
          disabled={(isSomeoneElseSpeaking && !isMeSpeaking) || isMeListening}
          className={`${buttonBaseStyle} ${isMeSpeaking ? 'bg-red-500/90 text-white hover:bg-red-600' : 'text-white disabled:opacity-30'}`}
          title="Speak"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isMeSpeaking ? 'Stop' : 'Speak'}
          </span>
        </button>

        {/* Listen Button - text only */}
        <button
          onClick={handleListenToggle}
          disabled={isMeSpeaking}
          className={`${buttonBaseStyle} ${isMeListening ? 'bg-blue-600/95 text-white ring-1 ring-blue-400/40 hover:bg-blue-700' : 'text-white disabled:opacity-20'}`}
          title="Listen"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isMeListening ? 'Stop' : 'Listen'}
          </span>
        </button>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={handleLangClick}
            disabled={isMeListening}
            className={`${buttonBaseStyle} ${isMeListening ? 'cursor-not-allowed opacity-50' : ''}`}
            title="Select Language"
          >
            <span className="text-lg">{selectedLanguage.flag}</span>
            <span className="hidden text-sm font-medium text-white sm:inline">
              {selectedLanguage.code.split('-')[0].toUpperCase()}
            </span>
            {!isMeListening && <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {showLangs && !isMeListening && (
            <div className="absolute bottom-full left-1/2 z-[100] mb-2 max-h-[300px] w-[220px] -translate-x-1/2 overflow-y-auto rounded-[8px] border border-slate-700/60 bg-[#1c1f2e] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { 
                    setSelectedLanguage(lang); 
                    setShowLangs(false); 
                  }}
                  className={`flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-left transition-all ${selectedLanguage.code === lang.code ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700/60'}`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslatorButtons;
