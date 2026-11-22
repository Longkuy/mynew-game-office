// 2D Pixel Art Game Studio Canvas Engine (600x380 logical resolution: 30x19 tiles @ 20px)

export const TILE = 20;
export const COLS = 30;
export const ROWS = 19;
export const W = COLS * TILE; // 600
export const H = ROWS * TILE; // 380

export const COFFEE_SPOTS = [{ x: 3, y: 15 }, { x: 5, y: 15 }, { x: 7, y: 15 }, { x: 6, y: 16 }];
export const ARCADE_SPOT = { x: 10, y: 15 };

export function createInitialAgents() {
  return [
    {
      id: 'may', name: 'พี่เมย์', enName: 'May', age: 31,
      role: 'Producer / PM', thRole: 'พี่ใหญ่คุมโปรเจกต์ & เดดไลน์', emoji: '📋', color: '#d97706',
      skin: '#f6d0b1', skinShade: '#dfb08c', hair: '#3d251e', hairHi: '#633e32', hairStyle: 'bun',
      outfit: '#c26d3a', outfitShade: '#964e24', innerShirt: '#f5efe6', pants: '#334155', shoes: '#1e293b', accessory: 'glasses',
      mbti: 'ENFJ', mood: 'ใจเย็นแต่แอบเล็งเดดไลน์', moodEmoji: '🙂',
      traits: ['พี่ใหญ่สายอบอุ่น', 'คอยเบรกเวลาสโคปบาน', 'ติดอเมริกาโน่เย็น'],
      catchphrase: '“เดี๋ยวก่อนนะทุกคน ใจเย็นๆ เราคุยกันเรื่อง MVP ก่อนนะคะ 😅”',
      bio: 'เคยอยู่สตูดิโอใหญ่ก่อนออกมาช่วยบอสปั้นทีมอินดี้ รักน้องๆ ทุกคนเหมือนครอบครัว คอยไกล่เกลี่ยเวลาต้นกับกานต์เถียงกันเรื่องฟีเจอร์',
      systemPrompt: 'คุณคือ "พี่เมย์" (อายุ 31) Producer & PM พี่ใหญ่ใจดีแต่เด็ดขาดของสตูดิโอเกมอินดี้ พูดจาเป็นกันเองแบบพี่สาวคนไทย ใช้ "พี่/นะคะ/ค่ะ" คอยสรุปประเด็น คุมสโคปไม่ให้บาน และแอบห่วงสุขภาพน้องๆ ในทีม',
      desk: { x: 2, y: 5, w: 4, h: 1, type: 'may' }, seat: { x: 3, y: 6 }, visitSpot: { x: 6, y: 6 }, standup: { x: 11, y: 4 },
      x: 3 * TILE, y: 6 * TILE, tx: 3, ty: 6, path: [], dir: 'up', status: 'working',
      task: 'จัดตาราง Sprint 1 & ดูงบกาแฟ', progress: 74, bubble: '', bubbleTimer: 0, emote: '', emoteTimer: 0, idleTimer: 260, blinkOffset: 11
    },
    {
      id: 'karn', name: 'กานต์', enName: 'Karn', age: 27,
      role: 'Game Designer', thRole: 'ออกแบบเกมเพลย์ & เนื้อเรื่อง', emoji: '🗺️', color: '#059669',
      skin: '#f0c49e', skinShade: '#d5a37a', hair: '#222633', hairHi: '#424961', hairStyle: 'messy',
      outfit: '#2d7a5e', outfitShade: '#1d5742', innerShirt: '#e2e8f0', pants: '#3f4756', shoes: '#78350f', accessory: 'beanie',
      mbti: 'ENFP', mood: 'ไอเดียพุ่งกระฉูด', moodEmoji: '🤩',
      traits: ['ไอเดียล้นหัว 24 ชม.', 'อินกับ Lore จัด', 'ชอบโยนฟีเจอร์เพิ่มตอน 5 โมงเย็น'],
      catchphrase: '“เฮ้ย! เดี๋ยวก่อน ถ้าเราเพิ่มระบบโลกคู่ขนานเข้าไปด้วยมันจะโคตรเท่เลยนะ!”',
      bio: 'นักออกแบบเกมสายฝัน ชอบเล่น RPG และ Tabletop โต๊ะรกเต็มไปด้วยโพสต์อิท เป็นคู่กัดประจำออฟฟิศกับต้นแต่ก็ซี้กันมาก สนิทกับมิ้นท์เพราะชอบสุมหัวคิดตัวละครด้วยกัน',
      systemPrompt: 'คุณคือ "กานต์" (อายุ 27) Game Designer & Writer ไฟแรง ชอบคิดไอเดียล้ำๆ พูดภาษาไทยธรรมชาติแบบหนุ่มครีเอทีฟ ("เฮ้ย!", "ผมว่า...", "น่าจะมันส์มาก") บางทีฟุ้งเกินสโคปจนโดนต้นเบรกหรือพี่เมย์เตือน',
      desk: { x: 2, y: 10, w: 4, h: 1, type: 'karn' }, seat: { x: 3, y: 11 }, visitSpot: { x: 6, y: 11 }, standup: { x: 13, y: 4 },
      x: 3 * TILE, y: 11 * TILE, tx: 3, ty: 11, path: [], dir: 'up', status: 'working',
      task: 'ร่าง Lore โลกของเกม & Core Loop', progress: 52, bubble: '', bubbleTimer: 0, emote: '', emoteTimer: 0, idleTimer: 210, blinkOffset: 37
    },
    {
      id: 'ton', name: 'ต้น', enName: 'Ton', age: 28,
      role: 'Lead Programmer', thRole: 'โปรแกรมเมอร์แบกสถาปัตยกรรม', emoji: '💻', color: '#0284c7',
      skin: '#f3c9a6', skinShade: '#d8ab86', hair: '#1b1d29', hairHi: '#393e57', hairStyle: 'spiky',
      outfit: '#2b394f', outfitShade: '#1c2536', innerShirt: '#38bdf8', pants: '#1e293b', shoes: '#0f172a', accessory: 'neckphones',
      mbti: 'INTP', mood: 'ปลงแต่ยังไหว (ขาดคาเฟอีน)', moodEmoji: '🫠',
      traits: ['พูดน้อยต่อยหนัก', 'กวนหน้านิ่ง', 'ปากบ่นแต่ยอมแก้โค้ดให้ตลอด'],
      catchphrase: '“ไอเดียดีมากครับกานต์... แต่ใครเขียน? ผมอีกแล้วใช่ปะ 🫠”',
      bio: 'เสาหลักฝั่งเทคนิคของสตูดิโอ มีเป็ดยางตั้งอยู่ข้างจอ ชอบบ่นเวลาฟีเจอร์เปลี่ยนหรือเจมส์เอาบั๊กประหลาดมาส่ง แต่เป็นคนรับผิดชอบสูงมาก และมักใจอ่อนทุกครั้งเวลาที่มิ้นท์มาขอแก้ UI 2 พิกเซล',
      systemPrompt: 'คุณคือ "ต้น" (อายุ 28) Lead Programmer พูดตรงๆ กวนหน้านิ่งแบบโปรแกรมเมอร์ไทยสมจริง ("เดี๋ยวก่อนนะ", "ทำได้แหละแต่...") ชอบเบรกไอเดียฟุ้งๆ ของกานต์ แซวเจมส์เรื่องหาบั๊กเก่งเกินเหตุ แต่จริงๆ ใจดีและใส่ใจคุณภาพโค้ดมาก',
      desk: { x: 12, y: 10, w: 4, h: 1, type: 'ton' }, seat: { x: 13, y: 11 }, visitSpot: { x: 11, y: 11 }, standup: { x: 15, y: 4 },
      x: 13 * TILE, y: 11 * TILE, tx: 13, ty: 11, path: [], dir: 'up', status: 'working',
      task: 'Refactor Game Loop & Collision', progress: 81, bubble: '', bubbleTimer: 0, emote: '', emoteTimer: 0, idleTimer: 340, blinkOffset: 63
    },
    {
      id: 'mint', name: 'มิ้นท์', enName: 'Mint', age: 25,
      role: 'Art & UI Lead', thRole: 'ศิลปิน Pixel Art & สายเป๊ะ UI', emoji: '🎨', color: '#e11d48',
      skin: '#fce0cc', skinShade: '#e5bc9f', hair: '#692a3d', hairHi: '#9e4760', hairStyle: 'bob',
      outfit: '#d46a7e', outfitShade: '#a6475b', innerShirt: '#fff7ed', pants: '#3b374a', shoes: '#7f1d1d', accessory: 'beret',
      mbti: 'ISFP', mood: 'กำลังอินกับพาเลตต์สีใหม่', moodEmoji: '✨',
      traits: ['ตาเหยี่ยวเรื่องสี/พิกเซล', 'ทาสแมวเจ้าพิกเซล', 'ร่าเริงแต่เป๊ะงานมาก'],
      catchphrase: '“ต้นนน ปุ่มมันเอียงซ้ายไป 2 พิกเซลอะ ขยับให้มิ้นท์หน่อยน้า 🥺”',
      bio: 'ศิลปินสาย Pixel Art ที่ทำให้งานทุกชิ้นดูละมุน มีขนมแจกบนโต๊ะตลอด ซี้กับกานต์เรื่องออกแบบโลกเกม คุยภาษาสุนทรียะกับพี่โน้ตรู้เรื่อง และชอบไปกวนต้นเรื่องความเป๊ะของ UI',
      systemPrompt: 'คุณคือ "มิ้นท์" (อายุ 25) Art & UI Lead สดใสร่าเริง แทนตัวเองว่า "มิ้นท์" ลงท้าย "ค่ะ/น้า" ใส่ใจรายละเอียดภาพ สี แสงเงา และความน่ารักของ UI มาก ชอบแซวต้นให้ขยับพิกเซลให้ตรง ชอบคุยเรื่องมู้ดภาพกับกานต์และพี่โน้ต',
      desk: { x: 23, y: 10, w: 4, h: 1, type: 'mint' }, seat: { x: 24, y: 11 }, visitSpot: { x: 22, y: 11 }, standup: { x: 11, y: 7 },
      x: 24 * TILE, y: 11 * TILE, tx: 24, ty: 11, path: [], dir: 'up', status: 'working',
      task: 'วาด Idle Sprite & ชุดพาเลตต์ 24 สี', progress: 64, bubble: '', bubbleTimer: 0, emote: '', emoteTimer: 0, idleTimer: 230, blinkOffset: 89
    },
    {
      id: 'james', name: 'เจมส์', enName: 'James', age: 24,
      role: 'QA / Playtester', thRole: 'น้องเล็กนักล่าบั๊ก & จับผิดสมดุล', emoji: '🐛', color: '#ca8a04',
      skin: '#e8b68c', skinShade: '#c99367', hair: '#3d2210', hairHi: '#6b3e1f', hairStyle: 'short',
      outfit: '#d49a2a', outfitShade: '#a17014', innerShirt: '#1e293b', pants: '#27303f', shoes: '#dc2626', accessory: 'cap',
      mbti: 'ESTP', mood: 'คึกคัก อยากแหกแมป', moodEmoji: '😆',
      traits: ['พลังงานล้น', 'หาวิธีทำเกมพังเก่งมาก', 'ชอบชวนทุกคนเล่นตู้เกม'],
      catchphrase: '“พี่ต้น! ผมกดแดชชนมุมโต๊ะพร้อมเปิดกระเป๋า ตัวละครวาร์ปไปนอกแมปแล้วครับ 555”',
      bio: 'น้องเล็กสุดในสตูดิโอ เล่นเกมวันละ 6 ชั่วโมง มองมุมผู้เล่นจริงได้ขาดมาก ชอบทำให้พี่ต้นเหงื่อตกด้วยรายงานบั๊กสุดหลุดโลก แต่เป็นตัวสร้างเสียงหัวเราะของออฟฟิศ สนิทกับพี่โน้ตสายชิลล์',
      systemPrompt: 'คุณคือ "เจมส์" (อายุ 24) QA & Playtester น้องเล็กขี้เล่น พูดจาเป็นธรรมชาติแบบเกมเมอร์ไทย ("พี่ต้น", "บอสครับ", "555", "โคตรมันส์") เก่งเรื่องหาบั๊กหลุดขอบและวิจารณ์ Game Feel จากมุมผู้เล่นจริงอย่างตรงไปตรงมา',
      desk: { x: 23, y: 14, w: 4, h: 1, type: 'james' }, seat: { x: 24, y: 15 }, visitSpot: { x: 22, y: 15 }, standup: { x: 13, y: 7 },
      x: 24 * TILE, y: 15 * TILE, tx: 24, ty: 15, path: [], dir: 'up', status: 'working',
      task: 'เทสจังหวะ Dash & เช็กจุดทะลุกำแพง', progress: 88, bubble: '', bubbleTimer: 0, emote: '', emoteTimer: 0, idleTimer: 165, blinkOffset: 112
    },
    {
      id: 'note', name: 'พี่โน้ต', enName: 'Note', age: 29,
      role: 'Sound & Music', thRole: 'สายติสท์ชิลล์ ประจำห้องอัดเสียง', emoji: '🎵', color: '#0d9488',
      skin: '#f2c8a7', skinShade: '#d4a47e', hair: '#1c2541', hairHi: '#3a506b', hairStyle: 'bangs',
      outfit: '#1e7874', outfitShade: '#125451', innerShirt: '#cbd5e1', pants: '#1e293b', shoes: '#334155', accessory: 'headphones',
      mbti: 'INFJ', mood: 'อินดี้ สงบ ฟัง Lo-fi', moodEmoji: '🎧',
      traits: ['ชิลล์สุดในบริษัท', 'ไม่เคยทะเลาะกับใคร', 'หูทองคำเรื่องซาวด์และฟีลลิ่ง'],
      catchphrase: '“ใจเย็นๆ กันนะทุกคน เดี๋ยวพี่เปิดคอร์ด Lo-fi กล่อมให้บรรยากาศมันได้ก่อน...”',
      bio: 'นักดนตรีอินดี้ที่ย้ายมาทำเพลงเกม ชอบขลุกอยู่ในห้องอัดกระจกใสกับกีตาร์และซินธ์ เป็นที่พักใจของทุกคนเวลาเครียด คุยกับมิ้นท์เรื่องอารมณ์ของฉากได้เป็นชั่วโมง และชอบดริปกาแฟกินกับเจมส์',
      systemPrompt: 'คุณคือ "พี่โน้ต" (อายุ 29) Sound & Music Designer นุ่มนวล ใจเย็น ติสท์นิดๆ แทนตัวเองว่า "พี่" พูดจาชวนผ่อนคลายแต่มีรสนิยมด้านดนตรีและซาวด์ดีไซน์เฉียบคม',
      desk: { x: 23, y: 5, w: 4, h: 1, type: 'note' }, seat: { x: 24, y: 6 }, visitSpot: { x: 22, y: 6 }, standup: { x: 15, y: 7 },
      x: 24 * TILE, y: 6 * TILE, tx: 24, ty: 6, path: [], dir: 'up', status: 'working',
      task: 'แต่งธีม Title Screen (Lo-fi 16-bit)', progress: 67, bubble: '', bubbleTimer: 0, emote: '', emoteTimer: 0, idleTimer: 295, blinkOffset: 141
    }
  ];
}

export function createOfficeEngine(canvas, agents, hooks) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const boss = { x: 14 * TILE, y: 16 * TILE, dir: 'up', bubble: '', bubbleTimer: 0 };
  const cat = { x: 6 * TILE, y: 16 * TILE, path: [], sleeping: false, sleepTimer: 160, heartTimer: 0 };

  // Build walkability grid
  const blocked = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const blockRect = (x, y, w, h) => {
    for (let r = y; r < y + h; r++) {
      for (let c = x; c < x + w; c++) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) blocked[r][c] = true;
      }
    }
  };
  blockRect(0, 0, COLS, 3);
  blockRect(0, 0, 1, ROWS);
  blockRect(COLS - 1, 0, 1, ROWS);
  blockRect(0, ROWS - 1, COLS, 1);
  blockRect(11, 5, 6, 2);
  agents.forEach(a => blockRect(a.desk.x, a.desk.y, a.desk.w, a.desk.h));
  blockRect(21, 3, 1, 5);
  blockRect(22, 7, 2, 1);
  blockRect(27, 7, 2, 1);
  blockRect(16, 9, 1, 2);
  blockRect(2, 14, 5, 1);
  blockRect(10, 14, 1, 1);
  blockRect(18, 14, 2, 1);
  blockRect(2, 17, 3, 1);
  blockRect(1, 3, 1, 1);
  blockRect(28, 3, 1, 1);
  blockRect(28, 17, 1, 1);
  blockRect(20, 16, 2, 1);

  function findPath(sx, sy, gx, gy) {
    if (sx === gx && sy === gy) return [];
    const queue = [[sx, sy]];
    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const parent = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    visited[sy][sx] = true;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    let found = false;
    while (queue.length) {
      const [cx, cy] = queue.shift();
      if (cx === gx && cy === gy) { found = true; break; }
      for (const [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 1 && nx < COLS - 1 && ny >= 3 && ny < ROWS - 1 && !visited[ny][nx] && !blocked[ny][nx]) {
          visited[ny][nx] = true;
          parent[ny][nx] = [cx, cy];
          queue.push([nx, ny]);
        }
      }
    }
    if (!found) return [];
    const path = [];
    let cur = [gx, gy];
    while (cur && !(cur[0] === sx && cur[1] === sy)) {
      path.unshift({ x: cur[0], y: cur[1] });
      cur = parent[cur[1]][cur[0]];
    }
    return path;
  }

  function sendAgentTo(agent, tx, ty, nextStatus, bubbleText = '', emote = '') {
    const curX = Math.round(agent.x / TILE);
    const curY = Math.round(agent.y / TILE);
    agent.path = findPath(curX, curY, tx, ty);
    agent.tx = tx;
    agent.ty = ty;
    agent.targetStatus = nextStatus;
    if (agent.path.length > 0) {
      agent.status = 'walking';
    } else {
      agent.status = nextStatus;
      if (nextStatus === 'working') agent.dir = 'up';
    }
    if (bubbleText) { agent.bubble = bubbleText; agent.bubbleTimer = 175; }
    if (emote) { agent.emote = emote; agent.emoteTimer = 140; }
  }

  const px = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  let tick = 0;

  function drawWindow(x, y, w, h, t, tod) {
    px(x - 3, y - 3, w + 6, h + 6, '#5c3c27');
    px(x - 1, y - 1, w + 2, h + 2, '#8c5e3f');
    let skyTop = '#38bdf8', skyBot = '#e0f2fe';
    if (tod === 'sunset') { skyTop = '#9a3412'; skyBot = '#fdba74'; }
    if (tod === 'night') { skyTop = '#0f172a'; skyBot = '#1e293b'; }
    px(x, y, w, Math.floor(h * 0.55), skyTop);
    px(x, y + Math.floor(h * 0.55), w, Math.ceil(h * 0.45), skyBot);
    if (tod === 'night') {
      const blink = Math.floor(t / 28) % 2;
      px(x + 8, y + 6, 2, 2, blink ? '#fef08a' : '#64748b');
      px(x + w - 14, y + 8, 2, 2, !blink ? '#fef08a' : '#64748b');
      px(x + 5, y + h - 13, 13, 13, '#090d16');
      px(x + 22, y + h - 18, 16, 18, '#090d16');
      px(x + 25, y + h - 14, 3, 3, '#facc15');
      px(x + 31, y + h - 10, 3, 3, '#fbbf24');
    } else {
      const cx = x + ((Math.floor(t / 14) + x) % (w - 18));
      px(cx, y + 7, 16, 5, '#ffffff');
      px(cx + 3, y + 4, 10, 3, '#ffffff');
      if (tod === 'sunset') px(x + w - 18, y + h - 13, 10, 10, '#fde047');
    }
    px(x + Math.floor(w / 2) - 1, y, 2, h, '#5c3c27');
    px(x, y + Math.floor(h * 0.56), w, 2, '#5c3c27');
    px(x - 4, y + h + 2, w + 8, 4, '#734d34');
  }

  function drawPlant(x, y) {
    px(x + 4, y + 12, 8, 7, '#b45309');
    px(x + 3, y + 11, 10, 2, '#d97706');
    px(x + 3, y + 3, 10, 8, '#15803d');
    px(x + 5, y + 1, 6, 5, '#22c55e');
    px(x + 1, y + 6, 4, 4, '#22c55e');
    px(x + 11, y + 5, 4, 5, '#16a34a');
    px(x + 6, y + 3, 2, 2, '#86efac');
  }

  function drawMiniIconBubble(cx, cy, icon) {
    px(cx - 8, cy - 12, 16, 13, '#ffffff');
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 8.5, cy - 12.5, 17, 14);
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(icon, cx, cy - 2);
  }

  function drawSpeechBubble(cx, cy, text) {
    const short = text.length > 26 ? text.slice(0, 25) + '…' : text;
    ctx.font = 'bold 8.5px sans-serif';
    const w = Math.max(36, Math.min(168, ctx.measureText(short).width + 12));
    const bx = Math.max(8, Math.min(W - w - 8, cx - w / 2));
    const by = Math.max(4, cy - 16);
    px(bx, by, w, 16, '#ffffff');
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 0.5, by + 0.5, w - 1, 15);
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(short, bx + w / 2, by + 11);
  }

  function drawOfficeBackground(t, tod) {
    for (let r = 3; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        const tones = ['#cf9f72', '#c89668', '#d3a579', '#c28f61'];
        px(c * TILE, r * TILE, TILE, TILE, tones[(r * 3 + c * 5) % tones.length]);
        px(c * TILE, r * TILE + 9, TILE, 1, '#b48053');
        px(c * TILE, r * TILE + 19, TILE, 1, '#b48053');
        const vx = ((r + c) % 2 === 0) ? 8 : 15;
        px(c * TILE + vx, r * TILE, 1, 9, '#b88558');
        px(c * TILE + ((vx + 9) % 18), r * TILE + 10, 1, 9, '#b88558');
        if ((r + c) % 4 === 0) px(c * TILE + 3, r * TILE + 3, 4, 1, '#dfb68c');
      }
    }
    px(TILE, 3 * TILE, W - 2 * TILE, 6, 'rgba(34, 22, 16, 0.22)');

    // Zone Rugs
    px(21 * TILE + 6, 3 * TILE, 7 * TILE + 14, 5 * TILE, '#233c47');
    px(21 * TILE + 10, 3 * TILE + 4, 7 * TILE + 6, 5 * TILE - 8, '#2c4c59');
    px(10 * TILE + 6, 4 * TILE - 2, 8 * TILE - 12, 4 * TILE + 6, '#475569');
    px(10 * TILE + 9, 4 * TILE + 1, 8 * TILE - 18, 4 * TILE, '#5b6c82');
    px(10 * TILE + 11, 4 * TILE + 3, 8 * TILE - 22, 2, '#94a3b8');
    px(10 * TILE + 11, 8 * TILE - 3, 8 * TILE - 22, 2, '#94a3b8');

    for (let r = 14; r <= 17; r++) {
      for (let c = 2; c <= 9; c++) {
        px(c * TILE, r * TILE, TILE, TILE, (r + c) % 2 === 0 ? '#efe4d4' : '#e0cbb2');
      }
    }
    px(2 * TILE + 2, 15 * TILE + 12, 4 * TILE + 8, 2 * TILE + 6, '#9a3412');
    px(2 * TILE + 5, 15 * TILE + 15, 4 * TILE + 2, 2 * TILE, '#c2410c');
    px(20 * TILE, 14 * TILE - 2, 8 * TILE + 16, 4 * TILE + 2, '#5c4033');
    px(20 * TILE + 4, 14 * TILE + 2, 8 * TILE + 8, 4 * TILE - 6, '#704e3e');
    px(13 * TILE + 2, 17 * TILE + 2, 3 * TILE - 4, 14, '#7f1d1d');
    px(13 * TILE + 5, 17 * TILE + 5, 3 * TILE - 10, 8, '#b91c1c');

    // Architectural Walls
    px(0, 0, W, 3 * TILE, '#e9dfd1');
    px(0, 0, W, 5, '#3b2d26');
    px(0, 2 * TILE - 2, W, TILE + 2, '#6b4730');
    px(0, 2 * TILE - 4, W, 3, '#8c5e3f');
    for (let c = 1; c < COLS - 1; c++) {
      px(c * TILE + 3, 2 * TILE + 2, TILE - 6, TILE - 7, '#5c3c27');
      px(c * TILE + 4, 2 * TILE + 3, TILE - 8, TILE - 9, '#734d34');
    }
    px(0, 3 * TILE - 3, W, 3, '#3b2619');
    px(0, 0, TILE, H, '#2b221e');
    px(W - TILE, 0, TILE, H, '#2b221e');
    px(0, H - TILE, W, TILE, '#2b221e');

    // Sound Booth Acoustic Panels & ON AIR Sign
    px(21 * TILE + 6, 5, 7 * TILE + 14, 3 * TILE - 8, '#26343d');
    for (let c = 22; c <= 28; c++) {
      px(c * TILE + 2, 10, 15, 36, '#1c272e');
      px(c * TILE + 4, 12, 11, 14, '#324652');
      px(c * TILE + 4, 29, 11, 14, '#324652');
    }
    const noteAgent = agents.find(a => a.id === 'note');
    const onAir = noteAgent && noteAgent.status === 'working';
    px(23 * TILE + 4, 8, 34, 11, '#111827');
    px(23 * TILE + 6, 10, 30, 7, onAir ? '#dc2626' : '#450a0a');
    ctx.font = 'bold 6px monospace';
    ctx.fillStyle = onAir ? '#ffffff' : '#7f1d1d';
    ctx.textAlign = 'center';
    ctx.fillText('ON AIR', 23 * TILE + 21, 16);

    drawWindow(2 * TILE, 9, 4 * TILE, 34, t, tod);
    drawWindow(18 * TILE, 9, 3 * TILE - 4, 34, t, tod);

    // Poster & Clock
    px(7 * TILE + 2, 9, 30, 34, '#292524');
    px(7 * TILE + 4, 11, 26, 30, '#1e3a5f');
    px(7 * TILE + 6, 29, 22, 10, '#2f855a');
    px(7 * TILE + 16, 15, 2, 14, '#fbbf24');
    px(7 * TILE + 13, 25, 8, 2, '#f59e0b');
    px(7 * TILE + 8, 14, 4, 4, '#f97316');
    px(9 * TILE + 4, 14, 14, 14, '#44403c');
    px(9 * TILE + 6, 16, 10, 10, '#fefce8');
    px(9 * TILE + 10, 17, 2, 5, '#1e293b');
    px(9 * TILE + 10, 20, 4, 1, '#dc2626');

    // Whiteboard
    px(11 * TILE, 8, 6 * TILE, 38, '#94a3b8');
    px(11 * TILE + 2, 10, 6 * TILE - 4, 34, '#f8fafc');
    px(11 * TILE + 7, 17, 12, 9, '#fef08a');
    px(11 * TILE + 21, 17, 12, 9, '#fde047');
    px(11 * TILE + 43, 17, 13, 9, '#93c5fd');
    px(11 * TILE + 58, 17, 13, 9, '#fda4af');
    px(11 * TILE + 79, 17, 13, 9, '#86efac');
    px(11 * TILE + 95, 17, 13, 9, '#4ade80');
    px(11 * TILE + 8, 32, 26, 2, '#64748b');
    px(11 * TILE + 44, 31, 20, 2, '#0ea5e9');
    px(11 * TILE + 78, 30, 28, 2, '#10b981');
    px(11 * TILE + 18, 44, 64, 3, '#64748b');
  }

  function drawSunbeams(tod) {
    if (tod === 'night') return;
    ctx.save();
    ctx.fillStyle = tod === 'sunset' ? 'rgba(251, 146, 60, 0.12)' : 'rgba(255, 251, 235, 0.13)';
    ctx.beginPath();
    ctx.moveTo(2 * TILE, 3 * TILE); ctx.lineTo(6 * TILE, 3 * TILE);
    ctx.lineTo(7.5 * TILE, 8.5 * TILE); ctx.lineTo(3.5 * TILE, 8.5 * TILE);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(18 * TILE, 3 * TILE); ctx.lineTo(20.8 * TILE, 3 * TILE);
    ctx.lineTo(22 * TILE, 8 * TILE); ctx.lineTo(19 * TILE, 8 * TILE);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawDesk(agent, t, tod, selectedId) {
    const d = agent.desk;
    const x = d.x * TILE, y = d.y * TILE, w = d.w * TILE;
    const isWorking = agent.status === 'working';
    const f = Math.floor(t / 10);

    px(x + 3, y + 18, w - 4, 5, 'rgba(0,0,0,0.22)');
    px(x, y, w, 19, '#543927');
    px(x + 2, y + 2, w - 4, 13, '#8c6244');
    px(x + 3, y + 3, w - 6, 2, '#a87b59');
    px(x + 10, y + 6, w - 20, 8, agent.color + '44');

    const mx = x + Math.floor(w / 2) - 13, my = y - 8;
    px(mx, my, 26, 15, '#1e293b');
    px(mx + 2, my + 2, 22, 11, isWorking ? '#0f172a' : '#1e293b');
    px(mx + 11, my + 15, 4, 3, '#475569');

    if (d.type === 'may') {
      px(x + 6, y + 5, 5, 6, '#f8fafc');
      px(x + w - 12, y + 3, 7, 9, '#fef08a');
      if (isWorking) {
        px(mx + 4, my + 4, 7, 2, '#f59e0b');
        px(mx + 13, my + 4, 8, 2, '#22c55e');
        px(mx + 6, my + 8, 12, 2, '#38bdf8');
      }
    } else if (d.type === 'karn') {
      px(x + 4, y + 4, 9, 8, '#f8fafc');
      px(x + w - 11, y + 5, 6, 6, '#fde047');
      px(x + w - 16, y + 8, 5, 5, '#fda4af');
      if (isWorking) {
        px(mx + 4, my + 4, 5, 4, '#34d399');
        px(mx + 13, my + 4, 6, 4, '#fbbf24');
        px(mx + 9, my + 9, 8, 2, '#60a5fa');
      }
    } else if (d.type === 'ton') {
      px(x + 4, y - 10, 11, 17, '#1e293b');
      px(x + 5, y - 8, 9, 13, isWorking ? '#0f172a' : '#1e293b');
      if (isWorking) {
        px(x + 6, y - 6, 5, 1, '#4ade80');
        px(x + 6, y - 3, 7, 1, '#38bdf8');
        px(mx + 4, my + 4, 8 + (f % 6), 1, '#38bdf8');
        px(mx + 4, my + 7, 12 - (f % 4), 1, '#4ade80');
        px(mx + 6, my + 10, 10, 1, '#f472b6');
      }
      px(x + w - 12, y + 5, 5, 5, '#facc15');
      px(x + w - 20, y + 5, 4, 6, '#0ea5e9');
    } else if (d.type === 'mint') {
      px(x + 6, y + 5, 14, 9, '#334155');
      px(x + 8, y + 6, 10, 6, isWorking ? '#f43f5e' : '#475569');
      px(x + w - 12, y + 4, 6, 7, '#fbcfe8');
      if (isWorking) {
        px(mx + 4, my + 3, 7, 8, '#f43f5e');
        px(mx + 12, my + 4, 8, 6, '#38bdf8');
        px(mx + 15, my + 5, 3, 3, f % 2 ? '#fde047' : '#ffffff');
      }
    } else if (d.type === 'james') {
      px(x + 6, y + 6, 10, 6, '#1e293b');
      px(x + w - 12, y + 4, 7, 8, '#ef4444');
      if (isWorking) {
        px(mx + 4, my + 4, 16, 7, '#334155');
        px(mx + 6 + (f % 9), my + 6, 3, 3, '#facc15');
      }
    } else if (d.type === 'note') {
      px(x + 4, y - 3, 8, 12, '#1e293b');
      px(x + w - 22, y + 6, 18, 7, '#f8fafc');
      px(x + w - 19, y + 6, 2, 4, '#0f172a');
      px(x + w - 14, y + 6, 2, 4, '#0f172a');
      px(x + w - 9, y + 6, 2, 4, '#0f172a');
      if (isWorking) {
        for (let b = 0; b < 7; b++) {
          const bh = 2 + ((f + b * 2) % 8);
          px(mx + 4 + b * 3, my + 12 - bh, 2, bh, '#2dd4bf');
        }
      }
    }

    if (tod !== 'day' && isWorking) px(mx - 6, y + 2, 38, 14, agent.color + '28');
    const sx = agent.seat.x * TILE + 3, sy = agent.seat.y * TILE + 6;
    px(sx, sy, 14, 10, '#334155');
    px(sx + 2, sy + 2, 10, 6, '#475569');
    if (selectedId === agent.id) {
      ctx.strokeStyle = agent.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 2, y - 10, w + 4, 46);
    }
  }

  function drawFurniture(t, tod, selectedId) {
    drawPlant(1 * TILE + 2, 3 * TILE);
    drawPlant(28 * TILE + 2, 3 * TILE);
    drawPlant(28 * TILE + 2, 17 * TILE - 4);

    // Sound Booth Glass Partition + Guitar
    px(21 * TILE + 4, 3 * TILE, 4, 5 * TILE, '#475569');
    px(21 * TILE + 5, 3 * TILE + 2, 2, 5 * TILE - 4, 'rgba(186, 230, 253, 0.45)');
    px(21 * TILE + 4, 7 * TILE + 12, 3 * TILE - 4, 6, '#334155');
    px(21 * TILE + 6, 7 * TILE + 13, 3 * TILE - 8, 3, 'rgba(186, 230, 253, 0.5)');
    px(27 * TILE, 7 * TILE + 12, 2 * TILE, 6, '#334155');
    px(27 * TILE + 2, 7 * TILE + 13, 2 * TILE - 4, 3, 'rgba(186, 230, 253, 0.5)');
    px(27 * TILE + 8, 3 * TILE + 10, 3, 12, '#78350f');
    px(27 * TILE + 5, 4 * TILE + 1, 9, 10, '#d97706');
    px(27 * TILE + 8, 4 * TILE + 4, 3, 3, '#451a03');

    // Meeting Table
    px(11 * TILE + 3, 5 * TILE + 4, 6 * TILE - 6, 2 * TILE - 2, 'rgba(0,0,0,0.2)');
    px(11 * TILE + 2, 5 * TILE, 6 * TILE - 4, 2 * TILE - 5, '#6b442a');
    px(11 * TILE + 4, 5 * TILE + 2, 6 * TILE - 8, 2 * TILE - 10, '#96633f');
    px(12 * TILE + 2, 5 * TILE + 8, 20, 14, '#f8fafc');
    px(14 * TILE + 4, 5 * TILE + 9, 16, 11, '#334155');
    px(14 * TILE + 6, 5 * TILE + 11, 12, 7, '#38bdf8');
    px(15 * TILE + 12, 5 * TILE + 12, 6, 6, '#f8fafc');

    // Dev Server Rack
    px(16 * TILE + 2, 9 * TILE + 2, 16, 36, '#1e293b');
    px(16 * TILE + 4, 9 * TILE + 4, 12, 32, '#0f172a');
    for (let i = 0; i < 5; i++) {
      const on = ((Math.floor(t / 10) + i) % 3) !== 0;
      px(16 * TILE + 6, 9 * TILE + 7 + i * 6, 3, 2, on ? '#22c55e' : '#14532d');
      px(16 * TILE + 11, 9 * TILE + 7 + i * 6, 3, 2, i === 1 ? '#38bdf8' : '#334155');
    }

    // Coffee Bar + Espresso + Fridge + Sofa
    px(2 * TILE, 14 * TILE, 4 * TILE, TILE + 2, '#4a3224');
    px(2 * TILE + 2, 14 * TILE + 2, 4 * TILE - 4, TILE - 6, '#75503a');
    px(2 * TILE + 6, 13 * TILE + 7, 18, 17, '#475569');
    px(2 * TILE + 8, 13 * TILE + 9, 14, 7, '#cbd5e1');
    px(2 * TILE + 12, 14 * TILE + 2, 6, 5, '#ffffff');
    const sy = Math.floor(t / 9) % 8;
    px(2 * TILE + 13, 13 * TILE + 3 - sy, 2, 2, 'rgba(255,255,255,0.75)');
    px(4 * TILE + 4, 14 * TILE + 2, 16, 11, '#fbcfe8');
    px(4 * TILE + 7, 14 * TILE + 5, 4, 4, '#92400e');
    px(4 * TILE + 13, 14 * TILE + 5, 4, 4, '#f472b6');
    px(6 * TILE + 2, 13 * TILE + 4, 16, 26, '#cbd5e1');
    px(6 * TILE + 4, 13 * TILE + 6, 12, 10, '#f1f5f9');
    px(6 * TILE + 4, 14 * TILE - 2, 12, 10, '#e2e8f0');
    px(6 * TILE + 6, 13 * TILE + 8, 3, 3, '#ef4444');

    px(2 * TILE, 17 * TILE - 5, 3 * TILE + 4, 21, '#9a3412');
    px(2 * TILE + 2, 17 * TILE - 3, 3 * TILE, 14, '#c2410c');
    px(2 * TILE + 4, 17 * TILE, 16, 9, '#ea580c');
    px(3 * TILE + 2, 17 * TILE, 16, 9, '#ea580c');
    px(4 * TILE, 17 * TILE, 16, 9, '#ea580c');
    px(2 * TILE + 6, 17 * TILE + 1, 6, 5, '#fef3c7');

    // Arcade + Trophy Shelf + QA Beanbag
    px(10 * TILE + 2, 13 * TILE + 4, 16, 30, '#312e81');
    px(10 * TILE + 4, 13 * TILE + 6, 12, 5, '#f59e0b');
    px(10 * TILE + 4, 13 * TILE + 13, 12, 9, '#0f172a');
    px(10 * TILE + 7, 13 * TILE + 16, 6, 4, Math.floor(t / 14) % 2 === 0 ? '#22d3ee' : '#f472b6');
    px(18 * TILE + 2, 13 * TILE + 6, 2 * TILE - 4, 28, '#5c3c27');
    px(18 * TILE + 4, 13 * TILE + 9, 2 * TILE - 8, 7, '#3b2619');
    px(18 * TILE + 6, 13 * TILE + 10, 4, 6, '#ef4444');
    px(18 * TILE + 11, 13 * TILE + 10, 4, 6, '#3b82f6');
    px(18 * TILE + 23, 13 * TILE + 11, 6, 5, '#facc15');
    px(20 * TILE + 2, 16 * TILE + 2, 34, 16, '#92400e');
    px(20 * TILE + 5, 16 * TILE + 4, 28, 11, '#d97706');

    agents.forEach(a => drawDesk(a, t, tod, selectedId));
  }

  function drawCharacter(ch, t, isBoss, selectedId) {
    const x = Math.round(ch.x), y = Math.round(ch.y);
    const walking = ch.status === 'walking';
    const working = ch.status === 'working';
    const bob = walking ? (Math.floor(t / 6) % 2) : (working ? (Math.floor(t / 14) % 2) : 0);

    px(x + 4, y + 16, 12, 4, 'rgba(0,0,0,0.28)');
    if (!isBoss && selectedId === ch.id) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 2, y + 14, 16, 6);
    }

    const step = walking ? (Math.floor(t / 6) % 2 === 0 ? 1 : -1) : 0;
    px(x + 5, y + 12 + (step > 0 ? -1 : 0), 4, 5, ch.pants);
    px(x + 11, y + 12 + (step < 0 ? -1 : 0), 4, 5, ch.pants);
    px(x + 5, y + 16 + (step > 0 ? -1 : 0), 4, 2, ch.shoes || '#1e293b');
    px(x + 11, y + 16 + (step < 0 ? -1 : 0), 4, 2, ch.shoes || '#1e293b');

    px(x + 4, y + 4 - bob, 12, 9, ch.outfit);
    px(x + 4, y + 10 - bob, 12, 3, ch.outfitShade || ch.outfit);
    if (ch.innerShirt) px(x + 8, y + 5 - bob, 4, 5, ch.innerShirt);

    const lArmY = working ? (y + 5 - (Math.floor(t / 5) % 2)) : (y + 6 - bob);
    const rArmY = working ? (y + 5 - ((Math.floor(t / 5) + 1) % 2)) : (y + 6 - bob);
    px(x + 2, lArmY, 2, 5, ch.outfit); px(x + 2, lArmY + 4, 2, 2, ch.skin);
    px(x + 16, rArmY, 2, 5, ch.outfit); px(x + 16, rArmY + 4, 2, 2, ch.skin);

    px(x + 5, y - 5 - bob, 10, 9, ch.skin);
    px(x + 5, y + 2 - bob, 10, 2, ch.skinShade || ch.skin);

    px(x + 4, y - 7 - bob, 12, 4, ch.hair);
    px(x + 6, y - 6 - bob, 5, 1, ch.hairHi || ch.hair);
    px(x + 4, y - 4 - bob, 2, 4, ch.hair);
    px(x + 14, y - 4 - bob, 2, 4, ch.hair);
    if (ch.hairStyle === 'bun') { px(x + 7, y - 10 - bob, 6, 3, ch.hair); px(x + 8, y - 8 - bob, 4, 1, '#fbbf24'); }
    else if (ch.hairStyle === 'bob') { px(x + 3, y - 4 - bob, 2, 7, ch.hair); px(x + 15, y - 4 - bob, 2, 7, ch.hair); }
    else if (ch.hairStyle === 'spiky') { px(x + 9, y - 9 - bob, 2, 2, ch.hair); }
    else if (ch.hairStyle === 'bangs') { px(x + 6, y - 4 - bob, 8, 2, ch.hair); }

    if (ch.dir !== 'up') {
      const blinking = ((t + (ch.blinkOffset || 0)) % 170) > 164;
      if (blinking) {
        px(x + 6, y - 1 - bob, 2, 1, '#1e293b');
        px(x + 12, y - 1 - bob, 2, 1, '#1e293b');
      } else {
        px(x + 6, y - 2 - bob, 2, 2, '#1e293b'); px(x + 6, y - 2 - bob, 1, 1, '#ffffff');
        px(x + 12, y - 2 - bob, 2, 2, '#1e293b'); px(x + 12, y - 2 - bob, 1, 1, '#ffffff');
      }
      px(x + 5, y + 1 - bob, 2, 1, 'rgba(244, 63, 94, 0.28)');
      px(x + 13, y + 1 - bob, 2, 1, 'rgba(244, 63, 94, 0.28)');
    }

    if (ch.accessory === 'glasses' && ch.dir !== 'up') {
      px(x + 5, y - 2 - bob, 4, 3, 'rgba(15, 23, 42, 0.35)');
      px(x + 11, y - 2 - bob, 4, 3, 'rgba(15, 23, 42, 0.35)');
      px(x + 9, y - 1 - bob, 2, 1, '#0f172a');
    } else if (ch.accessory === 'headphones') {
      px(x + 3, y - 3 - bob, 2, 5, '#2dd4bf');
      px(x + 15, y - 3 - bob, 2, 5, '#2dd4bf');
      px(x + 5, y - 8 - bob, 10, 2, '#0d9488');
    } else if (ch.accessory === 'neckphones') {
      px(x + 6, y + 4 - bob, 8, 2, '#38bdf8');
    } else if (ch.accessory === 'cap') {
      px(x + 4, y - 8 - bob, 12, 3, '#eab308');
      px(x + 6, y - 5 - bob, 11, 2, '#ca8a04');
    } else if (ch.accessory === 'beret') {
      px(x + 3, y - 9 - bob, 13, 3, '#e11d48');
    } else if (ch.accessory === 'beanie') {
      px(x + 5, y - 9 - bob, 10, 3, '#10b981');
    } else if (isBoss) {
      px(x + 6, y - 10 - bob, 8, 2, '#facc15');
      px(x + 6, y - 11 - bob, 2, 1, '#facc15');
      px(x + 9, y - 11 - bob, 2, 1, '#facc15');
      px(x + 12, y - 11 - bob, 2, 1, '#facc15');
    }

    const label = isBoss ? 'BOSS' : ch.name;
    ctx.font = 'bold 8px sans-serif';
    const tw = ctx.measureText(label).width;
    px(x + 10 - tw / 2 - 3, y + 19, tw + 6, 10, 'rgba(15, 23, 42, 0.82)');
    ctx.fillStyle = isBoss ? '#fde047' : '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + 10, y + 27);

    if (ch.bubble && ch.bubbleTimer > 0) drawSpeechBubble(x + 10, y - 12 - bob, ch.bubble);
    else if (ch.emote && ch.emoteTimer > 0) drawMiniIconBubble(x + 10, y - 11 - bob, ch.emote);
    else if (!isBoss && ch.status === 'coffee') drawMiniIconBubble(x + 10, y - 11 - bob, '☕');
    else if (!isBoss && ch.status === 'arcade') drawMiniIconBubble(x + 10, y - 11 - bob, '🕹️');
  }

  function drawCat(t) {
    const x = Math.round(cat.x), y = Math.round(cat.y);
    px(x + 4, y + 15, 12, 3, 'rgba(0,0,0,0.22)');
    if (cat.sleeping) {
      px(x + 4, y + 10, 12, 6, '#f97316');
      px(x + 6, y + 11, 5, 3, '#fed7aa');
      if (Math.floor(t / 24) % 2 === 0) {
        ctx.font = 'bold 8px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
        ctx.fillText('z', x + 16, y + 8);
      }
    } else {
      const bob = cat.path.length ? (Math.floor(t / 8) % 2) : 0;
      px(x + 5, y + 9 - bob, 10, 6, '#f97316');
      px(x + 6, y + 6 - bob, 7, 5, '#fb923c');
      px(x + 6, y + 4 - bob, 2, 2, '#ea580c');
      px(x + 11, y + 4 - bob, 2, 2, '#ea580c');
      px(x + 15, y + 7 + (Math.floor(t / 12) % 2), 2, 4, '#ea580c');
    }
    if (cat.heartTimer > 0) drawMiniIconBubble(x + 10, y + 1, '♥');
  }

  function stepAndRender() {
    tick++;
    const { timeOfDay, selectedAgentId, isRunningMission, onAutonomousTick } = hooks.getViewState();
    onAutonomousTick(tick);

    agents.forEach(a => {
      if (a.bubbleTimer > 0) a.bubbleTimer--;
      if (a.emoteTimer > 0) a.emoteTimer--;
      if (a.path.length > 0) {
        const next = a.path[0];
        const dx = next.x * TILE - a.x, dy = next.y * TILE - a.y;
        const speed = 1.45;
        if (Math.abs(dx) > Math.abs(dy)) a.dir = dx > 0 ? 'right' : 'left';
        else a.dir = dy > 0 ? 'down' : 'up';
        if (Math.hypot(dx, dy) <= speed) {
          a.x = next.x * TILE; a.y = next.y * TILE; a.path.shift();
          if (a.path.length === 0) {
            a.status = a.targetStatus || 'working';
            if (a.status === 'working') a.dir = 'up';
            else if (a.status === 'meeting') a.dir = (a.standup.y < 5 ? 'down' : 'up');
            else a.dir = 'down';
          }
        } else {
          const d = Math.hypot(dx, dy);
          a.x += (dx / d) * speed; a.y += (dy / d) * speed;
        }
      } else {
        if (a.status === 'working' && tick % 45 === 0 && a.progress < 100) a.progress++;
        if (!isRunningMission && a.status !== 'chatting') {
          a.idleTimer--;
          if (a.idleTimer <= 0) {
            if (a.status === 'coffee' || a.status === 'arcade') {
              sendAgentTo(a, a.seat.x, a.seat.y, 'working', 'กลับไปปั่นงานต่อ!');
              a.idleTimer = 420 + Math.floor(Math.random() * 260);
            } else if (a.status === 'working') {
              if (Math.random() < 0.26) {
                const isArc = a.id === 'james' ? Math.random() < 0.5 : Math.random() < 0.2;
                const sp = isArc ? ARCADE_SPOT : COFFEE_SPOTS[Math.floor(Math.random() * COFFEE_SPOTS.length)];
                sendAgentTo(a, sp.x, sp.y, isArc ? 'arcade' : 'coffee', isArc ? 'ขอตีตู้เกมแป๊บ 🕹️' : 'เติมกาแฟแป๊บ ☕');
                a.idleTimer = 240 + Math.floor(Math.random() * 140);
              } else {
                a.idleTimer = 280 + Math.floor(Math.random() * 200);
              }
            }
          }
        }
      }
    });

    if (boss.bubbleTimer > 0) boss.bubbleTimer--;
    if (cat.heartTimer > 0) cat.heartTimer--;
    if (cat.path.length > 0) {
      const next = cat.path[0];
      const dx = next.x * TILE - cat.x, dy = next.y * TILE - cat.y;
      if (Math.hypot(dx, dy) <= 0.85) { cat.x = next.x * TILE; cat.y = next.y * TILE; cat.path.shift(); }
      else { const d = Math.hypot(dx, dy); cat.x += (dx / d) * 0.85; cat.y += (dy / d) * 0.85; }
    } else {
      cat.sleepTimer--;
      if (cat.sleepTimer <= 0) {
        cat.sleeping = !cat.sleeping;
        if (!cat.sleeping) {
          const spots = [{x:5,y:16},{x:8,y:15},{x:9,y:12},{x:14,y:13},{x:22,y:11},{x:7,y:8}];
          const s = spots[Math.floor(Math.random() * spots.length)];
          cat.path = findPath(Math.round(cat.x / TILE), Math.round(cat.y / TILE), s.x, s.y);
        }
        cat.sleepTimer = 200 + Math.floor(Math.random() * 220);
      }
    }

    ctx.clearRect(0, 0, W, H);
    drawOfficeBackground(tick, timeOfDay);
    drawSunbeams(timeOfDay);
    drawFurniture(tick, timeOfDay, selectedAgentId);

    const entities = [
      ...agents.map(a => ({ y: a.y, draw: () => drawCharacter(a, tick, false, selectedAgentId) })),
      {
        y: boss.y,
        draw: () => drawCharacter({
          ...boss, skin: '#f6d0b1', skinShade: '#dfb08c', hair: '#1e1b2e', hairHi: '#4338ca',
          outfit: '#4338ca', outfitShade: '#312e81', innerShirt: '#f8fafc', pants: '#1e293b', shoes: '#0f172a', status: 'idle', blinkOffset: 5
        }, tick, true, selectedAgentId)
      },
      { y: cat.y, draw: () => drawCat(tick) }
    ];
    entities.sort((a, b) => a.y - b.y);
    entities.forEach(e => e.draw());

    if (timeOfDay === 'sunset') { ctx.fillStyle = 'rgba(234, 88, 12, 0.13)'; ctx.fillRect(0, 0, W, H); }
    else if (timeOfDay === 'night') { ctx.fillStyle = 'rgba(15, 23, 42, 0.36)'; ctx.fillRect(0, 0, W, H); }

    requestAnimationFrame(stepAndRender);
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const lx = ((e.clientX - rect.left) / rect.width) * W;
    const ly = ((e.clientY - rect.top) / rect.height) * H;
    for (const a of agents) {
      if (lx >= a.x - 4 && lx <= a.x + 24 && ly >= a.y - 12 && ly <= a.y + 26) {
        hooks.onSelectAgent(a);
        return;
      }
    }
    if (lx >= cat.x - 4 && lx <= cat.x + 22 && ly >= cat.y - 2 && ly <= cat.y + 22) {
      cat.heartTimer = 120; cat.sleeping = false;
      hooks.onPetCat();
      return;
    }
    if (lx >= 2 * TILE && lx <= 6 * TILE && ly >= 13 * TILE && ly <= 15 * TILE) {
      hooks.onClickCoffee();
      return;
    }
    if (lx >= 11 * TILE && lx <= 17 * TILE && ly >= 0 && ly <= 3 * TILE + 8) {
      hooks.onClickWhiteboard();
      return;
    }
  });

  requestAnimationFrame(stepAndRender);

  return {
    sendAgentTo,
    setBossBubble(text, frames = 150) { boss.bubble = text; boss.bubbleTimer = frames; },
  };
}
