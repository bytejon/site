import { readFileSync } from 'node:fs';

// Dedicated Luau grammar: source.luau, never an alias to Lua.
export const luau = {
  ...JSON.parse(readFileSync(new URL('../vendor/luau/Luau.tmLanguage.json', import.meta.url), 'utf8')),
  name: 'luau',
};

export const expressiveCode = {
  themes: ['github-light', 'github-dark'],
  shiki: { langs: [luau] },
  styleOverrides: { borderRadius: '4px', codeFontSize: '0.875rem' },
};
