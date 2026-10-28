import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target HTTPS Production URL
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://major-project-identity-verify.loca.lt';

// Output directories
const projectPublicDir = path.join(__dirname, '../public');
const brainDir = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\eb87f55c-99d8-45ab-b222-a831808a39e1';

if (!fs.existsSync(projectPublicDir)) fs.mkdirSync(projectPublicDir, { recursive: true });
if (!fs.existsSync(brainDir)) fs.mkdirSync(brainDir, { recursive: true });

async function generateQRCodes() {
  console.log(` Generating QR Codes for HTTPS Production URL: ${PRODUCTION_URL}`);

  // 1. Generate SVG String & Write Files
  const svgContent = await QRCode.toString(PRODUCTION_URL, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });

  const svgPublicPath = path.join(projectPublicDir, 'qrcode-production.svg');
  const svgBrainPath = path.join(brainDir, 'qrcode-production.svg');

  fs.writeFileSync(svgPublicPath, svgContent);
  fs.writeFileSync(svgBrainPath, svgContent);
  console.log(` SVG generated cleanly at:`);
  console.log(`   - ${svgPublicPath}`);
  console.log(`   - ${svgBrainPath}`);

  // 2. Generate High-Res PNG Data URL & Buffer
  // We use QRCode.toDataURL to get PNG base64, then save as buffer
  const pngDataUrl = await QRCode.toDataURL(PRODUCTION_URL, {
    errorCorrectionLevel: 'H',
    margin: 3,
    width: 1000,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });

  const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, '');
  const pngBuffer = Buffer.from(base64Data, 'base64');

  const pngPublicPath = path.join(projectPublicDir, 'qrcode-production.png');
  const pngBrainPath = path.join(brainDir, 'qrcode-production.png');

  fs.writeFileSync(pngPublicPath, pngBuffer);
  fs.writeFileSync(pngBrainPath, pngBuffer);
  console.log(` High-Resolution PNG (1000x1000) generated cleanly at:`);
  console.log(`   - ${pngPublicPath}`);
  console.log(`   - ${pngBrainPath}`);

  console.log(`\n All QR Code deliverables generated successfully!`);
}

generateQRCodes().catch(err => {
  console.error('Error generating QR codes:', err);
  process.exit(1);
});
