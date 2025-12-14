export const palettes = {
  home: ['#59018b', '#764ba2', '#532c80ff'],
  indigo: ['#6366F1', '#8B5CF6', '#4F46E5'],
  emerald: ['#10B981', '#34D399', '#059669'],
  rose: ['#F43F5E', '#FB7185', '#BE123C'],
  sky: ['#0EA5E9', '#38BDF8', '#0369A1']
};

function themeNumberToKey(n) {
  const v = Number(n);
  if (v === 1) return 'home';
  if (v === 2) return 'indigo';
  if (v === 3) return 'emerald';
  if (v === 4) return 'rose';
  if (v === 5) return 'sky';
  return null;
}

function clampByte(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function lightenRgb([r, g, b], amount = 0.18) {
  return [
    clampByte(r + (255 - r) * amount),
    clampByte(g + (255 - g) * amount),
    clampByte(b + (255 - b) * amount)
  ];
}

function darkenRgb([r, g, b], amount = 0.18) {
  return [
    clampByte(r * (1 - amount)),
    clampByte(g * (1 - amount)),
    clampByte(b * (1 - amount))
  ];
}

function rgbToHex([r, g, b]) {
  const to2 = (x) => clampByte(x).toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

function resolvePalette(primary) {
  // Accept: palette keys ("indigo"), numeric ids (1..5), or hex colors ("#10B981").
  const asKeyFromNumber = themeNumberToKey(primary);
  if (asKeyFromNumber && palettes[asKeyFromNumber]) return palettes[asKeyFromNumber];

  if (typeof primary === 'string') {
    const key = primary.trim();
    if (palettes[key]) return palettes[key];
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(key)) {
      const baseRgb = hexToRgbTuple(key);
      if (baseRgb) {
        const light = rgbToHex(lightenRgb(baseRgb, 0.22));
        const dark = rgbToHex(darkenRgb(baseRgb, 0.22));
        return [rgbToHex(baseRgb), light, dark];
      }
    }
  }

  if (typeof primary === 'number') {
    const key = themeNumberToKey(primary);
    if (key && palettes[key]) return palettes[key];
  }

  return palettes.indigo;
}

function hexToRgbTuple(hex) {
  if (!hex) return null;
  const raw = hex.toString().trim().replace('#', '');
  const normalized = raw.length === 3
    ? raw.split('').map((c) => c + c).join('')
    : raw.length >= 6
      ? raw.slice(0, 6)
      : null;

  if (!normalized) return null;
  const int = parseInt(normalized, 16);
  if (Number.isNaN(int)) return null;
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return [r, g, b];
}

export function applyTheme(prefs) {
  try {
    const stored = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('theme_prefs') || '{}') : {};
    const { dark = false, primary = 'indigo' } = prefs || stored || {};
    const palette = resolvePalette(primary);
    const root = document.documentElement;

    // primary colors
    root.style.setProperty('--id-primary', palette[0]);
    root.style.setProperty('--id-primary-light', palette[1]);
    root.style.setProperty('--id-primary-dark', palette[2]);

    const rgb = hexToRgbTuple(palette[0]);
    root.style.setProperty(
      '--id-primary-rgb',
      rgb ? `${rgb[0]}, ${rgb[1]}, ${rgb[2]}` : '99, 102, 241'
    );

    // simple semantic vars (used in some components)
    if (dark) {
      root.style.setProperty('--id-bg', '#0f172a');
      root.style.setProperty('--id-bg-card', '#0b1220');
      root.style.setProperty('--id-bg-elevated', '#091024');
      root.style.setProperty('--id-text', '#e6eef8');
      root.style.setProperty('--id-text-secondary', '#c7d2e9');
      root.style.setProperty('--id-text-muted', '#94a3b8');
      root.style.setProperty('--id-border', 'rgba(255,255,255,0.06)');
      // profile header gradient (dark)
      root.style.setProperty('--profile-header-start', '#2b0b2f');
      root.style.setProperty('--profile-header-end', '#05040a');
    } else {
      root.style.setProperty('--id-bg', '#f8fafc');
      root.style.setProperty('--id-bg-card', '#ffffff');
      root.style.setProperty('--id-bg-elevated', '#f1f5f9');
      root.style.setProperty('--id-text', '#0f172a');
      root.style.setProperty('--id-text-secondary', '#475569');
      root.style.setProperty('--id-text-muted', '#94a3b8');
      root.style.setProperty('--id-border', '#e2e8f0');
      // profile header gradient (light)
      root.style.setProperty('--profile-header-start', '#e0e7ff');
      root.style.setProperty('--profile-header-end', '#fdf2f8');
    }

    // body class to allow global dark styles
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', !!dark);
    }

    // Notify listeners after vars are updated
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('themechange', { detail: { dark, primary } }));
      } catch {
        window.dispatchEvent(new Event('themechange'));
      }
    }
  } catch (e) {
    console.error('applyTheme error', e);
  }
}

export default applyTheme;
