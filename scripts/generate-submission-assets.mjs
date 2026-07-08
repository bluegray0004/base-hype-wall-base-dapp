import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");

const W = 1284;
const H = 2778;

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const result = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      result.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) result.push(current);
  return result;
}

function frame(content, bg = "#0f1020") {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="#1b1230"/>
      </linearGradient>
      <radialGradient id="pink" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(220 220) rotate(45) scale(700 700)">
        <stop offset="0%" stop-color="#ff5fa2" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#ff5fa2" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="cyan" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1080 620) rotate(45) scale(760 760)">
        <stop offset="0%" stop-color="#74ffd1" stop-opacity=".35"/>
        <stop offset="100%" stop-color="#74ffd1" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#pink)"/>
    <rect width="${W}" height="${H}" fill="url(#cyan)"/>
    ${content}
  </svg>`;
}

function header(title, subtitle) {
  const lines = wrap(subtitle, 34);
  return `
    <text x="72" y="110" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#ff8dc0">BASE HYPE WALL</text>
    <text x="72" y="232" font-family="Arial, sans-serif" font-size="92" font-weight="900" fill="#ffffff">${esc(title)}</text>
    ${lines.map((line, index) => `<text x="76" y="${308 + index * 44}" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#cfd2f1">${esc(line)}</text>`).join("")}
  `;
}

function pill(x, y, text, fill, fg = "#101220") {
  return `
    <rect x="${x}" y="${y}" rx="28" width="${text.length * 16 + 76}" height="56" fill="${fill}" stroke="#111222" stroke-width="3"/>
    <text x="${x + 30}" y="${y + 37}" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="${fg}">${esc(text)}</text>
  `;
}

function panel(x, y, width, height, title, lines, accent = "#74ffd1") {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="32" fill="#12131f" stroke="#ffffff22" stroke-width="4"/>
      <text x="${x + 28}" y="${y + 54}" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="${accent}">${esc(title)}</text>
      ${lines.map((line, index) => `<text x="${x + 28}" y="${y + 118 + index * 40}" font-family="Arial, sans-serif" font-size="34" font-weight="${index === 0 ? 900 : 700}" fill="${index === 0 ? "#ffffff" : "#cfd2f1"}">${esc(line)}</text>`).join("")}
    </g>
  `;
}

function sticker(x, y, width, height, bg, fg, title, message) {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="26" fill="${bg}" stroke="#111222" stroke-width="4"/>
      <text x="${x + 22}" y="${y + 48}" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="${fg}" opacity=".8">${esc(title)}</text>
      <text x="${x + 22}" y="${y + 112}" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="${fg}">${esc(message)}</text>
    </g>
  `;
}

function button(x, y, width, text, fill, fg = "#111222") {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="96" rx="48" fill="${fill}" stroke="#111222" stroke-width="4"/>
    <text x="${x + width / 2}" y="${y + 61}" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="${fg}">${esc(text)}</text>
  `;
}

function screenshot1() {
  const content = `
    ${header("Post one bright line.", "Pick a topic, write a short burst of support, and add it to the Base wall in one clean mobile action.")}
    ${pill(72, 408, "Support post", "#ff5fa2", "#111222")}
    ${pill(274, 408, "One line only", "#ffe36e")}
    ${panel(72, 540, 1140, 286, "Post shout", ["Topic: Base Build Week", "Hype line: This is the cleanest builder wave yet.", "State: ready to publish"], "#74ffd1")}
    ${panel(72, 872, 548, 246, "Format", ["Short enough to scan fast", "Big enough to feel public"], "#ff8dc0")}
    ${panel(664, 872, 548, 246, "Why it works", ["One topic anchor", "One expressive line", "One onchain wall post"], "#ffe36e")}
    ${panel(72, 1166, 1140, 290, "Wall preview", ["Sticker color rotates by post", "Author and day stay visible", "The wall still reads cleanly on mobile"], "#74ffd1")}
    ${button(72, 2522, 1140, "Post on Base", "#ff5fa2")}
  `;
  return frame(content);
}

function screenshot2() {
  const content = `
    ${header("The wall is alive.", "A support post should feel playful, immediate, and readable without turning into a cluttered dashboard.")}
    ${pill(72, 408, "Wall topic", "#74ffd1")}
    ${pill(252, 408, "Base Build Week", "#ffffff")}
    ${sticker(72, 540, 360, 220, "#ff5fa2", "#ffffff", "Build energy", "This is the cleanest builder wave yet.")}
    ${sticker(462, 540, 360, 220, "#ffe36e", "#1f1730", "Today’s read", "More signal, less noise.")}
    ${sticker(852, 540, 360, 220, "#74ffd1", "#0f2231", "Wall pulse", "Feels like people are actually shipping.")}
    ${sticker(72, 802, 360, 220, "#8d7bff", "#ffffff", "Launch mood", "Fast, weird, and surprisingly polished.")}
    ${sticker(462, 802, 360, 220, "#ff8dc0", "#1f1730", "Builder note", "This one still feels fresh.")}
    ${sticker(852, 802, 360, 220, "#c8ff7f", "#1f1730", "Support line", "The wall format actually works here.")}
    ${panel(72, 1088, 1140, 272, "Wall behavior", ["Each post becomes one colorful sticker.", "Lookup stays simple: load by ID when needed."], "#74ffd1")}
    ${button(72, 2522, 1140, "Keep the wall moving", "#74ffd1")}
  `;
  return frame(content, "#10111e");
}

function screenshot3() {
  const content = `
    ${header("Load one exact shout.", "Users can look up a specific wall post and see the topic, message, author, and date in one focused view.")}
    ${pill(72, 408, "Shout ID 12", "#ffe36e")}
    ${pill(248, 408, "Lookup mode", "#ffffff")}
    ${panel(72, 540, 1140, 286, "Wall lookup", ["Topic: Base Build Week", "Author: 0x9936...9652", "Day: May 13"], "#74ffd1")}
    ${sticker(72, 872, 1140, 276, "#ff5fa2", "#ffffff", "Base Build Week", "This is the cleanest builder wave yet.")}
    ${panel(72, 1204, 1140, 272, "Signal detail", ["One short line stays legible.", "The post still feels like part of a live wall."], "#ff8dc0")}
    ${panel(72, 1534, 1140, 254, "Status", ["The shout is now visible as a clean, retrievable onchain wall entry."], "#74ffd1")}
    ${button(72, 2522, 1140, "Load another shout", "#ffe36e")}
  `;
  return frame(content, "#15162b");
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#0f1020"/>
    <rect x="138" y="138" width="748" height="748" rx="96" fill="#17182b" stroke="#ffffff18" stroke-width="18"/>
    <rect x="198" y="220" width="280" height="198" rx="34" fill="#ff5fa2"/>
    <rect x="546" y="220" width="280" height="198" rx="34" fill="#74ffd1"/>
    <rect x="198" y="484" width="280" height="198" rx="34" fill="#ffe36e"/>
    <rect x="546" y="484" width="280" height="198" rx="34" fill="#8d7bff"/>
    <circle cx="512" cy="790" r="72" fill="#17182b" stroke="#ffffff18" stroke-width="14"/>
    <path d="M480 790h64" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
    <path d="M512 758v64" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f1020"/>
        <stop offset="100%" stop-color="#1b1230"/>
      </linearGradient>
    </defs>
    <rect width="1910" height="1000" fill="url(#bg)"/>
    <text x="96" y="198" font-family="Arial, sans-serif" font-size="118" font-weight="900" fill="#ffffff">Base Hype Wall</text>
    <text x="100" y="292" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#cfd2f1">Post one support line, attach it to a topic, and light up a colorful onchain wall.</text>
    ${pill(100, 348, "Sticker wall", "#ff5fa2")}
    ${pill(306, 348, "Short support", "#74ffd1")}
    ${button(100, 448, 430, "Post shout", "#ff5fa2")}
    ${button(560, 448, 430, "Load shout", "#ffe36e")}
    ${sticker(1186, 124, 280, 182, "#ff5fa2", "#ffffff", "Build energy", "This is the cleanest builder wave yet.")}
    ${sticker(1502, 124, 280, 182, "#74ffd1", "#0f2231", "Wall pulse", "Feels like people are shipping.")}
    ${panel(1186, 372, 596, 220, "Wall style", ["Bright, playful, and clearly different from the archive-box and trade-ticket flows."], "#74ffd1")}
    ${panel(1186, 656, 596, 220, "Lookup mode", ["Posts stay retrievable by ID without burying the main wall experience."], "#ff8dc0")}
  </svg>
  `;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

const manifest = {
  generatedAt: new Date().toISOString(),
  files,
};

await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

for (const file of files) {
  console.log(file);
}
