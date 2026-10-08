import React, { useState } from 'react';

export default function CreateNoticePage({ user, onNoticeCreated, onNavigateBack, onRequireLogin }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="form-card" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Login Required</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Please verify your phone number via Minimoth OTP before publishing a campus notice.
        </p>
        <button className="btn-primary" onClick={onRequireLogin}>
          Go to Phone Login
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    if (!content.trim()) {
      setError('Content cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      await onNoticeCreated({
        title,
        content,
        category,
        authorName: user.name || 'Student',
        authorPhone: user.phone || ''
      });
    } catch (err) {
      setError(err.message || 'Failed to post notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className="form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Post a Campus Notice</h2>
          <button
            type="button"
            className="nav-btn"
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            onClick={onNavigateBack}
          >
            Cancel
          </button>
        </div>

        {error && <div className="alert-box alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="notice-title">Notice Title *</label>
            <input
              id="notice-title"
              type="text"
              className="form-input"
              placeholder="e.g. Library extended timings during finals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notice-category">Category *</label>
            <select
              id="notice-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">General</option>
              <option value="Exam">Exam</option>
              <option value="Event">Event</option>
              <option value="Academic">Academic</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notice-content">Description / Notice Body *</label>
            <textarea
              id="notice-content"
              className="form-textarea"
              rows={5}
              placeholder="Provide all essential details, venue, dates, or contact info..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <button
            id="submit-notice-btn"
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </form>
      </div>
    </div>
  );
}
