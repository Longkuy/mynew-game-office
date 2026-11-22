import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const execFileAsync = promisify(execFile);

export const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || '';
export const DRIVE_FOLDER_NAME = process.env.DRIVE_FOLDER_NAME || 'Mynew game/';
export const DRIVE_FOLDER_URL = DRIVE_FOLDER_ID
  ? `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`
  : 'https://drive.google.com/drive/my-drive';

// ---------------------------------------------------------------------------
// 1. Production Cloud Auth: Google Service Account JWT (RS256, zero deps!)
// ---------------------------------------------------------------------------
let cachedServiceAccount = undefined;
let cachedAccessToken = null;
let cachedTokenExpiry = 0;

function getServiceAccount() {
  if (cachedServiceAccount !== undefined) return cachedServiceAccount;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw || !raw.trim()) {
    cachedServiceAccount = null;
    return null;
  }
  try {
    const trimmed = raw.trim();
    const jsonStr = trimmed.startsWith('{')
      ? trimmed
      : Buffer.from(trimmed, 'base64').toString('utf8');
    const parsed = JSON.parse(jsonStr);
    if (parsed.client_email && parsed.private_key) {
      cachedServiceAccount = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('[DriveSync] Invalid GOOGLE_SERVICE_ACCOUNT_JSON:', err.message);
  }
  cachedServiceAccount = null;
  return null;
}

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getGoogleAccessToken() {
  const sa = getServiceAccount();
  if (!sa) return null;
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && now < cachedTokenExpiry - 60) {
    return cachedAccessToken;
  }

  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64Url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));
  const signingInput = `${header}.${claim}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  const signature = signer.sign(sa.private_key, 'base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Google OAuth HTTP ${res.status}: ${txt.slice(0, 140)}`);
  }
  const data = await res.json();
  cachedAccessToken = data.access_token;
  cachedTokenExpiry = now + Number(data.expires_in || 3500);
  return cachedAccessToken;
}

// ---------------------------------------------------------------------------
// 2. Local CLI fallback detection (Antigravity VM / local gdrive CLI)
// ---------------------------------------------------------------------------
let hasGdriveCli = null;
async function checkGdriveCli() {
  if (hasGdriveCli !== null) return hasGdriveCli;
  try {
    await execFileAsync('gdrive', ['--version'], { timeout: 3000 });
    hasGdriveCli = true;
  } catch {
    hasGdriveCli = false;
  }
  return hasGdriveCli;
}

export async function getDriveMode() {
  if (getServiceAccount() && DRIVE_FOLDER_ID) return 'service_account';
  if (DRIVE_FOLDER_ID && await checkGdriveCli()) return 'gdrive_cli';
  return 'local_only';
}

function normalizeFileEntry(item) {
  if (!item || typeof item !== 'object') return null;
  const id = item.id || item.ID || item.file_id || item.fileId;
  const name = item.name || item.Name || item.title || 'Untitled';
  const mimeType = item.mimeType || item.mime_type || item.type || item.Type || '';
  const modifiedTime = item.modifiedTime || item.modified_time || item.updatedAt || '';
  const size = item.size || item.Size || '';
  const webViewLink = item.webViewLink || item.web_view_link || (id ? `https://drive.google.com/file/d/${id}/view` : DRIVE_FOLDER_URL);
  return { id, name, mimeType, modifiedTime, size, webViewLink };
}

// ---------------------------------------------------------------------------
// 3. Unified Operations (Service Account REST API v3 -> gdrive CLI -> Local)
// ---------------------------------------------------------------------------
async function runGdrive(args) {
  const { stdout } = await execFileAsync('gdrive', args, {
    timeout: 30000,
    maxBuffer: 10 * 1024 * 1024,
    env: process.env,
  });
  const text = (stdout || '').trim();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export async function listDriveFiles() {
  const mode = await getDriveMode();
  if (mode === 'local_only') return [];

  if (mode === 'service_account') {
    const token = await getGoogleAccessToken();
    const q = `'${DRIVE_FOLDER_ID}' in parents and trashed = false`;
    const params = new URLSearchParams({
      q,
      fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink)',
      orderBy: 'modifiedTime desc',
      pageSize: '100',
    });
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Drive API list HTTP ${res.status}`);
    const data = await res.json();
    return (data.files || []).map(normalizeFileEntry).filter(Boolean);
  }

  const res = await runGdrive(['readonly', 'ls', DRIVE_FOLDER_ID, '--max', '100', '--json']);
  const arr = Array.isArray(res) ? res : (Array.isArray(res?.files) ? res.files : []);
  return arr.map(normalizeFileEntry).filter(Boolean);
}

export async function syncFileToDrive(localFilePath, fileName, existingDriveId = null) {
  const mode = await getDriveMode();
  if (mode === 'local_only') {
    throw new Error('ยังไม่ได้ตั้งค่า DRIVE_FOLDER_ID หรือ GOOGLE_SERVICE_ACCOUNT_JSON');
  }

  let targetId = existingDriveId;
  if (!targetId) {
    try {
      const files = await listDriveFiles();
      const match = files.find(f => f.name === fileName);
      if (match?.id) targetId = match.id;
    } catch {
      // ignore lookup error and proceed to upload
    }
  }

  if (mode === 'service_account') {
    const token = await getGoogleAccessToken();
    const content = await fs.readFile(localFilePath, 'utf8');
    const boundary = `mynew_game_${Date.now()}`;
    const metadata = targetId
      ? { name: fileName, mimeType: 'text/markdown' }
      : { name: fileName, parents: [DRIVE_FOLDER_ID], mimeType: 'text/markdown' };

    const body =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: text/markdown; charset=UTF-8\r\n\r\n` +
      `${content}\r\n` +
      `--${boundary}--`;

    const url = targetId
      ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(targetId)}?uploadType=multipart&fields=id,name,webViewLink`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink`;

    const res = await fetch(url, {
      method: targetId ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
    if (!res.ok) {
      const errTxt = await res.text().catch(() => '');
      throw new Error(`Drive upload HTTP ${res.status}: ${errTxt.slice(0, 140)}`);
    }
    const data = await res.json();
    const finalId = data.id || targetId;
    return {
      driveId: finalId,
      driveUrl: data.webViewLink || `https://drive.google.com/file/d/${finalId}/view`,
      updated: Boolean(targetId),
      syncedAt: new Date().toISOString(),
    };
  }

  // gdrive CLI mode
  let result;
  if (targetId) {
    result = await runGdrive(['mutate', 'update', targetId, localFilePath, '--mime-type', 'text/markdown', '--json']);
  } else {
    result = await runGdrive(['mutate', 'upload', localFilePath, '--parent', DRIVE_FOLDER_ID, '--mime-type', 'text/markdown', '--json']);
  }
  const normalized = normalizeFileEntry(result) || {};
  const finalId = normalized.id || targetId || null;
  let resolved = normalized;
  if (!finalId) {
    const files = await listDriveFiles();
    const match = files.find(f => f.name === fileName);
    if (match) resolved = match;
  }
  return {
    driveId: resolved.id || finalId,
    driveUrl: resolved.webViewLink || (finalId ? `https://drive.google.com/file/d/${finalId}/view` : DRIVE_FOLDER_URL),
    updated: Boolean(targetId),
    syncedAt: new Date().toISOString(),
  };
}

export async function readDriveFileContent(fileId, mimeType = '') {
  const mode = await getDriveMode();
  if (mode === 'local_only') {
    throw new Error('Google Drive ยังไม่ได้เชื่อมต่อ');
  }

  if (mode === 'service_account') {
    const token = await getGoogleAccessToken();
    let url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`;
    if (mimeType === 'application/vnd.google-apps.document') {
      url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export?mimeType=text/markdown`;
    } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export?mimeType=text/csv`;
    }
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Drive read HTTP ${res.status}`);
    return await res.text();
  }

  const tmpFile = path.join(os.tmpdir(), `mynew_game_${fileId.replace(/[^a-zA-Z0-9_-]/g, '')}_${Date.now()}.txt`);
  try {
    if (mimeType === 'application/vnd.google-apps.document') {
      await execFileAsync('gdrive', ['readonly', 'export', fileId, tmpFile, '--format', 'md'], { timeout: 30000 });
    } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      await execFileAsync('gdrive', ['readonly', 'export', fileId, tmpFile, '--format', 'csv'], { timeout: 30000 });
    } else {
      await execFileAsync('gdrive', ['readonly', 'download', fileId, '--out', tmpFile], { timeout: 30000 });
    }
    return await fs.readFile(tmpFile, 'utf8');
  } finally {
    await fs.unlink(tmpFile).catch(() => {});
  }
}
