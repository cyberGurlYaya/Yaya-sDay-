import type { NicknameStyle, NicknameSuggestion } from './types';

const suffixes: Record<NicknameStyle, string[]> = {
  cute: ['Boo', 'Bubbles', 'Bibi'],
  elegant: ['Belle', 'Lumi', 'Elle'],
  playful: ['Spark', 'Sunshine', 'Peach'],
  sweet: ['Love', 'Honey', 'Sweetie'],
  bold: ['Boss', 'Queen', 'Star'],
};

export function generateNicknameSuggestions(
  name: string,
  style: NicknameStyle,
  count = 3,
): NicknameSuggestion[] {
  const cleanName = name.trim();
  if (!cleanName) return [];

  const first = cleanName.split(/\s+/)[0];
  const pool = suffixes[style];

  return pool.slice(0, count).map((suffix) => ({
    value: `${first} ${suffix}`,
    style,
  }));
}
