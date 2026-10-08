import React, { useState } from 'react';

export default function AuthPage({ apiBaseUrl, onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [demoCode, setDemoCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setStep(2);
      setInfoMessage(`OTP sent to ${data.phone}.`);
      if (data.demoCode) {
        setDemoCode(data.demoCode);
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 4) {
      setError('Please enter the OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify OTP.');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="form-card">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {step === 1 ? 'Campus Member Login / Register' : 'Enter Verification Code'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {step === 1
            ? 'Sign in or register seamlessly with your phone number via Minimoth OTP.'
            : `Enter the OTP sent to ${phone} to complete verification.`}
        </p>

        {error && <div className="alert-box alert-error">{error}</div>}
        {infoMessage && <div className="alert-box alert-success">{infoMessage}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="auth-name">Your Full Name (Optional)</label>
              <input
                id="auth-name"
                type="text"
                className="form-input"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-phone">Phone Number *</label>
              <input
                id="auth-phone"
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210 or +919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button
              id="send-otp-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP via Minimoth'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="auth-otp">6-Digit OTP *</label>
              <input
                id="auth-otp"
                type="text"
                className="form-input"
                placeholder="Enter OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoFocus
              />
              {demoCode && (
                <div className="hint-box">
                  🔑 <strong>Demo Sandbox OTP:</strong> {demoCode}
                </div>
              )}
            </div>

            <button
              id="verify-otp-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginBottom: '1rem' }}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              className="nav-btn"
              style={{ width: '100%', textAlign: 'center' }}
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
              }}
            >
              ← Back to phone input
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
