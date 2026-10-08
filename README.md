# Campus Notice Board (Workshop Edition)

A strictly minimal, full-stack campus announcement web application designed for a 45-minute workshop.

## Features & Constraints Checklist
- **Frontend Pages (Max 3):**
  1. `NoticesPage` - Browse campus notices with tags and timestamps
  2. `AuthPage` - Mobile OTP authentication (registration/login) via Minimoth API
  3. `CreateNoticePage` - Publish new notice announcements
- **Backend API Endpoints (Strictly 5):**
  1. `POST /api/auth/send-otp` - Dispatch OTP via Minimoth API
  2. `POST /api/auth/verify-otp` - Verify code and create/return user session
  3. `GET /api/notices` - Fetch all announcements
  4. `POST /api/notices` - Create an announcement
  5. `DELETE /api/notices/:id` - Delete an announcement
- **Database Entities / Models (3):**
  1. `User` (`id`, `name`, `phone`, `role`)
  2. `Notice` (`id`, `title`, `content`, `category`, `authorName`, `authorPhone`, `createdAt`)
  3. `OtpSession` (`phone`, `otpId`, `code`, `expiresAt`, `name`)
- **Minimoth OTP Integration:**
  - Minimoth API key configured in backend `.env`
  - Zero-friction sandbox/offline demo fallback included for workshop participants

---

## Project Structure

```text
├── backend/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       └── pages/
│           ├── NoticesPage.jsx
│           ├── AuthPage.jsx
│           └── CreateNoticePage.jsx
└── README.md
```

---

## Quickstart Setup & Running

### 1. Backend Setup
1. Open a terminal in `./backend`:
   ```bash
   cd backend
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
   *(Optionally paste your live `MINIMOTH_API_KEY` from [minimoth.dev](https://minimoth.dev/))*
3. Start the server:
   ```bash
   npm start
   ```
   Backend runs on `http://localhost:5000`.

### 2. Frontend Setup
1. In another terminal, navigate to `./frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Verify `.env`:
   ```bash
   cp .env.example .env
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`.

---

## Testing OTP
- **With live Minimoth key**: Minimoth will send an instant WhatsApp/SMS OTP to the entered mobile number.
- **In Workshop/Sandbox mode**: The UI automatically displays the demo 6-digit code hint so attendees can test verification without live credits.
