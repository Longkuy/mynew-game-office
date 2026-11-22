#!/usr/bin/env node
/**
 * Antigravity Commander Sync Script
 * Usage:
 *   DRIVE_FOLDER_ID=1Pc1BFRgS7H2zUlpONKjEWB0UgF49Q2Ps node scripts/sync-office.mjs <dispatch.json>
 *
 * Applies an AI commander dispatch payload:
 *   1. Writes any new/updated game docs locally & syncs them directly to Google Drive "Mynew game/"
 *   2. Updates public/studio-live.json (bumping revision)
 *   3. Commits & pushes public/studio-live.json to GitHub so the live web office updates within seconds!
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { writeLocalDoc } from '../lib/store.js';
import { syncFileToDrive } from '../lib/driveSync.js';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LIVE_FILE = path.join(ROOT, 'public', 'studio-live.json');

async function main() {
  const payloadPath = process.argv[2];
  if (!payloadPath) {
    console.error('Usage: node scripts/sync-office.mjs <payload.json>');
    process.exit(1);
  }

  const live = JSON.parse(await fs.readFile(LIVE_FILE, 'utf8'));
  const payload = JSON.parse(await fs.readFile(payloadPath, 'utf8'));

  if (payload.gameTitle) live.gameTitle = payload.gameTitle;
  if (payload.activeOrder) live.activeOrder = payload.activeOrder;
  if (typeof payload.teamEnergy === 'number') live.teamEnergy = payload.teamEnergy;

  if (payload.agents && typeof payload.agents === 'object') {
    for (const [id, patch] of Object.entries(payload.agents)) {
      live.agents[id] = { ...(live.agents[id] || {}), ...patch };
    }
  }

  if (Array.isArray(payload.relationshipDeltas)) {
    for (const d of payload.relationshipDeltas) {
      const rel = live.relationships.find(
        r => (r.a === d.a && r.b === d.b) || (r.a === d.b && r.b === d.a)
      );
      if (rel) rel.score = Math.max(40, Math.min(100, rel.score + Number(d.delta || 0)));
    }
  }

  if (Array.isArray(payload.tasks)) {
    for (const t of payload.tasks) {
      const existing = live.tasks.find(x => x.id === t.id || x.title === t.title);
      if (existing) {
        Object.assign(existing, t);
      } else {
        live.tasks.unshift({
          id: t.id || `t_${Date.now()}_${Math.floor(Math.random() * 999)}`,
          title: t.title,
          ownerId: t.ownerId || 'may',
          status: t.status || 'done',
        });
      }
    }
  }

  const docIdByTitle = {};
  if (Array.isArray(payload.docs)) {
    for (const d of payload.docs) {
      const { fileName, fullPath } = await writeLocalDoc(d.title, d.content);
      let existing = live.docs.find(x => x.title === fileName);
      let syncInfo = { driveId: existing?.driveId || null, driveUrl: existing?.driveUrl || null };
      let driveStatus = 'local_only';
      try {
        syncInfo = await syncFileToDrive(fullPath, fileName, existing?.driveId || null);
        driveStatus = 'synced';
      } catch (err) {
        console.warn(`[sync-office] Drive sync skipped/failed for ${fileName}: ${err.message}`);
        driveStatus = 'error';
      }
      const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      if (existing) {
        existing.content = d.content;
        existing.driveId = syncInfo.driveId;
        existing.driveUrl = syncInfo.driveUrl;
        existing.driveStatus = driveStatus;
        existing.createdAt = nowTime;
      } else {
        existing = {
          id: d.id || `doc_${Date.now()}_${Math.floor(Math.random() * 999)}`,
          title: fileName,
          authorId: d.authorId || 'may',
          authorName: d.authorName || 'พี่เมย์ (Producer / PM)',
          emoji: d.emoji || '📄',
          createdAt: nowTime,
          driveId: syncInfo.driveId,
          driveUrl: syncInfo.driveUrl,
          driveStatus,
          content: d.content,
        };
        live.docs.unshift(existing);
      }
      docIdByTitle[d.title] = existing.id;
      docIdByTitle[fileName] = existing.id;
    }
  }

  if (Array.isArray(payload.messages)) {
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    for (const m of payload.messages) {
      live.messages.push({
        id: m.id || `m_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
        senderId: m.senderId,
        text: m.text,
        docRefId: m.docRefId || (m.docTitle ? docIdByTitle[m.docTitle] : null) || null,
        isBanter: Boolean(m.isBanter),
        time: m.time || nowTime,
      });
    }
    if (live.messages.length > 120) live.messages = live.messages.slice(-120);
  }

  live.revision = (live.revision || 0) + 1;
  live.updatedAt = new Date().toISOString();

  await fs.writeFile(LIVE_FILE, JSON.stringify(live, null, 2), 'utf8');

  if (!process.env.NO_GIT_PUSH) {
    await execFileAsync('git', ['add', 'public/studio-live.json'], { cwd: ROOT });
    await execFileAsync('git', ['commit', '-m', `Studio dispatch #${live.revision}: ${(live.activeOrder || 'update').slice(0, 60)}`], { cwd: ROOT });
    await execFileAsync('git', ['push', 'origin', 'main'], { cwd: ROOT });
  }

  console.log(JSON.stringify({
    ok: true,
    revision: live.revision,
    syncedDocs: live.docs.slice(0, 5).map(d => ({ title: d.title, driveUrl: d.driveUrl, status: d.driveStatus })),
  }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
