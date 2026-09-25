# SIRI — Living Cinematic Birthday Journey & Automated Dual-Blessing System ✦

A dark luxury, cinematic interactive web experience crafted to celebrate **SIRI** across space, time, and planetary alignments from **2003 through 2103**.

---

## 🌟 Core Features

### 1. 12-Scene Cinematic Storytelling Journey
- **Scene 01:** The Void (Cosmic beginning)
- **Scene 02:** Birth Moment (28 September 2003, 08:00 AM IST)
- **Scene 03:** The Name Reveal ("SIRI" in champagne gold glow)
- **Scene 04:** Astrological Alignment (Tula Rashi, Swati Nakshatra — 1st Pada, Venus / Shukra)
- **Scene 05:** Sharan Navaratri & Sacred Tithi (Ashwayuja Shukla Tritiya)
- **Scene 06:** Dual Birthday Concept (Solar Calendar vs Lunar Tithi)
- **Scene 07:** Current Year Reveal
- **Scene 08:** The Living 101-Year Timeline Journey (2003–2103 across 6 historical eras)
- **Scene 09:** Centennial Milestone (28 September 2103 — 100 Years)
- **Scene 10:** The Eternal Return of the Tithi
- **Scene 11:** Sacred Birthday Wish & Cosmic Blessing
- **Scene 12:** Final Horizon

### 2. Live Audio Synthesizer (Web Audio API)
- Pure synthesized harmonic frequencies: **528 Hz Solfeggio miracle tone**, warm ambient drones, and Tibetan singing bowl chimes with zero external audio dependencies.

### 3. Countdown Lock Screen & Live HUD Counter
- **Auto-Locking Countdown:** Locked until **28 September 2026, 00:00:00 AM IST** with live automatic unlock when zero is reached.
- **Preview Bypass Passcode:** Enter `mendu` to unlock preview mode anytime.
- **Dynamic Age Reveal:** Greets with "WELCOME TO 23" and dynamic age calculation.
- **Time Since Birth HUD:** Persistent top-right live counter showing total elapsed hours, years, days, minutes, and seconds since the exact moment of birth.

### 4. Floating Auto-Hiding Controls
- Minimal champagne-gold floating control button in the top-right corner.
- Automatically disappears after 3.5 seconds of user inactivity for an uninterrupted cinematic movie experience.
- Opens a glassmorphism utility panel with Sound, Scenes navigation, Email testing, and Admin portal.

### 5. Automated Dual-Email System
- **Event 1:** Solar Birthday Email (sent every 28 September at 00:00 IST).
- **Event 2:** Lunar Tithi Email (sent on the exact dynamic Ashwayuja Shukla Tritiya date each year).
- Deduplication engine to prevent duplicate sends (`email_logs`).
- Fully tested with Gmail SMTP / Nodemailer backend.

### 6. Secure Admin Portal
- Accessible at `/#/admin` (Default passcode: `siri2003`).
- Full CRUD management over yearly Tithi dates from 2003 to 2103.
- Instant test email triggers and real-time logs.

---

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Vanilla CSS & Glassmorphism, Lucide Icons
- **Backend:** Node.js, Express, Nodemailer, node-cron
- **Database:** Supabase PostgreSQL + LocalStorage fallback
- **Automation:** GitHub Actions cron workflow (`yearly_birthday_scheduler.yml`)

---

## 🚀 Getting Started Locally

### 1. Clone & Install
```bash
git clone https://github.com/lohith-1435/siri-birthday.git
cd siri-birthday
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure your credentials:
```env
PORT=3001
RECIPIENT_NAME=SIRI
RECIPIENT_EMAIL=recipient@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SENDER_EMAIL=your-email@gmail.com
IS_SIMULATED_MODE=false
```

### 3. Run Frontend & Backend
```bash
# Start frontend (Vite)
npm run dev

# Start email backend server
npm run server
```

---

## ☁️ Free 1-Click Deployment

- **Frontend:** Import this repository into [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com) (Build command: `npm run build`, Output directory: `dist`).
- **Email Backend (Optional):** Deploy to [Render.com](https://render.com) or [Railway.app](https://railway.app) for free 24/7 background cron execution.

---

✦ *Crafted with pure love, cosmic reverence, and mathematical precision.*
