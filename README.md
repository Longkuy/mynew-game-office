# 🎮 Mynew Game Studio — 2D Pixel AI Agent Office

เว็บแอป Full-Stack **AI Agent Office สไตล์ 2D Pixel Art** สำหรับสตูดิโอสร้างเกมอินดี้ พร้อมพนักงาน AI 6 แผนกที่มีนิสัยและความสัมพันธ์สมจริง, กระดานงาน Sprint, ตัวแก้ไขเอกสาร Markdown, เชื่อมต่อ Gemini / OpenAI API ผ่าน Backend, และ **ซิงก์เอกสารเกมลง Google Drive อัตโนมัติ**

---

## ✨ ฟีเจอร์หลัก
- **🏢 ออฟฟิศ 2D Pixel Art (600×380)** — พื้นไม้วอลนัท, แสงแดดส่องผ่านหน้าต่าง, ห้องอัดเสียงกระจกใสพร้อมป้าย `ON AIR`, โซนกาแฟ, ตู้เกม Arcade, เจ้าแมวออฟฟิศ (`เจ้าพิกเซล`), สลับเวลา เช้า / เย็น / ดึก และสลับธีมเว็บ สว่าง / มืด
- **👥 ทีมสร้างเกม 6 คนนิสัยสมจริง** — พี่เมย์ (Producer), กานต์ (Game Designer), ต้น (Lead Programmer), มิ้นท์ (Art & UI), เจมส์ (QA), พี่โน้ต (Sound & Music) พร้อม **ระบบความสัมพันธ์ในบริษัท** และ **เหตุการณ์เดินคุยกันเองอัตโนมัติ**
- **☁️ ซิงก์เอกสารเกมลง Google Drive อัตโนมัติ** — รองรับทั้ง **Google Drive API v3 (Service Account)** สำหรับเว็บออนไลน์ และ `gdrive` CLI สำหรับรันบนเครื่องพัฒนา
- **🤖 Zero-Dependency Node.js 22 Backend** — ไม่ต้องลง `npm install` หนักๆ บูตเร็วมาก ใช้ `fetch` และ `crypto` มาตรฐานของ Node.js 22

---

## 🚀 วิธีเอาขึ้นเว็บออนไลน์จริง (เลือกได้ 2 แบบ)

### แบบที่ 1: Full-Stack บน Render (แนะนำ — ฟรี + มี Backend + ซิงก์ Google Drive ได้จริง)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Longkuy/mynew-game-office)

1. กดปุ่ม **Deploy to Render** ด้านบน (ล็อกอินด้วย GitHub ของคุณ)
2. Render จะอ่านไฟล์ [`render.yaml`](./render.yaml) ให้อัตโนมัติ
3. กรอก Environment Variables (ใส่ทีหลังในหน้า Settings ของ Render ก็ได้):
   - `DRIVE_FOLDER_ID` — ID ของโฟลเดอร์ Google Drive (ตัวอักษรหลัง `/folders/` ในลิงก์ Drive)
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — ไฟล์ JSON คีย์ของ Google Service Account (ดูวิธีทำด้านล่าง)
   - `GEMINI_API_KEY` *(ไม่บังคับ)* — หากต้องการให้ทีม AI ใช้โมเดล Gemini จริงอัตโนมัติ
4. กด **Apply** รอประมาณ 1 นาที จะได้ลิงก์ `https://mynew-game-office.onrender.com` เปิดเล่นจากมือถือและคอมได้ทันที!

---

### แบบที่ 2: เปิดออนไลน์ทันทีผ่าน GitHub Pages (ฟรี — หน้าเว็บ Interactive + บันทึกในเบราว์เซอร์)
1. ไปที่แท็บ **Settings → Pages** ของ Repository นี้
2. ตรง **Build and deployment → Source** เลือก **GitHub Actions**
3. เมื่อ Workflow [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) รันเสร็จ จะได้ลิงก์ออนไลน์ที่:
   `https://longkuy.github.io/mynew-game-office/`

---

## ☁️ วิธีเชื่อม Google Drive อัตโนมัติบนเว็บออนไลน์ (Render / Railway / Cloud Run)
1. เข้า [Google Cloud Console](https://console.cloud.google.com/) → เปิดใช้งาน **Google Drive API**
2. ไปที่ **IAM & Admin → Service Accounts** → กด **Create Service Account**
3. เข้าไปที่ Service Account ที่สร้าง → แท็บ **Keys → Add Key → Create new key (JSON)** จะได้ไฟล์ `.json`
4. เปิดโฟลเดอร์ **`Mynew game/`** ใน Google Drive ของคุณ → กด **Share (แชร์)** → ใส่อีเมล `client_email` ของ Service Account (เช่น `xxx@xxx.iam.gserviceaccount.com`) โดยให้สิทธิ์เป็น **Editor**
5. นำเนื้อหาไฟล์ `.json` ทั้งก้อน (หรือแปลงเป็น Base64) ไปวางใน Environment Variable ชื่อ `GOOGLE_SERVICE_ACCOUNT_JSON` พร้อมใส่ `DRIVE_FOLDER_ID` บน Render

---

## 💻 รันบนเครื่องคอมพิวเตอร์ของคุณเอง (Windows / macOS / Linux)
ต้องมี **Node.js 20+** อยู่ในเครื่อง:

```bash
git clone https://github.com/Longkuy/mynew-game-office.git
cd mynew-game-office
npm start
```
จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:3847`
