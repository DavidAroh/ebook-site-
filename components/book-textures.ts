/* Canvas-generated art for the faces of the book that the cover photograph does
   not cover: the spine, the back board, and the page block.

   Every colour here was sampled out of the real front cover
   (public/images/the-new-way-of-work-cover.jpg) with a canvas readback rather
   than eyeballed, so the generated faces carry the printed artwork's own cream,
   ink and terracotta. The cover's dark is a neutral charcoal, not the navy it
   reads as at a glance. */

export const COVER_CREAM = "#faf1e9";
export const COVER_INK = "#23292d";
export const COVER_TERRA = "#d85d24";
const PAGE_CREAM = "#f7f2ea";
const PAGE_SHADE = "#dcd0bb";

/* next/font mints a hashed family name per font, so the only reliable way to
   reach Newsreader from a canvas is to read the variable the layout set. */
function family(token: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return v ? `${v}, ${fallback}` : fallback;
}

function surface(w: number, h: number) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const g = el.getContext("2d");
  if (!g) throw new Error("2d context unavailable");
  return { el, g };
}

/* letterSpacing is only in the DOM lib from TS 5.4, and silently ignored by
   engines that predate it — either way tracking is cosmetic, so it degrades. */
function track(g: CanvasRenderingContext2D, value: string) {
  (g as unknown as { letterSpacing: string }).letterSpacing = value;
}

function rule(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  weight = 3
) {
  g.fillStyle = COVER_TERRA;
  g.fillRect(x, y, w, weight);
}

/* Text rotated a quarter turn clockwise, so it reads top-to-bottom the way a
   European spine does. After the rotation the local x axis runs down the spine
   and "middle" baseline centres the glyphs across its width. */
function spineText(
  g: CanvasRenderingContext2D,
  text: string,
  font: string,
  spacing: string
) {
  g.font = font;
  track(g, spacing);
  return g.measureText(text).width;
}

/**
 * Largest size at or below `px` whose rendered run fits `limit`, leaving the
 * context set to the size it settled on. Iterative rather than one division
 * because tracking is a fixed addition per character and does not scale with the
 * font size, so scaling by the measured overshoot always lands slightly long.
 *
 * Needed because the real width is not knowable here: next/font mints a hashed
 * family per font and the metrics belong to whichever face actually loaded, so a
 * size that fits in one environment overruns in another.
 */
function fitSpineText(
  g: CanvasRenderingContext2D,
  text: string,
  weight: number,
  px: number,
  family: string,
  spacing: string,
  limit: number
) {
  let size = px;
  let width = spineText(g, text, `${weight} ${size}px ${family}`, spacing);
  for (let i = 0; i < 4 && width > limit; i++) {
    size = Math.floor(size * (limit / width));
    width = spineText(g, text, `${weight} ${size}px ${family}`, spacing);
  }
  return width;
}

function drawSpineText(
  g: CanvasRenderingContext2D,
  text: string,
  cx: number,
  centerY: number,
  width: number
) {
  g.save();
  g.translate(cx, centerY - width / 2);
  g.rotate(Math.PI / 2);
  g.textAlign = "left";
  g.textBaseline = "middle";
  g.fillText(text, 0, 0);
  g.restore();
}

/** Spine board: 0.4 x 3.0 world units, so 220 x 1650 keeps the pixels square. */
export function spineTexture(): HTMLCanvasElement {
  const W = 220;
  const H = 1650;
  const { el, g } = surface(W, H);
  const serif = family("--font-display", "Georgia, serif");
  const sans = family("--font-sans", "system-ui, sans-serif");

  g.fillStyle = COVER_CREAM;
  g.fillRect(0, 0, W, H);

  /* The case creases where it wraps the hinge, so both long edges sit in
     shadow. Baked in rather than lit, because at this width no light rig
     resolves a 4px crease. */
  const crease = g.createLinearGradient(0, 0, W, 0);
  crease.addColorStop(0, "rgba(35,41,45,0.20)");
  crease.addColorStop(0.09, "rgba(35,41,45,0)");
  crease.addColorStop(0.91, "rgba(35,41,45,0)");
  crease.addColorStop(1, "rgba(35,41,45,0.20)");
  g.fillStyle = crease;
  g.fillRect(0, 0, W, H);

  rule(g, W / 2 - 55, 150, 110);
  rule(g, W / 2 - 55, H - 153, 110);

  /* Both runs are rotated into the spine's 1650px length, and neither may grow
     into the other or past the terracotta rules. So: fix a band inside the
     rules, fit the title to a share of it, then set the title against the band's
     top and the author against its bottom. Whatever is left over becomes the gap
     between them, which is the one measurement that can safely absorb slack. */
  const BAND_TOP = 210;
  const BAND_END = H - 213;
  /* Share of the band the title may occupy before it is shrunk. The remainder
     holds the author plus a gap wide enough to read as deliberate. */
  const TITLE_SHARE = 0.62;

  g.fillStyle = COVER_INK;
  const titleW = fitSpineText(
    g,
    "THE NEW WAY OF WORK",
    600,
    92,
    serif,
    "2px",
    (BAND_END - BAND_TOP) * TITLE_SHARE
  );
  drawSpineText(g, "THE NEW WAY OF WORK", W / 2, BAND_TOP + titleW / 2, titleW);

  const authorW = spineText(g, "SHAMMAH NEI", `500 44px ${sans}`, "9px");
  drawSpineText(g, "SHAMMAH NEI", W / 2, BAND_END - authorW / 2, authorW);

  return el;
}

/** Back board: same 1024 x 1536 as the printed front, so the two boards share a
    pixel density and the type reads at the same size on both faces. */
export function backTexture(): HTMLCanvasElement {
  const { el, g } = surface(1024, 1536);
  const serif = family("--font-display", "Georgia, serif");
  const sans = family("--font-sans", "system-ui, sans-serif");

  g.fillStyle = COVER_CREAM;
  g.fillRect(0, 0, 1024, 1536);

  const blurb = [
    "AI has crossed a threshold. It can",
    "run whole workflows in the",
    "background — if you know how to",
    "ask for them.",
  ];
  g.fillStyle = COVER_INK;
  g.font = `400 52px ${serif}`;
  track(g, "0px");
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  blurb.forEach((line, i) => g.fillText(line, 108, 430 + i * 78));

  const detail = [
    "This handbook is the practical path: the",
    "prompting craft, the project setup, and the",
    "systems thinking behind real AI workflows.",
    "No code required.",
  ];
  g.font = `400 34px ${sans}`;
  g.fillStyle = "rgba(35,41,45,0.72)";
  detail.forEach((line, i) => g.fillText(line, 108, 830 + i * 54));

  rule(g, 108, 1120, 148);

  g.fillStyle = COVER_TERRA;
  g.font = `600 26px ${sans}`;
  track(g, "7px");
  g.fillText("FIRST EDITION", 108, 1200);

  g.fillStyle = COVER_INK;
  g.font = `600 46px ${serif}`;
  track(g, "5px");
  g.fillText("SHAMMAH NEI", 108, 1272);

  /* Geometry-only echo of the front cover's input / process / outcomes mark.
     Deliberately not a barcode: a plausible-looking ISBN on a real author's
     real book would be an invented fact printed on their product. */
  track(g, "0px");
  g.strokeStyle = COVER_TERRA;
  g.lineWidth = 5;
  g.strokeRect(742, 1178, 96, 96);
  g.fillStyle = COVER_TERRA;
  g.beginPath();
  g.arc(790, 1226, 17, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(35,41,45,0.5)";
  g.lineWidth = 4;
  [1196, 1226, 1256].forEach((y, i) => {
    g.beginPath();
    g.moveTo(858, y);
    g.lineTo(858 + 46 - i * 12, y);
    g.stroke();
  });

  return el;
}

/* Deterministic jitter. A perfectly even stripe pitch moires badly against the
   pixel grid once the block is viewed at a glancing angle, and a real page
   block is not even anyway. Seeded so every render is identical. */
function wobble(i: number) {
  const n = Math.sin(i * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Cut edges of the page block. Pages stack along the book's depth, so on the
 * fore-edge the striations run up the page and repeat across the depth, while
 * on the head and tail they run across the width — the same pattern at a
 * quarter turn. Cheaper and clearer to bake both than to rotate UVs.
 */
export function pageTexture(axis: "vertical" | "horizontal"): HTMLCanvasElement {
  const S = 512;
  const { el, g } = surface(S, S);

  g.fillStyle = PAGE_CREAM;
  g.fillRect(0, 0, S, S);

  for (let i = 0, p = 0; p < S; i++, p += 3) {
    const w = wobble(i);
    g.fillStyle = `rgba(220,208,187,${(0.22 + w * 0.4).toFixed(3)})`;
    const thickness = w > 0.82 ? 2 : 1;
    if (axis === "vertical") g.fillRect(p, 0, thickness, S);
    else g.fillRect(0, p, S, thickness);
  }

  /* Trimmed edges pick up dirt and the outermost leaves curl, so the block
     darkens toward its ends. Gives the edge somewhere to fall off to. */
  const fade = g.createLinearGradient(
    0,
    0,
    axis === "vertical" ? S : 0,
    axis === "vertical" ? 0 : S
  );
  fade.addColorStop(0, "rgba(150,132,104,0.30)");
  fade.addColorStop(0.16, "rgba(150,132,104,0)");
  fade.addColorStop(0.84, "rgba(150,132,104,0)");
  fade.addColorStop(1, "rgba(150,132,104,0.30)");
  g.fillStyle = fade;
  g.fillRect(0, 0, S, S);

  return el;
}

export { PAGE_CREAM, PAGE_SHADE };
