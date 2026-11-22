import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '..');
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const DOCS_DIR = path.join(ROOT_DIR, 'workspace', 'docs');
const STATE_FILE = path.join(DATA_DIR, 'studio-state.json');

export function sanitizeFileName(rawName) {
  const base = String(rawName || 'Untitled_Doc')
    .trim()
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 90);
  return base.endsWith('.md') ? base : `${base}.md`;
}

export function createDefaultState() {
  return {
    gameTitle: 'Mynew Game',
    autoSyncDrive: true,
    teamEnergy: 92,
    apiConfig: {
      provider: 'sim', // 'sim' | 'gemini' | 'openai'
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
    },
    relationships: [
      {
        a: 'karn', b: 'ton', score: 72, type: 'frenemy',
        label: 'คู่กัดสายฟีเจอร์ (Love-Hate)',
        desc: 'กานต์เสนออะไรล้ำๆ ต้นจะเบรกทันทีเรื่องเวลา แต่พอลงมือทำจริงกลับเข้าขากันอย่างเหลือเชื่อ'
      },
      {
        a: 'karn', b: 'mint', score: 91, type: 'close',
        label: 'คู่หูสายครีเอทีฟ (Soulmates)',
        desc: 'ชอบสุมหัวคิดเนื้อเรื่องกับดีไซน์ตัวละครด้วยกันจนลืมกินข้าว คุยภาษาจินตนาการรู้เรื่องสุดๆ'
      },
      {
        a: 'mint', b: 'ton', score: 80, type: 'frenemy',
        label: 'สงคราม 2 พิกเซล',
        desc: 'มิ้นท์ชอบเดินมาขอให้ต้นขยับ UI ทีละ 2px ต้นทำหน้าปลงแต่สุดท้ายก็ยอมแก้ให้ทุกที'
      },
      {
        a: 'ton', b: 'james', score: 74, type: 'frenemy',
        label: 'คู่เวรคู่กรรม Bug Hunter',
        desc: 'เจมส์ชอบเอาบั๊กสุดพิสดารมาฝากต้นตอน 6 โมงเย็น ต้นบ่นแต่แอบนับถือสายตาน้องมาก'
      },
      {
        a: 'may', b: 'ton', score: 88, type: 'work',
        label: 'คู่หูแบกเดดไลน์',
        desc: 'สองคนที่เป็นฐานมั่นคงของบริษัท แค่มองตาก็รู้ว่าฟีเจอร์ไหนทำทันหรือต้องตัดออก'
      },
      {
        a: 'may', b: 'karn', score: 82, type: 'work',
        label: 'พี่สาวคุมสโคป',
        desc: 'พี่เมย์เอ็นดูกานต์แต่ต้องคอยดึงสติไม่ให้ขยายแมปใหญ่เกินไป และคอยเตือนให้นอนให้พอ'
      },
      {
        a: 'mint', b: 'note', score: 89, type: 'close',
        label: 'สายมู้ด & สุนทรียะ',
        desc: 'จับคู่สีกับเสียงเพลงเข้ากันเป๊ะ ชอบแชร์เพลงอินดี้และกาแฟดริปให้กันประจำ'
      },
      {
        a: 'james', b: 'note', score: 84, type: 'close',
        label: 'แก๊งพักเบรกสายชิลล์',
        desc: 'เจอกันบ่อยที่โซนกาแฟกับตู้เกม ชอบคุยเรื่องเกมยุคเก่าและซาวด์แทร็กตำนาน'
      }
    ],
    tasks: [],
    docs: [],
    messages: [
      {
        id: 'm_boot_1',
        senderId: 'system',
        text: '🏢 เชื่อมต่อ Backend & โฟลเดอร์ Google Drive "Mynew game/" เรียบร้อย — เอกสารเกมที่ทีมสร้างจะถูกบันทึกอัตโนมัติ',
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        isBanter: false,
      },
      {
        id: 'm_boot_2',
        senderId: 'may',
        text: 'สวัสดีตอนเช้าค่ะบอส! ระบบหลังบ้านกับ Google Drive "Mynew game/" เชื่อมเรียบร้อยแล้วนะคะ ทุกไฟล์ที่ทีมเราช่วยกันร่างจะเซฟขึ้น Drive ให้อัตโนมัติเลย ลองกด "🚀 ประชุมคิดไอเดียเกมจากศูนย์" หรือพิมพ์โจทย์เกมที่อยากทำได้เลยค่ะ!',
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        isBanter: false,
      }
    ],
  };
}

let cachedState = null;

export async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(DOCS_DIR, { recursive: true });
}

export async function loadState() {
  await ensureDirs();
  if (cachedState) return cachedState;
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8');
    cachedState = { ...createDefaultState(), ...JSON.parse(raw) };
  } catch {
    cachedState = createDefaultState();
    await saveState(cachedState);
  }
  return cachedState;
}

export async function saveState(nextState) {
  await ensureDirs();
  cachedState = nextState;
  const tmp = `${STATE_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(cachedState, null, 2), 'utf8');
  await fs.rename(tmp, STATE_FILE);
  return cachedState;
}

export async function writeLocalDoc(fileName, content) {
  await ensureDirs();
  const safe = sanitizeFileName(fileName);
  const fullPath = path.join(DOCS_DIR, safe);
  await fs.writeFile(fullPath, content, 'utf8');
  return { fileName: safe, fullPath };
}
