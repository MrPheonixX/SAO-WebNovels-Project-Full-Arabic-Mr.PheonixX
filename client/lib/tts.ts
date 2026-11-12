// Advanced Arabic Text-to-Speech System for MrPheonixX Team

interface TTSVoice {
  id: string;
  name: string;
  nameArabic: string;
  lang: string;
  gender: "male" | "female";
  quality: "high" | "medium" | "low";
  available: boolean;
}

interface TTSSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  autoPlay: boolean;
  highlightText: boolean;
}

class ArabicTTSManager {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;
  private isPaused = false;
  private settings: TTSSettings;
  private voices: TTSVoice[] = [];
  private onStateChange?: (state: TTSState) => void;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.settings = this.loadSettings();
    this.initializeVoices();
  }

  private loadSettings(): TTSSettings {
    const saved = localStorage.getItem("tts-settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem("tts-settings");
      }
    }
    return {
      voice: "ar-SA",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      autoPlay: false,
      highlightText: true,
    };
  }

  private saveSettings(): void {
    localStorage.setItem("tts-settings", JSON.stringify(this.settings));
  }

  private initializeVoices(): void {
    const updateVoices = () => {
      const systemVoices = this.synthesis.getVoices();

      // Arabic voices
      const arabicVoices = systemVoices.filter(
        (voice) => voice.lang.startsWith("ar") || voice.name.includes("Arabic"),
      );

      this.voices = [
        // Premium Arabic voices (if available)
        {
          id: "ar-SA-premium",
          name: "Premium Saudi Arabic",
          nameArabic: "عربي سعودي متقدم",
          lang: "ar-SA",
          gender: "male",
          quality: "high",
          available: arabicVoices.some((v) => v.lang === "ar-SA"),
        },
        {
          id: "ar-EG-premium",
          name: "Premium Egyptian Arabic",
          nameArabic: "عربي مصري متقدم",
          lang: "ar-EG",
          gender: "female",
          quality: "high",
          available: arabicVoices.some((v) => v.lang === "ar-EG"),
        },
        // Standard Arabic voices
        {
          id: "ar-SA-standard",
          name: "Standard Saudi Arabic",
          nameArabic: "عربي سعودي عادي",
          lang: "ar-SA",
          gender: "male",
          quality: "medium",
          available: arabicVoices.some((v) => v.lang === "ar-SA"),
        },
        {
          id: "ar-AE-standard",
          name: "Standard Emirati Arabic",
          nameArabic: "عربي إماراتي عادي",
          lang: "ar-AE",
          gender: "female",
          quality: "medium",
          available: arabicVoices.some((v) => v.lang === "ar-AE"),
        },
        // Fallback voices
        {
          id: "ar-generic",
          name: "Generic Arabic",
          nameArabic: "عربي عام",
          lang: "ar",
          gender: "male",
          quality: "low",
          available: arabicVoices.length > 0,
        },
      ];

      // If no Arabic voices are available, add a fallback notification
      if (arabicVoices.length === 0) {
        console.warn("No Arabic voices found. TTS may not work properly.");
      }
    };

    // Initial load
    updateVoices();

    // Update when voices change (some browsers load voices asynchronously)
    this.synthesis.onvoiceschanged = updateVoices;
  }

  public getAvailableVoices(): TTSVoice[] {
    return this.voices.filter((voice) => voice.available);
  }

  public setSettings(newSettings: Partial<TTSSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public getSettings(): TTSSettings {
    return { ...this.settings };
  }

  public setStateChangeCallback(callback: (state: TTSState) => void): void {
    this.onStateChange = callback;
  }

  private notifyStateChange(state: Partial<TTSState>): void {
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        currentText: this.currentUtterance?.text || "",
        progress: 0, // Note: Web Speech API doesn't provide progress
        ...state,
      });
    }
  }

  public speak(text: string, options?: Partial<TTSSettings>): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop current speech
      this.stop();

      // Clean and prepare text for Arabic TTS
      const cleanText = this.prepareArabicText(text);

      // Create utterance
      this.currentUtterance = new SpeechSynthesisUtterance(cleanText);

      // Apply settings
      const effectiveSettings = { ...this.settings, ...options };
      this.currentUtterance.lang = effectiveSettings.voice;
      this.currentUtterance.rate = effectiveSettings.rate;
      this.currentUtterance.pitch = effectiveSettings.pitch;
      this.currentUtterance.volume = effectiveSettings.volume;

      // Find and set the best available voice
      const voices = this.synthesis.getVoices();
      const selectedVoice = voices.find(
        (voice) =>
          voice.lang === effectiveSettings.voice ||
          voice.lang.startsWith(effectiveSettings.voice.split("-")[0]),
      );

      if (selectedVoice) {
        this.currentUtterance.voice = selectedVoice;
      }

      // Set up event handlers
      this.currentUtterance.onstart = () => {
        this.isPlaying = true;
        this.isPaused = false;
        this.notifyStateChange({ isPlaying: true, isPaused: false });
      };

      this.currentUtterance.onend = () => {
        this.isPlaying = false;
        this.isPaused = false;
        this.notifyStateChange({ isPlaying: false, isPaused: false });
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        this.isPlaying = false;
        this.isPaused = false;
        this.notifyStateChange({ isPlaying: false, isPaused: false });
        reject(new Error(`TTS Error: ${event.error}`));
      };

      this.currentUtterance.onpause = () => {
        this.isPaused = true;
        this.notifyStateChange({ isPaused: true });
      };

      this.currentUtterance.onresume = () => {
        this.isPaused = false;
        this.notifyStateChange({ isPaused: false });
      };

      // Start speaking
      this.synthesis.speak(this.currentUtterance);
    });
  }

  private prepareArabicText(text: string): string {
    // Remove HTML tags
    let cleanText = text.replace(/<[^>]*>/g, "");

    // Normalize Arabic text
    cleanText = cleanText
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
      // Add pauses for better pronunciation
      .replace(/[.!?]/g, "$&... ")
      .replace(/[،]/g, "$&.. ")
      // Normalize Arabic characters
      .replace(/[أإآا]/g, "ا")
      .replace(/[ة]/g, "ه")
      .replace(/[ى]/g, "ي")
      // Add pronunciation hints for better speech
      .replace(/\bساو\b/g, "سورد آرت أونلاين")
      .replace(/\bSAO\b/g, "سورد آرت أونلاين")
      .replace(/\bكيريتو\b/g, "كيريتو")
      .replace(/\bأسونا\b/g, "أسونا")
      .trim();

    return cleanText;
  }

  public pause(): void {
    if (this.isPlaying && !this.isPaused) {
      this.synthesis.pause();
    }
  }

  public resume(): void {
    if (this.isPlaying && this.isPaused) {
      this.synthesis.resume();
    }
  }

  public stop(): void {
    this.synthesis.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.notifyStateChange({
      isPlaying: false,
      isPaused: false,
      currentText: "",
    });
  }

  public toggle(): void {
    if (this.isPlaying) {
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    }
  }

  public isSupported(): boolean {
    return "speechSynthesis" in window;
  }

  public getState(): TTSState {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentText: this.currentUtterance?.text || "",
      progress: 0, // Web Speech API doesn't provide progress
    };
  }

  // Advanced features
  public speakWithHighlight(text: string, elementId: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element || !this.settings.highlightText) {
      return this.speak(text);
    }

    // Add highlighting effect
    const originalStyle = element.style.cssText;
    element.style.cssText += `
      background: linear-gradient(90deg, rgba(59, 130, 246, 0.3) 0%, transparent 100%);
      animation: highlight-pulse 1s ease-in-out infinite;
    `;

    return this.speak(text).finally(() => {
      // Restore original style
      element.style.cssText = originalStyle;
    });
  }

  public speakPage(
    pageElement: HTMLElement,
    options?: {
      skipElements?: string[];
      pauseBetweenParagraphs?: number;
    },
  ): Promise<void> {
    const skipSelectors = options?.skipElements || [
      ".skip-tts",
      "[data-skip-tts]",
    ];
    const pauseDuration = options?.pauseBetweenParagraphs || 500;

    // Extract text content, skipping specified elements
    let textContent = "";
    const walker = document.createTreeWalker(
      pageElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Check if any parent element should be skipped
          let parent = node.parentElement;
          while (parent) {
            for (const selector of skipSelectors) {
              if (parent.matches(selector)) {
                return NodeFilter.FILTER_REJECT;
              }
            }
            parent = parent.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    // Combine text with natural pauses
    textContent = textNodes
      .map((node) => node.textContent?.trim())
      .filter((text) => text && text.length > 0)
      .join(" ... ");

    return this.speak(textContent);
  }
}

interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  progress: number;
}

// Create global TTS manager instance
export const ttsManager = new ArabicTTSManager();

// Helper functions for easy use
export const speakText = (text: string) => ttsManager.speak(text);
export const pauseTTS = () => ttsManager.pause();
export const resumeTTS = () => ttsManager.resume();
export const stopTTS = () => ttsManager.stop();
export const toggleTTS = () => ttsManager.toggle();

import React from "react";

// React hook for TTS state
export const useTTS = () => {
  const [state, setState] = React.useState<TTSState>(ttsManager.getState());

  React.useEffect(() => {
    ttsManager.setStateChangeCallback(setState);
    return () => ttsManager.setStateChangeCallback(() => {});
  }, []);

  return {
    ...state,
    speak: (text: string) => ttsManager.speak(text),
    pause: () => ttsManager.pause(),
    resume: () => ttsManager.resume(),
    stop: () => ttsManager.stop(),
    toggle: () => ttsManager.toggle(),
    settings: ttsManager.getSettings(),
    setSettings: (settings: Partial<TTSSettings>) =>
      ttsManager.setSettings(settings),
    voices: ttsManager.getAvailableVoices(),
    isSupported: ttsManager.isSupported(),
  };
};

// Add CSS for highlighting animation
const style = document.createElement("style");
style.textContent = `
  @keyframes highlight-pulse {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
  }
`;
document.head.appendChild(style);

export default ttsManager;
