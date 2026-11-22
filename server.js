import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  loadState,
  saveState,
  writeLocalDoc,
  sanitizeFileName,
  ROOT_DIR,
} from './lib/store.js';
import {
  DRIVE_FOLDER_ID,
  DRIVE_FOLDER_NAME,
  DRIVE_FOLDER_URL,
  getDriveMode,
  listDriveFiles,
  syncFileToDrive,
  readDriveFileContent,
} from './lib/driveSync.js';

const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PORT = Number(process.env.PORT || 3847);
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > 2 * 1024 * 1024) throw new Error('Payload too large');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

function effectiveApiConfig(st) {
  const cfg = st.apiConfig || {};
  if (cfg.apiKey) return cfg;
  if (process.env.GEMINI_API_KEY) {
    return { provider: 'gemini', apiKey: process.env.GEMINI_API_KEY, baseUrl: '', model: 'gemini-2.5-flash' };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    };
  }
  return cfg;
}

async function publicStateView(st) {
  const driveMode = await getDriveMode();
  const effAi = effectiveApiConfig(st);
  return {
    gameTitle: st.gameTitle,
    autoSyncDrive: st.autoSyncDrive,
    teamEnergy: st.teamEnergy,
    drive: {
      mode: driveMode,
      connected: driveMode !== 'local_only',
      folderId: DRIVE_FOLDER_ID,
      folderName: DRIVE_FOLDER_NAME,
      folderUrl: DRIVE_FOLDER_URL,
    },
    apiConfig: {
      provider: effAi.provider || 'sim',
      hasApiKey: Boolean(effAi.apiKey),
      baseUrl: effAi.baseUrl || 'https://api.openai.com/v1/chat/completions',
      model: effAi.model || 'gpt-4o-mini',
    },
    relationships: st.relationships || [],
    tasks: st.tasks || [],
    docs: st.docs || [],
    messages: st.messages || [],
  };
}

async function callBackendLLM(apiConfig, systemPrompt, userPrompt) {
  const provider = apiConfig?.provider || 'sim';
  const apiKey = apiConfig?.apiKey || '';
  if (provider === 'sim' || !apiKey) return null;

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 500 },
      }),
    });
    if (!res.ok) {
      const errTxt = await res.text().catch(() => '');
      throw new Error(`Gemini HTTP ${res.status}: ${errTxt.slice(0, 120)}`);
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  }

  if (provider === 'openai') {
    const baseUrl = apiConfig.baseUrl || 'https://api.openai.com/v1/chat/completions';
    const model = apiConfig.model || 'gpt-4o-mini';
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.85,
        max_tokens: 500,
      }),
    });
    if (!res.ok) {
      const errTxt = await res.text().catch(() => '');
      throw new Error(`OpenAI HTTP ${res.status}: ${errTxt.slice(0, 120)}`);
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  }

  return null;
}

async function handleApi(req, res, urlObj) {
  const method = req.method || 'GET';
  const pathname = urlObj.pathname;

  try {
    if (method === 'GET' && pathname === '/api/health') {
      const driveMode = await getDriveMode();
      return sendJson(res, 200, {
        ok: true,
        driveMode,
        driveConnected: driveMode !== 'local_only',
        driveFolderName: DRIVE_FOLDER_NAME,
      });
    }

    if (method === 'GET' && pathname === '/api/state') {
      const st = await loadState();
      return sendJson(res, 200, await publicStateView(st));
    }

    if (method === 'POST' && pathname === '/api/settings') {
      const body = await readJsonBody(req);
      const st = await loadState();
      if (typeof body.gameTitle === 'string' && body.gameTitle.trim()) {
        st.gameTitle = body.gameTitle.trim().slice(0, 80);
      }
      if (typeof body.autoSyncDrive === 'boolean') {
        st.autoSyncDrive = body.autoSyncDrive;
      }
      if (body.apiConfig && typeof body.apiConfig === 'object') {
        st.apiConfig = {
          provider: body.apiConfig.provider || st.apiConfig.provider || 'sim',
          apiKey: body.apiConfig.clearApiKey
            ? ''
            : (body.apiConfig.apiKey ? String(body.apiConfig.apiKey).trim() : st.apiConfig.apiKey || ''),
          baseUrl: body.apiConfig.baseUrl || st.apiConfig.baseUrl || 'https://api.openai.com/v1/chat/completions',
          model: body.apiConfig.model || st.apiConfig.model || 'gpt-4o-mini',
        };
      }
      await saveState(st);
      return sendJson(res, 200, { ok: true, state: await publicStateView(st) });
    }

    if (method === 'POST' && pathname === '/api/messages') {
      const body = await readJsonBody(req);
      const st = await loadState();
      const msg = {
        id: 'm_' + Date.now() + '_' + Math.floor(Math.random() * 9999),
        senderId: String(body.senderId || 'system'),
        text: String(body.text || ''),
        docRefId: body.docRefId || null,
        isBanter: Boolean(body.isBanter),
        time: body.time || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      st.messages.push(msg);
      if (st.messages.length > 180) st.messages = st.messages.slice(-180);
      await saveState(st);
      return sendJson(res, 201, { ok: true, message: msg });
    }

    if (method === 'POST' && pathname === '/api/tasks') {
      const body = await readJsonBody(req);
      const st = await loadState();
      const task = {
        id: 't_' + Date.now() + '_' + Math.floor(Math.random() * 9999),
        title: String(body.title || 'งานใหม่').slice(0, 140),
        ownerId: String(body.ownerId || 'may'),
        status: ['todo', 'in_progress', 'done'].includes(body.status) ? body.status : 'todo',
        createdAt: new Date().toISOString(),
      };
      st.tasks.unshift(task);
      await saveState(st);
      return sendJson(res, 201, { ok: true, task });
    }

    const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
    if (method === 'PATCH' && taskMatch) {
      const taskId = decodeURIComponent(taskMatch[1]);
      const body = await readJsonBody(req);
      const st = await loadState();
      const task = st.tasks.find(t => t.id === taskId);
      if (!task) return sendJson(res, 404, { error: 'Task not found' });
      if (['todo', 'in_progress', 'done'].includes(body.status)) task.status = body.status;
      if (typeof body.title === 'string' && body.title.trim()) task.title = body.title.trim();
      await saveState(st);
      return sendJson(res, 200, { ok: true, task });
    }

    if (method === 'PATCH' && pathname === '/api/relationships') {
      const body = await readJsonBody(req);
      const st = await loadState();
      if (Array.isArray(body.relationships)) st.relationships = body.relationships;
      if (typeof body.teamEnergy === 'number') {
        st.teamEnergy = Math.max(0, Math.min(100, Math.round(body.teamEnergy)));
      }
      await saveState(st);
      return sendJson(res, 200, { ok: true, relationships: st.relationships, teamEnergy: st.teamEnergy });
    }

    if (method === 'POST' && pathname === '/api/docs') {
      const body = await readJsonBody(req);
      const st = await loadState();
      const safeName = sanitizeFileName(body.title || 'Game_Doc.md');
      const content = String(body.content || '');
      const { fileName, fullPath } = await writeLocalDoc(safeName, content);

      let doc = st.docs.find(d => (body.id && d.id === body.id) || d.title === fileName);
      const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      if (doc) {
        doc.content = content;
        doc.updatedAt = nowTime;
        if (body.authorName) doc.authorName = body.authorName;
        if (body.emoji) doc.emoji = body.emoji;
      } else {
        doc = {
          id: 'doc_' + Date.now() + '_' + Math.floor(Math.random() * 9999),
          title: fileName,
          authorId: body.authorId || 'may',
          authorName: body.authorName || 'พี่เมย์ (Producer)',
          emoji: body.emoji || '📄',
          createdAt: nowTime,
          updatedAt: nowTime,
          localPath: fullPath,
          content,
          driveId: null,
          driveUrl: null,
          driveStatus: 'local_only',
          syncedAt: null,
        };
        st.docs.unshift(doc);
      }

      const driveMode = await getDriveMode();
      const shouldSync = (body.syncNow !== undefined ? Boolean(body.syncNow) : Boolean(st.autoSyncDrive)) && driveMode !== 'local_only';
      let driveError = null;
      if (shouldSync) {
        try {
          const syncRes = await syncFileToDrive(fullPath, fileName, doc.driveId);
          doc.driveId = syncRes.driveId;
          doc.driveUrl = syncRes.driveUrl;
          doc.driveStatus = 'synced';
          doc.syncedAt = syncRes.syncedAt;
        } catch (err) {
          doc.driveStatus = 'error';
          driveError = err.message;
        }
      }

      await saveState(st);
      return sendJson(res, 200, {
        ok: true,
        doc,
        driveSynced: doc.driveStatus === 'synced',
        driveMode,
        driveError,
      });
    }

    const docSyncMatch = pathname.match(/^\/api\/docs\/([^/]+)\/sync$/);
    if (method === 'POST' && docSyncMatch) {
      const docId = decodeURIComponent(docSyncMatch[1]);
      const st = await loadState();
      const doc = st.docs.find(d => d.id === docId);
      if (!doc) return sendJson(res, 404, { error: 'Document not found' });
      const { fileName, fullPath } = await writeLocalDoc(doc.title, doc.content);
      const syncRes = await syncFileToDrive(fullPath, fileName, doc.driveId);
      doc.driveId = syncRes.driveId;
      doc.driveUrl = syncRes.driveUrl;
      doc.driveStatus = 'synced';
      doc.syncedAt = syncRes.syncedAt;
      await saveState(st);
      return sendJson(res, 200, { ok: true, doc });
    }

    if (method === 'GET' && pathname === '/api/drive/files') {
      const driveMode = await getDriveMode();
      const files = driveMode === 'local_only' ? [] : await listDriveFiles();
      return sendJson(res, 200, {
        ok: true,
        mode: driveMode,
        connected: driveMode !== 'local_only',
        folderId: DRIVE_FOLDER_ID,
        folderName: DRIVE_FOLDER_NAME,
        folderUrl: DRIVE_FOLDER_URL,
        files,
      });
    }

    const driveReadMatch = pathname.match(/^\/api\/drive\/files\/([^/]+)\/content$/);
    if (method === 'GET' && driveReadMatch) {
      const fileId = decodeURIComponent(driveReadMatch[1]);
      const mimeType = urlObj.searchParams.get('mimeType') || '';
      const content = await readDriveFileContent(fileId, mimeType);
      return sendJson(res, 200, { ok: true, fileId, content });
    }

    if (method === 'POST' && pathname === '/api/ai/chat') {
      const body = await readJsonBody(req);
      const st = await loadState();
      const reply = await callBackendLLM(effectiveApiConfig(st), String(body.systemPrompt || ''), String(body.userPrompt || ''));
      return sendJson(res, 200, { ok: true, reply });
    }

    return sendJson(res, 404, { error: 'API route not found' });
  } catch (err) {
    console.error('[API Error]', method, pathname, err);
    return sendJson(res, 500, { ok: false, error: err.message || 'Internal Server Error' });
  }
}

async function serveStatic(res, pathname) {
  const cleanPath = pathname === '/' ? '/index.html' : pathname;
  const resolved = path.resolve(PUBLIC_DIR, '.' + cleanPath);
  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  try {
    const data = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (urlObj.pathname.startsWith('/api/')) {
    return handleApi(req, res, urlObj);
  }
  return serveStatic(res, urlObj.pathname);
});

server.listen(PORT, HOST, async () => {
  const mode = await getDriveMode();
  console.log(`Mynew Game Studio Server running on http://${HOST}:${PORT}`);
  console.log(`Google Drive Sync Mode: ${mode}`);
});
