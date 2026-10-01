function theme(name, type, background, foreground, palette) {
  return {
    name, type,
    colors: {
      'editor.background': background, 'editor.foreground': foreground,
      'editorGutter.foreground': palette.comment,
      'editorGroupHeader.tabsBackground': background,
      'tab.activeBackground': background, 'tab.activeForeground': foreground,
      'tab.activeBorder': palette.blue, 'tab.border': type === 'dark' ? '#303338' : '#d9d9d4',
      'focusBorder': palette.blue,
    },
    tokenColors: [
      { scope: ['comment'], settings: { foreground: palette.comment } },
      { scope: ['keyword','storage'], settings: { foreground: palette.purple } },
      { scope: ['entity.name.function','support.function'], settings: { foreground: palette.blue } },
      { scope: ['entity.name.type','support.type','support.class','storage.type'], settings: { foreground: palette.blue } },
      { scope: ['string'], settings: { foreground: palette.green } },
      { scope: ['constant.numeric','constant.language'], settings: { foreground: palette.orange } },
      { scope: ['constant.character.escape','punctuation.definition.interpolation'], settings: { foreground: palette.pink } },
      { scope: ['variable','punctuation'], settings: { foreground } },
    ],
  };
}
export const codeThemes = [
  theme('jon-light','light','#f1f0ed','#30333b',{blue:'#2d6098',purple:'#6850a0',green:'#37724e',orange:'#8b603c',pink:'#985c7c',comment:'#667078'}),
  theme('jon-dark','dark','#111315','#dce1e7',{blue:'#93bdea',purple:'#bca7ea',green:'#a0c8a6',orange:'#d5b18b',pink:'#d9aabe',comment:'#929ba6'}),
];
