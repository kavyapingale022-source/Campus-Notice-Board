import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MINIMOTH_API_KEY = process.env.MINIMOTH_API_KEY || '';
const MINIMOTH_BASE_URL = process.env.MINIMOTH_BASE_URL || 'https://api.minimoth.dev';

app.use(cors());
app.use(express.json());

// In-Memory Data Store (3 Entities: User, Notice, OtpSession)
const users = [
  { id: '1', name: 'Admin Staff', phone: '+919876543210', role: 'Staff' }
];

const notices = [
  {
    id: '1',
    title: 'Mid-Semester Examinations Schedule',
    content: 'Mid-term examinations will commence from next Monday. Please check notice board near library for the hall ticket distribution.',
    category: 'Exam',
    authorName: 'Admin Staff',
    authorPhone: '+919876543210',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Annual Tech Hackathon Registrations Open',
    content: 'Teams of up to 4 students can register for HackCampus 2026 before Friday. Exciting cash prizes and certificates!',
    category: 'Event',
    authorName: 'Admin Staff',
    authorPhone: '+919876543210',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

const otpSessions = new Map(); // phone -> { otpId, code, expiresAt, name }

// Helper: Normalize phone to E.164-like format
function normalizePhone(raw) {
  if (!raw) return '';
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

// -------------------------------------------------------------
// API ENDPOINTS (Strictly 5 endpoints)
// -------------------------------------------------------------

// 1. POST /api/auth/send-otp
// Sends OTP using Minimoth API (with safe mock fallback for offline/testing)
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone, name } = req.body;
  const formattedPhone = normalizePhone(phone);

  if (!formattedPhone || formattedPhone.length < 10) {
    return res.status(400).json({ error: 'Valid phone number is required.' });
  }

  // Generate fallback 6-digit mock OTP in case no API key or network failure
  const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
  let otpId = `otp_${Date.now()}`;
  let mode = 'mock';

  if (MINIMOTH_API_KEY && MINIMOTH_API_KEY !== 'mock_minimoth_sandbox_key') {
    try {
      const response = await fetch(`${MINIMOTH_BASE_URL}/v1/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MINIMOTH_API_KEY
        },
        body: JSON.stringify({ phone: formattedPhone })
      });
      const data = await response.json();
      if (response.ok && data.otp_id) {
        otpId = data.otp_id;
        mode = 'minimoth';
      } else {
        console.warn('Minimoth API returned error, falling back to local demo OTP:', data);
      }
    } catch (err) {
      console.warn('Network call to Minimoth failed, falling back to local demo OTP:', err.message);
    }
  }

  // Store in OtpSession entity
  otpSessions.set(formattedPhone, {
    otpId,
    code: fallbackCode,
    expiresAt: Date.now() + 5 * 60 * 1000,
    name: name?.trim() || null
  });

  return res.json({
    message: 'OTP sent successfully',
    phone: formattedPhone,
    otpId,
    // Provide demo code hint when in mock/sandbox mode for instant workshop testing
    ...(mode === 'mock' || MINIMOTH_API_KEY === 'mock_minimoth_sandbox_key' ? { demoCode: fallbackCode } : {})
  });
});

// 2. POST /api/auth/verify-otp
// Verifies OTP and registers or logs in user
app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const formattedPhone = normalizePhone(phone);

  if (!formattedPhone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required.' });
  }

  const session = otpSessions.get(formattedPhone);
  let verified = false;

  // Try Minimoth verification if live key is present
  if (MINIMOTH_API_KEY && MINIMOTH_API_KEY !== 'mock_minimoth_sandbox_key') {
    try {
      const response = await fetch(`${MINIMOTH_BASE_URL}/v1/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MINIMOTH_API_KEY
        },
        body: JSON.stringify({
          phone: formattedPhone,
          otp,
          otp_id: session?.otpId
        })
      });
      const data = await response.json();
      if (response.ok && (data.verified || data.success || data.access_token)) {
        verified = true;
      }
    } catch (err) {
      console.warn('Minimoth verify error:', err.message);
    }
  }

  // Fallback to in-memory check (for sandbox/demo)
  if (!verified && session) {
    if (Date.now() > session.expiresAt) {
      otpSessions.delete(formattedPhone);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (session.code === otp.trim()) {
      verified = true;
    }
  }

  if (!verified) {
    return res.status(400).json({ error: 'Invalid or expired OTP.' });
  }

  // Successful verification: Register or retrieve User
  let user = users.find(u => u.phone === formattedPhone);
  if (!user) {
    user = {
      id: String(Date.now()),
      name: session?.name || `Student ${formattedPhone.slice(-4)}`,
      phone: formattedPhone,
      role: 'Student'
    };
    users.push(user);
  }

  otpSessions.delete(formattedPhone);
  return res.json({
    message: 'Authentication successful',
    user
  });
});

// 3. GET /api/notices
// List all published notices (sorted newest first)
app.get('/api/notices', (req, res) => {
  const sorted = [...notices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

// 4. POST /api/notices
// Create a new notice
app.post('/api/notices', (req, res) => {
  const { title, content, category, authorName, authorPhone } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Notice title is required.' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Notice content is required.' });
  }

  const newNotice = {
    id: String(Date.now()),
    title: title.trim(),
    content: content.trim(),
    category: category ? category.trim() : 'General',
    authorName: authorName ? authorName.trim() : 'Anonymous',
    authorPhone: authorPhone ? normalizePhone(authorPhone) : '',
    createdAt: new Date().toISOString()
  };

  notices.unshift(newNotice);
  res.status(201).json(newNotice);
});

// 5. DELETE /api/notices/:id
// Delete a notice by ID
app.delete('/api/notices/:id', (req, res) => {
  const { id } = req.params;
  const index = notices.findIndex(n => n.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Notice not found.' });
  }

  const deleted = notices.splice(index, 1)[0];
  res.json({ message: 'Notice deleted successfully', notice: deleted });
});

app.listen(PORT, () => {
  console.log(`Campus Notice Board Backend running on http://localhost:${PORT}`);
});
