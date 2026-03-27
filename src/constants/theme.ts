export const appName = 'Vem här?';
export const cardPrefix = 'Vem här…';

// ─── Primitive tokens ────────────────────────────────────────────────────────
// 5 base colors. Swap hex here to rebrand — never reference these directly in UI.

const palette = {
  brand:    '#df0404',   // red accent
  ink:      '#111111',   // near-black (never pure black)
  dim:      '#1A1A1A',   // dark surface
  smoke:    '#2E2E2E',   // dark secondary surface
  grey:     '#666666',   // mid grey
  silver:   '#AAAAAA',   // muted text
  fog:      '#F2EEE9',   // off-white (never pure white)
  mist:     '#E8E3DD',   // light secondary surface
  stone:    '#D6D0CA',   // light border / tertiary surface
  navy:     '#e89595',   // dark navy (card bg in dark mode)
  blush:    '#f9edf0',   // very light pink (card bg in light mode)
  champagne:'#ee0808',   
} as const;

// ─── Brand hue rotation ───────────────────────────────────────────────────────
// Derives analogous mode tints from the brand color so they stay coherent
// when the brand hex changes. Rotates in HSL space: ±60° off the brand hue.

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue = 0;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;
  return [hue * 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  const hNorm = h / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const toC = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const r = Math.round(toC(hNorm + 1/3) * 255);
  const g = Math.round(toC(hNorm) * 255);
  const b = Math.round(toC(hNorm - 1/3) * 255);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rotateHue(hex: string, degrees: number): string {
  const [h, s, l] = hexToHsl(hex);
  // Clamp saturation slightly so rotated tints stay rich but not garish
  return hslToHex(h + degrees, Math.min(s, 0.80), l);
}

const modeFriends = rotateHue(palette.brand, -60);  // ~251° blue-violet
const modeSolo    = rotateHue(palette.brand, +60);   // ~11°  warm coral-red

// ─── Semantic tokens ──────────────────────────────────────────────────────────

export const darkColors = {
  bgPrimary:   palette.ink,
  bgSecondary: palette.dim,
  bgCard:      palette.champagne,
  bgBrand:     palette.brand,
  bgBlack:     palette.ink,

  textPrimary:   palette.fog,
  textSecondary: palette.silver,
  textMuted:     palette.grey,
  textOnBrand:   palette.fog,
  textOnCard:    palette.fog,

  accent:  palette.brand,
  border:  palette.smoke,

  modeDating:  palette.brand,  // brand hue
  modeFriends,                 // brand −60° (blue-violet)
  modeSolo,                    // brand +60° (warm coral-red)
} as const;

export const lightColors = {
  bgPrimary:   palette.fog,
  bgSecondary: palette.mist,
  bgCard:      palette.champagne,
  bgBrand:     palette.brand,
  bgBlack:     palette.ink,

  textPrimary:   palette.ink,
  textSecondary: palette.grey,
  textMuted:     '#999999',
  textOnBrand:   palette.fog,
  textOnCard:    palette.fog,

  accent:  palette.brand,
  border:  palette.stone,

  modeDating:  palette.brand,
  modeFriends,
  modeSolo,
} as const;

export type AppColors = { [K in keyof typeof darkColors]: string };

// Backward-compat alias
export const colors = darkColors;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
} as const;

// ─── Radius ───────────────────────────────────────────────────────────────────

export const radius = {
  sm:   6,
  md:   12,
  lg:   20,
  xl:   28,
  full: 9999,
} as const;

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const fonts = {
  extraLight: 'AuthorExtralight',
  regular:    'AuthorRegular',
  bold:       'AuthorBold',
  brand:      'AuthorRegular',  // will be overridden with custom font in AppHeader
  B: 'Bangers',
  M: 'MateMasie',
  C: 'Caprasimo',
  BC: 'BarlowCondensed',
  F: 'FiraSansCondensed-Bold',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
//
//   display  — screen-level titles
//   brand    — "Who here" / "Vem här" phrase only
//   heading  — section headings, settings rows
//   body     — descriptive text
//   caption  — secondary info, deck descriptions
//   badge    — uppercase micro-labels, counters, tab text
//   card     — question card text

export const typography = {
  display: { fontFamily: fonts.BC,       fontSize: 32, lineHeight: 38, letterSpacing: -0.5 },
  brand:   { fontFamily: fonts.B,      fontSize: 18, lineHeight: 30, letterSpacing: 0 },
  heading: { fontFamily: fonts.bold,       fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  body:    { fontFamily: fonts.regular,    fontSize: 16, lineHeight: 26 },
  caption: { fontFamily: fonts.regular,    fontSize: 14, lineHeight: 20 },
  badge:   { fontFamily: fonts.regular,    fontSize: 10, lineHeight: 14, letterSpacing: 1.2 },
  card:    { fontFamily: fonts.F,       fontSize: 26, lineHeight: 36, letterSpacing: 0 },
} as const;

// ─── Dimensions ───────────────────────────────────────────────────────────────

export const dimensions = {
  cardHeight:    400,
  buttonHeight:   52,
  iconTouchSize:  44,
  checkboxSize:   22,
  iconContainer:  32,
  dotSize:         5,
  rowHeight:      80,
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
// Bottom clearance needed to clear the floating tab bar + safe area
export const TAB_BAR_BOTTOM_CLEARANCE = 120;

// ─── Animation ────────────────────────────────────────────────────────────────



export const animation = {
  press:  60,
  quick: 160,
  base:  200,
} as const;
