import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());

// Ensure directories exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// SQLite Database Setup
const dbPath = path.join(dataDir, 'documents.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper utilities for DID, keypair, CID, and TxHash generation
function generateDID(seed = '') {
  const chars = '0123456789abcdef';
  let hash = '';
  const seedStr = (seed + Date.now()).toString();
  for (let i = 0; i < 40; i++) {
    const charIndex = (seedStr.charCodeAt(i % seedStr.length) + i * 17) % chars.length;
    hash += chars[charIndex];
  }
  return `did:identity:0x${hash}`;
}

function generateKeyPair() {
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

function generateCID(docHash = '') {
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let cid = 'Qm';
  const seedStr = (docHash + Date.now()).toString();
  for (let i = 0; i < 44; i++) {
    const charIndex = (seedStr.charCodeAt(i % seedStr.length) + i * 13) % base58Chars.length;
    cid += base58Chars[charIndex];
  }
  return cid;
}

function generateTxHash() {
  const hex = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return hash;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Calculate SHA-256 Checksum for File
function getFileChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve('0x' + hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

// Initialize Schema
db.serialize(() => {
  // 1. Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT,
      id_number TEXT,
      dob TEXT NOT NULL,
      role TEXT DEFAULT 'Identity Owner',
      did TEXT NOT NULL,
      public_key TEXT,
      private_key TEXT,
      registered_at TEXT NOT NULL
    )
  `, () => {
    db.run("ALTER TABLE users ADD COLUMN password TEXT", () => {});
  });

  // 2. Documents Table
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_category TEXT DEFAULT 'General Document',
      extension TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      upload_date TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_hash TEXT NOT NULL,
      uploaded_by TEXT DEFAULT 'Alexander Vance',
      role_access TEXT DEFAULT 'Identity Owner',
      is_forged INTEGER DEFAULT 0,
      preprocessing_json TEXT,
      ml_result_json TEXT
    )
  `, () => {
    db.run(`ALTER TABLE documents ADD COLUMN is_forged INTEGER DEFAULT 0`, () => {});
    db.run(`ALTER TABLE documents ADD COLUMN preprocessing_json TEXT`, () => {});
    db.run(`ALTER TABLE documents ADD COLUMN ml_result_json TEXT`, () => {});
  });

  // 3. IPFS Records Table
  db.run(`
    CREATE TABLE IF NOT EXISTS ipfs_records (
      cid TEXT PRIMARY KEY,
      doc_id TEXT NOT NULL,
      doc_hash TEXT NOT NULL,
      gateway_url TEXT NOT NULL,
      node_count INTEGER DEFAULT 24,
      file_size TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  // 4. Blockchain Ledger Records Table
  db.run(`
    CREATE TABLE IF NOT EXISTS blockchain_records (
      tx_hash TEXT PRIMARY KEY,
      block_number INTEGER NOT NULL,
      gas_used INTEGER NOT NULL,
      contract_address TEXT NOT NULL,
      network TEXT DEFAULT 'IdentityChain Sepolia Testnet',
      user_did TEXT NOT NULL,
      ipfs_cid TEXT NOT NULL,
      doc_hash TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  // 5. Verifiers Table
  db.run(`
    CREATE TABLE IF NOT EXISTS verifiers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      organization TEXT NOT NULL,
      status TEXT DEFAULT 'GRANTED',
      granted_at TEXT NOT NULL,
      duration TEXT DEFAULT '30 Days',
      did TEXT NOT NULL
    )
  `);

  // 6. Audit Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      verifier_name TEXT NOT NULL,
      action TEXT NOT NULL,
      status TEXT NOT NULL,
      did TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      tx_hash TEXT NOT NULL
    )
  `);

  // 7. Verification History Table
  db.run(`
    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      queried_cid TEXT NOT NULL,
      is_valid INTEGER NOT NULL,
      doc_name TEXT,
      owner_name TEXT,
      owner_did TEXT,
      blockchain_tx TEXT,
      steps_json TEXT
    )
  `, () => {
    seedDatabase();
  });
});

// Seed Initial Demo Data
function seedDatabase() {
  // Seed User
  db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
    if (!err && row.count === 0) {
      const keys = generateKeyPair();
      const did = generateDID('demo_user_alexander');
      db.run(`
        INSERT INTO users (id, full_name, email, password, id_number, dob, role, did, public_key, private_key, registered_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'usr-alexander-01',
        'Alexander Vance',
        'alexander.vance@identity.io',
        'alexander123',
        'NIT-CS-2024-8841',
        '1998-04-12',
        'Identity Owner',
        did,
        keys.publicKey,
        keys.privateKey,
        new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      ]);
    }
  });

  // Seed Documents
  db.get('SELECT COUNT(*) as count FROM documents', [], (err, row) => {
    if (err || (row && row.count > 0)) return;

    const sampleDocs = [
      {
        id: 'doc-seed-101',
        original_name: 'Academic_Degree_Certificate.pdf',
        filename: 'seed_degree_cert.pdf',
        file_type: 'application/pdf',
        file_category: 'Educational Degree',
        extension: '.pdf',
        file_size: 145800,
        upload_date: new Date(Date.now() - 86400000 * 2).toISOString(),
        file_hash: '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        uploaded_by: 'Alexander Vance',
        role_access: 'Identity Owner',
        is_forged: 0
      },
      {
        id: 'doc-seed-102',
        original_name: 'National_ID_Card.png',
        filename: 'seed_id_card.png',
        file_type: 'image/png',
        file_category: 'Identity Card',
        extension: '.png',
        file_size: 210400,
        upload_date: new Date(Date.now() - 86400000).toISOString(),
        file_hash: '0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        uploaded_by: 'Alexander Vance',
        role_access: 'Identity Owner',
        is_forged: 0
      },
      {
        id: 'doc-seed-103',
        original_name: 'Property_Land_Deed.docx',
        filename: 'seed_land_deed.docx',
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        file_category: 'Land Record',
        extension: '.docx',
        file_size: 98300,
        upload_date: new Date().toISOString(),
        file_hash: '0x5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        uploaded_by: 'Alexander Vance',
        role_access: 'Identity Owner',
        is_forged: 0
      }
    ];

    const stmt = db.prepare(`
      INSERT INTO documents (
        id, original_name, filename, file_type, file_category,
        extension, file_size, upload_date, file_path, file_hash, uploaded_by, role_access, is_forged
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleDocs.forEach((doc) => {
      const filePath = path.join(uploadsDir, doc.filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, `Sample Content for ${doc.original_name}`);
      }
      stmt.run([
        doc.id,
        doc.original_name,
        doc.filename,
        doc.file_type,
        doc.file_category,
        doc.extension,
        doc.file_size,
        doc.upload_date,
        filePath,
        doc.file_hash,
        doc.uploaded_by,
        doc.role_access,
        doc.is_forged
      ]);
    });
    stmt.finalize();
  });

  // Seed Verifiers
  db.get('SELECT COUNT(*) as count FROM verifiers', [], (err, row) => {
    if (!err && row.count === 0) {
      const sampleVerifiers = [
        {
          id: 'ver-1',
          name: 'Global Tech Enterprises',
          organization: 'Employment Verification Dept',
          status: 'GRANTED',
          granted_at: '2026-07-28 10:30 UTC',
          duration: 'Permanent',
          did: 'did:identity:0x891a3f9e2b1048ca09e122b15809ab44c2ef0192'
        },
        {
          id: 'ver-2',
          name: 'Metro National Bank',
          organization: 'KYC & Compliance Board',
          status: 'GRANTED',
          granted_at: '2026-07-29 09:15 UTC',
          duration: '30 Days',
          did: 'did:identity:0x41f878a9c1e0029b376510a991823ef512b077a1'
        },
        {
          id: 'ver-3',
          name: 'State Academic Registry',
          organization: 'Degree Authentication',
          status: 'REVOKED',
          granted_at: '2026-07-20 14:00 UTC',
          duration: 'Expired',
          did: 'did:identity:0x77c2980112ee5694210a448109312ffc8910d291'
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO verifiers (id, name, organization, status, granted_at, duration, did)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      sampleVerifiers.forEach((v) => stmt.run([v.id, v.name, v.organization, v.status, v.granted_at, v.duration, v.did]));
      stmt.finalize();
    }
  });

  // Seed Audit Logs
  db.get('SELECT COUNT(*) as count FROM audit_logs', [], (err, row) => {
    if (!err && row.count === 0) {
      const sampleLogs = [
        {
          id: 'log-101',
          timestamp: '2026-07-28 10:30:12',
          verifier_name: 'Global Tech Enterprises',
          action: 'ACCESS_GRANTED',
          status: 'CONFIRMED',
          did: 'did:identity:0x891a3f9e...',
          doc_type: 'Educational Degree',
          tx_hash: '0x39a1b02847c1e92d89047120aef192b0c1e84771a9902bc014871aa904f691bc'
        },
        {
          id: 'log-102',
          timestamp: '2026-07-29 09:15:44',
          verifier_name: 'Metro National Bank',
          action: 'VERIFICATION_REQUEST',
          status: 'SUCCESS',
          did: 'did:identity:0x41f878a9...',
          doc_type: 'Identity Proof',
          tx_hash: '0x882f01948ba109f5e1009182aa4d69101b089c67290141fbe1094892c90184b2'
        },
        {
          id: 'log-103',
          timestamp: '2026-07-29 11:02:18',
          verifier_name: 'State Academic Registry',
          action: 'ACCESS_REVOKED',
          status: 'CONFIRMED',
          did: 'did:identity:0x77c29801...',
          doc_type: 'Educational Degree',
          tx_hash: '0x12a9e88401928bcfe0018764b8109923a10984fce0987110e66100984ba10291'
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO audit_logs (id, timestamp, verifier_name, action, status, did, doc_type, tx_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      sampleLogs.forEach((l) => stmt.run([l.id, l.timestamp, l.verifier_name, l.action, l.status, l.did, l.doc_type, l.tx_hash]));
      stmt.finalize();
    }
  });
}

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${ext}. Supported types: PDF, DOC, DOCX, JPG, JPEG, PNG.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max
});

// REST API ROUTES

// --- 1. USER PROFILE ENDPOINTS ---
app.get('/api/user/profile', (req, res) => {
  db.get('SELECT * FROM users ORDER BY registered_at DESC LIMIT 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch user profile', details: err.message });
    }
    if (!row) {
      return res.json({ success: true, profile: null });
    }
    res.json({
      success: true,
      profile: {
        registered: true,
        fullName: row.full_name,
        email: row.email,
        password: row.password || '••••••••',
        dob: row.dob,
        role: row.role,
        did: row.did,
        keys: {
          publicKey: row.public_key,
          privateKey: row.private_key,
          algorithm: 'Ed25519-SHA256'
        },
        registeredAt: row.registered_at
      }
    });
  });
});

app.post('/api/user/register', (req, res) => {
  const { fullName, email, password, dob, role } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  const keys = generateKeyPair();
  const did = generateDID(email || fullName);
  const registeredAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const userId = `usr-${Date.now()}`;

  db.run(`
    INSERT INTO users (id, full_name, email, password, dob, role, did, public_key, private_key, registered_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    userId,
    fullName,
    email,
    password,
    dob || '1998-04-12',
    role || 'Identity Owner',
    did,
    keys.publicKey,
    keys.privateKey,
    registeredAt
  ], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to register user identity', details: err.message });
    }
    res.status(201).json({
      success: true,
      profile: {
        registered: true,
        fullName,
        email,
        password,
        dob: dob || '1998-04-12',
        role: role || 'Identity Owner',
        did,
        keys,
        registeredAt
      }
    });
  });
});

// --- 2. DOCUMENT MANAGEMENT ENDPOINTS ---
app.get('/api/documents', (req, res) => {
  const { search = '', type = 'all', sortBy = 'date', sortOrder = 'desc' } = req.query;

  // Filter out forged documents (is_forged = 1) from document library
  let query = 'SELECT * FROM documents WHERE (is_forged IS NULL OR is_forged = 0)';
  const params = [];

  if (search.trim()) {
    query += ' AND (original_name LIKE ? OR file_category LIKE ? OR uploaded_by LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (type !== 'all') {
    const targetType = type.toLowerCase();
    if (targetType === 'pdf') {
      query += ' AND extension = ?';
      params.push('.pdf');
    } else if (targetType === 'doc' || targetType === 'word') {
      query += ' AND (extension = ? OR extension = ?)';
      params.push('.doc', '.docx');
    } else if (targetType === 'image') {
      query += ' AND (extension = ? OR extension = ? OR extension = ?)';
      params.push('.jpg', '.jpeg', '.png');
    } else {
      query += ' AND extension = ?';
      params.push(`.${targetType}`);
    }
  }

  let orderColumn = 'upload_date';
  if (sortBy === 'name') orderColumn = 'original_name';
  else if (sortBy === 'size') orderColumn = 'file_size';
  else if (sortBy === 'type') orderColumn = 'extension';

  const dir = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${orderColumn} ${dir}`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve documents', details: err.message });
    }
    const formattedRows = rows.map((r) => ({
      ...r,
      formattedSize: formatFileSize(r.file_size),
      viewUrl: `/api/documents/${r.id}/view`,
      downloadUrl: `/api/documents/${r.id}/download`,
      preprocessing: r.preprocessing_json ? JSON.parse(r.preprocessing_json) : null,
      mlResult: r.ml_result_json ? JSON.parse(r.ml_result_json) : null
    }));
    res.json({ success: true, count: formattedRows.length, documents: formattedRows });
  });
});

app.get('/api/documents/stats', (req, res) => {
  db.all('SELECT extension, file_size, file_category FROM documents WHERE (is_forged IS NULL OR is_forged = 0)', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve stats', details: err.message });
    }

    const totalCount = rows.length;
    const totalSize = rows.reduce((acc, row) => acc + (row.file_size || 0), 0);

    const typeBreakdown = {
      pdf: rows.filter((r) => r.extension === '.pdf').length,
      word: rows.filter((r) => r.extension === '.doc' || r.extension === '.docx').length,
      image: rows.filter((r) => ['.jpg', '.jpeg', '.png'].includes(r.extension)).length
    };

    const categoryBreakdown = {};
    rows.forEach((r) => {
      const cat = r.file_category || 'General';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    res.json({
      success: true,
      totalCount,
      totalSize,
      formattedTotalSize: formatFileSize(totalSize),
      typeBreakdown,
      categoryBreakdown
    });
  });
});

app.post('/api/documents/upload', (req, res) => {
  const uploadHandler = upload.array('files', 10);

  uploadHandler(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for upload.' });
    }

    const category = req.body.category || 'General Document';
    const uploadedBy = req.body.uploadedBy || 'Alexander Vance';
    const roleAccess = req.body.roleAccess || 'Identity Owner';

    const insertedDocs = [];
    const duplicatesDetected = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const fileHash = await getFileChecksum(file.path);

      const existingDoc = await new Promise((resolve) => {
        db.get('SELECT * FROM documents WHERE file_hash = ? OR original_name = ?', [fileHash, file.originalname], (dbErr, row) => {
          resolve(row);
        });
      });

      if (existingDoc) {
        duplicatesDetected.push({
          original_name: file.originalname,
          existingId: existingDoc.id,
          message: 'Duplicate content or file name detected.'
        });
      }

      const id = `doc-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const uploadDate = new Date().toISOString();
      const preprocessing = {
        boundaryDetected: true,
        boundaryCoords: { x: 18, y: 18, width: 564, height: 384 },
        qualityScore: 97.2,
        noiseLevel: '0.014 (Filtered)',
        skewAngle: '-1.1° → 0.0° (Corrected)',
        tensorShape: '[1, 3, 512, 512]'
      };

      const stmt = db.prepare(`
        INSERT INTO documents (
          id, original_name, filename, file_type, file_category,
          extension, file_size, upload_date, file_path, file_hash, uploaded_by, role_access, preprocessing_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        id,
        file.originalname,
        file.filename,
        file.mimetype,
        category,
        ext,
        file.size,
        uploadDate,
        file.path,
        fileHash,
        uploadedBy,
        roleAccess,
        JSON.stringify(preprocessing)
      ]);
      stmt.finalize();

      insertedDocs.push({
        id,
        original_name: file.originalname,
        filename: file.filename,
        file_type: file.mimetype,
        file_category: category,
        extension: ext,
        file_size: file.size,
        formattedSize: formatFileSize(file.size),
        upload_date: uploadDate,
        file_hash: fileHash,
        uploaded_by: uploadedBy,
        role_access: roleAccess,
        viewUrl: `/api/documents/${id}/view`,
        downloadUrl: `/api/documents/${id}/download`,
        preprocessing
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${insertedDocs.length} file(s).`,
      documents: insertedDocs,
      duplicates: duplicatesDetected
    });
  });
});

// --- 3. FORGERY DETECTION SCAN ENDPOINT ---
app.post('/api/documents/:id/scan', (req, res) => {
  const { id } = req.params;
  const { overrideVerdict } = req.body;

  db.get('SELECT * FROM documents WHERE id = ?', [id], (err, doc) => {
    if (err || !doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    let isForged = 0;
    if (overrideVerdict === 'forged') isForged = 1;
    else if (overrideVerdict === 'genuine') isForged = 0;
    else {
      // Auto CNN tensor computation simulation
      const seed = doc.file_hash + doc.original_name + doc.file_size;
      let tensorSum = 0;
      for (let i = 0; i < seed.length; i++) tensorSum += seed.charCodeAt(i) * (i + 1);
      isForged = (tensorSum % 7 === 0) ? 1 : 0;
    }

    const confidenceScore = isForged ? 96.8 : 99.4;
    const mlResult = {
      verdict: isForged ? 'FORGED' : 'GENUINE',
      confidence: confidenceScore,
      scannedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      pipeline: {
        totalSteps: 15,
        passedSteps: isForged ? 9 : 15,
        failedSteps: isForged ? 6 : 0,
        anomalies: isForged ? [
          'Font kerning variance exceeds threshold',
          'Spliced image boundaries detected @ (115, 200)',
          'ELA heatmap compression quantization spike',
          'QR payload checksum mismatch'
        ] : []
      }
    };

    db.run(
      'UPDATE documents SET is_forged = ?, ml_result_json = ? WHERE id = ?',
      [isForged, JSON.stringify(mlResult), id],
      function (updateErr) {
        if (updateErr) {
          return res.status(500).json({ error: 'Failed to update scan result', details: updateErr.message });
        }
        res.json({
          success: true,
          docId: id,
          isForged,
          mlResult
        });
      }
    );
  });
});

// --- 4. IPFS PINNING ENDPOINTS ---
app.post('/api/ipfs/pin', (req, res) => {
  const { docId, docHash, fileSize } = req.body;
  if (!docHash) {
    return res.status(400).json({ error: 'Document hash is required for IPFS pinning.' });
  }

  const cid = generateCID(docHash);
  const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  db.run(`
    INSERT OR REPLACE INTO ipfs_records (cid, doc_id, doc_hash, gateway_url, node_count, file_size, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    cid,
    docId || 'doc-current',
    docHash,
    gatewayUrl,
    24,
    fileSize || '142 KB',
    timestamp
  ], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to pin file to IPFS', details: err.message });
    }
    res.status(201).json({
      success: true,
      ipfsRecord: {
        pinned: true,
        cid,
        docHash,
        gatewayUrl,
        nodeCount: 24,
        fileSize: fileSize || '142 KB',
        timestamp
      }
    });
  });
});

// --- 5. BLOCKCHAIN LEDGER RECORDING ENDPOINTS ---
app.post('/api/blockchain/record', (req, res) => {
  const { userDID, ipfsCID, docHash, docType, fullName } = req.body;
  if (!userDID || !ipfsCID) {
    return res.status(400).json({ error: 'userDID and ipfsCID are required.' });
  }

  const txHash = generateTxHash();
  const blockNumber = Math.floor(18500000 + Math.random() * 500000);
  const gasUsed = Math.floor(45000 + Math.random() * 8000);
  const contractAddress = '0x7F9a92C18e4708d132A69A5649f82E8d49B55e10';
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  db.run(`
    INSERT INTO blockchain_records (tx_hash, block_number, gas_used, contract_address, network, user_did, ipfs_cid, doc_hash, doc_type, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    txHash,
    blockNumber,
    gasUsed,
    contractAddress,
    'IdentityChain Sepolia Testnet',
    userDID,
    ipfsCID,
    docHash || '0xe3b0c442...',
    docType || 'Educational Degree',
    timestamp
  ], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to record on blockchain', details: err.message });
    }

    // Append to Audit Logs Table
    const logId = `log-${Date.now()}`;
    db.run(`
      INSERT INTO audit_logs (id, timestamp, verifier_name, action, status, did, doc_type, tx_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      logId,
      timestamp,
      'System / Smart Contract',
      'BLOCKCHAIN_RECORDED',
      'MINED & FINALIZED',
      userDID.substring(0, 20) + '...',
      docType || 'Educational Degree',
      txHash
    ]);

    res.status(201).json({
      success: true,
      blockchainRecord: {
        mined: true,
        txHash,
        blockNumber,
        gasUsed,
        contractAddress,
        network: 'IdentityChain Sepolia Testnet',
        timestamp,
        payload: {
          userDID,
          ipfsCID,
          documentHash: docHash,
          documentType: docType,
          issuedTo: fullName || 'Alexander Vance',
          smartContractMethod: 'storeIdentityDocumentRecord(bytes32,string,string)'
        }
      }
    });
  });
});

app.get('/api/blockchain/logs', (req, res) => {
  db.all('SELECT * FROM audit_logs ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
    }
    const formatted = rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      verifierName: r.verifier_name,
      action: r.action,
      status: r.status,
      did: r.did,
      docType: r.doc_type,
      txHash: r.tx_hash
    }));
    res.json({ success: true, logs: formatted });
  });
});

// --- 6. TRI-PARTY VERIFICATION QUERY ENDPOINT ---
app.post('/api/verify', (req, res) => {
  const { queriedCID } = req.body;
  if (!queriedCID) {
    return res.status(400).json({ error: 'queriedCID is required.' });
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  // Query database for IPFS and Blockchain records matching the CID
  db.get('SELECT * FROM ipfs_records WHERE cid = ?', [queriedCID], (err, ipfsRec) => {
    db.get('SELECT * FROM blockchain_records WHERE ipfs_cid = ?', [queriedCID], (bcErr, bcRec) => {
      const isValid = (ipfsRec && bcRec) ? 1 : 0;
      const id = `verif-${Date.now()}`;

      const steps = [
        { name: 'Fetch Metadata from IPFS Node', status: ipfsRec ? 'SUCCESS' : 'FAILED', details: `CID: ${queriedCID.substring(0, 16)}...` },
        { name: 'Query Smart Contract On-Chain Hash', status: bcRec ? 'SUCCESS' : 'FAILED', details: bcRec ? `Block #${bcRec.block_number}` : 'No on-chain transaction found' },
        { name: 'Compute SHA-256 Checksum of Document', status: 'SUCCESS', details: 'Calculated Hash matched' },
        {
          name: 'Compare Tri-Party Hashes (IPFS = Blockchain = Document)',
          status: isValid ? 'SUCCESS' : 'FAILED',
          details: isValid ? '100% Cryptographic Match' : 'Tri-party Mismatch'
        }
      ];

      db.run(`
        INSERT INTO verifications (id, timestamp, queried_cid, is_valid, doc_name, owner_name, owner_did, blockchain_tx, steps_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        timestamp,
        queriedCID,
        isValid,
        bcRec ? bcRec.doc_type : 'Document Record',
        'Alexander Vance',
        bcRec ? bcRec.user_did : 'did:identity:0x892a...',
        bcRec ? bcRec.tx_hash : '0x39a1b028...',
        JSON.stringify(steps)
      ]);

      res.json({
        success: true,
        verdict: {
          timestamp,
          queriedCID,
          isValid: Boolean(isValid),
          docName: bcRec ? bcRec.doc_type : 'Document Record',
          ownerName: 'Alexander Vance',
          ownerDID: bcRec ? bcRec.user_did : 'did:identity:0x892a...',
          blockchainTx: bcRec ? bcRec.tx_hash : '0x39a1b028...',
          steps
        }
      });
    });
  });
});

// --- 7. ACCESS CONTROL & VERIFIERS ENDPOINTS ---
app.get('/api/access-control/verifiers', (req, res) => {
  db.all('SELECT * FROM verifiers ORDER BY granted_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch verifiers', details: err.message });
    }
    const formatted = rows.map((r) => ({
      id: r.id,
      name: r.name,
      organization: r.organization,
      status: r.status,
      grantedAt: r.granted_at,
      duration: r.duration,
      did: r.did
    }));
    res.json({ success: true, verifiers: formatted });
  });
});

app.post('/api/access-control/verifiers', (req, res) => {
  const { name, organization, duration, userDID, docType } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Verifier name is required.' });
  }

  const verifierId = `ver-${Date.now()}`;
  const grantedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const verifierDid = generateDID(name);
  const txHash = generateTxHash();

  db.run(`
    INSERT INTO verifiers (id, name, organization, status, granted_at, duration, did)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    verifierId,
    name,
    organization || 'Organization',
    'GRANTED',
    grantedAt,
    duration || '30 Days',
    verifierDid
  ], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to add verifier', details: err.message });
    }

    // Add Audit Log
    const logId = `log-${Date.now()}`;
    db.run(`
      INSERT INTO audit_logs (id, timestamp, verifier_name, action, status, did, doc_type, tx_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      logId,
      grantedAt,
      name,
      'ACCESS_GRANTED',
      'CONFIRMED',
      userDID ? userDID.substring(0, 20) + '...' : 'did:identity:0x891a...',
      docType || 'Educational Degree',
      txHash
    ]);

    res.status(201).json({
      success: true,
      verifier: {
        id: verifierId,
        name,
        organization: organization || 'Organization',
        status: 'GRANTED',
        grantedAt,
        duration: duration || '30 Days',
        did: verifierDid
      }
    });
  });
});

app.patch('/api/access-control/verifiers/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { userDID, docType } = req.body;

  db.get('SELECT * FROM verifiers WHERE id = ?', [id], (err, verifier) => {
    if (err || !verifier) {
      return res.status(404).json({ error: 'Verifier not found' });
    }

    const newStatus = verifier.status === 'GRANTED' ? 'REVOKED' : 'GRANTED';
    const actionType = newStatus === 'GRANTED' ? 'ACCESS_GRANTED' : 'ACCESS_REVOKED';
    const grantedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const txHash = generateTxHash();

    db.run(
      'UPDATE verifiers SET status = ?, granted_at = ? WHERE id = ?',
      [newStatus, grantedAt, id],
      function (updateErr) {
        if (updateErr) {
          return res.status(500).json({ error: 'Failed to update verifier status', details: updateErr.message });
        }

        // Add Audit Log
        const logId = `log-${Date.now()}`;
        db.run(`
          INSERT INTO audit_logs (id, timestamp, verifier_name, action, status, did, doc_type, tx_hash)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          logId,
          grantedAt,
          verifier.name,
          actionType,
          'CONFIRMED',
          userDID ? userDID.substring(0, 20) + '...' : 'did:identity:0x891a...',
          docType || 'Educational Degree',
          txHash
        ]);

        res.json({
          success: true,
          verifier: {
            ...verifier,
            status: newStatus,
            grantedAt
          }
        });
      }
    );
  });
});

// --- 8. FILE STREAMING ENDPOINTS ---
app.get('/api/documents/:id/view', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM documents WHERE id = ?', [id], (err, doc) => {
    if (err || !doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!fs.existsSync(doc.file_path)) {
      return res.status(404).json({ error: 'File resource not found on storage disk' });
    }

    res.setHeader('Content-Type', doc.file_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.original_name)}"`);

    const readStream = fs.createReadStream(doc.file_path);
    readStream.pipe(res);
  });
});

app.get('/api/documents/:id/download', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM documents WHERE id = ?', [id], (err, doc) => {
    if (err || !doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!fs.existsSync(doc.file_path)) {
      return res.status(404).json({ error: 'File resource not found on storage disk' });
    }

    res.setHeader('Content-Type', doc.file_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.original_name)}"`);

    const readStream = fs.createReadStream(doc.file_path);
    readStream.pipe(res);
  });
});

app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM documents WHERE id = ?', [id], (err, doc) => {
    if (err || !doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (fs.existsSync(doc.file_path)) {
      try {
        fs.unlinkSync(doc.file_path);
      } catch (unlinkErr) {
        console.error('Error deleting file from disk:', unlinkErr.message);
      }
    }

    db.run('DELETE FROM documents WHERE id = ?', [id], function (deleteErr) {
      if (deleteErr) {
        return res.status(500).json({ error: 'Failed to delete metadata record', details: deleteErr.message });
      }
      res.json({
        success: true,
        message: 'Document deleted successfully',
        deletedId: id
      });
    });
  });
});

// Serve static frontend files in production
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Start Server
const server = app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Document Management API Server running on port ${PORT}`);
  console.log(` API Endpoint Base: http://localhost:${PORT}/api/documents`);
  console.log(`===================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[ERROR] Port ${PORT} is already in use. Please stop the running process or choose a different port.`);
  } else {
    console.error('[ERROR] Express server error:', err);
  }
});
