export type AppMode = "idle" | "speaking" | "listening";
export type ListenPreference = "raw" | "translated";
export type AudioSource = "mic" | "system";

export type EmotionType = "neutral" | "joy" | "sadness" | "anger" | "fear" | "calm" | "excited";

export interface SpeakerInfo {
  userId: string;
  userName: string;
  sessionId: string;
  since: number;
}

export interface QueueEntry {
  userId: string;
  userName: string;
  requestedAt: number;
}

export interface RoomState {
  activeSpeaker: SpeakerInfo | null;
  raiseHandQueue: QueueEntry[];
  lockVersion: number;
}

export interface Caption {
  id: string;
  text: string;
  sourceLang: string;
  speakerUserId: string;
  speakerName: string;
  timestamp: number;
  isFinal: boolean;
  emotion?: EmotionType;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
  emotion: EmotionType;
  pronunciationGuide: string;
}

export const AUTO_DETECT: Language = { code: 'auto', name: 'Auto Detect', flag: '✨' };

export const LANGUAGES: Language[] = [
  AUTO_DETECT,
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl-PL', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },
  { code: 'vi-VN', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'th-TH', name: 'Thai', flag: '🇹🇭' },
  { code: 'id-ID', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'tl-PH', name: 'Filipino', flag: '🇵🇭' },
  { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪' },
  { code: 'uk-UA', name: 'Ukrainian', flag: '🇺🇦' },
];
