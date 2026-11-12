// Simplified Arabic TTS for MrPheonixX Team

export interface TTSSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

class SimpleTTSManager {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop();

      // Clean Arabic text
      const cleanText = text
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .replace(/\bساو\b/g, "سورد آرت أونلاين")
        .trim();

      this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance.lang = "ar-SA";
      this.currentUtterance.rate = 1.0;
      this.currentUtterance.pitch = 1.0;
      this.currentUtterance.volume = 1.0;

      this.currentUtterance.onstart = () => {
        this.isPlaying = true;
      };

      this.currentUtterance.onend = () => {
        this.isPlaying = false;
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        this.isPlaying = false;
        reject(new Error(`TTS Error: ${event.error}`));
      };

      this.synthesis.speak(this.currentUtterance);
    });
  }

  stop(): void {
    this.synthesis.cancel();
    this.isPlaying = false;
    this.currentUtterance = null;
  }

  isActive(): boolean {
    return this.isPlaying;
  }
}

export const simpleTTS = new SimpleTTSManager();
export default simpleTTS;
