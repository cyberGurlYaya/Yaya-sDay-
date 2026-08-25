import type { NicknameStyle, NicknameSuggestion } from './types';

const nameBased: Record<string, string[]> = {
  alia: ['Ali', 'Lia', 'Lili', 'Yaya'],
  aaliyah: ['Aali', 'Ali', 'Lia', 'Lily', 'Yaya'],
  olamide: ['Ola', 'Lami', 'Mide', 'Omi'],
  adegoke: ['Ade', 'Goke', 'Koke', 'Dego'],
  ayomide: ['Ayo', 'Yomi', 'Mide'],
  ayoola: ['Ayo', 'Yola', 'Yoyo'],
};

const playfulExtras: Record<NicknameStyle, string[]> = {
  cute: ['Bibi', 'Mimi'],
  elegant: ['Elle', 'Lia'],
  playful: ['Yoyo', 'Lulu'],
  sweet: ['Lili', 'Mimi'],
  bold: ['Ace', 'Ari'],
};

export function generateNicknameSuggestions(name: string, style: NicknameStyle, count = 3): NicknameSuggestion[] {
  const cleanName = name.trim();
  if (!cleanName) return [];
  const first = cleanName.split(/\s+/)[0];
  const lower = first.toLowerCase();
  const suggestions: string[] = [];
  const add = (value: string) => {
    const clean = value.trim();
    if (clean && clean.length >= 2 && !suggestions.some(item => item.toLowerCase() === clean.toLowerCase())) suggestions.push(clean);
  };

  (nameBased[lower] ?? []).forEach(add);
  add(first);
  if (first.length >= 3) add(first.slice(0, 3));
  if (first.length >= 4) add(first.slice(1));
  if (suggestions.length < count) playfulExtras[style].forEach(add);

  return suggestions.slice(0, count).map(value => ({ value, style }));
}
