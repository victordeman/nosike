/** Generates the per-section social-card images (1200x630) into public/og/. */
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const NAME = "Prof. Austin N. Nosike";
const ROLE = "Vice Chancellor/President, James Hope University";

const SECTIONS: [string, string][] = [
  ["about", "About"],
  ["leadership", "Leadership"],
  ["education", "Education"],
  ["honours", "Honours & awards"],
  ["scholarship", "Scholarship"],
  ["proceedings", "Proceedings"],
  ["events", "Events"],
  ["policy", "Policy & consultancy"],
  ["mentorship", "Mentorship"],
  ["talks", "Talks & lectures"],
  ["gallery", "Gallery"],
  ["media-kit", "Media kit"],
  ["contact", "Contact"],
];

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function svg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f5f0"/>
  <rect x="0" y="0" width="1200" height="14" fill="#1f5135"/>
  <rect x="80" y="150" width="8" height="330" fill="#7a5c17"/>
  <text x="130" y="240" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#14213d" letter-spacing="2">${esc(NAME.toUpperCase())}</text>
  <text x="130" y="360" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="bold" fill="#14213d">${esc(title)}</text>
  <text x="130" y="430" font-family="Georgia, 'Times New Roman', serif" font-size="30" fill="#5a6478">${esc(ROLE)}</text>
  <text x="130" y="540" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="#1f5135" letter-spacing="1">EDUCATION · LEADERSHIP · POLICY · SCHOLARSHIP</text>
</svg>`;
}

mkdirSync("public/og", { recursive: true });
for (const [id, title] of SECTIONS) {
  await sharp(Buffer.from(svg(title)))
    .png()
    .toFile(`public/og/${id}.png`);
  console.log(`public/og/${id}.png`);
}
