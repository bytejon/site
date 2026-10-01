import { readFileSync } from 'node:fs';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { codeThemes } from './code-themes.mjs';
import { pluginCodeTools } from './code-tools.mjs';

// Dedicated Luau grammar: source.luau, never an alias to Lua.
export const luau = {
  ...JSON.parse(readFileSync(new URL('../vendor/luau/Luau.tmLanguage.json', import.meta.url), 'utf8')),
  name: 'luau',
};

export const expressiveCode = {
  themes: codeThemes,
  plugins: [pluginLineNumbers(), pluginCodeTools()],
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
  shiki: { langs: [luau] },
  styleOverrides: { borderRadius: '8px', gutterBorderWidth: '0px', codeFontSize: '0.875rem', codeLineHeight: '1.55', codePaddingBlock: 'var(--space-3)', codePaddingInline: 'var(--space-4)', frames: { editorActiveTabIndicator: 'var(--accent)' }, textMarkers: { markBackground: 'color-mix(in srgb, var(--accent) 12%, var(--code-surface))', markBorderColor: 'transparent' } },
};
