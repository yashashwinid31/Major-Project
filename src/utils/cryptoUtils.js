// Crypto & Hash Simulation Utilities

/**
 * Computes real SHA-256 hash string using Web Crypto API
 */
export async function calculateSHA256(input) {
  let buffer;
  if (typeof input === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(input);
  } else if (input instanceof ArrayBuffer) {
    buffer = input;
  } else {
    const encoder = new TextEncoder();
    buffer = encoder.encode(JSON.stringify(input));
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a Decentralized Identifier (DID)
 */
export function generateDID(identifierSeed = '') {
  const chars = '0123456789abcdef';
  let hash = '';
  const seed = (identifierSeed + Date.now()).toString();
  for (let i = 0; i < 40; i++) {
    const charIndex = (seed.charCodeAt(i % seed.length) + i * 17) % chars.length;
    hash += chars[charIndex];
  }
  return `did:identity:0x${hash}`;
}

/**
 * Generate simulated Public / Private Keys
 */
export function generateKeyPair() {
  const randomHex = (len) => {
    let result = '';
    const characters = '0123456789abcdef';
    for (let i = 0; i < len; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  return {
    publicKey: `0x04${randomHex(64)}${randomHex(64)}`,
    privateKey: `0x${randomHex(64)}`,
    algorithm: 'Ed25519-SHA256'
  };
}

/**
 * Generate mock IPFS Content ID (CID)
 */
export function generateCID(docHash = '') {
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let cid = 'Qm';
  const seedStr = docHash + Date.now().toString();
  for (let i = 0; i < 44; i++) {
    const charIndex = (seedStr.charCodeAt(i % seedStr.length) + i * 13) % base58Chars.length;
    cid += base58Chars[charIndex];
  }
  return cid;
}

/**
 * Generate Ethereum-style Transaction Hash
 */
export function generateTxHash() {
  const hex = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return hash;
}

/**
 * Generate random block number
 */
export function generateBlockNumber() {
  return Math.floor(18500000 + Math.random() * 500000);
}

/**
 * Helper to generate mock document SVG data URLs for instant testing with ELA heatmaps and metadata
 */
export function getSampleDocument(isForged = false) {
  const uploadTime = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  if (!isForged) {
    // Genuine National University Degree Certificate
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#00f2fe"/>
          <stop offset="100%" stop-color="#7f00ff"/>
        </linearGradient>
      </defs>
      <rect width="600" height="420" fill="url(#bgGrad)" rx="12"/>
      <rect x="15" y="15" width="570" height="390" fill="none" stroke="url(#goldGrad)" stroke-width="3" rx="8" stroke-dasharray="8 4"/>
      
      <!-- Seal -->
      <circle cx="300" cy="85" r="32" fill="none" stroke="#00f2fe" stroke-width="2"/>
      <polygon points="300,60 310,75 328,75 314,87 320,105 300,93 280,105 286,87 272,75 290,75" fill="#7f00ff" opacity="0.8"/>
      
      <!-- Text -->
      <text x="300" y="145" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">NATIONAL INSTITUTE OF TECHNOLOGY</text>
      <text x="300" y="168" font-family="Georgia, serif" font-size="13" fill="#94a3b8" text-anchor="middle" font-style="italic">OFFICIAL DEGREE OF BACHELOR OF SCIENCE</text>
      
      <text x="300" y="205" font-family="Arial, sans-serif" font-size="12" fill="#cbd5e1" text-anchor="middle">This is to certify that</text>
      <text x="300" y="235" font-family="Georgia, serif" font-size="23" font-weight="bold" fill="#00f2fe" text-anchor="middle">ALEXANDER R. VANCE</text>
      <text x="300" y="263" font-family="Arial, sans-serif" font-size="12" fill="#cbd5e1" text-anchor="middle">has successfully completed Computer Science &amp; Engineering with Honors</text>
      
      <!-- Signature & QR & Barcode -->
      <path d="M 80,310 Q 110,290 140,315 T 190,300" stroke="#38bdf8" stroke-width="2" fill="none"/>
      <text x="135" y="330" font-family="Arial, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">AUTHORIZED SIGNATURE</text>

      <!-- Simulated QR Code -->
      <rect x="270" y="295" width="60" height="60" fill="#ffffff" rx="4"/>
      <rect x="276" y="301" width="18" height="18" fill="#0f172a"/>
      <rect x="306" y="301" width="18" height="18" fill="#0f172a"/>
      <rect x="276" y="331" width="18" height="18" fill="#0f172a"/>
      <rect x="280" y="305" width="10" height="10" fill="#ffffff"/>
      <rect x="310" y="305" width="10" height="10" fill="#ffffff"/>
      <rect x="280" y="335" width="10" height="10" fill="#ffffff"/>
      <rect x="300" y="325" width="8" height="8" fill="#00f2fe"/>
      <text x="300" y="370" font-family="monospace" font-size="9" fill="#00f2fe" text-anchor="middle">QR VALID</text>

      <!-- Simulated Barcode -->
      <g transform="translate(420,295)">
        <rect width="120" height="40" fill="#ffffff" rx="2"/>
        <line x1="10" y1="5" x2="10" y2="35" stroke="#000" stroke-width="2"/>
        <line x1="15" y1="5" x2="15" y2="35" stroke="#000" stroke-width="1"/>
        <line x1="20" y1="5" x2="20" y2="35" stroke="#000" stroke-width="3"/>
        <line x1="28" y1="5" x2="28" y2="35" stroke="#000" stroke-width="1"/>
        <line x1="34" y1="5" x2="34" y2="35" stroke="#000" stroke-width="2"/>
        <line x1="42" y1="5" x2="42" y2="35" stroke="#000" stroke-width="4"/>
        <line x1="52" y1="5" x2="52" y2="35" stroke="#000" stroke-width="1"/>
        <line x1="60" y1="5" x2="60" y2="35" stroke="#000" stroke-width="3"/>
        <line x1="70" y1="5" x2="70" y2="35" stroke="#000" stroke-width="2"/>
        <line x1="80" y1="5" x2="80" y2="35" stroke="#000" stroke-width="1"/>
        <line x1="90" y1="5" x2="90" y2="35" stroke="#000" stroke-width="3"/>
        <line x1="100" y1="5" x2="100" y2="35" stroke="#000" stroke-width="2"/>
        <text x="60" y="52" font-family="monospace" font-size="9" fill="#64748b" text-anchor="middle">*NIT-2024-8841*</text>
      </g>

      <!-- Hologram Seal -->
      <rect x="250" y="380" width="100" height="22" fill="url(#goldGrad)" rx="4" opacity="0.9"/>
      <text x="300" y="395" font-family="monospace" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">OFFICIAL CERTIFIED</text>
    </svg>
    `;

    // ELA Heatmap (Uniform noise for genuine doc)
    const elaSvgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <rect width="600" height="420" fill="#050814" rx="12"/>
      <rect x="15" y="15" width="570" height="390" fill="none" stroke="#1e293b" stroke-width="2" rx="8"/>
      <!-- Uniform subtle purple background grid -->
      <pattern id="elaGrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1" fill="#38bdf8" opacity="0.15"/>
      </pattern>
      <rect width="600" height="420" fill="url(#elaGrid)"/>
      <text x="300" y="210" font-family="monospace" font-size="14" fill="#38bdf8" text-anchor="middle" opacity="0.6">[ELA HEATMAP: UNIFORM COMPRESSION - NO SPLICE DETECTED]</text>
    </svg>
    `;

    return {
      fileName: "National_Degree_Certificate_2024.pdf",
      fileSize: "142.5 KB",
      fileType: "application/pdf",
      category: "Educational Degree",
      uploadTime: uploadTime,
      previewUrl: "/genuine_document_sample.png",
      elaUrl: `data:image/svg+xml;utf8,${encodeURIComponent(elaSvgContent)}`,
      isForged: false,
      issuedTo: "Alexander R. Vance",
      documentId: "NIT-CS-2024-8841",
      issuer: "National Institute of Technology",
      issueDate: "2024-06-15",
      rawHashSeed: "GENUINE_DEGREE_ALEXANDER_VANCE_NIT_2024_VALID_SIGNATURE",
      preprocessing: {
        boundaryDetected: true,
        boundaryCoords: { x: 15, y: 15, width: 570, height: 390 },
        qualityScore: 98.4,
        noiseLevel: "0.012 (Filtered)",
        skewAngle: "-1.2° → 0.0° (Deskewed)",
        tensorShape: "[1, 3, 512, 512]"
      },
      ocrText: "NATIONAL INSTITUTE OF TECHNOLOGY OFFICIAL DEGREE OF BACHELOR OF SCIENCE This is to certify that ALEXANDER R. VANCE has successfully completed Computer Science & Engineering with Honors. REGISTRATION: NIT-CS-2024-8841",
      qrPayload: "https://identity.chain/verify?docId=NIT-CS-2024-8841&hash=0xe3b0c442",
      barcodeValue: "NIT-2024-8841"
    };
  } else {
    // Forged Driver's License / Identity Card (Altered signature & mismatched text)
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e1e24"/>
          <stop offset="100%" stop-color="#3f0e1b"/>
        </linearGradient>
      </defs>
      <rect width="600" height="420" fill="url(#bgGrad)" rx="12"/>
      <rect x="15" y="15" width="570" height="390" fill="none" stroke="#ef4444" stroke-width="3" rx="8"/>
      
      <!-- Warning Overlay -->
      <rect x="20" y="20" width="560" height="32" fill="#ef4444" opacity="0.25"/>
      <text x="300" y="41" font-family="monospace" font-size="13" font-weight="bold" fill="#f87171" text-anchor="middle">⚠️ FORGERY ANOMALY: MULTIPLE TAMPERED REGIONS DETECTED</text>

      <text x="300" y="95" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">NATIONAL IDENTITY & DRIVER CARD</text>
      
      <!-- Photo box with noise artifact -->
      <rect x="50" y="125" width="130" height="150" fill="#0f172a" stroke="#ef4444" stroke-width="2.5" rx="6" stroke-dasharray="4 2"/>
      <text x="115" y="195" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ef4444" text-anchor="middle">[SPLICED PHOTO]</text>
      
      <!-- Details -->
      <rect x="210" y="125" width="340" height="35" fill="#ef4444" opacity="0.15" stroke="#ef4444" stroke-dasharray="3 3"/>
      <text x="220" y="148" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#f87171">NAME: JOHN DOE (FONT ALTERED)</text>
      
      <text x="220" y="185" font-family="Arial, sans-serif" font-size="13" fill="#cbd5e1">ID NO: DL-99210-TAMPERED</text>
      <text x="220" y="215" font-family="Arial, sans-serif" font-size="13" fill="#cbd5e1">EXPIRES: 2032-12-31</text>
      <text x="220" y="245" font-family="monospace" font-size="11" fill="#ef4444">COPY-MOVE REGION: Cloned Stamp @ (220, 280)</text>

      <!-- Signature Area -->
      <path d="M 60,310 Q 90,285 120,320 T 170,300" stroke="#ef4444" stroke-width="3" fill="none"/>
      <text x="115" y="335" font-family="Arial, sans-serif" font-size="10" fill="#f87171" text-anchor="middle">[SIGNATURE MISMATCH]</text>
      
      <!-- Corrupted QR -->
      <rect x="260" y="275" width="60" height="60" fill="#ffffff" stroke="#ef4444" stroke-width="2" rx="4"/>
      <rect x="266" y="281" width="18" height="18" fill="#ef4444"/>
      <text x="290" y="350" font-family="monospace" font-size="9" fill="#ef4444" text-anchor="middle">QR INVALID</text>

      <!-- Barcode -->
      <g transform="translate(400,275)">
        <rect width="130" height="40" fill="#ffffff" stroke="#ef4444" rx="2"/>
        <line x1="10" y1="5" x2="10" y2="35" stroke="#ef4444" stroke-width="3"/>
        <line x1="25" y1="5" x2="25" y2="35" stroke="#ef4444" stroke-width="1"/>
        <line x1="40" y1="5" x2="40" y2="35" stroke="#ef4444" stroke-width="4"/>
        <line x1="65" y1="5" x2="65" y2="35" stroke="#ef4444" stroke-width="2"/>
        <line x1="85" y1="5" x2="85" y2="35" stroke="#ef4444" stroke-width="1"/>
        <line x1="110" y1="5" x2="110" y2="35" stroke="#ef4444" stroke-width="3"/>
        <text x="65" y="52" font-family="monospace" font-size="9" fill="#ef4444" text-anchor="middle">*INVALID-CHECKSUM*</text>
      </g>
    </svg>
    `;

    // ELA Heatmap (Spike in compression artifacts over altered text and photo)
    const elaSvgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <rect width="600" height="420" fill="#080309" rx="12"/>
      <rect x="15" y="15" width="570" height="390" fill="none" stroke="#7f1d1d" stroke-width="2" rx="8"/>
      
      <!-- High ELA luminance bright spots for spliced zones -->
      <circle cx="115" cy="200" r="50" fill="#ef4444" opacity="0.6"/>
      <circle cx="115" cy="200" r="30" fill="#facc15" opacity="0.8"/>

      <rect x="210" y="125" width="340" height="35" fill="#ef4444" opacity="0.5"/>
      <rect x="230" y="130" width="200" height="25" fill="#facc15" opacity="0.75"/>

      <circle cx="290" cy="305" r="30" fill="#ef4444" opacity="0.6"/>

      <text x="300" y="390" font-family="monospace" font-size="13" font-weight="bold" fill="#f87171" text-anchor="middle">[ELA HEATMAP: HIGH COMPRESSION QUANTIZATION DISCREPANCY DETECTED]</text>
    </svg>
    `;

    return {
      fileName: "Altered_Drivers_License_SAMPLE.jpg",
      fileSize: "198.2 KB",
      fileType: "image/jpeg",
      category: "Identity Card",
      uploadTime: uploadTime,
      previewUrl: "/forged_document_sample.png",
      elaUrl: `data:image/svg+xml;utf8,${encodeURIComponent(elaSvgContent)}`,
      isForged: true,
      issuedTo: "John Doe (Altered)",
      documentId: "DL-99210-FORGED",
      issuer: "State Licensing Authority",
      issueDate: "2023-01-10",
      rawHashSeed: "FORGED_DOCUMENT_MODIFIED_PIXELS_TAMPERED_CHECKSUM_FAILURE",
      preprocessing: {
        boundaryDetected: true,
        boundaryCoords: { x: 15, y: 15, width: 570, height: 390 },
        qualityScore: 72.1,
        noiseLevel: "0.088 (High Variance)",
        skewAngle: "+3.8° → 0.0° (Deskewed)",
        tensorShape: "[1, 3, 512, 512]"
      },
      ocrText: "NATIONAL IDENTITY & DRIVER CARD NAME: JOHN DOE (FONT ALTERED) ID NO: DL-99210-TAMPERED EXPIRES: 2032-12-31 COPY-MOVE REGION DETECTED",
      qrPayload: "INVALID_CHECKSUM_SIGNATURE_PAYLOAD_CORRUPT",
      barcodeValue: "INVALID-CHECKSUM"
    };
  }
}

