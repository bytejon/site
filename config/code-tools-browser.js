function update(frame) {
  const controls = [...frame.querySelectorAll('.scope-toggle')];
  const collapsed = controls.filter(button => button.getAttribute('aria-expanded') === 'false');
  for (const line of frame.querySelectorAll('[data-code-line]')) {
    const number = Number(line.dataset.codeLine);
    line.hidden = collapsed.some(button => number > Number(button.dataset.foldStart) && number < Number(button.dataset.foldEnd));
  }
  const expand = frame.querySelector('.expand-scopes');
  if (expand) expand.disabled = collapsed.length === 0;
}
document.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target : null;
  const fold = target?.closest('.scope-toggle');
  if (fold) {
    const expanded = fold.getAttribute('aria-expanded') !== 'true';
    fold.setAttribute('aria-expanded', String(expanded));
    fold.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} ${fold.dataset.foldKind} scope at line ${fold.dataset.foldStart}`);
    update(fold.closest('[data-code-tools]'));
  }
  const expand = target?.closest('.expand-scopes');
  if (expand) {
    const frame = expand.closest('[data-code-tools]');
    for (const button of frame.querySelectorAll('.scope-toggle')) {
      button.setAttribute('aria-expanded','true');
      button.setAttribute('aria-label',`Collapse ${button.dataset.foldKind} scope at line ${button.dataset.foldStart}`);
    }
    update(frame);
  }
});
document.querySelectorAll('[data-code-tools]').forEach(update);

// Copy feedback stays inside the button. Preserve the complete original source,
// including lines hidden by folding, and announce success without a tooltip.
const copyTimers = new WeakMap();
document.addEventListener('click', async event => {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest('[data-code-tools] .copy button');
  if (!button) return;
  event.stopImmediatePropagation();
  const source = button.dataset.code.replace(/\u007f/g, '\n');
  let copied = false;
  try { await navigator.clipboard.writeText(source); copied = true; }
  catch {
    const textarea = document.createElement('textarea');
    textarea.value = source; textarea.setAttribute('aria-hidden', 'true');
    Object.assign(textarea.style, { position: 'fixed', opacity: '0', pointerEvents: 'none', left: '0', top: '0' });
    document.body.append(textarea); textarea.select();
    try { copied = document.execCommand('copy'); } catch { /* Report failure below. */ }
    textarea.remove(); button.focus({ preventScroll: true });
  }
  const live = button.parentElement.querySelector('[aria-live]');
  if (live) live.textContent = copied ? 'Copied to clipboard.' : 'Copy failed. Select the code and copy it manually.';
  button.dataset.copyState = copied ? 'success' : 'error';
  clearTimeout(copyTimers.get(button));
  copyTimers.set(button, setTimeout(() => { delete button.dataset.copyState; if (live) live.textContent = ''; }, copied ? 1800 : 4000));
}, true);

for (const tabs of document.querySelectorAll('starlight-tabs')) {
  const panels = [...tabs.querySelectorAll(':scope > [role="tabpanel"]')];
  if (panels.length > 1 && panels.every(panel => panel.querySelectorAll('[data-code-tools]').length === 1)) tabs.classList.add('code-tabset');
}
