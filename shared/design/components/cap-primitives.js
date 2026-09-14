/**
 * Cap Foundation tiny JS primitives (vanilla) — FND-03
 */

export const CapSwitch = {
  bind(el) {
    if (!el) return;
    el.addEventListener('click', () => {
      const on = el.getAttribute('aria-checked') === 'true';
      el.setAttribute('aria-checked', on ? 'false' : 'true');
    });
  },
};

export const CapConfirm = {
  open({ title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false } = {}) {
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'cap-sheet-backdrop';
      backdrop.style.zIndex = '60';
      const dialog = document.createElement('div');
      dialog.className = 'cap-dialog';
      dialog.setAttribute('role', 'alertdialog');
      dialog.setAttribute('aria-modal', 'true');
      const h = document.createElement('h2');
      h.tabIndex = -1;
      h.textContent = title || 'Are you sure?';
      h.style.font = '600 20px/25px var(--font-ui, system-ui)';
      h.style.margin = '0 0 8px';
      const p = document.createElement('p');
      p.textContent = body || '';
      p.style.margin = '0';
      p.style.color = 'var(--text-secondary)';
      const actions = document.createElement('div');
      actions.className = 'cap-dialog__actions';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'cap-btn cap-btn--secondary';
      cancel.textContent = cancelLabel;
      const confirm = document.createElement('button');
      confirm.type = 'button';
      confirm.className = `cap-btn ${destructive ? 'cap-btn--destructive' : 'cap-btn--primary'}`;
      confirm.textContent = confirmLabel;
      const close = (val) => {
        backdrop.remove();
        dialog.remove();
        window.removeEventListener('keydown', onKey);
        resolve(val);
      };
      const onKey = (e) => {
        if (e.key === 'Escape') close(false);
      };
      cancel.addEventListener('click', () => close(false));
      confirm.addEventListener('click', () => close(true));
      backdrop.addEventListener('click', () => close(false));
      actions.append(cancel, confirm);
      dialog.append(h, p, actions);
      document.body.append(backdrop, dialog);
      window.addEventListener('keydown', onKey);
      h.focus();
    });
  },
};

export function CapToast(message, { ms = 4000 } = {}) {
  const el = document.createElement('div');
  el.className = 'cap-toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
  return el;
}
