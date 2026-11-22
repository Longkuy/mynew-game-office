import { createInitialAgents, createOfficeEngine, COFFEE_SPOTS } from './engine.js';

const AGENTS = createInitialAgents();

const DEFAULT_RELATIONSHIPS = [
  { a: 'karn', b: 'ton', score: 72, type: 'frenemy', label: 'คู่กัดสายฟีเจอร์ (Love-Hate)', desc: 'กานต์เสนออะไรล้ำๆ ต้นจะเบรกทันทีเรื่องเวลา แต่พอลงมือทำจริงกลับเข้าขากันอย่างเหลือเชื่อ' },
  { a: 'karn', b: 'mint', score: 91, type: 'close', label: 'คู่หูสายครีเอทีฟ (Soulmates)', desc: 'ชอบสุมหัวคิดเนื้อเรื่องกับดีไซน์ตัวละครด้วยกันจนลืมกินข้าว คุยภาษาจินตนาการรู้เรื่องสุดๆ' },
  { a: 'mint', b: 'ton', score: 80, type: 'frenemy', label: 'สงคราม 2 พิกเซล', desc: 'มิ้นท์ชอบเดินมาขอให้ต้นขยับ UI ทีละ 2px ต้นทำหน้าปลงแต่สุดท้ายก็ยอมแก้ให้ทุกที' },
  { a: 'ton', b: 'james', score: 74, type: 'frenemy', label: 'คู่เวรคู่กรรม Bug Hunter', desc: 'เจมส์ชอบเอาบั๊กสุดพิสดารมาฝากต้นตอน 6 โมงเย็น ต้นบ่นแต่แอบนับถือสายตาน้องมาก' },
  { a: 'may', b: 'ton', score: 88, type: 'work', label: 'คู่หูแบกเดดไลน์', desc: 'สองคนที่เป็นฐานมั่นคงของบริษัท แค่มองตาก็รู้ว่าฟีเจอร์ไหนทำทันหรือต้องตัดออก' },
  { a: 'may', b: 'karn', score: 82, type: 'work', label: 'พี่สาวคุมสโคป', desc: 'พี่เมย์เอ็นดูกานต์แต่ต้องคอยดึงสติไม่ให้ขยายแมปใหญ่เกินไป และคอยเตือนให้นอนให้พอ' },
  { a: 'mint', b: 'note', score: 89, type: 'close', label: 'สายมู้ด & สุนทรียะ', desc: 'จับคู่สีกับเสียงเพลงเข้ากันเป๊ะ ชอบแชร์เพลงอินดี้และกาแฟดริปให้กันประจำ' },
  { a: 'james', b: 'note', score: 84, type: 'close', label: 'แก๊งพักเบรกสายชิลล์', desc: 'เจอกันบ่อยที่โซนกาแฟกับตู้เกม ชอบคุยเรื่องเกมยุคเก่าและซาวด์แทร็กตำนาน' }
];

const state = {
  backendOnline: false,
  gameTitle: 'Mynew Game',
  autoSyncDrive: true,
  drive: {
    mode: 'local_only',
    connected: false,
    folderId: '',
    folderName: 'Mynew game/',
    folderUrl: 'https://drive.google.com/drive/my-drive',
  },
  apiConfig: { provider: 'sim', hasApiKey: false, localKey: '', baseUrl: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
  timeOfDay: 'day',
  soundEnabled: false,
  banterEnabled: true,
  teamEnergy: 92,
  selectedAgentId: 'may',
  activeTab: 'chat',
  isRunningMission: false,
  banterCooldown: 340,
  lastBanterIdx: -1,
  relationships: structuredClone(DEFAULT_RELATIONSHIPS),
  tasks: [],
  docs: [],
  driveFiles: [],
  messages: [],
  editingDocId: null,
};

// Audio Synth
let audioCtx = null;
function playTone(freq, dur = 0.07, type = 'triangle', vol = 0.035, delay = 0) {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + dur);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + dur);
  } catch (_) {}
}
const sfx = {
  click: () => playTone(540, 0.04),
  msg: () => { playTone(620, 0.05); playTone(820, 0.06, 'triangle', 0.03, 0.055); },
  banter: () => playTone(480, 0.045, 'sine', 0.025),
  done: () => { playTone(523, 0.06); playTone(659, 0.06, 'triangle', 0.035, 0.07); playTone(784, 0.11, 'triangle', 0.035, 0.14); },
  coffee: () => { playTone(380, 0.06, 'sine'); playTone(500, 0.08, 'sine', 0.035, 0.07); },
  meow: () => { playTone(720, 0.07); playTone(940, 0.09, 'triangle', 0.04, 0.06); playTone(660, 0.11, 'triangle', 0.03, 0.13); },
  standup: () => { playTone(440, 0.07, 'square', 0.025); playTone(554, 0.07, 'square', 0.025, 0.08); playTone(659, 0.12, 'square', 0.025, 0.16); },
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
const escapeHtml = s => String(s || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

// Backend REST Helper
async function api(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('canvasToast');
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2800);
}

function setSyncStatus(text) {
  document.getElementById('syncIndicator').textContent = text;
}

// Organic Office Banter Scenes
const OFFICE_SCENES = [
  {
    relPair: ['karn', 'ton'], delta: -1, actor: 'karn', target: 'ton',
    title: 'กานต์แอบมาโยนฟีเจอร์ใหม่ให้ต้น',
    steps: [
      { who: 'karn', bubble: 'ต้น! ถ้าเพิ่มระบบตกปลาด้วยล่ะ?', emote: '💡', chat: 'ต้นๆ เดี๋ยวถ้าเกมเรามีระบบตกปลา + ทำอาหารตอนพักแคมป์ด้วยนะ รับรองคนติดงอมแงม!' },
      { who: 'ton', bubble: 'เดี๋ยว!! เอาเดินให้ได้ก่อนมั้ย 🫠', emote: '💢', chat: 'ใจเย็นก่อนพ่อคุณ ตอนนี้แค่ตัวละครเดินชนหินยังไม่นิ่งเลย จะไปตกปลาแล้วเหรอ 🫠' },
      { who: 'may', bubble: 'กานต์ กลับมาดู Sprint 1 ค่ะ 😅', emote: '📋', chat: 'แอบได้ยินนะกานต์ ขอแปะไว้ใน Backlog ก่อนนะคะ รอบนี้เอา Core Loop ให้จบก่อนเนอะ' }
    ]
  },
  {
    relPair: ['mint', 'ton'], delta: +2, actor: 'mint', target: 'ton',
    title: 'มิ้นท์เดินมาเช็กความเป๊ะของ UI กับต้น',
    steps: [
      { who: 'mint', bubble: 'ต้นนน ปุ่มมันเบี้ยว 2px อะ 🥺', emote: '🎨', chat: 'ต้นนน ปุ่ม Start ในหน้าเมนูมันขยับซ้ายไป 2 พิกเซลอะ ขยับให้มิ้นท์หน่อยน้า 🥺' },
      { who: 'ton', bubble: 'รู้ได้ไงวะว่า 2px... อะแก้ให้ก็ได้', emote: '💧', chat: 'สายตาเธอมันติดไม้บรรทัดมาเหรอ... อะๆ แก้ให้แล้ว เดี๋ยวจะเอาขนมบนโต๊ะเธอมากินด้วยนะ' },
      { who: 'mint', bubble: 'เย้! ขอบคุณน้า หยิบได้เลย ✨', emote: '♥', chat: 'เย้ ขอบคุณน้าต้น! ป๊อกกี้อยู่ตรงข้างจอหยิบไปได้เลย ✨' }
    ]
  },
  {
    relPair: ['james', 'ton'], delta: -1, actor: 'james', target: 'ton',
    title: 'เจมส์เจอวิธีแหกแมปสุดพิสดาร',
    steps: [
      { who: 'james', bubble: 'พี่ต้น! ผมทำตัวละครบินออกแมปได้ 555', emote: '🐛', chat: 'พี่ต้นครับ! ผมลองกด Dash พร้อมกด Pause 3 ทีรัวๆ ตัวละครพุ่งทะลุเพดานไปอวกาศเลยครับ 555' },
      { who: 'ton', bubble: 'ผู้เล่นปกติใครมันจะกดแบบนั้นวะ...', emote: '💢', chat: 'เจมส์... ถามจริง ทำไมเอ็งชอบกดอะไรที่มนุษย์ปกติเขาไม่กดกันวะ อะส่งคลิปมา เดี๋ยวพี่แก้ให้' },
      { who: 'james', bubble: 'เผื่อ Speedrunner ไงพี่! 😆', emote: '✨', chat: 'เผื่อสาย Speedrun ไงพี่ เดี๋ยวส่ง Ticket ให้ในบอร์ดนะครับ!' }
    ]
  },
  {
    relPair: ['mint', 'note'], delta: +2, actor: 'mint', target: 'note',
    title: 'มิ้นท์แวะห้องอัดคุยเรื่องมู้ดเกมกับพี่โน้ต',
    steps: [
      { who: 'mint', bubble: 'พี่โน้ต ฉากเย็นสีส้มนี้เข้ากับเพลงไหนดี?', emote: '🎨', chat: 'พี่โน้ตคะ มิ้นท์เพิ่งลงสีฉากตอนเย็นเสร็จ อยากได้เพลงที่ฟังแล้วเหงาๆ แต่อบอุ่นอะค่ะ' },
      { who: 'note', bubble: 'โอ้ สีสวยมาก เดี๋ยวพี่ใช้ Rhodes ผสม 8-bit', emote: '🎵', chat: 'โห พาเลตต์สีละมุนมากมิ้นท์ เดี๋ยวพี่ลองอัดเปียโน Rhodes คู่กับซินธ์ 8-bit นุ่มๆ ให้ฟังนะ' }
    ]
  },
  {
    relPair: ['karn', 'mint'], delta: +2, actor: 'karn', target: 'mint',
    title: 'กานต์กับมิ้นท์สุมหัวคิดดีไซน์ตัวละคร',
    steps: [
      { who: 'karn', bubble: 'มิ้นท์! อยากให้ NPC ร้านค้าเป็นแมวใส่ผ้ากันเปื้อน!', emote: '✨', chat: 'มิ้นท์ๆ คิดออกแล้ว NPC ขายไอเทมในเมืองเอาเป็นแมวส้มหน้ามึนใส่ผ้ากันเปื้อนเหมือนเจ้าพิกเซลเลยดีมั้ย!' },
      { who: 'mint', bubble: 'น่ารักมาก!! ขอวาดตอนนี้เลย! 🐱', emote: '♥', chat: 'กรี๊ดด น่ารักมากกานต์! เอาแบบเวลากดซื้อของแล้วมันหาวใส่ผู้เล่นด้วยนะ มิ้นท์ขอสเก็ตช์เดี๋ยวนี้เลย!' }
    ]
  },
  {
    relPair: ['may', 'ton'], delta: +2, actor: 'may', target: 'ton',
    title: 'พี่เมย์แวะเช็กสภาพร่างกายต้น',
    steps: [
      { who: 'may', bubble: 'ต้น ดื่มน้ำบ้างนะ กาแฟแก้วที่ 3 แล้ว 💧', emote: '☕', chat: 'ต้นคะ พี่เห็นกระป๋องชูกำลังวางเรียง 2 กระป๋องแล้วนะ พักสายตาไปดื่มน้ำเปล่าบ้างเดี๋ยวมึนหัว' },
      { who: 'ton', bubble: 'รับทราบครับพี่เมย์ ขอบคุณครับ 😅', emote: '♥', chat: 'แหะๆ รู้ทันตลอดเลยนะครับพี่เมย์ เดี๋ยวคอมไพล์รอบนี้ผ่านผมลุกไปยืดเส้นเลยครับ' }
    ]
  }
];

// Initialize Canvas Engine
const engine = createOfficeEngine(document.getElementById('officeCanvas'), AGENTS, {
  getViewState: () => ({
    timeOfDay: state.timeOfDay,
    selectedAgentId: state.selectedAgentId,
    isRunningMission: state.isRunningMission,
    onAutonomousTick: () => {
      if (state.banterEnabled && !state.isRunningMission) {
        state.banterCooldown--;
        if (state.banterCooldown <= 0) {
          state.banterCooldown = 880 + Math.floor(Math.random() * 440);
          playOfficeScene();
        }
      }
    }
  }),
  onSelectAgent: (a) => {
    selectAgent(a.id);
    sfx.click();
    const greetings = {
      may: 'มีอะไรให้พี่ช่วยดูไหมคะบอส?',
      karn: 'บอส! มาดูไอเดียใหม่ผมหน่อย!',
      ton: 'ว่าไงบอส อย่าเพิ่งแก้สเปกนะ 🫠',
      mint: 'บอสดูสีชุดใหม่หน่อยค่า ✨',
      james: 'บอส! มาลองเล่นบิลด์ใหม่มั้ยครับ!',
      note: 'ฟังบีทใหม่หน่อยมั้ยครับบอส 🎧'
    };
    a.bubble = greetings[a.id];
    a.bubbleTimer = 130;
    showToast(`${a.emoji} ${a.name} — ${a.mood} ${a.moodEmoji}`);
  },
  onPetCat: () => {
    sfx.meow();
    state.teamEnergy = Math.min(100, state.teamEnergy + 2);
    persistRelationships();
    updateStatsUI();
    showToast('🐱 เกาคางเจ้าพิกเซล! พลังใจทีม +2%');
  },
  onClickCoffee: () => triggerCoffeeBreak(),
  onClickWhiteboard: () => triggerStandup(),
});

// Persistence Sync Helpers
async function persistRelationships() {
  try {
    await api('/api/relationships', {
      method: 'PATCH',
      body: JSON.stringify({ relationships: state.relationships, teamEnergy: state.teamEnergy })
    });
  } catch (_) {}
}

async function addMessage(senderId, text, docRefId = null, isBanter = false, persist = true) {
  const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const msgObj = { senderId, text, docRefId, isBanter, time: now };
  state.messages.push(msgObj);
  renderSingleMessage(msgObj);
  if (persist) {
    api('/api/messages', { method: 'POST', body: JSON.stringify(msgObj) }).catch(() => {});
  }
}

function renderAllMessages() {
  const feed = document.getElementById('chatFeed');
  feed.innerHTML = '';
  state.messages.forEach(m => renderSingleMessage(m, true));
  feed.scrollTop = feed.scrollHeight;
}

function renderSingleMessage(msg, silent = false) {
  const feed = document.getElementById('chatFeed');
  const div = document.createElement('div');
  div.className = 'msg-enter';
  if (msg.senderId === 'system') {
    div.innerHTML = `<div class="msg-system">${escapeHtml(msg.text)}</div>`;
  } else if (msg.senderId === 'boss') {
    div.innerHTML = `
      <div class="msg-boss-wrap">
        <div class="msg-boss">
          <div style="display:flex;justify-content:space-between;gap:12px;font-size:11px;opacity:0.85;margin-bottom:2px;">
            <strong>👑 บอส (คุณ)</strong><span>${escapeHtml(msg.time)}</span>
          </div>
          <div style="white-space:pre-wrap;">${escapeHtml(msg.text)}</div>
        </div>
      </div>
    `;
  } else {
    const a = AGENTS.find(x => x.id === msg.senderId) || AGENTS[0];
    const docBtn = msg.docRefId
      ? `<button data-open-doc="${msg.docRefId}" class="btn btn-sm" style="margin-top:7px;">☁️ เปิดดู / แก้ไขเอกสาร</button>`
      : '';
    const banterBadge = msg.isBanter ? `<span class="pill" style="font-size:10px;padding:1px 6px;">คุยกันในออฟฟิศ</span>` : '';
    div.innerHTML = `
      <div class="msg-agent ${msg.isBanter ? 'banter' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px;">
          <div style="display:flex;align-items:center;gap:6px;min-width:0;">
            <span style="width:8px;height:8px;border-radius:2px;background:${a.color};display:inline-block;flex-shrink:0;"></span>
            <strong>${a.emoji} ${a.name}</strong>
            ${banterBadge}
          </div>
          <span class="muted" style="font-size:11px;flex-shrink:0;">${escapeHtml(msg.time)}</span>
        </div>
        <div style="white-space:pre-wrap;">${escapeHtml(msg.text)}</div>
        ${docBtn}
      </div>
    `;
    if (msg.docRefId) {
      div.querySelector('[data-open-doc]').addEventListener('click', () => openDocEditor(msg.docRefId));
    }
    if (!silent && !msg.isBanter) sfx.msg();
  }
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
}

function saveLocalBrowserState() {
  if (state.backendOnline) return;
  try {
    localStorage.setItem('mynew_game_studio_static_v1', JSON.stringify({
      gameTitle: state.gameTitle,
      teamEnergy: state.teamEnergy,
      relationships: state.relationships,
      tasks: state.tasks,
      docs: state.docs,
      messages: state.messages.slice(-80),
    }));
  } catch (_) {}
}

// Create / Save Doc -> Local + Automatic Google Drive Sync (or localStorage on static host)
async function saveDocToBackendAndDrive({ id = null, title, authorId = 'may', content, syncNow = undefined }) {
  const a = AGENTS.find(x => x.id === authorId) || AGENTS[0];
  if (!state.backendOnline) {
    const cleanTitle = String(title || 'Game_Doc.md').trim().endsWith('.md') ? String(title).trim() : `${String(title || 'Game_Doc').trim()}.md`;
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    let doc = state.docs.find(d => (id && d.id === id) || d.title === cleanTitle);
    if (doc) {
      doc.content = content; doc.updatedAt = nowTime;
    } else {
      doc = {
        id: 'doc_' + Date.now() + '_' + Math.floor(Math.random() * 999),
        title: cleanTitle, authorId: a.id, authorName: `${a.name} (${a.role})`,
        emoji: a.emoji, createdAt: nowTime, updatedAt: nowTime,
        content, driveId: null, driveUrl: null, driveStatus: 'local_only'
      };
      state.docs.unshift(doc);
    }
    saveLocalBrowserState();
    renderDocs(); updateStatsUI();
    setSyncStatus('💾 บันทึกในเบราว์เซอร์ (กดโหลด .md ได้)');
    setTimeout(() => setSyncStatus(''), 3500);
    return doc;
  }

  setSyncStatus(state.drive.connected ? '⏳ กำลังซิงก์ขึ้น Google Drive...' : '⏳ กำลังบันทึก...');
  try {
    const res = await api('/api/docs', {
      method: 'POST',
      body: JSON.stringify({
        id, title, authorId: a.id, authorName: `${a.name} (${a.role})`,
        emoji: a.emoji, content, syncNow,
      }),
    });
    const idx = state.docs.findIndex(d => d.id === res.doc.id);
    if (idx >= 0) state.docs[idx] = res.doc;
    else state.docs.unshift(res.doc);
    renderDocs(); updateStatsUI();

    if (res.driveSynced) {
      setSyncStatus('☁️ ซิงก์ลง Google Drive แล้ว');
      showToast(`☁️ บันทึก "${res.doc.title}" ลง Google Drive แล้ว!`);
      refreshDriveFiles(true);
    } else if (res.driveError) {
      setSyncStatus('⚠️ เซฟลงเซิร์ฟเวอร์แล้ว (Drive error)');
      showToast(`เซฟแล้ว แต่ซิงก์ Drive ไม่สำเร็จ: ${res.driveError}`);
    } else {
      setSyncStatus('💾 บันทึกลงเซิร์ฟเวอร์แล้ว');
    }
    setTimeout(() => setSyncStatus(''), 4000);
    return res.doc;
  } catch (err) {
    setSyncStatus('❌ บันทึกไม่สำเร็จ');
    showToast(`เกิดข้อผิดพลาด: ${err.message}`);
    return null;
  }
}

async function refreshDriveFiles(silent = false) {
  const label = document.getElementById('driveSyncStateText');
  if (!state.backendOnline) {
    label.textContent = 'Static Web Mode — Deploy บน Render เพื่อเปิด Auto-Sync Drive';
    renderDriveFiles();
    return;
  }
  if (!silent) label.textContent = 'กำลังดึงรายการจาก Drive...';
  try {
    const res = await api('/api/drive/files');
    state.drive.connected = Boolean(res.connected);
    state.drive.mode = res.mode || 'local_only';
    state.driveFiles = res.files || [];
    label.textContent = res.connected
      ? `ซิงก์ล่าสุด ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} (${state.driveFiles.length} ไฟล์)`
      : 'ยังไม่ได้ตั้งค่า GOOGLE_SERVICE_ACCOUNT_JSON (ดูคู่มือใน README)';
    renderDriveFiles();
    updateStatsUI();
  } catch (err) {
    label.textContent = `โหลด Drive ไม่สำเร็จ: ${err.message}`;
  }
}

// UI Renderers
const statusLabels = {
  working: { text: 'ปั่นงานอยู่', cls: 'text-success' },
  walking: { text: 'กำลังเดิน', cls: 'text-link' },
  chatting: { text: 'คุยกับเพื่อน', cls: 'text-primary' },
  coffee: { text: 'จิบกาแฟ', cls: 'text-warning' },
  arcade: { text: 'ตีตู้เกม', cls: 'text-warning' },
  meeting: { text: 'ประชุมทีม', cls: 'text-primary' },
  idle: { text: 'ชิลล์อยู่', cls: 'muted' },
};

function selectAgent(id) {
  state.selectedAgentId = id;
  renderRoster();
  renderInspector();
}

function renderRoster() {
  const grid = document.getElementById('rosterGrid');
  grid.innerHTML = AGENTS.map(a => {
    const st = statusLabels[a.status] || statusLabels.idle;
    return `
      <button data-agent="${a.id}" class="roster-card ${state.selectedAgentId === a.id ? 'selected' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
          <div style="display:flex;align-items:center;gap:5px;min-width:0;">
            <span style="width:9px;height:9px;border-radius:2px;background:${a.color};flex-shrink:0;"></span>
            <strong style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.name}</strong>
            <span style="font-size:11px;">${a.moodEmoji}</span>
          </div>
          <span class="muted" style="font-size:10.5px;">${a.mbti}</span>
        </div>
        <div class="muted" style="font-size:11px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.role}</div>
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:6px;">
          <span class="${st.cls}" style="font-weight:600;">${st.text}</span>
          <span class="muted num-tab">${a.progress}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${a.progress}%;background:${a.color};"></div></div>
      </button>
    `;
  }).join('');
  grid.querySelectorAll('.roster-card').forEach(btn => {
    btn.addEventListener('click', () => { sfx.click(); selectAgent(btn.dataset.agent); });
  });
}

function renderInspector() {
  const a = AGENTS.find(x => x.id === state.selectedAgentId) || AGENTS[0];
  const rels = state.relationships.filter(r => r.a === a.id || r.b === a.id);
  const el = document.getElementById('agentInspector');
  el.innerHTML = `
    <div class="inspector-top">
      <div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:5px;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <strong>${a.emoji} ${a.name} (${a.enName}, ${a.age} ปี) — ${a.thRole}</strong>
          <span class="trait-chip">${a.moodEmoji} ${a.mood}</span>
        </div>
        <div class="muted" style="font-size:12px;">${a.bio}</div>
        <div style="font-size:12px;font-style:italic;">${a.catchphrase}</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:2px;">
          ${a.traits.map(tr => `<span class="trait-chip">${tr}</span>`).join('')}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
        <button id="inspChat" class="btn btn-sm">💬 คุยกับ${a.name}</button>
        <button id="inspToggle" class="btn btn-sm">${a.status === 'coffee' ? '💻 กลับโต๊ะ' : '☕ พักกาแฟ'}</button>
      </div>
    </div>
    <div style="padding-top:8px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:11px;">
      <span class="muted" style="font-weight:600;">ความสัมพันธ์หลัก:</span>
      ${rels.map(r => {
        const other = AGENTS.find(x => x.id === (r.a === a.id ? r.b : r.a));
        return `<span class="trait-chip">${other.emoji} ${other.name}: <strong style="color:var(--text)">${r.label}</strong> (${r.score}%)</span>`;
      }).join('')}
    </div>
  `;
  document.getElementById('inspChat').onclick = () => {
    switchTab('chat');
    const inp = document.getElementById('chatInput');
    inp.value = `@${a.name} `;
    inp.focus();
  };
  document.getElementById('inspToggle').onclick = () => {
    sfx.click();
    if (a.status === 'coffee' || a.status === 'arcade') engine.sendAgentTo(a, a.seat.x, a.seat.y, 'working', 'กลับมานั่งโต๊ะแล้ว!');
    else {
      const sp = COFFEE_SPOTS[Math.floor(Math.random() * COFFEE_SPOTS.length)];
      engine.sendAgentTo(a, sp.x, sp.y, 'coffee', 'ขอพักจิบกาแฟแป๊บ ☕');
    }
    renderRoster();
    renderInspector();
  };
}

function renderRelations() {
  const svg = document.getElementById('relGraphSvg');
  const coords = {
    may: { x: 160, y: 30 }, karn: { x: 64, y: 72 }, note: { x: 256, y: 72 },
    ton: { x: 64, y: 140 }, mint: { x: 256, y: 140 }, james: { x: 160, y: 168 }
  };
  const strokeByType = { close: '#10b981', frenemy: '#f59e0b', work: '#0ea5e9' };
  const lines = state.relationships.map(r => {
    const p1 = coords[r.a], p2 = coords[r.b];
    const dash = r.type === 'frenemy' ? 'stroke-dasharray="4 2"' : '';
    return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeByType[r.type]}" stroke-width="${r.score >= 85 ? 2.4 : 1.6}" ${dash} opacity="0.8" />`;
  }).join('');
  const nodes = AGENTS.map(a => {
    const p = coords[a.id];
    return `
      <g style="cursor:pointer" data-rel-node="${a.id}">
        <circle cx="${p.x}" cy="${p.y}" r="16" fill="var(--surface)" stroke="${a.color}" stroke-width="2.5" />
        <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11">${a.emoji}</text>
        <text x="${p.x}" y="${p.y + 26}" text-anchor="middle" font-size="9" font-weight="600" fill="var(--text)">${a.name}</text>
      </g>
    `;
  }).join('');
  svg.innerHTML = lines + nodes;
  svg.querySelectorAll('[data-rel-node]').forEach(g => {
    g.addEventListener('click', () => { sfx.click(); selectAgent(g.getAttribute('data-rel-node')); });
  });

  document.getElementById('relationsList').innerHTML = state.relationships.map(r => {
    const a1 = AGENTS.find(x => x.id === r.a);
    const a2 = AGENTS.find(x => x.id === r.b);
    const c = strokeByType[r.type];
    return `
      <div class="sub-box" style="display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
          <strong>${a1.emoji} ${a1.name} ↔ ${a2.emoji} ${a2.name}</strong>
          <span class="num-tab" style="font-size:11px;font-weight:600;color:${c};">${r.label} • ${r.score}%</span>
        </div>
        <div class="muted" style="font-size:11.5px;">${r.desc}</div>
        <div class="progress-track"><div class="progress-fill" style="width:${r.score}%;background:${c};"></div></div>
      </div>
    `;
  }).join('');
}

function renderBoard() {
  const el = document.getElementById('boardList');
  const groups = [
    { key: 'in_progress', label: '🔥 กำลังทำ' },
    { key: 'todo', label: '📌 รอทำ' },
    { key: 'done', label: '✅ เสร็จแล้ว' }
  ];
  if (state.tasks.length === 0) {
    el.innerHTML = `<div class="muted" style="text-align:center;padding:28px 8px;">ยังไม่มีงานใน Sprint — ลองกดภารกิจด้านซ้ายหรือเพิ่มงานด้านบนได้เลย</div>`;
    return;
  }
  el.innerHTML = groups.map(g => {
    const items = state.tasks.filter(t => t.status === g.key);
    if (!items.length) return '';
    return `
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div class="muted" style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;">
          <span>${g.label}</span><span>${items.length}</span>
        </div>
        ${items.map(t => {
          const a = AGENTS.find(x => x.id === t.ownerId) || AGENTS[0];
          const next = t.status === 'todo' ? 'in_progress' : (t.status === 'in_progress' ? 'done' : 'todo');
          const lbl = t.status === 'done' ? 'ทำใหม่' : (t.status === 'todo' ? 'เริ่มทำ' : 'เสร็จแล้ว');
          return `
            <div class="sub-box" style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;">
              <div style="min-width:0;">
                <div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${t.status === 'done' ? 'text-decoration:line-through;opacity:0.6;' : ''}">${escapeHtml(t.title)}</div>
                <div class="muted" style="font-size:11px;display:flex;align-items:center;gap:5px;margin-top:2px;">
                  <span style="width:7px;height:7px;border-radius:2px;background:${a.color};display:inline-block;"></span>
                  <span>${a.name}</span>
                </div>
              </div>
              <button data-task-id="${t.id}" data-next="${next}" class="btn btn-sm task-toggle">${lbl}</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');

  el.querySelectorAll('.task-toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.taskId;
      const next = btn.dataset.next;
      const t = state.tasks.find(x => x.id === id);
      if (!t) return;
      t.status = next;
      sfx.click();
      renderBoard();
      updateStatsUI();
      api(`/api/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status: next }) }).catch(() => {});
    });
  });
}

function renderDocs() {
  const el = document.getElementById('docsList');
  if (state.docs.length === 0) {
    el.innerHTML = `<div class="muted" style="text-align:center;padding:16px 8px;">ยังไม่มีเอกสารที่สร้างจากสตูดิโอ — กดปุ่มภารกิจเพื่อให้ทีมสร้างและอัปโหลดลง Drive อัตโนมัติได้เลย</div>`;
    return;
  }
  el.innerHTML = state.docs.map(d => {
    const syncBadge = d.driveStatus === 'synced'
      ? `<span class="doc-badge-synced">☁️ ซิงก์ลง Mynew game/ แล้ว</span>`
      : (d.driveStatus === 'error' ? `<span class="doc-badge-err">⚠️ ซิงก์ Drive ไม่สำเร็จ</span>` : `<span class="muted" style="font-size:11px;">💾 เฉพาะในเครื่อง</span>`);
    const driveBtn = d.driveUrl
      ? `<a href="${escapeHtml(d.driveUrl)}" target="_blank" rel="noopener" class="btn btn-sm">Drive ↗</a>`
      : `<button data-resync="${d.id}" class="btn btn-sm resync-btn">☁️ ซิงก์</button>`;
    return `
      <div class="sub-box" style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="min-width:0;">
            <div style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${d.emoji || '📄'} ${escapeHtml(d.title)}</div>
            <div class="muted" style="font-size:11px;">โดย ${escapeHtml(d.authorName)} • ${syncBadge}</div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0;">
            ${driveBtn}
            <button data-edit-doc="${d.id}" class="btn btn-sm edit-doc-btn">แก้ไข</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  el.querySelectorAll('.edit-doc-btn').forEach(btn => {
    btn.addEventListener('click', () => openDocEditor(btn.dataset.editDoc));
  });
  el.querySelectorAll('.resync-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.resync;
      btn.textContent = '⏳...';
      try {
        const res = await api(`/api/docs/${encodeURIComponent(id)}/sync`, { method: 'POST' });
        const idx = state.docs.findIndex(x => x.id === id);
        if (idx >= 0) state.docs[idx] = res.doc;
        renderDocs();
        refreshDriveFiles(true);
        showToast('☁️ ซิงก์ลง Google Drive สำเร็จ!');
      } catch (err) {
        showToast(`ซิงก์ไม่สำเร็จ: ${err.message}`);
        renderDocs();
      }
    });
  });
}

function renderDriveFiles() {
  const el = document.getElementById('driveFilesList');
  if (!state.driveFiles.length) {
    el.innerHTML = `<div class="muted" style="text-align:center;padding:12px;">โฟลเดอร์ Mynew game/ ยังว่างอยู่ — สร้างเอกสารแรกแล้วระบบจะอัปโหลดขึ้นให้ทันทีครับ</div>`;
    return;
  }
  el.innerHTML = state.driveFiles.map(f => `
    <div class="sub-box" style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;">
      <div style="min-width:0;">
        <div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📄 ${escapeHtml(f.name)}</div>
        <div class="muted" style="font-size:11px;">${escapeHtml(f.mimeType || 'Google Drive File')}</div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0;">
        <button data-drive-read="${escapeHtml(f.id)}" data-drive-name="${escapeHtml(f.name)}" data-drive-mime="${escapeHtml(f.mimeType || '')}" data-drive-url="${escapeHtml(f.webViewLink || '')}" class="btn btn-sm drive-read-btn">อ่าน</button>
        <a href="${escapeHtml(f.webViewLink)}" target="_blank" rel="noopener" class="btn btn-sm">↗</a>
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.drive-read-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const fid = btn.dataset.driveRead;
      const fname = btn.dataset.driveName;
      const mime = btn.dataset.driveMime;
      const url = btn.dataset.driveUrl;
      btn.textContent = '⏳';
      try {
        const res = await api(`/api/drive/files/${encodeURIComponent(fid)}/content?mimeType=${encodeURIComponent(mime)}`);
        openDocEditorRaw({ title: fname, content: res.content, driveUrl: url, meta: 'อ่านจาก Google Drive: Mynew game/ (แก้ไขแล้วบันทึกกลับขึ้น Drive ได้ทันที)' });
      } catch (err) {
        showToast(`อ่านไฟล์ไม่ได้: ${err.message}`);
      } finally {
        btn.textContent = 'อ่าน';
      }
    });
  });
}

function openDocEditor(docId) {
  const d = state.docs.find(x => x.id === docId);
  if (!d) return;
  state.editingDocId = d.id;
  document.getElementById('docModalTitleInput').value = d.title;
  document.getElementById('docModalEditor').value = d.content;
  document.getElementById('docModalMeta').textContent = `โดย ${d.authorName} • ${d.driveStatus === 'synced' ? '☁️ ซิงก์ลง Mynew game/ แล้ว' : '💾 บันทึกในเครื่อง'}`;
  const link = document.getElementById('docModalDriveLink');
  if (d.driveUrl) { link.href = d.driveUrl; link.classList.remove('hidden'); }
  else link.classList.add('hidden');
  document.getElementById('docModal').classList.remove('hidden');
}

function openDocEditorRaw({ title = 'New_Game_Doc.md', content = '', driveUrl = '', meta = 'สร้างเอกสารใหม่และซิงก์ขึ้น Mynew game/ อัตโนมัติ' }) {
  state.editingDocId = null;
  document.getElementById('docModalTitleInput').value = title;
  document.getElementById('docModalEditor').value = content;
  document.getElementById('docModalMeta').textContent = meta;
  const link = document.getElementById('docModalDriveLink');
  if (driveUrl) { link.href = driveUrl; link.classList.remove('hidden'); }
  else link.classList.add('hidden');
  document.getElementById('docModal').classList.remove('hidden');
}

function updateStatsUI() {
  const avg = state.relationships.length
    ? Math.round(state.relationships.reduce((s, r) => s + r.score, 0) / state.relationships.length)
    : 80;
  document.getElementById('teamEnergy').textContent = `${state.teamEnergy}%`;
  document.getElementById('teamHarmony').textContent = `${avg}%`;
  document.getElementById('driveCount').textContent = Math.max(state.driveFiles.length, state.docs.filter(d => d.driveStatus === 'synced').length);
  document.getElementById('tabBoardCount').textContent = state.tasks.length;
  document.getElementById('tabDocsCount').textContent = Math.max(state.docs.length, state.driveFiles.length);
  document.getElementById('headerStudioTitle').textContent = `${state.gameTitle} Studio`;
}

function updateModeBadge() {
  const b = document.getElementById('modeBadge');
  if (state.apiConfig.provider !== 'sim' && state.apiConfig.hasApiKey) {
    b.textContent = state.apiConfig.provider === 'gemini' ? '⚡ Live Gemini (Backend)' : '⚡ Live AI (Backend)';
  } else {
    b.textContent = 'Studio Sim Mode';
  }
}

function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('hidden', p.id !== `panel-${tabName}`));
  if (tabName === 'docs') refreshDriveFiles(true);
}

// Autonomous Workplace Mini-Scene
async function playOfficeScene() {
  if (state.isRunningMission) return;
  let idx;
  do { idx = Math.floor(Math.random() * OFFICE_SCENES.length); } while (idx === state.lastBanterIdx);
  state.lastBanterIdx = idx;
  const sc = OFFICE_SCENES[idx];
  const actor = AGENTS.find(a => a.id === sc.actor);
  const target = AGENTS.find(a => a.id === sc.target);
  document.getElementById('liveEventTicker').textContent = `💬 ${sc.title}`;
  if (actor && target) engine.sendAgentTo(actor, target.visitSpot.x, target.visitSpot.y, 'chatting');

  await sleep(1050);
  for (const step of sc.steps) {
    if (state.isRunningMission) return;
    const sp = AGENTS.find(a => a.id === step.who);
    if (sp) {
      sp.bubble = step.bubble; sp.bubbleTimer = 190;
      sp.emote = step.emote; sp.emoteTimer = 190;
      sfx.banter();
      await addMessage(sp.id, step.chat, null, true, true);
    }
    await sleep(2300);
  }
  adjustRelationship(sc.relPair[0], sc.relPair[1], sc.delta);
  await sleep(900);
  if (!state.isRunningMission && actor) engine.sendAgentTo(actor, actor.seat.x, actor.seat.y, 'working');
}

function adjustRelationship(idA, idB, delta) {
  const rel = state.relationships.find(r => (r.a === idA && r.b === idB) || (r.a === idB && r.b === idA));
  if (rel) {
    rel.score = Math.max(40, Math.min(100, rel.score + delta));
    renderRelations();
    renderInspector();
    updateStatsUI();
    persistRelationships();
  }
}

// Agent Turn Executor (with Backend LLM Proxy + Auto Drive Doc Sync!)
async function runAgentTurn(agentId, taskTitle, simReply, bubbleText, emote, userPrompt = '', context = '', docSpec = null, goMeeting = false) {
  const a = AGENTS.find(x => x.id === agentId);
  if (!a) return '';
  a.task = taskTitle; a.progress = 20;
  if (goMeeting) engine.sendAgentTo(a, a.standup.x, a.standup.y, 'meeting', bubbleText, emote);
  else engine.sendAgentTo(a, a.seat.x, a.seat.y, 'working', bubbleText, emote);
  renderRoster();
  if (state.selectedAgentId === a.id) renderInspector();
  document.getElementById('typingText').textContent = `${a.emoji} ${a.name} กำลังทำงาน...`;

  let createdTaskId = null;
  try {
    const tRes = await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title: taskTitle, ownerId: a.id, status: 'in_progress' }) });
    state.tasks.unshift(tRes.task);
    createdTaskId = tRes.task.id;
    renderBoard(); updateStatsUI();
  } catch (_) {}

  let replyText = simReply;
  if (state.apiConfig.provider !== 'sim' && state.apiConfig.hasApiKey) {
    try {
      await sleep(500);
      a.progress = 55; renderRoster();
      const relNotes = state.relationships
        .filter(r => r.a === a.id || r.b === a.id)
        .map(r => {
          const other = AGENTS.find(x => x.id === (r.a === a.id ? r.b : r.a));
          return `- กับ${other.name}: ${r.label} (${r.desc})`;
        }).join('\n');
      const sysPrompt = `${a.systemPrompt}\nโปรเจกต์เกม: "${state.gameTitle}"\nความสัมพันธ์กับเพื่อนในทีม:\n${relNotes}\n${context ? 'สิ่งที่เพื่อนเพิ่งพูด:\n' + context : ''}\nตอบเป็นภาษาไทยให้เหมือนคนทำงานร่วมกันจริงๆ (ไม่เกิน 130 คำ)`;
      const aiRes = await api('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ systemPrompt: sysPrompt, userPrompt: userPrompt || taskTitle })
      });
      if (aiRes.reply) replyText = aiRes.reply;
    } catch (err) {
      replyText = `(สลับเป็น Studio Sim ชั่วคราว: ${err.message})\n\n${simReply}`;
    }
  } else {
    await sleep(750); a.progress = 60; renderRoster(); await sleep(650);
  }

  a.progress = 100; a.bubble = bubbleText; a.bubbleTimer = 165;
  if (createdTaskId) {
    const t = state.tasks.find(x => x.id === createdTaskId);
    if (t) t.status = 'done';
    renderBoard(); updateStatsUI();
    api(`/api/tasks/${encodeURIComponent(createdTaskId)}`, { method: 'PATCH', body: JSON.stringify({ status: 'done' }) }).catch(() => {});
  }
  renderRoster();
  if (state.selectedAgentId === a.id) renderInspector();

  let docRefId = null;
  if (docSpec) {
    const content = (state.apiConfig.provider !== 'sim' && state.apiConfig.hasApiKey)
      ? `# ${docSpec.title}\n\n${replyText}\n`
      : docSpec.content;
    const savedDoc = await saveDocToBackendAndDrive({ title: docSpec.title, authorId: a.id, content });
    if (savedDoc) docRefId = savedDoc.id;
  }

  await addMessage(a.id, replyText, docRefId, false, true);
  return replyText;
}

// Preset Game Dev Missions (Auto-Save & Auto-Upload to Google Drive!)
async function runMission(key) {
  if (state.isRunningMission) { showToast('⏳ รอทีมคุยรอบนี้ให้จบก่อนนะครับ'); return; }
  state.isRunningMission = true;
  engine.setBossBubble('ทุกคน ลุยภารกิจนี้กัน!');
  switchTab('chat');

  try {
    if (key === 'pitch') {
      await addMessage('boss', `🚀 ทุกคน มารวมตัวที่โต๊ะประชุมหน่อย! ช่วยกันคิดไอเดียเกมแรก "${state.gameTitle}" จากศูนย์ แล้วเซฟสรุปลง Drive ให้ด้วย`);
      AGENTS.forEach(a => engine.sendAgentTo(a, a.standup.x, a.standup.y, 'meeting'));
      await sleep(750);
      const c1 = await runAgentTurn('may', 'เปิดประชุม Game Pitch & คุมสโคป',
        `โอเคค่ะทุกคน รอบนี้บอสให้เราเริ่มจากศูนย์และต้องเซฟสรุปลง Google Drive "Mynew game/" ด้วย พี่ขอตั้งกติกาเดิมนะคะ: สโคปต้องทำ Demo เล่นได้ใน 2–3 สัปดาห์ ห้ามเสนอ Open World นะกานต์ 😅`,
        'ห้ามเสนอ Open World นะกานต์ 😅', '📋', 'เปิดประชุมคิดไอเดียเกมจากศูนย์พร้อมดักคอกานต์เรื่องสโคป', '', null, true);
      const c2 = await runAgentTurn('karn', 'เสนอ 3 คอนเซปต์เกมอินดี้',
        `โห พี่เมย์ดักทางผมอีกแล้ว 555 โอเคๆ คัด 3 แนวสโคปกำลังดีแต่โคตรติดมือครับ:\n1) **Midnight Ramen Dungeon** — ลงดันเจี้ยนหาวัตถุดิบตอนบ่าย เปิดร้านราเมนให้มอนสเตอร์ตอนดึก\n2) **Pixel Ghost High** — สืบสวน-หนีผีในโรงเรียนไทยยุค 90 ภาพพิกเซล\n3) **Tiny Sky Island** — วางแผนป้องกันเกาะลอยฟ้าแบบ Turn-Based\n\nมิ้นท์ว่าอันไหนวาดสนุก?`,
        'คัดมา 3 ไอเดียโคตรติดมือ! 💡', '💡', 'เสนอ 3 แนวเกมอินดี้ที่น่าสร้างจากศูนย์ แล้วถามมิ้นท์', c1, null, true);
      const c3 = await runAgentTurn('mint', 'เสนอโทนภาพ 2D Pixel Art',
        `กรี๊ดด มิ้นท์โหวตข้อ 1 กับข้อ 2 ค่ะกานต์! ร้านราเมนกลางคืนจัดแสงโคมไฟอุ่นๆ ตัดควันพิกเซลน่ารักมากเลย ✨`,
        'ร้านราเมนกลางคืนน่ารักมาก! ✨', '🎨', 'ออกความเห็นเรื่องงานภาพจาก 3 แนวที่กานต์เสนอ', c2, null, true);
      const c4 = await runAgentTurn('ton', 'ประเมิน Tech Stack ฝั่งโค้ด',
        `ข้อ 1 ทำ Prototype บนเว็บ HTML5 Canvas ได้ไวสุดครับ แต่กานต์ฟังนะ... เอาแค่ 5 เมนูราเมนก่อน อย่าเพิ่งยัด 200 เมนูผมจะตายคาจอ 🫠`,
        'เอา 5 เมนูก่อนนะ 🫠', '💻', 'ประเมิน Tech Stack และแซวกานต์เรื่องสโคป', c2 + '\n' + c3, null, true);
      await runAgentTurn('note', 'เสนอแนวเพลง BGM & SFX',
        `พี่ทำบีท Lo-fi ผสมเสียงน้ำซุปเดือดกับเสียงชามกระทบกันได้เลยครับ ฟังแล้วหิวแน่นอน 🎧`,
        'Lo-fi + เสียงน้ำซุปเดือด! 🎵', '🎵', 'เสนอแนวเพลงและ SFX ให้เข้ากับไอเดีย', c2 + '\n' + c3, null, true);
      await runAgentTurn('james', 'สรุป Pitch & บันทึกลง Google Drive',
        `มุมผู้เล่นผมโหวต **Midnight Ramen Dungeon** ครับ! ผมรวมข้อสรุปของทุกคนเป็นไฟล์ \`01_Game_Pitch.md\` อัปโหลดขึ้นโฟลเดอร์ **Mynew game/** บน Google Drive ให้บอสเรียบร้อยแล้วครับ! ☁️`,
        'อัปโหลดขึ้น Drive ให้แล้วครับ! ☁️', '🐛', 'สรุปความเห็นจากมุมผู้เล่นและปิดประชุม', c4, {
          title: `01_Game_Pitch_${state.gameTitle}.md`,
          content: `# Game Pitch — ${state.gameTitle}\n\n> สร้างและซิงก์อัตโนมัติจาก Mynew Game Studio AI Agent Office\n\n## 3 แนวเกมที่ทีมเสนอ\n1. **Midnight Ramen Dungeon** (Action + Cozy Shop)\n   - *กานต์:* ลงดันเจี้ยนหาวัตถุดิบ + เปิดร้านราเมนให้มอนสเตอร์ตอนกลางคืน\n   - *มิ้นท์:* แสงโคมไฟอุ่นๆ ควันราเมนพิกเซล โทนสี Cozy Night\n   - *พี่โน้ต:* Lo-fi Chiptune + เสียงน้ำซุปเดือด\n2. **Pixel Ghost High** (Thai 90s Mystery / Horror)\n   - สืบสวนปริศนาในโรงเรียนไทยยามค่ำคืนด้วยแสงไฟฉาย 2D\n3. **Tiny Sky Island** (Minimal Turn-Based Tactics)\n   - ป้องกันเกาะลอยฟ้าตารางเล็ก จบรอบละ 10 นาที\n\n## ข้อตกลง MVP (พี่เมย์ & ต้น & เจมส์)\n- เริ่มจาก **HTML5 Canvas Prototype**\n- สโคปแรก: 1 ดันเจี้ยน + 3 วัตถุดิบ + 5 เมนูราเมน\n`
        }, true);
      adjustRelationship('karn', 'mint', +2);
      sfx.done();
      await sleep(900);
      AGENTS.forEach(a => engine.sendAgentTo(a, a.seat.x, a.seat.y, 'working'));

    } else if (key === 'gdd') {
      await addMessage('boss', '📖 ช่วยเขียนเอกสาร GDD ฉบับเริ่มต้นแล้วอัปโหลดลงโฟลเดอร์ Mynew game/ เลย');
      const c1 = await runAgentTurn('karn', 'เขียน One-Page GDD & ซิงก์ Drive',
        `เรียบร้อยครับบอส! ร่าง One-Page GDD พร้อมอัปโหลดขึ้น Google Drive **Mynew game/** แล้ว แอบใส่ระบบตกปลาไว้เป็น "Phase 2" ตามที่ต้นขอแล้วนะ 555`,
        'อัปโหลด GDD ขึ้น Drive แล้ว! ☁️', '🗺️', 'ร่าง One-Page GDD สำหรับเกมอินดี้', '', {
          title: `02_GDD_${state.gameTitle}.md`,
          content: `# One-Page Game Design Document — ${state.gameTitle}\n\n## Core Gameplay Loop (3-5 นาที/รอบ)\n1. **สำรวจ / ลุยด่าน** — ควบคุมตัวละครเดิน ตี Dash เก็บวัตถุดิบ\n2. **กลับมาจัดการที่ฐาน** — คราฟต์ / ปรุงอาหาร / อัปเกรดอุปกรณ์\n3. **รับมือความท้าทายรอบถัดไป** — ศัตรูและอีเวนต์สุ่มเข้มข้นขึ้น\n\n## Controls\n- \`WASD\` เดิน | \`Space\` โจมตี/โต้ตอบ | \`Shift\` Dash หลบ\n\n## MVP Scope (อนุมัติโดยพี่เมย์ & ต้น)\n- 1 ดันเจี้ยนหลัก + 1 โซนร้านค้า + ศัตรู 2 แบบ + ระบบอัปเกรด 3 อย่าง\n- *(Phase 2 Backlog: ระบบตกปลาของกานต์)*\n`
        });
      await runAgentTurn('ton', 'ตรวจสโคป GDD',
        `เห็นคำว่า "Phase 2" แล้วค่อยหายใจออกหน่อยครับ 🫠 สโคปนี้ผมปั้น Greybox เล่นได้จริงเร็วแน่นอน`,
        'สโคปนี้ลุยได้เลยครับ!', '💻', 'ตอบรับ GDD ของกานต์', c1);
      adjustRelationship('karn', 'ton', +3);
      sfx.done();

    } else if (key === 'mechanics') {
      await addMessage('boss', '⚔️ ออกแบบตัวละครหลัก + ระบบต่อสู้ แล้วเซฟสเปกลง Drive ด้วยนะ');
      const c1 = await runAgentTurn('karn', 'ออกแบบตัวละครหลัก + Perfect Dash',
        `เสนอตัวเอก **"ไค (Kai)"** กับระบบ **"Dash สวนกลับ"** กดหลบจังหวะเป๊ะแล้วชาร์จตีแรง x2 ครับ!`,
        'Perfect Dash สวนกลับ! ⚔️', '🗺️', 'ออกแบบตัวละครหลักและระบบต่อสู้');
      await runAgentTurn('mint', 'ออกแบบ Sprite ผ้าพันคอขยับได้',
        `มิ้นท์วาดผ้าพันคอสีแดงปลิวตามตอน Dash พร้อมประกายสีทองตอน Perfect Dodge ให้เลยค่ะ ✨`,
        'ผ้าพันคอปลิวตอน Dash! ✨', '🎨', 'ออกแบบ Sprite ตัวละครต่อจากกานต์', c1);
      await runAgentTurn('ton', 'เขียนสเปก Combat & ซิงก์ Drive',
        `จัด Finite State Machine + Hitstop 40ms + Screen Shake ไว้ในไฟล์ \`03_Character_and_Combat.md\` บน Drive ให้เรียบร้อยแล้วครับ`,
        'เซฟสเปก Combat ลง Drive แล้ว! ☁️', '💻', 'เขียนสเปกระบบต่อสู้ฝั่งโค้ด', c1, {
          title: `03_Character_and_Combat_${state.gameTitle}.md`,
          content: `# Character & Combat Spec — ${state.gameTitle}\n\n## ตัวเอก: ไค (Kai)\n- **Visual (มิ้นท์):** 32x32 px, ผ้าพันคอสีแดงปลิวตาม Dash, ประกายทองตอน Perfect Dodge\n- **Combat (กานต์):** Combo 3 จังหวะ + Perfect Dash Counter (ดาเมจ x2)\n- **Code Feel (ต้น):** Finite State Machine + Input Buffer 100ms + Hitstop 40ms + Micro Screen Shake\n`
        });
      adjustRelationship('mint', 'ton', +2);
      sfx.done();

    } else if (key === 'tech') {
      await addMessage('boss', '💻 ต้นวาง Architecture โค้ด ส่วนเจมส์เขียน QA Checklist ลง Drive ให้หน่อย');
      const c1 = await runAgentTurn('ton', 'วางโครงสร้างโฟลเดอร์โค้ด',
        `แยก \`src/core/\`, \`src/entities/\`, \`src/scenes/\` และ \`src/data/balance.json\` ให้กานต์ปรับตัวเลขเองได้โดยไม่ต้องแตะโค้ดผม 😌`,
        'แยก balance.json ให้กานต์เลย 😌', '💻', 'วางโครงสร้างโฟลเดอร์โค้ดเกม 2D');
      await runAgentTurn('james', 'เขียน QA Plan & ซิงก์ลง Drive',
        `เตรียม 5 ท่าแหกเกมไว้รอพี่ต้นแล้วครับ พร้อมบันทึก \`04_Tech_and_QA_Plan.md\` ลง Google Drive เรียบร้อย! 555`,
        'อัปโหลด QA Plan ลง Drive แล้ว! ☁️', '🐛', 'เขียน QA Test Plan แซวพี่ต้น', c1, {
          title: `04_Tech_and_QA_Plan_${state.gameTitle}.md`,
          content: `# Tech Architecture & QA Plan — ${state.gameTitle}\n\n## Folder Structure (ต้น)\n\`\`\`text\nsrc/\n  core/       # Fixed-Timestep 60Hz Loop, InputBuffer, WebAudio\n  entities/   # Player, Enemy, Loot, Particles\n  scenes/     # TitleScene, DungeonScene, ShopScene\n  data/       # balance.json\n\`\`\`\n\n## QA Torture Checklist (เจมส์)\n- [ ] Dash อัดมุมกำแพงไม่ทะลุแมป\n- [ ] กดปุ่มรัว 10 ที/วิ พร้อมเปิดเมนูไม่ค้าง\n- [ ] Restart 20 รอบติดไม่มี Memory Leak\n- [ ] ลื่น 60 FPS ทั้งจอคอมและหน้าต่างเล็ก\n`
        });
      adjustRelationship('ton', 'james', +2);
      sfx.done();

    } else if (key === 'audio_art') {
      await addMessage('boss', '🎨 มิ้นท์กับพี่โน้ตจูนโทนภาพกับเสียงแล้วเซฟ Art & Audio Bible ลง Drive หน่อย');
      const c1 = await runAgentTurn('mint', 'กำหนดพาเลตต์ Warm Cozy Lantern',
        `เลือกพาเลตต์ **"Warm Cozy Lantern"** เน้นเงาเข้มตัดแสงไฟอำพันอบอุ่นค่ะพี่โน้ต!`,
        'พาเลตต์ Warm Cozy Lantern! 🎨', '🎨', 'กำหนดพาเลตต์สีและอารมณ์ภาพ');
      await runAgentTurn('note', 'เขียน Art & Audio Bible ลง Drive',
        `จับคู่คอร์ด Maj7 นุ่มๆ 92 BPM ในเมือง แล้ว Fade เบสซินธ์ 16-bit ตอนลงดันเจี้ยนครับ พี่อัปโหลด \`05_Art_and_Audio_Bible.md\` ขึ้น Google Drive ให้แล้วนะ 🎧☁️`,
        'อัปโหลด Audio Bible ขึ้น Drive แล้ว! ☁️', '🎵', 'ออกแบบแผน BGM & SFX จับคู่กับสีของมิ้นท์', c1, {
          title: `05_Art_and_Audio_Bible_${state.gameTitle}.md`,
          content: `# Art & Audio Bible — ${state.gameTitle}\n\n## Visual Palette (มิ้นท์)\n- Shadow Plum: \`#1E1B2E\` | Warm Wood: \`#C89668\`\n- Lantern Gold: \`#F59E0B\` | Spirit Cyan: \`#38BDF8\` | Berry Coral: \`#E11D48\`\n\n## Audio Direction (พี่โน้ต)\n- **Town Theme:** Warm Lo-fi Rhodes + 8-bit Arpeggio (92 BPM)\n- **Dungeon Theme:** Seamless Layer Transition (118 BPM)\n- **Core SFX:** Dash Whoosh, Footstep, Cozy UI Blip, Level-Up Chime\n`
        });
      adjustRelationship('mint', 'note', +3);
      sfx.done();
    }
  } finally {
    state.isRunningMission = false;
    document.getElementById('typingText').textContent = 'ทีมงานพร้อมคุยกับบอส';
  }
}

async function handleUserChat(rawText) {
  const text = rawText.trim();
  if (!text) return;
  if (state.isRunningMission) { showToast('⏳ รอทีมคุยรอบนี้จบก่อนนะครับ'); return; }
  await addMessage('boss', text, null, false, true);
  engine.setBossBubble(text.length > 20 ? text.slice(0, 19) + '…' : text);
  state.isRunningMission = true;

  try {
    const lower = text.toLowerCase();
    let targets = [];
    AGENTS.forEach(a => {
      if (lower.includes('@' + a.enName.toLowerCase()) || text.includes('@' + a.name) || text.includes(a.name)) targets.push(a.id);
    });
    if (!targets.length) {
      if (/โค้ด|ระบบ|engine|unity|godot|canvas|html|bug|โปรแกรม/.test(lower)) targets = ['ton', 'james'];
      else if (/ภาพ|สี|pixel|sprite|ui|ตัวละคร|วาด|สวย/.test(lower)) targets = ['mint', 'karn'];
      else if (/เสียง|เพลง|bgm|sfx|ดนตรี/.test(lower)) targets = ['note', 'mint'];
      else if (/เทส|บั๊ก|สมดุล|qa/.test(lower)) targets = ['james', 'ton'];
      else if (/ผี|เอาชีวิตรอด|rpg|ฟาร์ม|ร้าน|เนื้อเรื่อง|ด่าน|เกมเพลย์|ไอเดีย|แนว/.test(lower)) targets = ['karn', 'ton', 'may'];
      else targets = ['may', 'karn'];
    }

    let ctxAcc = '';
    for (const id of targets) {
      const a = AGENTS.find(x => x.id === id);
      const simMap = {
        may: `รับทราบค่ะบอส เรื่อง "${text}" เดี๋ยวพี่จดเข้า Sprint และช่วยคุมสโคปให้ทีมทำได้จบสวยๆ นะคะ`,
        karn: `เฮ้ย บอส!! ไอเดีย "${text}" โคตรน่าเล่นเลยครับ ผมคิด Core Loop ต่อยอดออกแล้ว อยากให้ผมร่างลง Google Drive เลยไหมครับ?`,
        ton: ctxAcc.includes('[กานต์]')
          ? `ฟังกานต์เล่าแล้วก็เออ น่าเล่นจริงแหละครับบอส 😅 แต่ขอเริ่มจาก Prototype เล็กๆ ก่อนนะ เดี๋ยวผมวางโครงโค้ดรอเลย`
          : `เรื่อง "${text}" ฝั่งโค้ดทำได้สบายครับบอส แค่ล็อกกติกาหลักให้ชัดเดี๋ยวผมวางโครงให้เลย`,
        mint: `น่ารักมากเลยค่ะบอส! สำหรับ "${text}" มิ้นท์คิดโทนสีกับดีไซน์ตัวละครออกทันทีเลยค่ะ ✨`,
        james: `โอ้โห "${text}" นี่แนวผมเลยครับบอส! เดี๋ยวพี่ต้นทำบิลด์แรกเสร็จผมขอเทสคนแรกเลยครับ 555`,
        note: `ฟีลดีมากครับบอส เรื่อง "${text}" พี่เริ่มได้ยินเมโลดี้ลอยมาแล้ว เดี๋ยวขอไปลองอัดเดโมในห้องอัดก่อนนะครับ 🎧`,
      };
      const res = await runAgentTurn(id, `คุยเรื่อง: ${text.slice(0, 22)}`, simMap[id], `${a.name} ตอบบอส`, a.emoji, text, ctxAcc);
      ctxAcc += `\n[${a.name}]: ${res}`;
    }
    sfx.done();
  } finally {
    state.isRunningMission = false;
    document.getElementById('typingText').textContent = 'ทีมงานพร้อมคุยกับบอส';
  }
}

function triggerStandup() {
  sfx.standup();
  engine.setBossBubble('ทุกคน ประชุมด่วน!');
  AGENTS.forEach(a => engine.sendAgentTo(a, a.standup.x, a.standup.y, 'meeting', 'กำลังเดินไปครับ/ค่ะ!'));
  addMessage('system', '📋 บอสเรียกประชุม Standup — พนักงานทั้ง 6 คนกำลังเดินมารวมตัวที่โต๊ะกลาง');
  showToast('📋 เรียกประชุมทีมที่ Whiteboard!');
  renderRoster();
}

function triggerCoffeeBreak() {
  sfx.coffee();
  state.teamEnergy = Math.min(100, state.teamEnergy + 8);
  AGENTS.forEach((a, i) => engine.sendAgentTo(a, COFFEE_SPOTS[i % COFFEE_SPOTS.length].x, COFFEE_SPOTS[i % COFFEE_SPOTS.length].y, 'coffee', 'เย้! เติมกาแฟ ☕', '☕'));
  state.relationships.forEach(r => { r.score = Math.min(100, r.score + 1); });
  persistRelationships();
  addMessage('system', '☕ พักเบรกกาแฟยกออฟฟิศ! พลังทีม +8% และความสนิทของทุกคนเพิ่มขึ้น');
  showToast('☕ พักเบรกกาแฟ! พลังทีม +8%');
  renderRelations(); renderRoster(); updateStatsUI();
}

function triggerPizzaParty() {
  sfx.done();
  state.teamEnergy = 100;
  state.relationships.forEach(r => { r.score = Math.min(100, r.score + 4); });
  persistRelationships();
  AGENTS.forEach(a => engine.sendAgentTo(a, a.standup.x, a.standup.y, 'meeting', 'พิซซ่ามาแล้ว!! 🍕', '♥'));
  addMessage('system', '🍕 บอสสั่งพิซซ่ามาเลี้ยงทั้งสตูดิโอ! พลังทีม 100%, ความสัมพันธ์ทุกคู่ +4%');
  addMessage('james', 'เย้!! ขอบคุณครับบอสสส รักบอสที่สุดเลยครับ! 🍕😆', null, true);
  addMessage('ton', 'ถ้ามีพิซซ่าแบบนี้... ยอมเพิ่มระบบตกปลาให้กานต์ก็ได้วะ 555', null, true);
  showToast('🍕 ปาร์ตี้พิซซ่า! เคมีทีมพุ่งกระฉูด!');
  renderRelations(); renderInspector(); updateStatsUI();
}

// Wire DOM Events
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.timeOfDay = btn.dataset.time;
    document.querySelectorAll('.time-btn').forEach(b => b.classList.toggle('active', b === btn));
    sfx.click();
  });
});

document.getElementById('btnTheme').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('mynew_office_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  sfx.click();
});
if (localStorage.getItem('mynew_office_theme') === 'dark') document.documentElement.classList.add('dark');

document.getElementById('btnBanter').addEventListener('click', (e) => {
  state.banterEnabled = !state.banterEnabled;
  e.currentTarget.textContent = state.banterEnabled ? '🗣️ คุยกันเอง: เปิด' : '🗣️ คุยกันเอง: ปิด';
  sfx.click();
});

document.getElementById('btnStandup').addEventListener('click', triggerStandup);
document.getElementById('btnCoffee').addEventListener('click', triggerCoffeeBreak);
document.getElementById('btnTeamDinner').addEventListener('click', triggerPizzaParty);
document.getElementById('btnTriggerScene').addEventListener('click', () => { sfx.click(); playOfficeScene(); });
document.getElementById('btnSound').addEventListener('click', (e) => {
  state.soundEnabled = !state.soundEnabled;
  e.currentTarget.textContent = state.soundEnabled ? '🔊 เสียง' : '🔇 เสียง';
  if (state.soundEnabled) sfx.done();
});

document.querySelectorAll('.mission-btn').forEach(btn => btn.addEventListener('click', () => runMission(btn.dataset.mission)));
document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => { sfx.click(); switchTab(btn.dataset.tab); }));
document.querySelectorAll('.mention-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById('chatInput');
    inp.value = btn.dataset.mention + inp.value.replace(/^@\S+\s*/, '');
    inp.focus();
  });
});

document.getElementById('chatForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const inp = document.getElementById('chatInput');
  const val = inp.value; inp.value = '';
  handleUserChat(val);
});

document.getElementById('btnAddTask').addEventListener('click', async () => {
  const inp = document.getElementById('newTaskInput');
  const ownerId = document.getElementById('newTaskOwner').value;
  if (!inp.value.trim()) return;
  const title = inp.value.trim(); inp.value = '';
  try {
    const res = await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title, ownerId, status: 'todo' }) });
    state.tasks.unshift(res.task);
    renderBoard(); updateStatsUI();
    const a = AGENTS.find(x => x.id === ownerId);
    if (a) { a.task = title; engine.sendAgentTo(a, a.seat.x, a.seat.y, 'working', 'รับงานใหม่แล้ว!'); renderRoster(); }
    sfx.click();
  } catch (err) { showToast(`เพิ่มงานไม่ได้: ${err.message}`); }
});

document.getElementById('btnRefreshDrive').addEventListener('click', () => { sfx.click(); refreshDriveFiles(false); });
document.getElementById('btnNewDoc').addEventListener('click', () => {
  sfx.click();
  openDocEditorRaw({
    title: `Notes_${state.gameTitle}.md`,
    content: `# ${state.gameTitle} — Studio Notes\n\n- ไอเดียหลัก:\n- สิ่งที่ต้องทำต่อ:\n`
  });
});

// Settings Modal
const apiModal = document.getElementById('apiModal');
const apiProviderEl = document.getElementById('apiProvider');
function syncApiFields() {
  const p = apiProviderEl.value;
  document.getElementById('apiKeyGroup').classList.toggle('hidden', p === 'sim');
  document.getElementById('apiBaseUrlGroup').classList.toggle('hidden', p !== 'openai');
}
apiProviderEl.addEventListener('change', syncApiFields);

document.getElementById('btnApiSettings').addEventListener('click', () => {
  document.getElementById('gameTitleInput').value = state.gameTitle;
  document.getElementById('autoSyncDriveInput').checked = state.autoSyncDrive;
  apiProviderEl.value = state.apiConfig.provider || 'sim';
  document.getElementById('apiKeyInput').value = '';
  document.getElementById('savedKeyHint').textContent = state.apiConfig.hasApiKey ? '(บันทึกคีย์ไว้บน Backend แล้ว)' : '';
  document.getElementById('apiBaseUrl').value = state.apiConfig.baseUrl || 'https://api.openai.com/v1/chat/completions';
  document.getElementById('apiModel').value = state.apiConfig.model || 'gpt-4o-mini';
  syncApiFields();
  apiModal.classList.remove('hidden');
});
document.getElementById('closeApiModal').onclick = () => apiModal.classList.add('hidden');
document.getElementById('cancelApiModal').onclick = () => apiModal.classList.add('hidden');
document.getElementById('saveApiModal').onclick = async () => {
  const newTitle = document.getElementById('gameTitleInput').value.trim() || 'Mynew Game';
  const autoSync = document.getElementById('autoSyncDriveInput').checked;
  const prov = apiProviderEl.value;
  const key = document.getElementById('apiKeyInput').value.trim();
  const baseUrl = document.getElementById('apiBaseUrl').value.trim();
  const model = document.getElementById('apiModel').value.trim();

  if (!state.backendOnline) {
    state.gameTitle = newTitle;
    state.autoSyncDrive = autoSync;
    state.apiConfig = { provider: prov, hasApiKey: Boolean(key || state.apiConfig.localKey), localKey: key || state.apiConfig.localKey, baseUrl, model };
    saveLocalBrowserState();
    updateModeBadge(); updateStatsUI();
    apiModal.classList.add('hidden');
    showToast('✅ บันทึกการตั้งค่าในเบราว์เซอร์แล้ว');
    sfx.done();
    return;
  }

  try {
    const res = await api('/api/settings', {
      method: 'POST',
      body: JSON.stringify({
        gameTitle: newTitle,
        autoSyncDrive: autoSync,
        apiConfig: { provider: prov, apiKey: key || undefined, baseUrl, model }
      })
    });
    state.gameTitle = res.state.gameTitle;
    state.autoSyncDrive = res.state.autoSyncDrive;
    state.apiConfig = res.state.apiConfig;
    updateModeBadge(); updateStatsUI();
    apiModal.classList.add('hidden');
    showToast('✅ บันทึกการตั้งค่าลง Backend เรียบร้อย');
    sfx.done();
  } catch (err) {
    showToast(`บันทึกไม่ได้: ${err.message}`);
  }
};

// Doc Editor Modal
document.getElementById('closeDocModal').onclick = () => document.getElementById('docModal').classList.add('hidden');
document.getElementById('btnCopyDoc').onclick = () => {
  navigator.clipboard?.writeText(document.getElementById('docModalEditor').value);
  showToast('📋 คัดลอกเนื้อหาแล้ว');
};
document.getElementById('btnDownloadDoc').onclick = () => {
  const title = document.getElementById('docModalTitleInput').value.trim() || 'game_doc.md';
  const blob = new Blob([document.getElementById('docModalEditor').value], { type: 'text/markdown;charset=utf-8' });
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = u; a.download = title.endsWith('.md') ? title : title + '.md'; a.click();
  URL.revokeObjectURL(u);
};
document.getElementById('btnSaveAndSyncDoc').onclick = async () => {
  const btn = document.getElementById('btnSaveAndSyncDoc');
  btn.textContent = '⏳ กำลังบันทึก...';
  btn.disabled = true;
  try {
    const doc = await saveDocToBackendAndDrive({
      id: state.editingDocId,
      title: document.getElementById('docModalTitleInput').value.trim() || 'Untitled.md',
      authorId: 'may',
      content: document.getElementById('docModalEditor').value,
      syncNow: true,
    });
    if (doc) {
      state.editingDocId = doc.id;
      document.getElementById('docModalMeta').textContent = doc.driveStatus === 'synced'
        ? `☁️ ซิงก์ลง Google Drive "${state.drive.folderName}" เรียบร้อย`
        : '💾 บันทึกเรียบร้อย (ดาวน์โหลด .md หรือต่อ Backend เพื่อซิงก์ Drive)';
      if (doc.driveUrl) {
        const link = document.getElementById('docModalDriveLink');
        link.href = doc.driveUrl;
        link.classList.remove('hidden');
      }
      sfx.done();
    }
  } finally {
    btn.textContent = '☁️ บันทึก & ซิงก์ลง Drive';
    btn.disabled = false;
  }
};

// Initial Load (Auto-detects Full-Stack Backend vs Static Web Hosting!)
async function boot() {
  const drivePill = document.getElementById('driveHeaderPill');
  try {
    const data = await api('/api/state');
    state.backendOnline = true;
    state.gameTitle = data.gameTitle || 'Mynew Game';
    state.autoSyncDrive = data.autoSyncDrive !== false;
    state.teamEnergy = data.teamEnergy ?? 92;
    state.drive = data.drive || state.drive;
    state.apiConfig = data.apiConfig || state.apiConfig;
    state.relationships = data.relationships?.length ? data.relationships : structuredClone(DEFAULT_RELATIONSHIPS);
    state.tasks = data.tasks || [];
    state.docs = data.docs || [];
    state.messages = data.messages || [];

    drivePill.href = state.drive.folderUrl;
    drivePill.textContent = state.drive.connected
      ? `☁️ Drive: ${state.drive.folderName} ↗`
      : '💾 Backend Online (Local Mode)';
    document.getElementById('driveFolderLinkBtn').href = state.drive.folderUrl;
  } catch {
    state.backendOnline = false;
    drivePill.textContent = '🌐 Web Studio Mode';
    try {
      const local = JSON.parse(localStorage.getItem('mynew_game_studio_static_v1') || 'null');
      if (local) {
        state.gameTitle = local.gameTitle || state.gameTitle;
        state.teamEnergy = local.teamEnergy ?? 92;
        state.relationships = local.relationships?.length ? local.relationships : structuredClone(DEFAULT_RELATIONSHIPS);
        state.tasks = local.tasks || [];
        state.docs = local.docs || [];
        state.messages = local.messages || [];
      }
    } catch (_) {}
    if (state.messages.length === 0) {
      const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      state.messages = [
        { senderId: 'system', text: '🏢 ยินดีต้อนรับสู่ Mynew Game Studio! ทีมงานทั้ง 6 คนเข้าออฟฟิศครบแล้ว', time: now, isBanter: false },
        { senderId: 'may', text: 'สวัสดีค่ะบอส! วันนี้ทุกคนคึกคักกันมากเลย ลองกด "🚀 ประชุมคิดไอเดียเกมจากศูนย์" หรือพิมพ์แนวเกมที่อยากทำได้เลยนะคะ (หากต้องการซิงก์ Google Drive อัตโนมัติ สามารถ Deploy Backend บน Render ได้ในคลิกเดียวค่ะ)', time: now, isBanter: false },
      ];
    }
  }

  updateModeBadge();
  renderRoster();
  renderInspector();
  renderRelations();
  renderBoard();
  renderDocs();
  renderAllMessages();
  updateStatsUI();
  refreshDriveFiles(true);
}

boot();
