import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- OKLab color manipulation ---
// Minimal OKLab conversion utilities
function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255].map(v => v / 255);
}
function rgbToHex([r, g, b]) {
  return (
    "#" +
    [r, g, b]
      .map(x => Math.round(x * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}
// sRGB to linear
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
// RGB <-> OKLab
function rgbToOklab([r, g, b]) {
  r = srgbToLinear(r); g = srgbToLinear(g); b = srgbToLinear(b);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const L = 0.2104542553 * Math.cbrt(l) + 0.7936177850 * Math.cbrt(m) - 0.0040720468 * Math.cbrt(s);
  const a = 1.9779984951 * Math.cbrt(l) - 2.4285922050 * Math.cbrt(m) + 0.4505937099 * Math.cbrt(s);
  const b_ = 0.0259040371 * Math.cbrt(l) + 0.7827717662 * Math.cbrt(m) - 0.8086757660 * Math.cbrt(s);
  return [L, a, b_];
}
function oklabToRgb([L, a, b_]) {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b_, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b_, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b_, 3);
  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return [linearToSrgb(r), linearToSrgb(g), linearToSrgb(b)].map(x => Math.min(1, Math.max(0, x)));
}
// Fix lightness/chroma, keep hue
export function normalizeTintColor(hex, L = 0.35, C = 0.08) {
  try {
    const rgb = hexToRgb(hex);
    const [l, a, b_] = rgbToOklab(rgb);
    const hue = Math.atan2(b_, a);
    // fixed chroma (C) and darker lightness (L)
    const a2 = Math.cos(hue) * C;
    const b2 = Math.sin(hue) * C;
    const rgb2 = oklabToRgb([L, a2, b2]);
    return rgbToHex(rgb2);
  } catch {
    return hex; // fallback
  }
}
