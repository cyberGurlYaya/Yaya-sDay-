export const colors = {
  primary: '#9B7EDB',
  babyPink: '#F3B6C8',
  mint: '#A9DCCB',
  sky: '#A9D4F5',
  cream: '#FFF9F2',
  plum: '#3D3155',
  mutedPlum: '#6B607C',
  white: '#FFFFFF',
} as const;

export type YayaColor = keyof typeof colors;
