import * as Speech from 'expo-speech';

export async function speak(
  text: string,
  options: { rate?: number; pitch?: number } = {}
): Promise<void> {
  await Speech.speak(text, {
    rate: options.rate ?? 1,
    pitch: options.pitch ?? 1,
    language: 'en',
  });
}

export function stop(): void {
  Speech.stop();
}

export function pause(): void {
  Speech.pause();
}

export function resume(): void {
  Speech.resume();
}

export function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
