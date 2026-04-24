/**
 * generate-icons.mjs
 * Creates PWA icons (192x192 and 512x512) using sharp.
 * Run: node scripts/generate-icons.mjs
 */
import { createWriteStream, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Ensure icons dir exists
mkdirSync(resolve(root, "public/icons"), { recursive: true });

// SVG source: teal circle background + white pizza icon
const makeSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Teal background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0d9488"/>

  <!-- White pizza circle base -->
  <circle cx="${size/2}" cy="${size * 0.45}" r="${size * 0.28}" fill="white" opacity="0.95"/>
  <!-- Sauce layer -->
  <circle cx="${size/2}" cy="${size * 0.45}" r="${size * 0.22}" fill="#dc2626" opacity="0.85"/>
  <!-- Cheese layer -->
  <ellipse cx="${size/2}" cy="${size * 0.45}" rx="${size * 0.17}" ry="${size * 0.16}" fill="#fef3c7"/>

  <!-- Toppings (small dots) -->
  <circle cx="${size*0.42}" cy="${size*0.40}" r="${size*0.025}" fill="#1a1a1a" opacity="0.7"/>
  <circle cx="${size*0.55}" cy="${size*0.43}" r="${size*0.022}" fill="#1a1a1a" opacity="0.7"/>
  <circle cx="${size*0.46}" cy="${size*0.52}" r="${size*0.020}" fill="#16a34a" opacity="0.9"/>
  <circle cx="${size*0.57}" cy="${size*0.50}" r="${size*0.018}" fill="#16a34a" opacity="0.9"/>

  <!-- Eyes -->
  <circle cx="${size*0.44}" cy="${size*0.43}" r="${size*0.04}" fill="white"/>
  <circle cx="${size*0.56}" cy="${size*0.43}" r="${size*0.04}" fill="white"/>
  <circle cx="${size*0.445}" cy="${size*0.433}" r="${size*0.022}" fill="#1a1a1a"/>
  <circle cx="${size*0.565}" cy="${size*0.433}" r="${size*0.022}" fill="#1a1a1a"/>

  <!-- Smile -->
  <path d="M ${size*0.43} ${size*0.51} Q ${size*0.5} ${size*0.56} ${size*0.57} ${size*0.51}"
        stroke="#92400e" stroke-width="${size*0.018}" fill="none" stroke-linecap="round"/>

  <!-- "DFJ" text label -->
  <text x="${size/2}" y="${size*0.84}"
        font-family="Arial, sans-serif" font-weight="900" font-size="${size*0.13}"
        fill="white" text-anchor="middle" letter-spacing="1">DFJ</text>
</svg>
`;

// Try to use sharp (bundled with Next.js)
async function generateWithSharp() {
  const sharp = (await import("sharp")).default;

  for (const size of [192, 512]) {
    const svg = Buffer.from(makeSVG(size));
    const outPath = resolve(root, `public/icons/icon-${size}.png`);
    await sharp(svg).png().toFile(outPath);
    console.log(`✅ Generated icon-${size}.png`);
  }

  // Apple touch icon (180x180)
  const svg180 = Buffer.from(makeSVG(180));
  await sharp(svg180).png().toFile(resolve(root, "public/icons/apple-touch-icon.png"));
  console.log("✅ Generated apple-touch-icon.png");

  console.log("🎉 All icons generated in public/icons/");
}

generateWithSharp().catch((err) => {
  console.error("sharp not available:", err.message);
  console.log("Saving SVG files as fallback...");

  // Fallback: save SVGs (browsers can use SVG as PWA icons in some cases)
  import("fs").then(({ writeFileSync }) => {
    writeFileSync(resolve(root, "public/icons/icon.svg"), makeSVG(512));
    console.log("✅ Saved icon.svg — convert to PNG manually if needed");
  });
});
